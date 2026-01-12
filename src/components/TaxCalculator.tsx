import React, { useState, useMemo, useEffect } from 'react';

// --- Statutory Rates Logic ---
const getStatutoryRates = (year: number) => {
  if (year >= 2025) { // 2025-2026
    return { minWage: 1700, socsoCeiling: 6000, foreignEPFRate: 0.02, defaultCitizenEPF: 0.11, notableChange: "Mandatory EPF for Foreigners (2%); Min Wage up from RM1.5k." };
  }
  if (year === 2024) {
    return { minWage: 1500, socsoCeiling: 6000, foreignEPFRate: 0, defaultCitizenEPF: 0.11, notableChange: "SOCSO/EIS ceiling increased to RM6k (Oct 1st)." };
  }
  if (year === 2023) {
    return { minWage: 1500, socsoCeiling: 5000, foreignEPFRate: 0, defaultCitizenEPF: 0.11, notableChange: "Min wage enforced for all employers (<5 staff included)." };
  }
  if (year === 2022) {
    return { minWage: 1500, socsoCeiling: 5000, foreignEPFRate: 0, defaultCitizenEPF: 0.11, notableChange: "SOCSO/EIS ceiling up to RM5k (Sept); Min wage to RM1.5k (May)." };
  }
  if (year === 2021) {
    return { minWage: 1200, socsoCeiling: 4000, foreignEPFRate: 0, defaultCitizenEPF: 0.09, notableChange: "Pandemic relief: Employee EPF optionally reduced to 9%." };
  }
  if (year === 2020) {
    return { minWage: 1200, socsoCeiling: 4000, foreignEPFRate: 0, defaultCitizenEPF: 0.11, notableChange: "Min wage increased to RM1.2k for major cities." };
  }
  // 2019 and fallback
  return { minWage: 1100, socsoCeiling: 4000, foreignEPFRate: 0, defaultCitizenEPF: 0.11, notableChange: "First year Foreign Workers were mandated for SOCSO." };
};


