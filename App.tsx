
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { ProcessingState, BankStatementData, BankProvider, ChatMessage, BusinessProfile, StatementDateRange } from './types';
import { convertPdfToImages } from './services/pdfService';
import { extractStatementData, askAuditAssistant, quickResponse } from './services/geminiService';
import { BusinessRegistrationForm } from './components/BusinessRegistrationForm';
import { AuditVisualizations } from './components/AuditVisualizations';

const BANK_OPTIONS: BankProvider[] = ['Auto-detect', 'CIMB', 'Maybank', 'RHB', 'Public Bank', 'Hong Leong'];

const App: React.FC = () => {
  const [state, setState] = useState<ProcessingState>({
    status: 'idle',
    message: 'Set up your business profile and upload a PDF to begin.',
    selectedBank: 'Auto-detect',
    chatHistory: [],
    businessProfile: {
      legal_name: '',
      registration_number: '',
      business_type: 'sdn_bhd',
      tax_identification_number: '',
      financial_year_end: '31-12'
    }
  });

  const [chatInput, setChatInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(true);
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

  const updateProfile = (profile: BusinessProfile) => {
    setState(prev => ({
      ...prev,
      businessProfile: profile
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!state.businessProfile.legal_name) {
      alert("Please provide a Legal Business Name first.");
      setShowProfileEditor(true);
      return;
    }

    if (file.type !== 'application/pdf') {
      setState(prev => ({ ...prev, status: 'error', message: 'Error', error: 'Please upload a PDF file.' }));
      return;
    }

    setState(prev => ({ ...prev, status: 'processing', message: 'Reading PDF pages and metadata...' }));
    setShowProfileEditor(false);

    try {
      const { images, metadata } = await convertPdfToImages(file);
      
      setState(prev => ({ 
        ...prev, 
        status: 'processing', 
        message: `Forensic analysis for ${state.businessProfile.legal_name}...`,
        pdfMetadata: metadata
      }));

      const data = await extractStatementData(images, state.selectedBank, state.businessProfile);
      
      setState(prev => ({ 
        ...prev,
        status: 'completed', 
        message: 'Forensic extraction successful!', 
        data: data 
      }));

      // If we got new date ranges, show the profile editor again so user can confirm/see the FYE suggestion
      setShowProfileEditor(true);

      setIsChatOpen(true);
      const welcome = await quickResponse(`Extraction complete for ${state.businessProfile.legal_name}. YA grouping ${data.transactions[0]?.year_of_assessment}. Welcome message.`);
      setState(prev => ({
        ...prev,
        chatHistory: [...prev.chatHistory, { role: 'model', text: welcome || "Extraction complete! Mr RP and The Aoutha are ready to help." }]
      }));

    } catch (err: any) {
      console.error(err);
      setState(prev => ({ 
        ...prev,
        status: 'error', 
        message: 'Extraction failed', 
        error: err.message || 'An unexpected error occurred. Ensure your API key is valid.' 
      }));
    }
  };

  const auditSchedules = useMemo(() => {
    if (!state.data) return null;
    const initial = { salaries: 0, epf_socso: 0, tax_payments: 0, loans: 0, directors: 0, revenue: 0 };
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
      const response = await askAuditAssistant(chatInput, state.chatHistory, state.data, state.businessProfile);
      setState(prev => ({ ...prev, chatHistory: [...prev.chatHistory, response] }));
    } catch (err) {
      console.error(err);
      setState(prev => ({ 
        ...prev, 
        chatHistory: [...prev.chatHistory, { role: 'model', text: "Error processing query." }] 
      }));
    } finally {
      setIsChatLoading(false);
    }
  };

  const downloadCSV = useCallback(() => {
    if (!state.data) return;
    
    // Business Metadata Headers for Ledger Context
    const meta = [
      [`"Business Name"`, `"${state.data.business_profile_snapshot.legal_name}"`],
      [`"Registration No"`, `"${state.data.business_profile_snapshot.registration_number}"`],
      [`"Tax ID (TIN)"`, `"${state.data.business_profile_snapshot.tax_identification_number}"`],
      [`"Entity Type"`, `"${state.data.business_profile_snapshot.business_type}"`],
      [`"FYE"`, `"${state.data.business_profile_snapshot.financial_year_end}"`],
      [`"Statement Period"`, `"${state.data.account_metadata.statement_period}"`],
      [`"Account No"`, `"${state.data.account_metadata.account_number}"`],
      [] // Spacer row
    ];

    const headers = ['Date', 'YA', 'Description', 'Audit Type', 'Counterparty', 'Ref No', 'Debit', 'Credit', 'Tax', 'Balance', 'Forensic Notes'];
    const rows = state.data.transactions.map(t => [
      t.date, 
      t.year_of_assessment, 
      `"${t.description.replace(/"/g, '""')}"`, 
      t.audit_tags.type, 
      t.audit_tags.counterparty_type,
      t.cheque_ref_no || '', 
      t.withdrawal_amount.toFixed(2), 
      t.deposit_amount.toFixed(2), 
      (t.tax_amount || 0).toFixed(2), 
      t.balance_after.toFixed(2), 
      `"${(t.audit_tags.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      ...meta.map(m => m.join(',')),
      headers.join(','), 
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit_ledger_${state.data.business_profile_snapshot.legal_name.replace(/\s+/g, '_')}_${state.data.account_metadata.account_number}.csv`;
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

  const currentStatementRange = useMemo<StatementDateRange | undefined>(() => {
    if (!state.data?.account_metadata) return undefined;
    return {
      earliest_transaction_date: state.data.account_metadata.earliest_transaction_date,
      latest_transaction_date: state.data.account_metadata.latest_transaction_date,
    };
  }, [state.data]);

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
                Audit & Tax Assistant
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-8 space-y-8">
        <BusinessRegistrationForm 
          profile={state.businessProfile}
          onSubmit={updateProfile}
          statementDateRange={currentStatementRange}
          isExpanded={showProfileEditor}
          onToggle={() => setShowProfileEditor(!showProfileEditor)}
        />

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
            
            <label className={`group relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl transition-all ${state.status === 'processing' || !state.businessProfile.legal_name ? 'bg-slate-50 border-slate-200 cursor-not-allowed' : 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer'}`}>
              <input type="file" className="hidden" accept="application/pdf" onChange={handleFileUpload} disabled={state.status === 'processing' || !state.businessProfile.legal_name} />
              <div className="flex flex-col items-center justify-center">
                {!state.businessProfile.legal_name ? (
                  <p className="text-sm font-bold text-amber-500 uppercase tracking-widest">Setup Profile First</p>
                ) : (
                  <>
                    <p className="text-sm font-medium text-slate-600">{state.status === 'processing' ? 'Extracting Audit Tags...' : 'Drop Statement PDF here'}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold mt-1">Maximum 3 Pages Analysis</p>
                  </>
                )}
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
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            {/* Visual Analytics Section */}
            <AuditVisualizations transactions={state.data.transactions} />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pb-20">
              <div className="space-y-6 lg:col-span-1">
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

              <div className="lg:col-span-3 space-y-6">
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden h-[800px] flex flex-col">
                  <div className="px-6 py-4 border-b bg-slate-50 flex items-center justify-between">
                    <h3 className="font-bold text-slate-700 text-sm">Ledger with Forensic Tags</h3>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={downloadCSV}
                        className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-sm"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Download CSV Ledger
                      </button>
                      <span className="text-[9px] font-bold bg-white border px-2 py-1.5 rounded text-slate-400 uppercase tracking-tighter">
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
          </div>
        )}
      </main>

      {isChatOpen && (
        <div className="fixed bottom-20 right-6 w-[400px] max-w-[calc(100vw-3rem)] h-[550px] bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-6">
          <div className="p-4 bg-indigo-600 text-white flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <div>
                <h3 className="font-bold text-sm">Mr RP & The Aoutha</h3>
                <p className="text-[9px] text-indigo-100 uppercase tracking-widest font-bold">Tax & Audit AI Experts</p>
              </div>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          
          <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50">
            {state.chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-800 border border-slate-100'}`}>
                  {msg.text}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Sources:</p>
                      <ul className="space-y-1">
                        {msg.sources.map((src, idx) => (
                          <li key={idx}>
                            <a href={src.web.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-500 hover:underline block truncate">
                              {src.web.title || src.web.uri}
                            </a>
                          </li>
                        ))}
                      </ul>
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
              placeholder="Ask Mr RP (Tax) or The Aoutha (Audit)..." 
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
