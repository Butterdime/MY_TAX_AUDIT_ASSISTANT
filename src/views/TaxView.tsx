import React from 'react';
import { computeSmeTaxScenario } from '../utils/logic/taxcompute';
import TaxPlanningView from '../components/audit/TaxPlanningView';
import { useForensicContext } from '../context/ForensicContext';

const TaxView: React.FC = () => {
  const { rawEntries } = useForensicContext();

  const chargeableIncome = rawEntries.reduce((acc, entry) => {
    if (entry.type === 'CREDIT') {
      return acc + entry.amount;
    }
    if (entry.type === 'DEBIT') {
      return acc - entry.amount;
    }
    return acc;
  }, 0);

  const taxScenario = computeSmeTaxScenario(chargeableIncome, true);

  const handleOptimize = () => {
    console.log("Optimization heuristics initiated...");
  };

  return (
    <div className="font-display space-y-8 animate-in fade-in duration-500">
      <div className="border-l-4 border-emerald-500 pl-8 py-2">
        <h2 className="text-3xl font-black tracking-tighter uppercase text-white">Stage 4: Tax Simulation</h2>
        <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">
          Project your YA 2026 tax obligations based on the refined ledger.
        </p>
      </div>

      <div className="p-1 rounded-2xl bg-black/20 border border-white/5">
        <TaxPlanningView scenario={taxScenario} onOptimize={handleOptimize} />
      </div>
    </div>
  );
};

export default TaxView;
