import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, 
  Activity, 
  Cpu, 
  FileText, 
  Download, 
  AlertCircle, 
  Database,
  Search,
  ArrowRightLeft,
  PieChart,
  Table as TableIcon,
  TrendingUp,
  Globe,
  CheckCircle2,
  Terminal,
  Zap,
  Info,
  FileSpreadsheet,
  X,
  Check,
  RefreshCw
} from 'lucide-react';
import { 
  LedgerEntry, 
  UILedgerEntry, 
  TransactionType, 
  AuditStatus, 
  EInvoiceStatus,
  mapLedgerEntryToUILedgerEntry,
  mapUILedgerEntryToLedgerEntry
} from './types/index';
import { auth } from './firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, User } from 'firebase/auth';
import SovereignHeader from './components/layout/SovereignHeader';
import TabRail from './components/layout/TabRail';

// --- YEAR TRANSITION SCREEN COMPONENT ---
const YearTransitionScreen: React.FC<{ isVisible: boolean; onComplete: () => void }> = ({ isVisible, onComplete }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onComplete();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease-in;
        }
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center animate-fadeIn">
        <div className="text-[#00D9FF] text-9xl font-bold animate-pulse">Λ</div>
        <div className="text-white text-5xl font-mono mt-4">2025 → 2026</div>
        <div className="text-gray-400 text-xl mt-2">
          YEAR-END TRANSITION PROTOCOL
        </div>
      </div>
    </>
  );
};

// --- MASSIVE ACTIVATION YA 2017 TEST HARNESS ---
const massiveActivationYA2017: LedgerEntry[] = [
  {
    id: 'ya2017_001',
    transactionDate: '2017-01-15',
    description: 'ANNUAL STAFF DINNER - GALA EVENT',
    amount: 100000,
    type: 'DEBIT',
    sourceDocUrl: 'https://docs.example.com/invoice_001.pdf',
    supportingDocUrl: 'https://docs.example.com/receipt_001.pdf',
    category: 'Entertainment',
    confidenceScore: 0.85,
    auditStatus: 'PENDING',
    eInvoiceStatus: 'MISSING',
    dieFlags: ['MISCLASSIFICATION_RISK'],
    metadata: { accountCode: 8201, notes: 'Consider Staff Welfare classification' }
  },
  {
    id: 'ya2017_002',
    transactionDate: '2017-02-20',
    description: 'PURCHASE OF CNC AUTOMATION ROBOT',
    amount: 150000,
    type: 'DEBIT',
    sourceDocUrl: 'https://docs.example.com/invoice_002.pdf',
    supportingDocUrl: 'https://docs.example.com/invoice_002.pdf',
    category: 'Capital Expenditure',
    confidenceScore: 0.98,
    auditStatus: 'VALIDATED',
    eInvoiceStatus: 'VALIDATED',
    dieFlags: [],
    metadata: { accountCode: 7102, notes: 'Automation Capital Allowance eligible' }
  },
  {
    id: 'ya2017_003',
    transactionDate: '2017-03-10',
    description: 'JANUARY SALARY PAYROLL',
    amount: 1500,
    type: 'DEBIT',
    sourceDocUrl: 'https://docs.example.com/payroll_001.pdf',
    supportingDocUrl: 'https://docs.example.com/payroll_001.pdf',
    category: 'Staff Costs',
    confidenceScore: 0.95,
    auditStatus: 'PENDING',
    eInvoiceStatus: 'EXEMPT',
    dieFlags: ['MINIMUM_WAGE_RISK'],
    metadata: { accountCode: 8402, notes: 'Below 2026 minimum wage floor' }
  },
  {
    id: 'ya2017_004',
    transactionDate: '2017-04-05',
    description: 'SOFTWARE LICENSING FEES',
    amount: 25000,
    type: 'DEBIT',
    sourceDocUrl: 'https://docs.example.com/invoice_003.pdf',
    supportingDocUrl: 'https://docs.example.com/invoice_003.pdf',
    category: 'Software',
    confidenceScore: 0.90,
    auditStatus: 'PENDING',
    eInvoiceStatus: 'VALIDATED',
    dieFlags: [],
    metadata: { accountCode: 7102, notes: 'Automation CA eligible' }
  },
  {
    id: 'ya2017_005',
    transactionDate: '2017-05-12',
    description: 'SERVICE REVENUE - PROJECT ALPHA',
    amount: 50000,
    type: 'CREDIT',
    sourceDocUrl: 'https://docs.example.com/invoice_rev_001.pdf',
    supportingDocUrl: 'https://docs.example.com/invoice_rev_001.pdf',
    category: 'Revenue',
    confidenceScore: 0.92,
    auditStatus: 'VALIDATED',
    eInvoiceStatus: 'VALIDATED',
    dieFlags: [],
    metadata: { accountCode: 4000, notes: 'Software sales revenue' }
  }
];


// --- MAIN APP COMPONENT ---
export default function App() {
  const [activeTab, setActiveTab] = useState(1);
  const [forensicLedger, setForensicLedger] = useState<LedgerEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAuditMode, setIsAuditMode] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [pendingReclass, setPendingReclass] = useState<Record<string, Partial<UILedgerEntry>>>({});
  const [showIntro, setShowIntro] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Firebase auth - Email/Password only (anonymous auth disabled)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Handle sign in
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSigningIn(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Success - onAuthStateChanged will update user state
    } catch (error: any) {
      setAuthError(error.code || error.message);
      console.error('Sign in error:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  // Derived UI ledger from forensic ledger
  const uiLedger = useMemo(() => {
    return forensicLedger.map(mapLedgerEntryToUILedgerEntry);
  }, [forensicLedger]);

  // Helper to compute updated flags
  const computeUpdatedFlags = (entry: UILedgerEntry, newCategory: string): string[] => {
    const flags: string[] = [];
    if (newCategory === 'Staff Welfare' && entry.category === 'Entertainment') {
      flags.push('MISCLASSIFICATION_RISK');
    }
    if (entry.debit && entry.debit < 1700 && newCategory.includes('Salary')) {
      flags.push('MINIMUM_WAGE_RISK');
    }
    return flags;
  };

  // Handle reclassification
  const handleReclassifyEntry = (entryId: string, updates: Partial<UILedgerEntry>) => {
    const originalEntry = forensicLedger.find(e => e.id === entryId);
    if (!originalEntry) return;

    const updatedUIEntry: UILedgerEntry = {
      ...uiLedger.find(e => e.id === entryId)!,
      ...updates
    };

    const newFlags = computeUpdatedFlags(updatedUIEntry, updatedUIEntry.category);
    updatedUIEntry.dieFlags = newFlags;

    const updatedLedgerEntry = mapUILedgerEntryToLedgerEntry(updatedUIEntry, originalEntry);
    
    setForensicLedger(prev => 
      prev.map(e => e.id === entryId ? updatedLedgerEntry : e)
    );
  };

  // Run audit (load test data)
  const handleRunAudit = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setForensicLedger(massiveActivationYA2017);
      setIsProcessing(false);
      setActiveTab(2);
    }, 1500);
  };

  // Export audit pack
  const handleExportAuditPack = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      ledger: forensicLedger,
      metadata: {
        year: 'YA2017',
        entity: 'Test Entity',
        generatedBy: user?.uid || 'anonymous'
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `myaudit-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Tax stats
  const taxStats = useMemo(() => {
    const totalDebits = forensicLedger
      .filter(e => e.type === 'DEBIT')
      .reduce((sum, e) => sum + e.amount, 0);
    const totalCredits = forensicLedger
      .filter(e => e.type === 'CREDIT')
      .reduce((sum, e) => sum + e.amount, 0);
    const estimatedTax = totalCredits * 0.15; // Simplified 15% rate
    
    return {
      totalDebits,
      totalCredits,
      estimatedTax,
      netIncome: totalCredits - totalDebits
    };
  }, [forensicLedger]);

  // Flagged entries for Review tab
  const flaggedUiEntries = useMemo(() => {
    return uiLedger.filter(e => e.dieFlags && e.dieFlags.length > 0);
  }, [uiLedger]);

  // Evidence hash
  const evidenceHash = useMemo(() => {
    const hash = forensicLedger.length.toString(36).toUpperCase();
    return `EVID-${hash}-${Date.now().toString(36).slice(-4).toUpperCase()}`;
  }, [forensicLedger]);

  // --- RPR BRAND KIT v2.1 COLORS ---
  const colors = {
    charcoal: '#2B2F33',
    black: '#000000',
    cyan: '#00D9FF',
    white: '#F5F7FA',
    slate: '#3A4045',
    success: '#059669',
    warning: '#D97706',
    danger: '#B91C1C'
  };


  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-cyan-500/30" style={{ backgroundColor: colors.charcoal, color: colors.white }}>
      <YearTransitionScreen isVisible={showIntro} onComplete={() => setShowIntro(false)} />
      
      {!showIntro && !user && (
        <div className="flex-1 flex items-center justify-center p-10">
          <div className="w-full max-w-md">
            <div className="border-l-4 border-cyan-400 pl-8 py-2 mb-8">
              <h2 className="text-3xl font-black tracking-tighter uppercase text-white">Sign In</h2>
              <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">Email/Password Authentication</p>
            </div>
            <form onSubmit={handleSignIn} className="p-8 rounded-2xl bg-black/20 border border-white/5 space-y-6">
              <div>
                <label htmlFor="email" className="block text-[10px] text-slate-500 uppercase font-black mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="auditor@myaudit.test"
                  required
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-[10px] text-slate-500 uppercase font-black mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
              {authError && (
                <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30">
                  <p className="text-xs text-red-400 font-bold uppercase">{authError}</p>
                </div>
              )}
              <button
                type="submit"
                disabled={isSigningIn}
                className="w-full px-8 py-4 rounded-xl bg-cyan-500 text-slate-900 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-cyan-500/10 hover:translate-y-[-2px] active:translate-y-[0] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSigningIn ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Sign In
                  </>
                )}
              </button>
              <p className="text-[9px] text-slate-500 text-center italic mt-4">
                Test credentials: auditor@myaudit.test / TestPassword123!
              </p>
            </form>
          </div>
        </div>
      )}

      {!showIntro && user && (
        <>
          {/* --- SOVEREIGN HEADER --- */}
          <SovereignHeader user={user} isAuditMode={isAuditMode} />

          {/* --- MAIN WORKFLOW CANVAS --- */}
          <main className="flex-1 overflow-y-auto p-10 max-w-6xl mx-auto w-full">
            
            {/* TAB 1: SETUP */}
            {activeTab === 1 && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="border-l-4 border-cyan-400 pl-8 py-2">
                  <h2 className="text-3xl font-black tracking-tighter uppercase">01 Entity Setup</h2>
                  <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold italic">"Keeping the logic where it belongs: in the hands of the person who carries the risk."</p>
                </div>
                <div className="p-12 rounded-2xl bg-black/20 border border-white/5 flex flex-col items-center justify-center text-center space-y-6">
                  <Database size={48} className="text-cyan-500/20 mb-6" />
                  <p className="text-slate-400 max-w-md">Initialize the sovereign reporting context by mapping your legal entity to the 1000-9999 account substrate.</p>
                  <button
                    onClick={handleRunAudit}
                    disabled={isProcessing}
                    className="px-8 py-4 rounded-xl bg-cyan-500 text-slate-900 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-cyan-500/10 hover:translate-y-[-2px] active:translate-y-[0] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap size={16} />
                        Load YA 2017 Test Data
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: EXTRACTION */}
            {activeTab === 2 && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="border-l-4 border-cyan-400 pl-8 py-2">
                  <h2 className="text-3xl font-black tracking-tighter uppercase">02 Extraction</h2>
                  <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">Document Processing & Ledger Ingestion</p>
                </div>
                <div className="p-12 rounded-2xl bg-black/20 border border-white/5">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Forensic Ledger Status</p>
                      <p className="text-2xl font-black text-white">{forensicLedger.length} entries loaded</p>
                    </div>
                    {evidenceHash && (
                      <div className="text-right">
                        <p className="text-[9px] text-slate-500 uppercase font-black mb-1">Evidence Hash</p>
                        <p className="text-[11px] font-mono text-cyan-400">{evidenceHash}</p>
                      </div>
                    )}
                  </div>
                  {forensicLedger.length > 0 ? (
                    <div className="space-y-4">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-[11px]">
                          <thead className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] bg-black/40">
                            <tr>
                              <th className="px-4 py-3">Date</th>
                              <th className="px-4 py-3">Description</th>
                              <th className="px-4 py-3 text-right">Amount</th>
                              <th className="px-4 py-3">Category</th>
                              <th className="px-4 py-3">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 font-medium">
                            {uiLedger.slice(0, 10).map((entry) => (
                              <tr key={entry.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-4 py-3 font-mono text-cyan-400">{entry.date}</td>
                                <td className="px-4 py-3 text-slate-200 uppercase tracking-tight">{entry.description}</td>
                                <td className="px-4 py-3 text-right tabular-nums text-white">
                                  {entry.debit ? `RM ${entry.debit.toLocaleString()}` : entry.credit ? `RM ${entry.credit.toLocaleString()}` : '—'}
                                </td>
                                <td className="px-4 py-3 text-slate-400">{entry.category}</td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${
                                    entry.status === 'VALIDATED' ? 'bg-emerald-500/20 text-emerald-400' :
                                    entry.status === 'APPROVED' ? 'bg-cyan-500/20 text-cyan-400' :
                                    'bg-amber-500/20 text-amber-400'
                                  }`}>
                                    {entry.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {forensicLedger.length > 10 && (
                        <p className="text-[9px] text-slate-500 text-center italic">Showing first 10 of {forensicLedger.length} entries</p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Search size={48} className="text-cyan-500/20 mb-6 mx-auto" />
                      <p className="text-slate-400">No ledger entries loaded. Run the audit from Setup tab.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: REVIEW & VERIFY */}
            {activeTab === 3 && (
              <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
                <div className="flex justify-between items-end border-l-4 border-cyan-400 pl-8 py-2">
                  <div>
                    <h2 className="text-3xl font-black tracking-tighter uppercase">03 Review & Verify</h2>
                    <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">Reclassification & Validation</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase font-black">Flagged Entries</p>
                    <p className="text-xl font-black text-white uppercase tracking-tighter">{flaggedUiEntries.length}</p>
                  </div>
                </div>

                {flaggedUiEntries.length > 0 ? (
                  <div className="space-y-4">
                    {flaggedUiEntries.map((entry) => (
                      <div key={entry.id} className="p-6 rounded-2xl bg-black/20 border border-white/5 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <p className="text-white font-black text-sm uppercase">{entry.description}</p>
                              <span className="px-2 py-1 bg-red-500/20 text-red-400 text-[9px] font-black uppercase rounded">
                                {entry.dieFlags?.[0] || 'FLAGGED'}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-[10px] text-slate-400">
                              <span>{entry.date}</span>
                              <span className="font-mono">
                                {entry.debit ? `RM ${entry.debit.toLocaleString()}` : entry.credit ? `RM ${entry.credit.toLocaleString()}` : '—'}
                              </span>
                              <span>Current: {entry.category}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <select
                            value={entry.category}
                            onChange={(e) => handleReclassifyEntry(entry.id, { category: e.target.value })}
                            className="px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-[11px] font-black uppercase text-white focus:outline-none focus:border-cyan-500"
                          >
                            <option value="Entertainment">Entertainment</option>
                            <option value="Staff Welfare">Staff Welfare</option>
                            <option value="Capital Expenditure">Capital Expenditure</option>
                            <option value="Software">Software</option>
                            <option value="Staff Costs">Staff Costs</option>
                            <option value="Revenue">Revenue</option>
                          </select>
                          <button
                            onClick={() => handleReclassifyEntry(entry.id, { status: 'VALIDATED' })}
                            className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-[10px] font-black uppercase text-emerald-400 hover:bg-emerald-500/30 transition-all flex items-center gap-2"
                          >
                            <Check size={14} />
                            Validate
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 rounded-2xl bg-black/20 border border-white/5 flex flex-col items-center justify-center text-center">
                    <CheckCircle2 size={48} className="text-emerald-500/20 mb-6" />
                    <p className="text-slate-400 max-w-md">No flagged entries. All transactions are validated.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: TAX PLANNING */}
            {activeTab === 4 && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="border-l-4 border-emerald-500 pl-8 py-2">
                  <h2 className="text-3xl font-black tracking-tighter uppercase">04 Tax Planning</h2>
                  <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">Estimated Liability // Advisory Only</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-8 bg-black/20 border border-white/5 rounded-2xl">
                    <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Total Revenue</p>
                    <p className="text-3xl font-black text-white">RM {taxStats.totalCredits.toLocaleString()}</p>
                  </div>
                  <div className="p-8 bg-black/20 border border-white/5 rounded-2xl">
                    <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Total Expenses</p>
                    <p className="text-3xl font-black text-white">RM {taxStats.totalDebits.toLocaleString()}</p>
                  </div>
                  <div className="p-8 bg-cyan-900/10 border border-cyan-500/20 rounded-2xl">
                    <p className="text-[10px] text-cyan-400 uppercase font-black mb-1">Estimated Tax</p>
                    <p className="text-3xl font-black text-white">RM {taxStats.estimatedTax.toLocaleString()}</p>
                    <p className="text-[10px] text-cyan-500/70 mt-2 font-bold uppercase tracking-widest">15% Flat Rate</p>
                  </div>
                </div>
                <div className="p-6 bg-black/40 rounded-xl border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase font-black mb-2">Net Income</p>
                  <p className="text-2xl font-black text-white">RM {taxStats.netIncome.toLocaleString()}</p>
                </div>
              </div>
            )}

            {/* TAB 5: EXPORT */}
            {activeTab === 5 && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="border-l-4 border-warning pl-8 py-2">
                  <h2 className="text-3xl font-black tracking-tighter uppercase">05 Export</h2>
                  <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">Generate Final Audit Pack</p>
                </div>
                <div className="p-12 rounded-2xl bg-black/20 border border-white/5 flex flex-col items-center justify-center text-center space-y-6">
                  <FileSpreadsheet size={48} className="text-cyan-500/20 mb-6" />
                  <p className="text-slate-400 max-w-md">Export the complete forensic ledger as a JSON audit pack for external review.</p>
                  <button
                    onClick={handleExportAuditPack}
                    disabled={forensicLedger.length === 0}
                    className="px-10 py-4 rounded-xl bg-cyan-500 text-slate-900 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-cyan-500/10 hover:translate-y-[-2px] active:translate-y-[0] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Download size={16} />
                    Export Audit Pack (JSON)
                  </button>
                  {forensicLedger.length > 0 && (
                    <p className="text-[9px] text-slate-500 italic">
                      {forensicLedger.length} entries • {evidenceHash}
                    </p>
                  )}
                </div>
              </div>
            )}

          </main>

          {/* --- SOVEREIGN NAVIGATION --- */}
          <TabRail activeTab={activeTab} onTabChange={setActiveTab} />

          <footer className="bg-black py-10 border-t border-white/10 px-10">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex flex-col">
                <span className="text-sm font-black text-white tracking-widest uppercase">RPR COMMUNICATIONS</span>
                <p className="text-[9px] text-slate-600 tracking-[0.5em] uppercase mt-1">Sovereign Identity Substrate // Build 2026.01.15</p>
              </div>
              <div className="text-center md:text-right">
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">© 2026 RPR Communications, LLC. Delaware, USA.</p>
                <p className="text-[9px] uppercase font-bold text-cyan-400 mt-1 tracking-widest">Sovereign Logic Integrator v2.2 // Malaysia Active</p>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
