import React from 'react';
import { LedgerEntry } from '../../types';

interface TransactionRowProps {
    entry: LedgerEntry;
}

export const TransactionRow: React.FC<TransactionRowProps> = ({ entry }) => {
    const hasDieFlags = (entry.dieFlags?.length ?? 0) > 0;
    const isDieFlagged = entry.status === 'USER_REVIEWED' && hasDieFlags; // Based on prototype behavior

    return (
        <div className={`grid grid-cols-7 items-center px-6 py-4 bg-white dark:bg-slate-900 rounded-xl transition-all relative group ${hasDieFlags
                ? 'border-2 border-neon-amber shadow-[0_4px_20px_-5px_rgba(255,176,0,0.15)]'
                : 'border border-slate-100 dark:border-slate-800 hover:shadow-md'
            }`}>
            {hasDieFlags && (
                <div className="absolute -left-1 top-4 bottom-4 w-1 bg-neon-amber rounded-full"></div>
            )}

            {/* Date */}
            <div className="col-span-1 text-sm text-slate-500 font-medium">
                {(entry as any).date ? new Date((entry as any).date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
            </div>

            {/* Description */}
            <div className="col-span-2">
                <div className="font-bold text-slate-900 dark:text-white uppercase">{entry.description}</div>
                <div className="flex flex-col gap-1 mt-1">
                    {hasDieFlags && (
                        <div className="flex items-center gap-1">
                            <span className="text-[10px] bg-neon-amber/10 text-neon-amber px-1.5 py-0.5 rounded font-bold uppercase">
                                {entry.dieFlags![0].flagType.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                                {entry.category} → {entry.dieFlags![0].suggestion}
                            </span>
                        </div>
                    )}
                    {!hasDieFlags && (
                        <div className="text-[10px] text-slate-400 font-medium">{entry.category}</div>
                    )}
                </div>
            </div>

            {/* Amount */}
            <div className="col-span-1 font-bold text-slate-900 dark:text-white">
                RM {entry.debit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>

            {/* E-Invoice */}
            <div className="col-span-1 flex justify-center">
                {entry.eInvoiceStatus === 'valid' ? (
                    <span className="material-symbols-outlined text-soft-mint text-[20px]">check_circle</span>
                ) : (
                    <div className="group/tip relative flex items-center justify-center">
                        <span className="material-symbols-outlined text-neon-amber" title="Missing E-Invoice">warning</span>
                        <span className="absolute -top-8 hidden group-hover/tip:block bg-slate-800 text-white text-[9px] px-2 py-1 rounded whitespace-nowrap">Missing E-Invoice</span>
                    </div>
                )}
            </div>

            {/* Status */}
            <div className="col-span-1 flex justify-center">
                {hasDieFlags ? (
                    <span className="px-3 py-1 bg-neon-amber text-white text-[10px] font-black rounded-full shadow-sm">DIE_FLAGGED</span>
                ) : entry.status === 'AUDIT_READY' ? (
                    <span className="px-3 py-1 bg-soft-mint/10 text-soft-mint text-[10px] font-black rounded-full uppercase">Audit_Ready</span>
                ) : (
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-black rounded-full uppercase">{entry.status}</span>
                )}
            </div>

            {/* Action */}
            <div className="col-span-1 text-right">
                <button className={`${hasDieFlags ? 'text-neon-amber hover:underline' : 'text-slate-400 hover:text-slate-600'} font-bold text-sm transition-colors`}>
                    {hasDieFlags ? 'Review' : 'View'}
                </button>
            </div>
        </div>
    );
};
