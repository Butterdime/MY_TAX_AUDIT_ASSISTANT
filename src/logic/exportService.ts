import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LedgerEntry } from '../types';
import { calculateReadinessScore } from './auditReadiness';
import { estimateRiskSimulation } from './riskHeuristics';
import { getPrioritizedTasks } from './remediation';

export const generateAuditReport = (entries: LedgerEntry[]) => {
  const doc = new jsPDF();
  const score = calculateReadinessScore(entries);
  const risk = estimateRiskSimulation(entries);
  const tasks = getPrioritizedTasks(entries);

  // 1. Header & Title
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.text('MYAUDIT: Forensic Readiness Report', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Run Date: ${new Date().toLocaleDateString()}`, 14, 28);
  doc.text('Assessment Year: 2026 (Simulation)', 14, 33);

  // 2. Executive Summary Box
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.rect(14, 40, 182, 30, 'F');
  
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`Internal Readiness Score: ${score}%`, 20, 50);
  doc.text(`Simulated Tax Exposure: RM ${risk.simulatedLeakage.toLocaleString()}`, 20, 58);

  // 3. Detailed Task Table
  const tableData = tasks.map(t => [
    t.description,
    t.reason === 'MISSING_DOC' ? 'Missing Receipt' : 'Uncategorized',
    `RM ${t.debit.toLocaleString()}`,
    `RM ${t.simulatedSavings.toLocaleString()}`
  ]);

  autoTable(doc, {
    startY: 80,
    head: [['Description', 'Issue Type', 'Amount', 'Simulated Saving']],
    body: tableData,
    headStyles: { fillColor: [15, 23, 42] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  // 4. Disclaimer Footer
  const finalY = (doc as any).lastAutoTable.finalY || 150;
  doc.setFontSize(8);
  doc.setTextColor(150);
  const disclaimer = 'Note: This report is an internal forensic heuristic and does not constitute statutory tax advice or LHDN certification.';
  doc.text(disclaimer, 14, finalY + 15);

  doc.save(`MYAUDIT-Report-${new Date().toISOString().split('T')[0]}.pdf`);
};
