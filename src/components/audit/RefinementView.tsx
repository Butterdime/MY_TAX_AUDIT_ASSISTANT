import React from 'react';
import { CheckCircle2, Check } from 'lucide-react';
import type { UILedgerEntry } from '../../types/viewModels';

interface RefinementViewProps {
  entries: UILedgerEntry[];
  onReclassify: (id: string, updates: Partial<Pick<UILedgerEntry, 'category' | 'status'>>) => void;
  integrityScore: number;
}

const RefinementView: React.FC<RefinementViewProps> = ({
  entries,
  onReclassify,
  integrityScore
}) => {
    const flaggedEntries = entries.filter(e => e.flags && e.flags.length > 0);
    const categoryOptions = [
        'Entertainment',
        'Staff Welfare',
        'Capital Expenditure',
        'Software',
        'Staff Costs',
        'Revenue',
      ];

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
      <div className="flex justify-between items-end border-l-4 border-cyan-400 pl-8 py-2">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase text-white">
            03 Review & Verify
          </h2>
          <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">
            Reclassification & Validation
          </p>
        </div>
        <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Integrity Score</p>
            <p className="text-[11px] font-mono text-cyan-400">{integrityScore.toFixed(2)}</p>
        </div>
      </div>

      {flaggedEntries.length > 0 ? (
        <div className="space-y-4">
          {flaggedEntries.map((entry) => (
            <div
              key={entry.id}
              className={`p-6 rounded-3xl bg-slate-950 border ${entry.flags?.includes('MIN_WAGE_VIOLATION') ? 'border-amber-400/50' : 'border-slate-800'} space-y-4`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-white font-black text-sm uppercase">
                      {entry.description}
                    </p>
                    <span className={`px-2 py-1 text-[9px] font-black uppercase rounded ${entry.flags?.includes('MIN_WAGE_VIOLATION') ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                      {entry.flags?.[0] || 'FLAGGED'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-slate-400">
                    <span>{entry.date}</span>
                    <span className="font-mono">
                      {entry.debit
                        ? `RM ${entry.debit.toLocaleString()}`
                        : entry.credit
                        ? `RM ${entry.credit.toLocaleString()}`
                        : '—'}
                    </span>
                    <span>Current: {entry.category}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={entry.category}
                  onChange={(e) => onReclassify(entry.id, { category: e.target.value })}
                  className="px-4 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-[11px] font-black uppercase text-white focus:outline-none focus:border-cyan-400"
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <button
                  onClick={() => onReclassify(entry.id, { status: 'VALIDATED' })}
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
        <div className="p-12 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center">
          <CheckCircle2 size={48} className="text-emerald-500/20 mb-6" />
          <p className="text-slate-400 max-w-md">
            No flagged entries. All transactions are validated.
          </p>
        </div>
      )}
    </div>
  );
};
export default RefinementView;