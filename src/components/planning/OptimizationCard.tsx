import React from 'react';
import { calculateSMEOptimization } from '../../logic/taxOptimization';

interface Props {
  projectedChargeableIncome: number;
}

const OptimizationCard: React.FC<Props> = ({ projectedChargeableIncome }) => {
  const { optimizedTax, totalSavings } = calculateSMEOptimization(projectedChargeableIncome);

  return (
    <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg border border-slate-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-400">YA 2026 Optimization Simulation</h3>
        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded border border-indigo-500/30 font-mono">
          SME STATUS: ACTIVE
        </span>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Estimated SME Tax</p>
          <p className="text-2xl font-bold">RM {optimizedTax.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-emerald-500 uppercase font-bold mb-1">Potential Advantage</p>
          <p className="text-2xl font-bold text-emerald-400">RM {totalSavings.toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-800">
        <p className="text-[9px] text-slate-500 leading-relaxed italic">
          Disclaimer: This simulation assumes the entity meets LHDN SME criteria (paid-up capital ≤ RM 2.5m). 
          Actual tax payable is determined by the statutory Mr R.P.P engine based on final audited accounts.
        </p>
      </div>
    </div>
  );
};

export default OptimizationCard;
