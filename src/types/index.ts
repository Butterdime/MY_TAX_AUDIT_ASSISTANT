// High-Inclusivity Canonical Frontend Types
// This file serves as the single source of truth for frontend types.

// --- DieFlag ---
// Combining backend canonical and legacy frontend fields
export type DieFlagSeverity = 'low' | 'med' | 'high';
export type DieFlagType = 'risk' | 'opportunity' | 'MISCLASSIFICATION_RISK' | string;

export interface DieFlag {
  // Backend canonical fields
  severity: DieFlagSeverity;
  message: string;
  flagType: DieFlagType;
  category?: 'compliance' | 'tax' | 'forensic' | 'timing';
  detectedAt: string; // ISO String

  // Legacy frontend fields for compatibility
  id?: string;
  entryId?: string;
  title?: string;
  suggestion?: string;
  estimatedImpact?: string;
  confidence?: 'low' | 'medium' | 'high' | number;
  createdAt?: string;
}

// --- LedgerEntry ---
// Combining backend canonical and legacy frontend fields
export type TransactionType = 'debit' | 'credit' | 'DEBIT' | 'CREDIT';
export type AuditStatus = 'pending' | 'reviewed' | 'flagged' | 'cleared' | 'PENDING' | 'VALIDATED' | 'APPROVED';
export type EInvoiceStatus = 'VALIDATED' | 'EXEMPT' | 'MISSING';

export interface LedgerEntry {
  // Core Fields (mostly from backend canonical)
  id: string;
  transactionDate: string;
  description: string;
  amount: number;
  type: TransactionType;

  // Optional & Legacy Fields
  accountCode?: string;
  reference?: string;
  entityId?: string;
  metadata?: { [key: string]: any };

  // Status & Flag Fields
  status: AuditStatus; // Unified status field
  auditStatus?: AuditStatus; // Legacy alias
  eInvoiceStatus?: EInvoiceStatus;
  forensicFlags?: DieFlag[]; // Canonical
  dieFlags?: string[]; // Legacy

  // Other legacy fields
  sourceDocUrl?: string;
  supportingDocUrl?: string;
  category?: string;
  confidenceScore?: number;

  // UI-specific fields that have been used in logic
  debit?: number;
  credit?: number;
  date?: string; // UI alias for transactionDate
  confidence?: number; // UI alias for confidenceScore
}

// --- Other Application Types ---

export interface IncentiveSignals {
  usesAutomation: boolean;
  reinvestsInAssets: boolean;
  employsDisabledStaff: boolean;
  frequentSmallAssets: boolean;
  hasPioneerStatus: boolean;
}

export type ActivityType = 'SYSTEM_ACTION' | 'USER_ACTION' | 'FLAG_RAISED';

export interface ActivityLog {
  id: string;
  type: ActivityType;
  details: string;
  timestamp: number;
}

export interface AuditLogEntry {
    id: string;
    timestamp: number;
    user: string;
    details: string;
}

export interface TaxDeductions {
  epf: number;
  socso: number;
  eis: number;
  total: number;
}

export interface TaxComputationResult {
  taxableIncome: number;
  estimatedTax: number;
  grossSalary: number;
  netPay: number;
  deductions: TaxDeductions;
  notes?: string;
}
