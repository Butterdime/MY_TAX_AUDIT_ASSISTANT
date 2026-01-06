
export type BankProvider = 'CIMB' | 'Maybank' | 'RHB' | 'Public Bank' | 'Hong Leong' | 'Auto-detect';

export type BusinessType = 'sole_proprietorship' | 'partnership' | 'llp' | 'sdn_bhd' | 'bhd' | 'other';

export interface BusinessProfile {
  legal_name: string;
  registration_number: string;
  business_type: BusinessType;
  tax_identification_number: string;
  financial_year_end: string;
}

export interface StatementDateRange {
  earliest_transaction_date: string; // ISO date
  latest_transaction_date: string;   // ISO date
}

export interface PdfMetadata {
  pageCount: number;
  author: string;
  creationDate: string;
  fileName: string;
  fileSize: string;
}

export interface AuditTags {
  type: "revenue" | "expense" | "salary" | "epf_socso" | "loan_repayment" | "director_drawing" | "tax_payment" | "interbank_transfer" | "other";
  counterparty_type: "employee" | "director" | "vendor" | "government" | "related_company" | "unknown";
  notes?: string;
}

// Add missing Transaction interface
export interface Transaction {
  date: string;
  description: string;
  cheque_ref_no?: string;
  withdrawal_amount: number;
  deposit_amount: number;
  tax_amount?: number;
  balance_after: number;
  year_of_assessment: string;
  audit_tags: AuditTags;
}

export interface AccountMetadata {
  bank_name: string;
  account_name: string;
  account_number: string;
  statement_period: string;
  currency: string;
  opening_balance: number;
  closing_balance: number;
  earliest_transaction_date: string;
  latest_transaction_date: string;
}

export interface ReconciliationInfo {
  is_reconciled: boolean;
  calculated_movement: number;
  expected_movement: number;
  issues: string[];
}

export interface BankStatementData {
  business_profile_snapshot: BusinessProfile;
  account_metadata: AccountMetadata;
  transactions: Transaction[];
  reconciliation_info: ReconciliationInfo;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isSearch?: boolean;
  sources?: { web: { uri: string; title: string } }[];
}

export interface ProcessingState {
  status: 'idle' | 'processing' | 'completed' | 'error';
  message: string;
  data?: BankStatementData;
  pdfMetadata?: PdfMetadata;
  error?: string;
  selectedBank: BankProvider;
  chatHistory: ChatMessage[];
  businessProfile: BusinessProfile;
}