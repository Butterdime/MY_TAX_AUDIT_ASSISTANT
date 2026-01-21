// src/types/viewModels.ts
import type { LedgerEntry, DieFlag } from './index';

export interface UILedgerEntry {
  id: string;
  date: string;
  debit?: number;
  credit?: number;
  description: string;
  category?: string;
  status: string;
  confidence?: number;
  flags: string[]; // messages only
}

export function deriveDebit(entry: LedgerEntry): number | undefined {
  if (entry.debit !== undefined) return entry.debit;
  if (entry.type === 'debit' || entry.type === 'DEBIT') return entry.amount;
  return undefined;
}

export function deriveCredit(entry: LedgerEntry): number | undefined {
  if (entry.credit !== undefined) return entry.credit;
  if (entry.type === 'credit' || entry.type === 'CREDIT') return entry.amount;
  return undefined;
}

export function toUILedgerEntry(entry: LedgerEntry): UILedgerEntry {
  const allFlags = [
    ...(entry.forensicFlags?.map(f => f.message) ?? []),
    ...(entry.dieFlags ?? [])
  ];

  return {
    id: entry.id,
    date: entry.date ?? entry.transactionDate,
    debit: deriveDebit(entry),
    credit: deriveCredit(entry),
    description: entry.description,
    category: entry.category,
    status: entry.status ?? entry.auditStatus,
    confidence: entry.confidence ?? entry.confidenceScore,
    flags: allFlags,
  };
}
