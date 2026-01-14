import React from 'react';
import { IncentiveSignals } from '../types';
import { CheckCircle, XCircle } from 'lucide-react';

interface Props {
  signals: IncentiveSignals;
  onUpdate: (key: keyof IncentiveSignals, value: boolean) => void;
}

const IncentiveProfile: React.FC<Props> = ({ signals, onUpdate }) => (
  <div className="p-6 bg-slate-900/50 rounded-lg border border-slate-800/50">
    <h3 className="text-white font-bold mb-6">SME Incentive Profile</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Entity Context Card */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
        <h4 className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Entity Context</h4>
        <p className="mt-3 text-lg text-white font-medium">SME, Sdn Bhd</p>
        <p className="text-xs text-slate-500">Paid-up Capital &lt; RM2.5m</p>
      </div>
      
      {/* Tax Residency Card */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
        <h4 className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Tax Residency</h4>
        <p className="mt-3 text-lg text-white font-medium">Malaysian Resident</p>
        <p className="text-xs text-slate-500">Central Management & Control in MY</p>
      </div>

      {/* Incentive Eligibility Card */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
        <h4 className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Incentive Eligibility</h4>
        <div className="mt-3 flex items-center gap-3">
          {signals.hasPioneerStatus ? (
            <CheckCircle className="w-6 h-6 text-emerald-500" />
          ) : (
            <XCircle className="w-6 h-6 text-rose-500" />
          )}
          <p className="text-lg text-white font-medium">
            {signals.hasPioneerStatus ? "Eligible (Pioneer Status)" : "Not a Pioneer Company"}
          </p>
        </div>
        <p className="text-xs text-slate-500">Check MIDA registration for details.</p>
      </div>
    </div>
    
    {/* Interactive Signal Toggles */}
    <div className="mt-8 pt-6 border-t border-slate-800">
        <h4 className="text-sm text-slate-400 uppercase tracking-wider font-semibold mb-4">Simulated Signals</h4>
        <div className="flex flex-wrap gap-4">
            {Object.keys(signals).map(key => (
                <button 
                  key={key}
                  onClick={() => onUpdate(key as keyof IncentiveSignals, !signals[key as keyof IncentiveSignals])}
                  className={`flex items-center gap-2 p-2 rounded-md text-xs border transition-all ${signals[key as keyof IncentiveSignals] ? 'bg-blue-600/20 border-blue-500/30 text-blue-300' : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-700/50'}`}>
                  {signals[key as keyof IncentiveSignals] ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </button>
            ))}
        </div>
    </div>
  </div>
);

export default IncentiveProfile;
