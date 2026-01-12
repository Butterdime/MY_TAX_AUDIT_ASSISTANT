export interface OptimizationResult {
  standardTax: number;   // 24% Non-SME benchmark
  optimizedTax: number;  // YA 2026 Tiered SME Heuristic
  totalSavings: number;
}

/**
 * SIMULATION ONLY: Compares standard vs SME tiered rates.
 * Chargeable income is used after assumed business deductions.
 */
export const calculateSMEOptimization = (chargeableIncome: number): OptimizationResult => {
  // Scenario A: Standard 24% Rate (Benchmarked Risk)
  const standardTax = chargeableIncome * 0.24;

  // Scenario B: YA 2026 Tiered SME Provision (Simulation)
  let optimizedTax = 0;
  if (chargeableIncome <= 150000) {
    optimizedTax = chargeableIncome * 0.15;
  } else if (chargeableIncome <= 600000) {
    optimizedTax = (150000 * 0.15) + ((chargeableIncome - 150000) * 0.17);
  } else {
    optimizedTax = (150000 * 0.15) + (450000 * 0.17) + ((chargeableIncome - 600000) * 0.24);
  }

  return { 
    standardTax, 
    optimizedTax, 
    totalSavings: standardTax - optimizedTax 
  };
};
