
// Note: In production, these types are imported from src/types/index.ts
export type TransactionType = 'DEBIT' | 'CREDIT';
export type AuditStatus = 'PENDING' | 'VALIDATED' | 'APPROVED';
export type EInvoiceStatus = 'VALIDATED' | 'EXEMPT' | 'MISSING';

export interface LedgerEntry {
  id: string;
  transactionDate: string;
  description: string;
  amount: number;
  type: TransactionType;
  sourceDocUrl: string;
  supportingDocUrl: string;
  category: string;
  confidenceScore: number;
  auditStatus: AuditStatus;
  eInvoiceStatus: EInvoiceStatus;
  dieFlags: string[];
  metadata: Record<string, any>;
}

export interface RawOcrData {
  date: string;
  description: string;
  amount: number;
  type: 'DR' | 'CR';
  metadata?: any;
}
export type ConfidenceLevel = 'low' | 'medium' | 'high' | number;

export type DieFlagType = 'risk' | 'opportunity' | 'MISCLASSIFICATION_RISK';

export interface DieFlag {
  id: string;
  entryId: string;
  title: string;
  message: string;
  flagType: DieFlagType;
  suggestion?: string;
  estimatedImpact?: string;
  confidence?: ConfidenceLevel;
  createdAt?: string;
}

export interface IncentiveSignals {
  usesAutomation: boolean;
  reinvestsInAssets: boolean;
  employsDisabledStaff: boolean;
  frequentSmallAssets: boolean;
  hasPioneerStatus: boolean;
}

export interface AuditLogEntry {
    id: string;
    timestamp: number;
    user: string;
    details: string;
}

export type ActivityType = 'SYSTEM_ACTION' | 'USER_ACTION' | 'FLAG_RAISED';

export interface ActivityLog {
  id: string;
  type: ActivityType;
  details: string;
  timestamp: number;
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

export interface RuleRegistry {
  id: string;
  triggerSignal: string;
  shortName: string;
  advisoryText: string;
  taxCode: string;
}
