import { LedgerEntry } from '../types';

/**
 * HEURISTIC: Calculates an internal readiness percentage.
 * Deducts score for missing docs (>RM500) and missing categories.
 */
export const calculateReadinessScore = (entries: LedgerEntry[]): number => {
  if (entries.length === 0) return 100;

  const atRiskEntries = entries.filter(e => 
    (e.debit > 500 && (!e.supportingDocLinks || e.supportingDocLinks.length === 0)) ||
    (e.category === 'Uncategorized')
  );

  const totalCount = entries.length;
  const riskCount = atRiskEntries.length;
  
  // Linear ratio of healthy entries vs total entries
  const score = Math.round(((totalCount - riskCount) / totalCount) * 100);
  
  return Math.max(0, score);
};
