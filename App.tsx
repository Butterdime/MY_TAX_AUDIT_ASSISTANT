
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { ProcessingState, BankStatementData, BankProvider, ChatMessage, Transaction } from './types';
import { convertPdfToImages } from './services/pdfService';
import { extractStatementData, askAuditAssistant, quickResponse } from './services/geminiService';

const BANK_OPTIONS: BankProvider[] = ['Auto-detect', 'CIMB', 'Maybank', 'RHB', 'Public Bank', 'Hong Leong'];

const App: React.FC = () => {
  const [state, setState] = useState<ProcessingState>({
    status: 'idle',
    message: 'Select a bank and upload a PDF to begin.',
    selectedBank: 'Auto-detect',
    chatHistory: []
  });

  const [chatInput, setChatInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.chatHistory, isChatLoading]);

  const handleBankChange = (bank: BankProvider) => {
    setState(prev => ({ ...prev, selectedBank: bank }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setState(prev => ({ ...prev, status: 'error', message: 'Error', error: 'Please upload a PDF file.' }));
      return;
    }

    setState(prev => ({ ...prev, status: 'processing', message: 'Reading PDF pages and metadata...' }));

    try {
      const { images, metadata } = await convertPdfToImages(file);
      
      setState(prev => ({ 
        ...prev, 
        status: 'processing', 
        message: `Forensic analysis of ${state.selectedBank} statement...`,
        pdfMetadata: metadata
      }));

      const data = await extractStatementData(images, state.selectedBank);
      
      setState(prev => ({ 
        ...prev,
        status: 'completed', 
        message: 'Forensic extraction successful!', 
        data: data 
      }));

      setIsChatOpen(true);
      const welcome = await quickResponse(`Generate a short greeting for an auditor. Mention that extraction of ${state.selectedBank} statement is complete and reconciliation status is ${data.reconciliation_info.is_reconciled ? 'verified' : 'shows discrepancies'}.`);
      setState(prev => ({
        ...prev,
        chatHistory: [...prev.chatHistory, { role: 'model', text: welcome || "Extraction complete! I've tagged all transactions for your tax review. How can I assist you today?" }]
      }));

    } catch (err: any) {
      console.error(err);
      setState(prev => ({ 
        ...prev,
        status: 'error', 
        message: 'Extraction failed', 
        error: err.message || 'An unexpected error occurred. Ensure your API key is valid and the file is legible.' 
      }));
    }
  };

  const auditSchedules = useMemo(() => {
    if (!state.data) return null;
    const initial = {
      salaries: 0,
      epf_socso: 0,
      tax_payments: 0,
      loans: 0,
      directors: 0,
      revenue: 0
    };
    return state.data.transactions.reduce((acc, t) => {
      const type = t.audit_tags.type;
      const amount = t.withdrawal_amount || t.deposit_amount;
      if (type === 'salary') acc.salaries += amount;
      if (type === 'epf_socso') acc.epf_socso += amount;
      if (type === 'tax_payment') acc.tax_payments += amount;
      if (type === 'loan_repayment') acc.loans += amount;
      if (type === 'director_drawing') acc.directors += amount;
      if (type === 'revenue') acc.revenue += amount;
      return acc;
    }, initial);
  }, [state.data]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: chatInput };
    setState(prev => ({ ...prev, chatHistory: [...prev.chatHistory, userMsg] }));
    setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await askAuditAssistant(chatInput, state.chatHistory, state.data);
      setState(prev => ({ ...prev, chatHistory: [...prev.chatHistory, response] }));
    } catch (err) {
      console.error(err);
      setState(prev => ({ 
        ...prev, 
        chatHistory: [...prev.chatHistory, { role: 'model', text: "Sorry, I encountered an error processing your audit query." }] 
      }));
    } finally {
      setIsChatLoading(false);
    }
  };

  const downloadCSV = useCallback(() => {
    if (!state.data) return;
    const headers = ['Date', 'YA', 'Description', 'Audit Type', 'Ref No', 'Debit', 'Credit', 'Tax', 'Balance', 'Notes'];
    const rows = state.data.transactions.map(t => [
      t.date, t.year_of_assessment, `"${t.description.replace(/"/g, '""')}"`, t.audit_tags.type, t.cheque_ref_no || '', t.withdrawal_amount, t.deposit_amount, t.tax_amount, t.balance_after, `"${t.audit_tags.notes || ''}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit_ledger_${state.data.account_metadata.account_number}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [state.data]);

  const downloadJSON = useCallback(() => {
    if (!state.data) return;
    const blob = new Blob([JSON.stringify(state.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit_structured_${state.data.account_metadata.account_number}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [state.data]);

  const getTagColor = (type: string) => {
    switch(type) {
      case 'salary': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'epf_socso': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'tax_payment': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'revenue': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'expense': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'director_drawing': return 'bg-sky-100 text-sky-700 border-sky-200';
      case 'loan_repayment': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold">A</div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">AuditExtract</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Malaysian Forensic AI</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {state.data && (
              <button 
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-indigo-100 transition-all shadow-sm ring-1 ring-indigo-100"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                Audit Chat Assistant
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-8 space-y-8">
        {/* Upload Section */}
        <section className={`bg-white rounded-xl border p-8 shadow-sm transition-all ${state.status === 'completed' ? 'opacity-50 grayscale hover:grayscale-0 hover:opacity-100' : ''}`}>
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs">1</span>
                Statement Source
              </h2>
              <div className="flex gap-1">
                {BANK_OPTIONS.map(bank => (
                  <button 
                    key={bank} 
                    onClick={() => handleBankChange(bank)}
                    className={`px-2 py-1 text-[10px] font-bold rounded border transition-all ${state.selectedBank === bank ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-400'}`}
                  >
                    {bank}
                  </button>
                ))}
              </div>
            </div>
            
            <label className={`group relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl transition-all ${state.status === 'processing' ? 'bg-slate-50 border-slate-200 cursor-not-allowed' : 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer'}`}>
              <input type="file" className="hidden" accept="application/pdf" onChange={handleFileUpload} disabled={state.status === 'processing'} />
              <div className="flex flex-col items-center justify-center">
                <p className="text-sm font-medium text-slate-600">{state.status === 'processing' ? 'Extracting Audit Tags...' : 'Drop Statement PDF here'}</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold mt-1">Maximum 3 Pages Analysis</p>
              </div>
            </label>

            {state.status === 'error' && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-100 flex gap-3 items-center">
                <span className="font-bold">Error:</span> {state.error}
              </div>
            )}
            
            {state.status === 'processing' && (
              <div className="mt-4 flex items-center justify-center gap-3">
                <div className="animate-spin h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full" />
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{state.message}</span>
              </div>
            )}
          </div>
        </section>

        {state.data && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Sidebar Columns */}
            <div className="space-y-6 lg:col-span-1">
              {/* Reconciliation Info */}
              <div className={`rounded-xl border p-4 shadow-sm border-l-4 ${state.data.reconciliation_info.is_reconciled ? 'bg-emerald-50 border-emerald-500' : 'bg-red-50 border-red-500'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1 rounded-full ${state.data.reconciliation_info.is_reconciled ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                    {state.data.reconciliation_info.is_reconciled ? (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                    )}
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider">Reconciliation</h3>
                </div>
                <p className="text-[10px] font-medium text-slate-600 mb-2">
                  {state.data.reconciliation_info.is_reconciled ? 'Balances align with movement.' : 'Mismatch detected in statements.'}
                </p>
                {state.data.reconciliation_info.issues.length > 0 && (
                  <ul className="text-[9px] text-red-700 list-disc pl-4 mt-2">
                    {state.data.reconciliation_info.issues.map((issue, i) => <li key={i}>{issue}</li>)}
                  </ul>
                )}
              </div>

              {/* Account Metadata */}
              <div className="bg-white rounded-xl border p-5 shadow-sm space-y-4">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account Details</h3>
                <div className="space-y-3">
                  <div>
                    <dt className="text-[9px] text-slate-400 font-bold uppercase">Bank / Account Name</dt>
                    <dd className="text-xs font-bold text-slate-700 truncate">{state.data.account_metadata.bank_name}</dd>
                    <dd className="text-[10px] font-medium text-slate-500 uppercase">{state.data.account_metadata.account_name}</dd>
                  </div>
                  <div>
                    <dt className="text-[9px] text-slate-400 font-bold uppercase">Account No</dt>
                    <dd className="text-xs font-mono font-bold text-slate-700">{state.data.account_metadata.account_number}</dd>
                  </div>
                  <div className="pt-3 border-t grid grid-cols-2 gap-2">
                    <div>
                      <dt className="text-[9px] text-slate-400 font-bold uppercase">Opening</dt>
                      <dd className="text-xs font-mono font-bold">{state.data.account_metadata.opening_balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</dd>
                    </div>
                    <div>
                      <dt className="text-[9px] text-slate-400 font-bold uppercase">Closing</dt>
                      <dd className="text-xs font-mono font-bold text-indigo-600">{state.data.account_metadata.closing_balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</dd>
                    </div>
                  </div>
                </div>
              </div>

              {/* Audit Schedule Summaries */}
              <div className="bg-white rounded-xl border p-5 shadow-sm space-y-4">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Audit Schedules</h3>
                {auditSchedules && (
                  <div className="space-y-2">
                    {[
                      { label: 'Payroll & Wages', val: auditSchedules.salaries, color: 'text-indigo-600' },
                      { label: 'EPF/SOCSO/KWSP', val: auditSchedules.epf_socso, color: 'text-purple-600' },
                      { label: 'Tax Payments', val: auditSchedules.tax_payments, color: 'text-amber-600' },
                      { label: 'Loan Repayments', val: auditSchedules.loans, color: 'text-slate-600' },
                      { label: 'Revenue (Inflow)', val: auditSchedules.revenue, color: 'text-emerald-600' },
                      { label: 'Director Drawings', val: auditSchedules.directors, color: 'text-sky-600' },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center py-1 border-b border-slate-50 last:border-0">
                        <span className="text-[9px] font-bold text-slate-500 uppercase">{item.label}</span>
                        <span className={`text-[10px] font-mono font-bold ${item.color}`}>RM {item.val.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="pt-2 grid grid-cols-2 gap-2">
                  <button onClick={downloadCSV} className="bg-indigo-600 text-white text-[9px] font-bold py-2 rounded-lg hover:bg-indigo-700 uppercase tracking-widest">CSV Export</button>
                  <button onClick={downloadJSON} className="bg-slate-100 text-slate-600 text-[9px] font-bold py-2 rounded-lg hover:bg-slate-200 uppercase tracking-widest">JSON Audit</button>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden h-[800px] flex flex-col">
                <div className="px-6 py-4 border-b bg-slate-50 flex items-center justify-between">
                  <h3 className="font-bold text-slate-700 text-sm">Ledger with Forensic Tags</h3>
                  <div className="flex gap-2">
                    <span className="text-[9px] font-bold bg-white border px-2 py-1 rounded text-slate-400 uppercase tracking-tighter">
                      YA Grouping: {Array.from(new Set(state.data.transactions.map(t => t.year_of_assessment))).join(', ')}
                    </span>
                  </div>
                </div>
                <div className="overflow-auto flex-grow">
                  <table className="w-full text-left">
                    <thead className="sticky top-0 bg-slate-50 text-[9px] font-bold text-slate-400 uppercase border-b z-10">
                      <tr>
                        <th className="px-6 py-3 w-20">Date / YA</th>
                        <th className="px-6 py-3 min-w-[300px]">Description & Forensic Tags</th>
                        <th className="px-6 py-3 text-right">Debit</th>
                        <th className="px-6 py-3 text-right">Credit</th>
                        <th className="px-6 py-3 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {state.data.transactions.map((t, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 group">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-xs font-bold text-slate-700">{t.date}</div>
                            <div className="text-[8px] font-bold text-indigo-400 uppercase">YA {t.year_of_assessment}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-[11px] font-bold text-slate-800 uppercase leading-snug mb-1">{t.description}</div>
                            <div className="flex flex-wrap gap-1 items-center">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${getTagColor(t.audit_tags.type)}`}>
                                {t.audit_tags.type.replace('_', ' ')}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-slate-50 text-[8px] font-bold text-slate-400 uppercase border border-slate-100">
                                {t.audit_tags.counterparty_type}
                              </span>
                              {t.cheque_ref_no && <span className="text-[9px] font-mono text-slate-300 ml-2"># {t.cheque_ref_no}</span>}
                            </div>
                            {t.audit_tags.notes && (
                              <p className="text-[9px] text-slate-400 italic mt-1 leading-tight">{t.audit_tags.notes}</p>
                            )}
                          </td>
                          <td className={`px-6 py-4 text-right font-mono text-xs ${t.withdrawal_amount > 0 ? 'text-red-500 font-bold' : 'text-slate-200'}`}>
                            {t.withdrawal_amount.toFixed(2)}
                          </td>
                          <td className={`px-6 py-4 text-right font-mono text-xs ${t.deposit_amount > 0 ? 'text-emerald-600 font-bold' : 'text-slate-200'}`}>
                            {t.deposit_amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-slate-700 font-mono text-xs bg-slate-50/20">
                            {t.balance_after.toLocaleString(undefined, {minimumFractionDigits: 2})}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Audit Assistant Floating UI */}
      {isChatOpen && (
        <div className="fixed bottom-20 right-6 w-[400px] max-w-[calc(100vw-3rem)] h-[550px] bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-6">
          <div className="p-4 bg-indigo-600 text-white flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <div>
                <h3 className="font-bold text-sm">Audit AI Assistant</h3>
                <p className="text-[9px] text-indigo-100 uppercase tracking-widest font-bold">LHDN & YA Expert</p>
              </div>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          
          <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50">
            {state.chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-800 border border-slate-100'}`}>
                  {msg.text}
                  {msg.isSearch && msg.sources && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">Audit Citations</p>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.sources.slice(0, 3).map((s: any, j: number) => (
                          <a key={j} href={s.web?.uri} target="_blank" rel="noreferrer" className="text-[9px] bg-slate-50 px-2 py-1 rounded border border-slate-200 text-indigo-600 font-bold truncate max-w-[120px] hover:border-indigo-300">
                            {s.web?.title || 'External Source'}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 rounded-2xl px-4 py-3 flex items-center gap-1.5 shadow-sm">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t bg-white flex gap-2">
            <input 
              value={chatInput} 
              onChange={e => setChatInput(e.target.value)} 
              placeholder="Query YA assessment or schedules..." 
              className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" 
            />
            <button type="submit" disabled={isChatLoading || !chatInput.trim()} className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-md shadow-indigo-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </form>
        </div>
      )}

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t py-4 text-center z-20">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          AuditExtract Forensic Analysis • Financial Statement Support • YA 2024 Ready
        </p>
      </footer>
    </div>
  );
};

export default App;
