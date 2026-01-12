import { LedgerEntry } from '../types';

const NOTIONAL_RISK_RATE = 0.24; // Worst-case corporate rate for simulation
const DOCUMENT_GAP_THRESHOLD = 500;

export interface ForensicRiskScore {
  estimatedExposure: number;
  simulatedLeakage: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

/**
 * HEURISTIC ONLY: Estimates potential tax disallowance risk.
 * This is a simulation tool, not a statutory tax engine.
 */
export const estimateRiskSimulation = (entries: LedgerEntry[]): ForensicRiskScore => {
  // We sum the 'debit' side as these represent the expenses being claimed
  const highRiskEntries = entries.filter(e => 
    (e.debit > DOCUMENT_GAP_THRESHOLD && (!e.supportingDocLinks || e.supportingDocLinks.length === 0)) ||
    (e.category === 'Uncategorized')
  );

  const estimatedExposure = highRiskEntries.reduce((sum, e) => sum + e.debit, 0);
  const simulatedLeakage = estimatedExposure * NOTIONAL_RISK_RATE;

  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  if (simulatedLeakage > 5000) riskLevel = 'HIGH';
  else if (simulatedLeakage > 1000) riskLevel = 'MEDIUM';

  return { estimatedExposure, simulatedLeakage, riskLevel };
};
