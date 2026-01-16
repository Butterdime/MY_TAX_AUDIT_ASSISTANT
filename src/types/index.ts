export * from '../types';

// UI-specific ledger entry type for display and editing
export interface UILedgerEntry {
  id: string;
  date: string;
  description: string;
  debit?: number;
  credit?: number;
  category: string;
  status: string;
  dieFlags?: string[];
  confidence?: number;
}

// Mapping functions for converting between canonical and UI formats
import type { LedgerEntry, TransactionType, AuditStatus, EInvoiceStatus } from '../types';

export function mapLedgerEntryToUILedgerEntry(entry: LedgerEntry): UILedgerEntry {
  const isDebit = entry.type === 'DEBIT';
  return {
    id: entry.id,
    date: entry.transactionDate,
    description: entry.description,
    debit: isDebit ? entry.amount : undefined,
    credit: !isDebit ? entry.amount : undefined,
    category: entry.category,
    status: entry.auditStatus,
    dieFlags: entry.dieFlags,
    confidence: entry.confidenceScore,
  };
}

export function mapUILedgerEntryToLedgerEntry(uiEntry: UILedgerEntry, original?: LedgerEntry): LedgerEntry {
  const amount = (uiEntry.debit || 0) + (uiEntry.credit || 0);
  const type: TransactionType = uiEntry.debit ? 'DEBIT' : 'CREDIT';
  
  return {
    id: uiEntry.id,
    transactionDate: uiEntry.date,
    description: uiEntry.description,
    amount,
    type,
    sourceDocUrl: original?.sourceDocUrl || '',
    supportingDocUrl: original?.supportingDocUrl || '',
    category: uiEntry.category,
    confidenceScore: uiEntry.confidence || original?.confidenceScore || 0.5,
    auditStatus: uiEntry.status as AuditStatus || 'PENDING',
    eInvoiceStatus: original?.eInvoiceStatus || 'MISSING',
    dieFlags: uiEntry.dieFlags || [],
    metadata: original?.metadata || {},
  };
}