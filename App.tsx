
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './i18n'; // Init i18n
import { ProcessingState, BankStatementData, BankProvider, ChatMessage, BusinessProfile, StatementDateRange, UserProfile, SupportedLanguage, AssistantPersona } from './types';
import { convertPdfToImages } from './services/pdfService';
import { extractStatementData, askAuditAssistant, quickResponse, inferPersona } from './services/geminiService';
import { BusinessRegistrationForm } from './components/BusinessRegistrationForm';
import { AuditVisualizations } from './components/AuditVisualizations';
import { FinancialYearSummary } from './components/FinancialYearSummary';
import { UserSettings } from './components/UserSettings';

const BANK_OPTIONS: BankProvider[] = ['Auto-detect', 'CIMB', 'Maybank', 'RHB', 'Public Bank', 'Hong Leong'];

type Tab = 'summary' | 'ledger' | 'analytics';

const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  
  const DEFAULT_MOCK_USER: UserProfile = {
    user_id: 'dev_user',
    google_sub: 'dev_mode',
    email: 'hello@myaudit.ai',
    display_name: 'Developer Mode',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MYAUDIT',
    preferred_language: 'en'
  };

  const [state, setState] = useState<ProcessingState>({
    status: 'idle',
    message: '',
    progress: 0,
    selectedBank: 'Auto-detect',
    chatHistory: [],
    businessProfile: {
      legal_name: '',
      registration_number: '',
      business_type: 'sdn_bhd',
      tax_identification_number: '',
      financial_year_end: '31-12'
    },
    userProfile: DEFAULT_MOCK_USER,
    assistantPersona: 'none'
  });

  const [activeTab, setActiveTab] = useState<Tab>('summary');
  const [monthFilter, setMonthFilter] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state.chatHistory, isChatLoading, state.status, state.progress]);

  const introText = "Hello, I am the MYAUDIT assistant. Which area are you interested in: Tax planning & Malaysian income tax (Mr RP), or Audit, reconciliation & forensic checks (The Aoutha)?";

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isChatOpen) setIsChatOpen(true);

    const uploadNotice: ChatMessage = { role: 'user', text: `${t('bank_source')}: ${file.name}` };
    setState(prev => ({ 
      ...prev, 
      status: 'processing', 
      message: t('status_preprocessing'),
      progress: 10,
      chatHistory: [...prev.chatHistory, uploadNotice]
    }));
    
    setShowProfileEditor(false);

    try {
      // Phase 1: Local PDF Processing
      const { images, metadata } = await convertPdfToImages(file);
      
      setState(prev => ({ 
        ...prev, 
        pdfMetadata: metadata,
        message: t('status_ai_extraction'),
        progress: 40
      }));

      // Phase 2: AI Data Extraction
      const data = await extractStatementData(images, state.selectedBank, i18n.language as SupportedLanguage);
      
      setState(prev => ({ 
        ...prev, 
        message: t('status_finalizing'),
        progress: 90
      }));

      const companyName = data.business_profile_snapshot.legal_name || "the company";
      const confirmationText = `Extraction for ${companyName} is complete and ready for audit review.`;

      setState(prev => {
        const newHistory: ChatMessage[] = [
          ...prev.chatHistory,
          { role: 'model', text: confirmationText }
        ];

        if (prev.assistantPersona === 'none') {
          newHistory.push({ role: 'model', text: introText });
        }

        return { 
          ...prev, 
          status: 'completed', 
          progress: 100,
          data,
          message: t('status_complete'),
          businessProfile: data.business_profile_snapshot,
          chatHistory: newHistory
        };
      });

      setShowProfileEditor(true);
      
    } catch (err: any) {
      console.error("File processing error:", err);
      const errorMsg: ChatMessage = { 
        role: 'model', 
        text: `I encountered an issue with that file: ${err.message}. Please ensure the PDF is not encrypted and contains clear, readable bank statement pages.` 
      };
      setState(prev => ({ 
        ...prev, 
        status: 'error', 
        error: err.message,
        progress: 0,
        chatHistory: [...prev.chatHistory, errorMsg]
      }));
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const currentHistory = [...state.chatHistory];
    const userMsg: ChatMessage = { role: 'user', text: chatInput };
    const updatedHistoryWithUser = [...currentHistory, userMsg];
    
    setState(prev => ({ ...prev, chatHistory: updatedHistoryWithUser }));
    setChatInput('');
    setIsChatLoading(true);

    try {
      let activePersona = state.assistantPersona;

      if (activePersona === 'none') {
        const lower = chatInput.toLowerCase();
        if (lower.includes('rp') || lower.includes('tax')) {
          activePersona = 'tax';
        } else if (lower.includes('aoutha') || lower.includes('audit')) {
          activePersona = 'audit';
        } else {
          activePersona = await inferPersona(chatInput);
        }
        
        if (activePersona !== 'none') {
          setState(prev => ({ ...prev, assistantPersona: activePersona }));
        }
      }

      const response = await askAuditAssistant(
        chatInput, 
        updatedHistoryWithUser, 
        state.data, 
        state.businessProfile, 
        i18n.language as SupportedLanguage,
        activePersona
      );

      setState(prev => ({ ...prev, chatHistory: [...updatedHistoryWithUser, response] }));
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handlePersonaBtn = (p: AssistantPersona) => {
    setState(prev => ({
      ...prev,
      assistantPersona: p,
      chatHistory: [...prev.chatHistory, { role: 'user', text: p === 'tax' ? "I'd like to talk to Mr RP about Tax." : "I'd like to talk to The Aoutha about Audit." }]
    }));
    setTimeout(() => {
      handleSendMessage({ preventDefault: () => {} } as React.FormEvent);
    }, 100);
  };

  const ProcessingProgressCard = () => (
    <div className="bg-white border border-indigo-100 rounded-3xl p-6 shadow-sm space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-600">{t('processing')}</h4>
        <span className="text-[10px] font-black text-slate-400">{state.progress}%</span>
      </div>
      
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-indigo-600 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(79,70,229,0.4)] animate-pulse"
          style={{ width: `${state.progress}%` }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold text-slate-700 flex items-center gap-2">
          {state.status === 'processing' && (
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
          )}
          {state.message}
        </p>
        <div className="flex items-center gap-1">
          {[1, 2, 3].map(i => (
            <div 
              key={i} 
              className={`h-1 flex-grow rounded-full transition-colors ${state.progress >= (i * 33) ? 'bg-indigo-600' : 'bg-slate-200'}`} 
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      <header className="bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md">M</div>
            <div>
              <h1 className="text-lg font-black tracking-tighter leading-none">{t('app_name')}</h1>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">{t('tagline')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {state.assistantPersona !== 'none' && (
              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-widest">
                {state.assistantPersona === 'tax' ? 'Mr RP' : 'The Aoutha'}
              </span>
            )}
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-1 rounded-full border border-slate-100 hover:bg-slate-50 transition-colors shadow-sm"
            >
              {state.userProfile?.avatar_url ? (
                <img src={state.userProfile.avatar_url} className="w-8 h-8 rounded-full" alt="Profile" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-200" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-8 space-y-8">
        <section className={`bg-white rounded-2xl border p-8 shadow-sm transition-all ${state.status === 'completed' ? 'opacity-50 grayscale hover:grayscale-0 hover:opacity-100' : ''}`}>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{t('bank_source')}</h2>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {BANK_OPTIONS.map(bank => (
                <button 
                  key={bank} 
                  onClick={() => setState(prev => ({ ...prev, selectedBank: bank }))}
                  className={`px-4 py-2 text-[10px] font-bold rounded-xl border transition-all ${state.selectedBank === bank ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}
                >
                  {bank}
                </button>
              ))}
            </div>
            
            <label className={`group relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-3xl transition-all ${state.status === 'processing' ? 'bg-slate-50 border-slate-200 cursor-not-allowed animate-pulse' : 'border-indigo-100 hover:border-indigo-400 hover:bg-indigo-50/50 cursor-pointer'}`}>
              <input type="file" className="hidden" accept="application/pdf" onChange={handleFileUpload} disabled={state.status === 'processing'} />
              <div className="flex flex-col items-center justify-center p-6">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                </div>
                <p className="text-sm font-bold text-slate-700">{state.status === 'processing' ? state.message : t('drop_pdf')}</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold mt-2 tracking-widest">CIMB, Maybank, RHB, etc.</p>
              </div>
            </label>
          </div>
        </section>

        <BusinessRegistrationForm 
          profile={state.businessProfile}
          onSubmit={p => setState(prev => ({ ...prev, businessProfile: p }))}
          isExpanded={showProfileEditor}
          onToggle={() => setShowProfileEditor(!showProfileEditor)}
          statementDateRange={state.data ? { 
            earliest_transaction_date: state.data.account_metadata.earliest_transaction_date, 
            latest_transaction_date: state.data.account_metadata.latest_transaction_date 
          } : undefined}
        />

        {state.data && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex gap-8">
                {['summary', 'ledger', 'analytics'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab as Tab)}
                    className={`text-[10px] font-black uppercase tracking-[0.2em] pb-3 border-b-2 transition-all ${activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                  >
                    {t(`tab_${tab}`)}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === 'summary' && <FinancialYearSummary summaries={state.data.financial_year_summaries} onMonthClick={(m) => { setMonthFilter(m); setActiveTab('ledger'); }} />}
            {activeTab === 'analytics' && <AuditVisualizations transactions={state.data.transactions} />}
            {activeTab === 'ledger' && (
               <div className="bg-white rounded-2xl border shadow-sm h-[600px] flex flex-col overflow-hidden">
                 <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500">{monthFilter || t('full_ledger')}</span>
                    {monthFilter && <button onClick={() => setMonthFilter(null)} className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{t('clear')}</button>}
                 </div>
                 <div className="overflow-auto flex-grow p-4">
                    <div className="divide-y divide-slate-100">
                      {state.data.transactions
                        .filter(t => !monthFilter || t.financial_month_label === monthFilter)
                        .map((tx, idx) => (
                          <div key={idx} className="py-3 px-2 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-slate-400">{tx.date}</span>
                              <span className="text-xs font-medium text-slate-700">{tx.description}</span>
                            </div>
                            <div className="flex gap-4 items-center">
                              <span className={`text-xs font-bold font-mono ${tx.deposit_amount > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                {tx.deposit_amount > 0 ? `+${tx.deposit_amount.toFixed(2)}` : `-${tx.withdrawal_amount.toFixed(2)}`}
                              </span>
                              <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-500">{tx.audit_tags.type}</span>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                 </div>
               </div>
            )}
          </div>
        )}
      </main>

      {!isChatOpen && (
        <button 
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-40 animate-bounce"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        </button>
      )}

      {isChatOpen && (
        <div className="fixed bottom-6 right-6 w-[420px] max-w-[calc(100vw-3rem)] h-[600px] bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-8">
          <div className="p-6 bg-indigo-600 text-white flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center text-[10px]">🤖</div>
              <h3 className="font-black text-sm uppercase tracking-widest">{t('assistant_name')}</h3>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          
          <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-slate-50/50">
            {state.chatHistory.length === 0 && (
              <div className="bg-white border rounded-3xl p-5 text-sm shadow-sm space-y-4">
                <p className="text-slate-800 font-medium">{introText}</p>
                <div className="grid grid-cols-1 gap-2">
                  <button 
                    onClick={() => fileInputRef.current?.click()} 
                    className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-md group"
                  >
                    <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    {t('upload_statement')}
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handlePersonaBtn('tax')} className="bg-indigo-50 text-indigo-700 px-3 py-2.5 rounded-xl text-[11px] font-bold hover:bg-indigo-100 transition-all border border-indigo-100">Mr RP (Tax)</button>
                    <button onClick={() => handlePersonaBtn('audit')} className="bg-indigo-50 text-indigo-700 px-3 py-2.5 rounded-xl text-[11px] font-bold hover:bg-indigo-100 transition-all border border-indigo-100">The Aoutha (Audit)</button>
                  </div>
                </div>
              </div>
            )}
            
            {state.chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-3xl px-5 py-4 text-sm shadow-sm leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white font-medium' : 'bg-white text-slate-800 border border-slate-100'}`}>
                  {msg.text}
                  {msg.text === introText && state.assistantPersona === 'none' && (
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <button onClick={() => handlePersonaBtn('tax')} className="bg-slate-50 text-slate-700 px-3 py-2 rounded-xl text-[10px] font-bold hover:bg-slate-100 transition-all border">Mr RP (Tax)</button>
                      <button onClick={() => handlePersonaBtn('audit')} className="bg-slate-50 text-slate-700 px-3 py-2 rounded-xl text-[10px] font-bold hover:bg-slate-100 transition-all border">The Aoutha (Audit)</button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {state.status === 'processing' && (
              <ProcessingProgressCard />
            )}

            {isChatLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] bg-white border border-slate-100 rounded-3xl px-5 py-4 text-sm shadow-sm flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">MYAUDIT is thinking...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          
          <form onSubmit={handleSendMessage} className="p-6 border-t bg-white flex gap-2 items-center">
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              accept="application/pdf" 
              onChange={handleFileUpload} 
              disabled={state.status === 'processing'} 
            />
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 bg-slate-100 hover:bg-indigo-50 rounded-xl transition-colors text-slate-500 hover:text-indigo-600 flex-shrink-0" 
              title={t('upload_statement')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            <input 
              value={chatInput} 
              onChange={e => setChatInput(e.target.value)} 
              placeholder={t('chat_placeholder')} 
              className="flex-grow bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner" 
            />
            <button 
              type="submit" 
              disabled={isChatLoading || state.status === 'processing'} 
              className="bg-indigo-600 text-white w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-50 flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {state.userProfile && (
        <UserSettings 
          user={state.userProfile} 
          onUpdateLanguage={l => i18n.changeLanguage(l)} 
          onSignOut={() => window.location.reload()} 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      )}
    </div>
  );
};

export default App;
