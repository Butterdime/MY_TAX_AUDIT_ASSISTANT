import { LedgerEntry } from '../types';

const DOCUMENT_GAP_THRESHOLD = 500;

export const analyzeEntry = (entry: LedgerEntry): string[] => {
  const issues: string[] = []; // Fixes 'never' type inference
  
  if (entry.category === 'Uncategorized') {
    issues.push('UNCATEGORIZED_ENTRY');
  }
  
  if (entry.debit > DOCUMENT_GAP_THRESHOLD && entry.supportingDocLinks.length === 0) {
    issues.push('DOCUMENT_GAP');
  }
  
  return issues;
};