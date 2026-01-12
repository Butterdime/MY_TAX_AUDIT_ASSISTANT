export type LedgerEntry = {
  id: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
  category: string;
  supportingDocLinks?: string[];
};
