import React, { useState } from 'react';
import type { UILedgerEntry } from '../../types/viewModels';
import { IncentiveMatchBadge } from '../incentives/IncentiveMatchBadge';

interface Props {
  transaction: UILedgerEntry;
}

const TransactionRow: React.FC<Props> = ({ transaction }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const amount = transaction.debit ?? transaction.credit ?? 0;

  return (
    <>
      <tr
        className={`border-b border-slate-800 hover:bg-slate-700/50 ${transaction.flags.length > 0 ? 'cursor-pointer' : ''}`}
        onClick={() => transaction.flags.length > 0 && setIsExpanded(!isExpanded)}
      >
        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{transaction.date}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
          <div className="flex items-center space-x-2">
            <span>{transaction.description}</span>
            <IncentiveMatchBadge category={transaction.category!} />
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono text-emerald-400">{amount.toFixed(2)}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{transaction.category}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${transaction.status === 'VALIDATED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {transaction.status}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">{transaction.confidence ? `${(Number(transaction.confidence) * 100).toFixed(0)}%` : 'N/A'}</td>
      </tr>
      {isExpanded && (
        <tr className="bg-slate-800/50">
          <td colSpan={6} className="p-4">
            <div className="space-y-2">
              <p className="text-xs font-bold text-amber-400">Forensic Flags:</p>
              {transaction.flags.map((flag, index) => (
                <p key={index} className="text-xs text-slate-300 font-mono">{flag}</p>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default TransactionRow;
