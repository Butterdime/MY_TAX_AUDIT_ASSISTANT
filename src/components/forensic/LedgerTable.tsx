import React from 'react';
import { LedgerEntry } from '../../types';
import { TransactionRow } from './TransactionRow';

interface LedgerTableProps {
    transactions: LedgerEntry[];
}

export const LedgerTable: React.FC<LedgerTableProps> = ({ transactions }) => {
    return (
        <div className="bg-transparent space-y-3">
            {/* Table Header */}
            <div className="grid grid-cols-7 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <div className="col-span-1">Date</div>
                <div className="col-span-2">Description</div>
                <div className="col-span-1">Amount</div>
                <div className="col-span-1 text-center">E-Invoice</div>
                <div className="col-span-1 text-center">Status</div>
                <div className="col-span-1 text-right">Action</div>
            </div>

            {/* Table Rows */}
            {transactions.map((entry) => (
                <TransactionRow key={entry.id} entry={entry} />
            ))}

            {transactions.length === 0 && (
                <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-slate-500 text-sm">No transactions found matching your search.</p>
                </div>
            )}
        </div>
    );
};
