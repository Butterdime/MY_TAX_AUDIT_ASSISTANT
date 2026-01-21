import React, { useState } from 'react';
import type { UILedgerEntry } from '../../types/viewModels';

export interface LedgerTableProps {
  entries: UILedgerEntry[];
}

const CategoryCell: React.FC<{ entry: UILedgerEntry, onUpdate: (newCategory: string) => void }> = ({ entry, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(entry.category);

  if (isEditing) {
    return (
      <select 
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => {
          if (value) onUpdate(value);
          setIsEditing(false);
        }}
        autoFocus
        className="bg-slate-900 text-white w-full"
      >
        <option>Staff Welfare</option>
        <option>Entertainment</option>
        <option>Uncategorized</option>
        <option>Asset Purchase</option>
        <option>Operating Expense</option>
      </select>
    );
  }

  return (
    <div onClick={() => setIsEditing(true)} className="cursor-pointer">
      {entry.category}
    </div>
  );
};

export const LedgerTable: React.FC<LedgerTableProps> = ({ entries }) => {
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'AUDIT_READY': return 'text-emerald-400';
      case 'VALIDATED': return 'text-sky-400';
      case 'FLAGGED': return 'text-amber-400';
      default: return 'text-slate-400';
    }
  };

  const FlagPill: React.FC<{flag: string}> = ({ flag }) => (
    <div className="bg-amber-900/50 border border-amber-700 text-amber-300 text-[10px] px-1.5 py-0.5 rounded-full inline-block whitespace-nowrap">
      {flag}
    </div>
  );

  return (
    <div className="overflow-x-auto bg-slate-800/50 rounded-lg border border-slate-700">
      <table className="min-w-full text-sm text-left text-slate-300">
        <thead className="text-xs text-slate-400 uppercase bg-slate-900/50">
          <tr>
            <th scope="col" className="px-6 py-3">Date</th>
            <th scope="col" className="px-6 py-3">Description</th>
            <th scope="col" className="px-6 py-3">Category</th>
            <th scope="col" className="px-6 py-3 text-right">Amount (RM)</th>
            <th scope="col" className="px-6 py-3">Flags</th>
            <th scope="col" className="px-6 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b border-slate-700 hover:bg-slate-800/40">
              <td className="px-6 py-4">{entry.date}</td>
              <td className="px-6 py-4 font-medium text-white">{entry.description}</td>
              <td className="px-6 py-4">
                 <CategoryCell 
                    entry={entry} 
                    onUpdate={(newCategory) => console.log('Update category to:', newCategory)}
                />
              </td>
              <td className="px-6 py-4 text-right font-mono">
                {entry.debit ? entry.debit.toFixed(2) : entry.credit ? `-${entry.credit.toFixed(2)}` : '0.00'}
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col gap-1.5 items-start">
                  {entry.flags?.map((flag, index) => <FlagPill key={index} flag={flag} />)}
                </div>
              </td>
              <td className={`px-6 py-4 font-medium ${getStatusColor(entry.status)}`}>{entry.status.replace('_', ' ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LedgerTable;
