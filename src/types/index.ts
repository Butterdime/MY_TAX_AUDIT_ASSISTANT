/**
 * Represents a flag raised by the Deductibility Insight Engine (DIE).
 */
export interface DieFlag {
  flagType: "MISCLASSIFICATION_RISK" | "MISSING_DOC" | "CAPITAL_VS_REVENUE" | "OTHER";
  suggestion: string;
  estimatedImpact: string;
  confidence: number;
  createdAt: number;
}

/**
 * Represents a single transaction or journal entry in the ledger.
 * Extended with metadata for the Deductibility Insight Engine (DIE).
 */
export interface LedgerEntry {
  id: string;
  transactionId: string;
  yearId: string;
  description: string;
  debit: number;
  credit: number;
  category: string;
  status: "NEW" | "AUTO_TAGGED" | "USER_REVIEWED" | "AUDIT_READY" | "LOCKED" | "LOCKED_FOR_AUDIT";
  supportingDocLinks: string[];
  auditNotes?: string;
  // DIE metadata
  participantType?: "STAFF_ONLY" | "CLIENT_ONLY" | "MIXED" | "UNIDENTIFIED" | null;
  eventPurpose?: "MARKETING" | "WELFARE" | "REVENUE_GENERATION" | "OTHER" | null;
  sourceEvidence?: string[] | null;
  dieFlags?: DieFlag[];
  eInvoiceStatus?: 'valid' | 'missing' | 'warning';
}

/**
 * Captures user responses to the incentive screening questionnaire.
 * This data is used by Mr R.P.P to suggest relevant tax incentives.
 */
export interface IncentiveProfile {
  mainActivity: "Manufacturing" | "Services" | "Trading" | "Professional" | "Tech" | "Agriculture" | "Other";
  usesAutomation: boolean;
  reinvestsInAssets: "regularly" | "occasionally" | "no";
  employsDisabledStaff: boolean | "unsure";
  frequentSmallAssets: "regularly" | "occasionally" | "no";
  hasPioneerStatus: boolean | "applying";
}

/**
 * Represents the primary business entity being audited.
 * Extended with the Incentive Profile fields.
 */
export interface Entity {
  id: string;
  name: string;
  registrationNo: string;
  country: "MY";
  language: "EN" | "BM" | "ZH";
  industry: string;
  smeFlag: boolean;
  paidUpCapital: number;
  incentiveProfile?: IncentiveProfile;
  incentiveProfileCompletedAt?: number;
}

/**
 * Audit trail for suggestions made by the Deductibility Insight Engine (DIE).
 */
export interface DieInsight {
  id: string;
  ledgerEntryId: string;
  yearId: string;
  flagType: "MISCLASSIFICATION_RISK" | "MISSING_DOC" | "CAPITAL_VS_REVENUE" | "OTHER";
  originalCategory: string;
  suggestedCategory: string;
  rationale: string;
  estimatedTaxImpact: {
    originalDeductibility: number;
    suggestedDeductibility: number;
    impactOnTaxAtRate17: number;
  };
  userResponse: "ACCEPTED" | "REJECTED" | "PENDING";
  userResponseAt?: number;
  confidence: number;
  createdAt: number;
}

/**
 * Stores statutory rules for the AI agents to use.
 * This includes deductibility rules and incentive details.
 */
export interface RuleRegistry {
  id: string;
  ruleId: string;
  ya: number; // Year of Assessment
  type: "DEDUCTIBILITY_RULE" | "INCENTIVE";
  industries: string[];
  effectiveFrom: string; // Date string
  effectiveTo: string; // Date string
  conditions: {
    category: string;
    keywords: string[];
  };
  descriptionSimpleEN: string;
  descriptionSimpleBM: string;
  descriptionSimpleZH: string;
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
  references: string[];
}

export type BankProvider = 'CIMB' | 'Maybank' | 'RHB' | 'Public Bank' | 'Hong Leong' | 'Auto-detect';

export type BusinessType = 'sole_proprietorship' | 'partnership' | 'llp' | 'sdn_bhd' | 'bhd' | 'other';

export type SupportedLanguage = "en" | "ms" | "zh";

export type AssistantPersona = 'none' | 'tax' | 'audit';

export interface UserProfile {
  user_id: string;            // internal UID
  google_sub: string;         // Google subject / unique ID
  email: string;
  display_name?: string;
  avatar_url?: string;
  preferred_language: SupportedLanguage;
}

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

export interface Transaction {
  date: string;
  description: string;
  cheque_ref_no?: string;
  withdrawal_amount: number;
  deposit_amount: number;
  tax_amount?: number;
  balance_after: number;
  year_of_assessment: string;
  financial_year_label: string; // e.g. "FYE 31-12-2024"
  financial_month_label: string; // e.g. "Jan 2024"
  audit_tags: AuditTags;
}

export interface MonthlySummary {
  month_label: string; // e.g. "Jan 2024"
  start_date: string;
  end_date: string;
  total_deposits: number;
  total_withdrawals: number;
  by_audit_type: {
    salary: number;
    epf_socso: number;
    director_drawing: number;
    tax_payment: number;
    loan_repayment: number;
    revenue: number;
    expense: number;
    other: number;
  };
}

export interface FinancialYearSummary {
  financial_year_label: string;
  financial_year_end_date: string;
  months: MonthlySummary[];
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
  financial_year_summaries: FinancialYearSummary[];
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
  progress: number; // Track extraction progress percentage
  data?: BankStatementData;
  pdfMetadata?: PdfMetadata;
  error?: string;
  selectedBank: BankProvider;
  chatHistory: ChatMessage[];
  businessProfile: BusinessProfile;
  userProfile?: UserProfile;
  assistantPersona: AssistantPersona;
}

export interface TaxComputationResult {
  grossSalary: number;
  netPay: number;
  deductions: {
    epf: number;
    socso: number;
    eis: number;
    total: number;
  };
}
