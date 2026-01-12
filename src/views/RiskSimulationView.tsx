import React, { useState } from 'react';
import { useLedgerEntries } from '../hooks/useLedgerEntries';
import { estimateRiskSimulation } from '../logic/riskHeuristics';
import { getPrioritizedTasks, RemediationTask } from '../logic/remediation';
import RemediationList from '../components/planning/RemediationList';
import RemediationPanel from '../components/planning/RemediationPanel.tsx';
import OptimizationCard from '../components/planning/OptimizationCard';
import ReadinessGauge from '../components/shared/ReadinessGauge';
import { calculateReadinessScore } from '../logic/auditReadiness';
import { generateAuditReport } from '../logic/exportService';

const RiskSimulationView: React.FC = () => {
  const { entries, loading } = useLedgerEntries();
  const [selectedTask, setSelectedTask] = useState<RemediationTask | null>(null);
  
  if (loading) return <div className="p-8 text-slate-500 italic">Syncing with MYAUDIT Forensic Cloud...</div>;

  const riskScore = estimateRiskSimulation(entries);
  const tasks = getPrioritizedTasks(entries);
  const mockProjectedIncome = 780000;
  const readinessScore = calculateReadinessScore(entries);

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
      <header className="mb-8 border-b border-slate-100 pb-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Audit Risk Simulator</h2>
        <p className="text-slate-500 text-sm mt-1">Heuristic projection of potential disallowance exposure.</p>
      </header>

      <ReadinessGauge score={readinessScore} />
      <button 
        onClick={() => generateAuditReport(entries)}
        className="mt-4 px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-700 transition-colors"
      >
        Download Audit Report
      </button>
      <OptimizationCard projectedChargeableIncome={mockProjectedIncome} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
        <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Exposure</p>
          <p className="text-2xl font-bold text-slate-900">RM {riskScore.estimatedExposure.toLocaleString()}</p>
        </div>
        
        <div className="p-6 bg-red-50 rounded-xl border border-red-100">
          <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Simulated Leakage</p>
          <p className="text-2xl font-bold text-red-600">RM {riskScore.simulatedLeakage.toLocaleString()}</p>
        </div>

        <div className="p-6 bg-slate-900 rounded-xl shadow-inner">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Audit Risk Level</p>
          <p className={`text-2xl font-bold ${riskScore.riskLevel === 'HIGH' ? 'text-red-400' : 'text-emerald-400'}`}>
            {riskScore.riskLevel}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-amber-50 border-l-4 border-amber-400 text-amber-900 text-xs">
          <strong>LHDN Audit Heuristic:</strong> Items over RM 500 without supporting documents are prioritized by auditors. 
          Resolving these gaps could lower your simulated risk by <strong>RM {riskScore.simulatedLeakage.toLocaleString()}</strong>.
        </div>
        
        <p className="text-[10px] text-slate-400 text-center italic mt-6">
          DISCLAIMER: This is an internal risk simulation, not a statutory tax computation. 
          Final tax liabilities are calculated via the LHDN-aligned engine in the backend Mr R.P.P module.
        </p>
      </div>
      <RemediationList tasks={tasks} onFix={(task) => setSelectedTask(task)} />
      <RemediationPanel task={selectedTask} onClose={() => setSelectedTask(null)} />
    </div>
  );
};

export default RiskSimulationView;