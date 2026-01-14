import React from 'react';

const TaxView: React.FC = () => {
  return (
    <div className="font-display">
      <div className="mb-10">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Stage 4: Tax Simulation</h2>
        <p className="text-slate-500 text-lg font-light leading-relaxed">
          Project your YA 2026 tax obligations based on the refined ledger.
        </p>
      </div>

      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-2xl font-bold text-slate-900 mb-6">SME Tax Brackets (YA 2026)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Tier 1 */}
          <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">First RM 150,000</p>
            <p className="text-4xl font-black text-blue-600 my-2">15%</p>
            <p className="text-sm text-slate-600">Chargeable Income</p>
          </div>

          {/* Tier 2 */}
          <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">RM 150,001 - RM 600,000</p>
            <p className="text-4xl font-black text-blue-600 my-2">17%</p>
            <p className="text-sm text-slate-600">Chargeable Income</p>
          </div>

          {/* Tier 3 */}
          <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Above RM 600,000</p>
            <p className="text-4xl font-black text-blue-600 my-2">24%</p>
            <p className="text-sm text-slate-600">Chargeable Income</p>
          </div>
        </div>
        <div className="bg-amber-50 p-4 border-l-4 border-amber-400 rounded-r-lg text-sm text-amber-900">
          <p><strong>Disclaimer:</strong> This is an AI-generated tax estimation for planning purposes only and is not a substitute for professional tax advice. Consult with a qualified tax agent for final filing.</p>
        </div>
      </div>
    </div>
  );
};

export default TaxView;