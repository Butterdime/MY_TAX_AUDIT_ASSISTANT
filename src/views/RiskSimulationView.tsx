import React, { useState } from 'react';
import { useLedgerEntries } from '../hooks/useLedgerEntries';
import { estimateRiskSimulation } from '../logic/riskHeuristics';
import { mapEntriesToTasks, RemediationTask } from '../logic/remediation';
import RemediationList from '../components/planning/RemediationList';
import { RemediationPanel } from '../components/planning/RemediationPanel';
import { getReadinessStats } from '../logic/auditReadiness';
import { generateAuditReport } from '../logic/exportService';

const RiskSimulationView: React.FC = () => {
  const { canonicalEntries, uiEntries, loading } = useLedgerEntries('ya2026');
  const [selectedTask, setSelectedTask] = useState<RemediationTask | null>(null);
  
  if (loading) return <div className="p-8 text-slate-500 italic">Syncing with MYAUDIT Forensic Cloud...</div>;

  // Logic functions must use canonical entries
  const riskScore = estimateRiskSimulation(canonicalEntries);
  const tasks = mapEntriesToTasks(canonicalEntries);

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
      <header className="mb-8 border-b border-slate-100 pb-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Audit Risk Simulator</h2>
        <p className="text-slate-500 text-sm mt-1">Heuristic projection of potential disallowance exposure.</p>
      </header>

      
      <button 
        onClick={() => generateAuditReport(canonicalEntries)}
        className="mt-4 px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-700 transition-colors"
      >
        Download Audit Report
      </button>

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
        </p>
      </div>
      
      {/* RemediationList will need to be updated to accept tasks based on UILedgerEntry if it renders UI data */}
      <RemediationList tasks={tasks} onFix={(task) => setSelectedTask(task)} />
      
      {selectedTask && (
        <RemediationPanel
          entityId="MY-ENTITY-001"
          entryId={selectedTask.id}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
};

export default RiskSimulationView;
