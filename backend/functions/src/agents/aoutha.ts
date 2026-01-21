import { LedgerEntry, DieFlag } from '../types';

const DOCUMENT_GAP_THRESHOLD = 500;

export const analyzeEntry = (entry: LedgerEntry): DieFlag[] => {
  const flags: DieFlag[] = [];
  
  if (entry.category === 'Uncategorized') {
    flags.push({
      severity: 'low',
      message: `Entry "${entry.description}" is uncategorized and requires classification. Potential tax impact depends on correct categorization.`,
      flagType: 'MISCLASSIFICATION_RISK',
      category: 'tax',
      detectedAt: new Date().toISOString(),
    });
  }
  
  const debit = entry.debit ?? 0;
  if (debit > DOCUMENT_GAP_THRESHOLD && !entry.supportingDocUrl) {
    flags.push({
      severity: 'high',
      message: `Entry "${entry.description}" exceeds RM ${DOCUMENT_GAP_THRESHOLD} threshold but has no supporting documentation. Potential tax disallowance of RM ${debit.toFixed(2)} if documentation is not provided.`,
      flagType: 'MISSING_DOC',
      category: 'compliance',
      detectedAt: new Date().toISOString(),
    });
  }
  
  return flags;
};