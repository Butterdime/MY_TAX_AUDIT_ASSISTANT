import React from 'react';
import type { UILedgerEntry } from '../../types/viewModels';
import TransactionRow from './TransactionRow';

interface Props {
  transactions: UILedgerEntry[];
}

const ExtractionResults: React.FC<Props> = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-slate-500">No transactions extracted yet. Start a new extraction process.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">Extracted Transactions</h2>
      <table className="w-full text-sm text-left text-slate-300">
        <thead className="text-xs text-slate-400 uppercase bg-slate-700">
          <tr>
            <th scope="col" className="px-6 py-3">Date</th>
            <th scope="col" className="px-6 py-3">Description</th>
            <th scope="col" className="px-6 py-3 text-right">Amount (MYR)</th>
            <th scope="col" className="px-6 py-3">Category</th>
            <th scope="col" className="px-6 py-3">E-Invoice</th>
            <th scope="col" className="px-6 py-3">AI Confidence</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <TransactionRow key={tx.id} transaction={tx} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExtractionResults;
