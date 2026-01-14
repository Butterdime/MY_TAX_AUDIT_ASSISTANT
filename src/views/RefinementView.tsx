import React from 'react';

const RefinementView: React.FC = () => {
  return (
    <div className="font-display">
      <div className="mb-10">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Stage 3: Refinement</h2>
        <p className="text-slate-500 text-lg font-light leading-relaxed">
          Review and approve AI-driven suggestions from the Deductibility Insight Engine (DIE).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        {/* Left Pane: Original Entry */}
        <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Original Entry</h4>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-bold text-slate-800">Transaction ID</p>
              <p className="font-mono text-slate-600">TXN-2025-4A8B</p>
            </div>
            <div>
              <p className="font-bold text-slate-800">Amount</p>
              <p className="text-slate-600">RM 1,200.00</p>
            </div>
            <div>
              <p className="font-bold text-slate-800">Original GL Code</p>
              <p className="text-slate-600">6300 - Entertainment</p>
            </div>
            <div>
              <p className="font-bold text-slate-800">Vendor</p>
              <p className="text-slate-600">The Grand Restaurant</p>
            </div>
          </div>
        </div>

        {/* Right Pane: AI Suggestion */}
        <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-bold text-blue-500 uppercase tracking-widest mb-4">AI Suggested Reclassification</h4>
          <div className="space-y-4 text-sm">
             <div>
              <p className="font-bold text-blue-900">Suggested GL Code</p>
              <p className="text-blue-700">6150 - Staff Welfare & Benefits</p>
            </div>
             <div>
              <p className="font-bold text-blue-900">Deductibility Status</p>
              <p className="font-mono text-blue-700">100% Deductible</p>
            </div>
            <div className="p-4 bg-white/70 rounded-md">
              <p className="font-bold text-blue-900 mb-2">Justification</p>
              <p className="text-slate-700 leading-relaxed">
                The Aoutha engine cross-referenced this invoice with employee timesheets. The attendees were all staff members, making this a "Staff Welfare" event, not "Entertainment".
              </p>
            </div>
            <div className="flex gap-4 pt-4">
                <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">Approve</button>
                <button className="flex-1 border border-slate-300 text-slate-600 px-4 py-2 rounded-lg font-medium">Reject</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefinementView;