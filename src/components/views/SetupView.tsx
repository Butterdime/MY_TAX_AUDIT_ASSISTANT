import React from 'react';
import { Database, RefreshCw, Zap } from 'lucide-react';
import { useForensicContext } from '../../context/ForensicContext';

const SetupView = () => {
    const { handleRunAudit, rawEntries } = useForensicContext();
    const [isProcessing, setIsProcessing] = React.useState(false);

    const handleButtonClick = () => {
        setIsProcessing(true);
        handleRunAudit();
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="border-l-4 border-cyan-400 pl-8 py-2">
                <h2 className="text-3xl font-black tracking-tighter uppercase">01 Entity Setup</h2>
                <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold italic">"Keeping the logic where it belongs: in the hands of the person who carries the risk."</p>
            </div>
            <div className="p-12 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center space-y-6">
                <Database size={48} className="text-cyan-400/20 mb-6" />
                <p className="text-slate-400 max-w-md">Initialize the sovereign reporting context by mapping your legal entity to the 1000-9999 account substrate.</p>
                <button
                    onClick={handleButtonClick}
                    disabled={isProcessing || rawEntries.length > 0}
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
    );
};

export default SetupView;