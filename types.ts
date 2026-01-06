
export type BankProvider = 'CIMB' | 'Maybank' | 'RHB' | 'Public Bank' | 'Hong Leong' | 'Auto-detect';

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

export interface AccountMetadata {
  bank_name: string;
  account_name: string;
  account_number: string;
  statement_period: string;
  currency: string;
  opening_balance: number;
  closing_balance: number;
}

export interface Transaction {
  date: string;
  description: string;
  cheque_ref_no: string;
  withdrawal_amount: number;
  deposit_amount: number;
  tax_amount: number;
  balance_after: number;
  audit_tags: AuditTags;
  year_of_assessment: string;
}

export interface ReconciliationInfo {
  is_reconciled: boolean;
  calculated_movement: number;
  expected_movement: number;
  issues: string[];
}

export interface BankStatementData {
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
}
