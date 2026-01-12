import React from 'react';
import { RemediationTask } from '../../logic/remediation';

interface Props {
  tasks: RemediationTask[];
  onFix: (task: RemediationTask) => void;
}

const RemediationList: React.FC<Props> = ({ tasks, onFix }) => {
  if (tasks.length === 0) return (
    <div className="mt-8 p-6 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
      <p className="text-emerald-800 font-medium italic">All high-risk items resolved. Ledger is audit-ready.</p>
    </div>
  );

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Priority Remediation Checklist</h3>
        <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold uppercase">Heuristic View</span>
      </div>
      
      <div className="space-y-3">
        {tasks.map(task => (
          <div key={task.id} className="group flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl transition-all hover:border-slate-400">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900">{task.description}</span>
              <span className="text-[10px] font-mono text-slate-500 uppercase">
                {task.reason === 'MISSING_DOC' ? '⚠️ Missing Doc > RM500' : '❓ Uncategorized'}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-red-600">~ RM {task.simulatedSavings.toLocaleString()} (Simulated)</span>
              <button onClick={() => onFix(task)} className="mt-2 text-[10px] bg-slate-900 text-white px-4 py-1.5 rounded-lg font-bold uppercase hover:bg-red-600 transition-colors">
                Fix Now
              </button>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[9px] text-slate-400 italic leading-tight">
        * "Simulated Savings" represents the tax impact if the item is disallowed at the 24% rate. Final treatment subject to LHDN audit rules.
      </p>
    </div>
  );
};

export default RemediationList;
