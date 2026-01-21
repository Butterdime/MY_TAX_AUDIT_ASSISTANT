import { LedgerEntry, DieFlag } from '../types';

/**
 * Validates Staff Welfare transactions for YA 2026 compliance.
 * Region: asia-southeast1 (Singapore)
 */
export const validateStaffWelfare = (entry: LedgerEntry): { isSafe: boolean; suggestedStatus: 'flagged' | 'cleared'; newFlags: DieFlag[] } => {
  const flags: DieFlag[] = [];
  const WELFARE_THRESHOLD = 5000; // Example threshold for DIE flag trigger

  const debit = entry.debit ?? 0;

  // 1. Check for Misclassification Risk
  if (entry.category === 'Staff Welfare' && debit > WELFARE_THRESHOLD) {
    flags.push({
      severity: 'med',
      message: 'Staff welfare debit exceeds statutory threshold. Verify if this exceeds limits for staff benefits. Potential non-deductibility.',
      flagType: 'THRESHOLD_EXCEEDED',
      category: 'tax',
      detectedAt: new Date().toISOString()
    });
  }

  // 2. E-Invoice Compliance Check
  if (entry.eInvoiceStatus === 'missing') {
    flags.push({
        severity: 'high',
        message: 'E-Invoice required for YA 2026 tax deduction. High risk of audit rejection.',
        flagType: 'DOCUMENTATION_GAP',
        category: 'compliance',
        detectedAt: new Date().toISOString()
    });
  }

  const isSafe = flags.length === 0;
  return {
    isSafe,
    suggestedStatus: isSafe ? 'cleared' : 'flagged',
    newFlags: flags
  };
};
