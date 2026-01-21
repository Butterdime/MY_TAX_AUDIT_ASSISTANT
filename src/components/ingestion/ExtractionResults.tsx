import React from 'react';
import type { UILedgerEntry } from '../../types/viewModels';

interface Props {
  transactions: UILedgerEntry[];
}

export const ExtractionResults: React.FC<Props> = ({ transactions }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-white">Extraction Results</h2>
        <p className="text-sm text-slate-400 mt-1">Found {transactions.length} ledger entries.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800">
          <thead className="bg-slate-950">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Description</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Category</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody className="bg-slate-900 divide-y divide-slate-800">
            {transactions.map((entry) => (
              <tr key={entry.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{entry.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{entry.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{entry.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono text-emerald-400">{(entry.debit ?? entry.credit)?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExtractionResults;
