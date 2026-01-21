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
import { auth } from './firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, User } from 'firebase/auth';
import SovereignHeader from './components/layout/SovereignHeader';
import TabRail from './components/layout/TabRail';
import TaxView from './views/TaxView';
import { ForensicProvider, useForensicContext } from './context/ForensicContext';
import LedgerTable from './components/forensic/LedgerTable';
import AouthaPanel from './components/aoutha/AouthaPanel';

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

// --- MAIN APP CONTENT ---
const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState(1);
  const { entries, rawEntries, loading, error, handleRunAudit } = useForensicContext();

  const handleRunAuditAndSwitchTab = async () => {
    await handleRunAudit();
    setActiveTab(2);
  };

  const evidenceHash = useMemo(() => {
    const hash = rawEntries.length.toString(36).toUpperCase();
    return `EVID-${hash}-${Date.now().toString(36).slice(-4).toUpperCase()}`;
  }, [rawEntries]);

  return (
    <>
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
                onClick={handleRunAuditAndSwitchTab}
                disabled={loading}
                className="px-8 py-4 rounded-xl bg-cyan-500 text-slate-900 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-cyan-500/10 hover:translate-y-[-2px] active:translate-y-[0] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
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
                <h2 className="text-3xl font-black tracking-tighter uppercase">02 Extraction & AOUTHA</h2>
                <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">Document Processing & Ledger Ingestion</p>
              </div>
            <AouthaPanel rawEntries={rawEntries} />
            <LedgerTable entries={entries} />
          </div>
        )}

        {/* TAB 3: REVIEW & VERIFY */}
        {activeTab === 3 && (
           <div className="space-y-8 animate-in fade-in duration-500">
             <div className="border-l-4 border-cyan-400 pl-8 py-2">
                <h2 className="text-3xl font-black tracking-tighter uppercase">03 Review & Verify</h2>
                <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">Reclassification & Validation</p>
              </div>
            <LedgerTable entries={entries.filter(e => e.flags.length > 0)} />
          </div>
        )}

        {/* TAB 4: TAX PLANNING */}
        {activeTab === 4 && (
            <TaxView />
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
                onClick={() => {}}
                disabled={rawEntries.length === 0}
                className="px-10 py-4 rounded-xl bg-cyan-500 text-slate-900 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-cyan-500/10 hover:translate-y-[-2px] active:translate-y-[0] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Download size={16} />
                Export Audit Pack (JSON)
              </button>
              {rawEntries.length > 0 && (
                <p className="text-[9px] text-slate-500 italic">
                  {rawEntries.length} entries • {evidenceHash}
                </p>
              )}
            </div>
          </div>
        )}
      </main>

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
  );
}


// --- ROOT APP COMPONENT ---
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [email, setEmail] = useState('auditor@myaudit.test');
  const [password, setPassword] = useState('TestPassword123!');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSigningIn(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setAuthError(error.code || error.message);
    } finally {
      setIsSigningIn(false);
    }
  };

  const colors = {
    charcoal: '#2B2F33',
    black: '#000000',
    cyan: '#00D9FF',
    white: '#F5F7FA',
    slate: '#3A4045',
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
            </form>
          </div>
        </div>
      )}

      {!showIntro && user && (
        <ForensicProvider>
          <SovereignHeader user={user} isAuditMode={false} />
          <AppContent />
        </ForensicProvider>
      )}
    </div>
  );
}
