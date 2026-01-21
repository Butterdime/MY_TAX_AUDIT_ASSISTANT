import React from 'react';
import ruleRegistry from '../../data/rule-registry-ya2026.json';
import { IncentiveSignals, LedgerEntry } from '../../types';

interface Props {
  signals: IncentiveSignals;
  transactions: LedgerEntry[];
}

const MrRpp: React.FC<Props> = ({ signals, transactions }) => {

  const automationSavings = transactions
    .filter(t => t.category === 'Asset Purchase' && !(t.dieFlags && t.dieFlags.length > 0) && t.type === 'DEBIT')
    .reduce((acc, t) => acc + t.amount, 0) * 0.17; // Assumes 100% additional allowance * 17% tax rate

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-700 p-4 w-full max-w-sm mx-auto space-y-4 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <h4 className="font-bold text-white uppercase tracking-wider text-xs">Mr R.P.P Tax Advisory</h4>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 h-96">
        {/* Calculated Savings Card */}
        {automationSavings > 0 && (
            <div className="p-4 bg-sky-900/20 border-l-4 border-sky-500 rounded-r shadow-sm">
                <h5 className="font-bold text-sky-400 text-xs">Automation CA Savings</h5>
                <p className="text-xl font-bold text-white mt-1">RM {automationSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                    Estimated tax savings from asset purchases qualifying for Automation Capital Allowance.
                </p>
            </div>
        )}

        {/* Rule-based Advisory Cards */}
        {ruleRegistry.map((rule) => {
          if (!signals[rule.triggerSignal as keyof IncentiveSignals]) return null;
          return (
            <div key={rule.ruleId} className="p-4 bg-emerald-900/20 border-l-4 border-emerald-500 rounded-r shadow-sm">
              <h5 className="font-bold text-emerald-400 text-xs">{rule.shortName}</h5>
              <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                {rule.advisoryText}
              </p>
              <p className="text-[9px] text-slate-500 mt-3 font-mono">STATUTORY REF: {rule.taxCode}</p>
            </div>
          );
        })}
        
        {Object.values(signals).every(s => !s) && automationSavings === 0 && (
          <p className="text-xs text-slate-500 italic text-center py-10">No specific incentives or savings detected.</p>
        )}
      </div>

      {/* Mandatory Disclaimer */}
      <div className="pt-4 border-t border-slate-800">
        <div className="p-3 bg-red-900/10 rounded border border-red-900/30">
          <p className="text-[9px] leading-tight text-red-400 font-medium">
            DISCLAIMER: This is planning guidance based on general Malaysian tax rules. 
            Confirm with a licensed tax agent before filing. Not professional advice.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MrRpp;
