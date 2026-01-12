import { LedgerEntry } from '../types';

export interface RemediationTask {
  id: string;
  description: string;
  debit: number;
  simulatedSavings: number; // Renamed to clarify simulation
  reason: 'MISSING_DOC' | 'UNCATEGORIZED';
}

/**
 * HEURISTIC: Prioritizes cleanup tasks based on potential disallowance risk.
 * Uses a flat 24% simulation rate to represent max exposure.
 */
export const getPrioritizedTasks = (entries: LedgerEntry[]): RemediationTask[] => {
  const SIMULATED_RATE = 0.24;
  
  return entries
    .filter(e => 
      (e.debit > 500 && (!e.supportingDocLinks || e.supportingDocLinks.length === 0)) ||
      (e.category === 'Uncategorized')
    )
    .map(e => ({
      id: e.id,
      description: e.description,
      debit: e.debit,
      simulatedSavings: e.debit * SIMULATED_RATE,
      reason: (e.category === 'Uncategorized' ? 'UNCATEGORIZED' : 'MISSING_DOC') as 'UNCATEGORIZED' | 'MISSING_DOC'
    }))
    .sort((a, b) => b.simulatedSavings - a.simulatedSavings);
};
