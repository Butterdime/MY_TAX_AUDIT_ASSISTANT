export interface LedgerEntry {
  id?: string;
  transactionId?: string;
  yearId?: string;
  description: string;
  category: string;
  debit: number;
  credit?: number;
  supportingDocLinks: string[];
  status?: string;
}