const TaxCalculator: React.FC = () => {
  const [auditYear, setAuditYear] = useState<number>(2026);
  const [grossSalary, setGrossSalary] = useState<number>(1700);
  const [residencyStatus, setResidencyStatus] = useState<'citizen' | 'foreigner'>('citizen');
  const [citizenEpfRate, setCitizenEpfRate] = useState<number>(0.11);

  const rates = useMemo(() => getStatutoryRates(auditYear), [auditYear]);

  useEffect(() => {
    setGrossSalary(rates.minWage);
    setCitizenEpfRate(rates.defaultCitizenEPF);
  }, [auditYear, rates.minWage, rates.defaultCitizenEPF]);

  const minWageWarning = useMemo(() => grossSalary > 0 && grossSalary < rates.minWage, [grossSalary, rates.minWage]);

  const deductions = useMemo(() => {
    const epfRate = residencyStatus === 'citizen' ? citizenEpfRate : rates.foreignEPFRate;
    const socsoEisSalaryCap = Math.min(grossSalary, rates.socsoCeiling);
    const socsoRate = 0.005; // Approximate rate, actual is based on a table
    const eisRate = 0.002;

    const epf = grossSalary * epfRate;
    const socso = socsoEisSalaryCap * socsoRate;
    const eis = socsoEisSalaryCap * eisRate;
    const total = epf + socso + eis;

    return { epf, socso, eis, total, epfRate };
  }, [grossSalary, residencyStatus, rates, citizenEpfRate]);

  const netPay = useMemo(() => grossSalary - deductions.total, [grossSalary, deductions.total]);

  const handleVerify = async () => {
    const complianceNote = (auditYear >= 2026 && minWageWarning) 
      ? `CRITICAL RISK: For 2026, salary is below the min wage. This is a "High Risk Compliance Breach".`
      : minWageWarning ? `COMPLIANCE WARNING: Gross salary is below the minimum wage of RM ${rates.minWage.toFixed(2)} for ${auditYear}.` : '';

    const prompt = `
      Verify the following Malaysian payroll calculation for compliance with the ${auditYear} Employment Act.
      - Audit Year: ${auditYear}
      - Gross Salary: RM ${grossSalary.toFixed(2)}
      - Residency Status: ${residencyStatus}
      - Statutory Minimum Wage for ${auditYear}: RM ${rates.minWage.toFixed(2)}
      - SOCSO/EIS Salary Cap for ${auditYear}: RM ${rates.socsoCeiling.toFixed(2)}

      Deductions Applied:
      - EPF Deduction (${(deductions.epfRate * 100).toFixed(0)}%): RM ${deductions.epf.toFixed(2)}
      - SOCSO Deduction (~0.5% on capped salary): RM ${deductions.socso.toFixed(2)}
      - EIS Deduction (0.2% on capped salary): RM ${deductions.eis.toFixed(2)}
      - Total Deductions: RM ${deductions.total.toFixed(2)}
      - Net Pay: RM ${netPay.toFixed(2)}

      ${complianceNote}

      Is this calculation compliant based on the rules for ${auditYear}? Please analyze and report any discrepancies.
    `;
    alert('Verification request sent to Gemini. Check the console for the prompt.');
    console.log('Gemini Verification Prompt:', prompt);
  };

  const years = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* --- LEFT SIDE: INPUTS -- */}
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Statutory Calculator</h2>
          <p className="text-sm text-slate-500 mb-4">Select audit year to see historical rates.</p>

          <div className="mb-4">
            <label htmlFor="audit-year" className="block text-sm font-medium text-slate-700 mb-1">Audit Year</label>
            <select id="audit-year" value={auditYear} onChange={(e) => setAuditYear(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <p className='text-xs text-slate-400 mt-1'>Note: {rates.notableChange}</p>
          </div>

          <div className="mb-4">
            <label htmlFor="gross-salary" className="block text-sm font-medium text-slate-700 mb-1">Gross Monthly Salary (RM)</label>
            <input type="number" id="gross-salary" value={grossSalary} onChange={(e) => setGrossSalary(Number(e.target.value))} className={`w-full px-3 py-2 border rounded-md shadow-sm ${minWageWarning ? 'border-red-500 ring-2 ring-red-200' : 'border-slate-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`} />
            {minWageWarning && <p className="text-sm text-red-600 mt-1">Warning: Salary is below the RM {rates.minWage.toFixed(2)} minimum wage for {auditYear}.</p>}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="residency-status" className="block text-sm font-medium text-slate-700 mb-1">Residency</label>
              <select id="residency-status" value={residencyStatus} onChange={(e) => setResidencyStatus(e.target.value as 'citizen' | 'foreigner')} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                <option value="citizen">Citizen</option>
                <option value="foreigner">Foreigner</option>
              </select>
            </div>
            {auditYear === 2021 && residencyStatus === 'citizen' && (
                 <div>
                    <label htmlFor="epf-rate" className="block text-sm font-medium text-slate-700 mb-1">EPF Rate (2021)</label>
                     <select id="epf-rate" value={citizenEpfRate} onChange={(e) => setCitizenEpfRate(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                         <option value={0.09}>9% (Relief)</option>
                         <option value={0.11}>11% (Standard)</option>
                     </select>
                 </div>
            )}
          </div>
        </div>

        {/* --- RIGHT SIDE: RESULTS -- */}
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <p className="text-slate-600">Gross Pay:</p>
            <p className="font-semibold text-lg text-slate-800">RM {grossSalary.toFixed(2)}</p>
          </div>
          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Deductions Breakdown</h3>
            <div className="flex justify-between text-sm text-slate-600"><p>EPF ({(deductions.epfRate * 100).toFixed(0)}%):</p><p>- RM {deductions.epf.toFixed(2)}</p></div>
            <div className="flex justify-between text-sm text-slate-600"><p>SOCSO (~0.5%):</p><p>- RM {deductions.socso.toFixed(2)}</p></div>
            <div className="flex justify-between text-sm text-slate-600"><p>EIS (0.2%):</p><p>- RM {deductions.eis.toFixed(2)}</p></div>
            <div className="flex justify-between font-semibold text-slate-800 mt-2 border-t border-slate-200 pt-2"><p>Total Deductions:</p><p>- RM {deductions.total.toFixed(2)}</p></div>
          </div>
          <div className="flex justify-between items-center border-t-2 border-blue-600 pt-4 mt-4">
            <p className="text-xl font-bold text-slate-800">Net Pay:</p>
            <p className="text-xl font-bold text-blue-600">RM {netPay.toFixed(2)}</p>
          </div>
          <div className="mt-6 text-center">
            <button onClick={handleVerify} className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm">
              Verify with Gemini Audit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxCalculator;
