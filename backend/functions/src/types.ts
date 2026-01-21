/**
 * MYAUDIT CANONICAL TYPES (Backend)
 * Version: 1.2.2 (Phase 1.4B Stabilization)
 * Authority: Expanded to support legacy logic during transition.
 */

export interface DieFlag {
  severity: 'low' | 'med' | 'high';
  message: string;
  flagType: string;
  category?: 'compliance' | 'tax' | 'forensic' | 'timing';
  detectedAt: string; // ISO String
}

export type TransactionType = 'debit' | 'credit' | 'DEBIT' | 'CREDIT';

export interface LedgerEntry {
  // Canonical Fields
  id: string;
  transactionDate: string; // YYYY-MM-DD
  description: string;
  amount: number;
  type: TransactionType;
  accountCode: string;
  entityId: string;
  status: string; // Expanded to handle legacy values
  forensicFlags?: DieFlag[];
  metadata?: Record<string, any>;
  reference?: string;

  // Legacy Forensic Fields (to be deprecated)
  date?: string;
  debit?: number;
  credit?: number;
  category?: string;
  confidenceScore?: number;
  sourceDocUrl?: string;
  supportingDocUrl?: string;
  eInvoiceStatus?: string;
  dieFlags?: string[]; // Legacy simple string array
}

export interface AdvisoryProposal {
  id: string;
  title: string;
  description: string;
  impactScore: number; // 1-10
  type: 'incentive' | 'optimization' | 'compliance';
  statutoryReference?: string; // Links to RuleRegistry
  potentialSavings?: number;
}

export interface AuditTrailEntry {
  timestamp: string;
  agentId: 'AG-01' | 'AG-02' | 'SYSTEM';
  action: string;
  resourceId: string;
  changes: Record<string, any>;
  signature: string; // HMAC or similar for integrity
}