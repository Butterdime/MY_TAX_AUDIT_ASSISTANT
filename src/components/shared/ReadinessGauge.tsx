import React from 'react';

interface Props {
  score: number;
}

const ReadinessGauge: React.FC<Props> = ({ score }) => {
  const getColor = (s: number) => {
    if (s > 85) return 'text-emerald-500';
    if (s > 60) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 flex items-center gap-8 shadow-sm">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-100" strokeWidth="3" />
          <circle 
            cx="18" cy="18" r="16" fill="none" 
            className={`${getColor(score)} transition-all duration-1000 ease-in-out`} 
            strokeWidth="3" 
            strokeDasharray={`${score}, 100`}
            strokeLinecap="round"
            stroke="currentColor"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-black text-slate-900">{score}%</span>
        </div>
      </div>

      <div className="flex-1">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Internal Readiness Rating</h4>
        <p className="text-lg font-bold text-slate-900 leading-tight">
          {score === 100 
            ? "Audit-Ready: All entries documented." 
            : "Action Required: Forensic Gaps Detected."}
        </p>
        <p className="text-[10px] text-slate-500 mt-2 leading-relaxed italic">
          Note: This is an internal readiness check, not an LHDN or statutory compliance determination. 
          The score reflects your current documentation status.
        </p>
      </div>
    </div>
  );
};

export default ReadinessGauge;
