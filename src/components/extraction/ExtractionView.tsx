import React from 'react';
import { Search } from 'lucide-react';
import { useForensicContext } from '../../context/ForensicContext';

const ExtractionView = () => {
    const { entries, rawEntries } = useForensicContext();
    const evidenceHash = `EVID-${rawEntries.length.toString(36).toUpperCase()}-${Date.now().toString(36).slice(-4).toUpperCase()}`;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="border-l-4 border-cyan-400 pl-8 py-2">
        <h2 className="text-3xl font-black tracking-tighter uppercase text-white">
          02 Extraction
        </h2>
        <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">
          Document Processing & Ledger Ingestion
        </p>
      </div>

      <div className="p-12 rounded-3xl bg-slate-950 border border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-black mb-1">
              Forensic Ledger Status
            </p>
            <p className="text-2xl font-black text-white">{rawEntries.length} entries loaded</p>
          </div>
          {evidenceHash && (
            <div className="text-right">
              <p className="text-[9px] text-slate-500 uppercase font-black mb-1">
                Evidence Hash
              </p>
              <p className="text-[11px] font-mono text-cyan-400">{evidenceHash}</p>
            </div>
          )}
        </div>

        {entries.length > 0 ? (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] bg-slate-950/60">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium">
                  {entries.slice(0, 10).map((entry) => (
                    <tr
                      key={entry.id}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-cyan-400">{entry.date}</td>
                      <td className="px-4 py-3 text-slate-200 uppercase tracking-tight">
                        {entry.description}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-white">
                        {entry.debit
                          ? `RM ${entry.debit.toLocaleString()}`
                          : entry.credit
                          ? `RM ${entry.credit.toLocaleString()}`
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-400">{entry.category}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${
                          entry.status === 'VALIDATED'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : entry.status === 'APPROVED'
                            ? 'bg-cyan-500/20 text-cyan-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rawEntries.length > 10 && (
              <p className="text-[9px] text-slate-500 text-center italic">
                Showing first 10 of {rawEntries.length} entries
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search size={48} className="text-cyan-400/20 mb-6 mx-auto" />
            <p className="text-slate-400">
              No ledger entries loaded. Run the audit from Setup tab.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExtractionView;