import React, { useMemo } from 'react';
import type { LedgerEntry, DieFlag } from '../../types';

interface AouthaProps {
  rawEntries: LedgerEntry[];
}

// Rule constants
const DOCUMENT_GAP_THRESHOLD = 500;
const LARGE_ENTERTAINMENT_THRESHOLD = 1000;
const SIGNIFICANT_REPAIR_THRESHOLD = 5000;

// DIE Hint Generation Logic using canonical types
const generateDieHints = (entries: LedgerEntry[]): DieFlag[] => {
  const hints: DieFlag[] = [];

  for (const entry of entries) {
    const debit = entry.type === 'DEBIT' ? entry.amount : 0;

    // Rule 1: Large Entertainment Expense
    if (entry.category === 'Entertainment' && debit > LARGE_ENTERTAINMENT_THRESHOLD) {
      hints.push({
        id: `${entry.id}-entertainment`,
        entryId: entry.id,
        severity: 'med',
        message: `Entertainment expense of RM ${debit} is flagged. Client entertainment is 50% deductible, but staff entertainment may be 100% deductible. Please verify and re-categorize if for staff.`,
        flagType: 'risk',
        category: 'tax',
        detectedAt: new Date().toISOString(),
      });
    }

    // Rule 2: Potential Capital Improvement
    if (entry.category === 'Repairs & Maintenance' && debit > SIGNIFICANT_REPAIR_THRESHOLD) {
      hints.push({
        id: `${entry.id}-capital`,
        entryId: entry.id,
        severity: 'high',
        message: `A repair of RM ${debit} seems significant. If this was an improvement that extends the asset's life or value, it should be capitalized, not expensed. Please verify.`,
        flagType: 'risk',
        category: 'tax',
        detectedAt: new Date().toISOString(),
      });
    }

    // Rule 3: Donation Verification
    if (entry.category === 'Donations') {
      hints.push({
        id: `${entry.id}-donation`,
        entryId: entry.id,
        severity: 'med',
        message: `Donation of RM ${debit} recorded. Tax deductions for donations are only allowed for contributions to LHDN-approved institutions. Please verify the recipient's approval status.`,
        flagType: 'risk',
        category: 'compliance',
        detectedAt: new Date().toISOString(),
      });
    }
  }

  return hints;
};

const AouthaPanel: React.FC<AouthaProps> = ({ rawEntries }) => {
  const dieFlags = useMemo(() => generateDieHints(rawEntries), [rawEntries]);

  const docGaps = rawEntries.filter(e =>
    (e.type === 'DEBIT' ? e.amount : 0) > DOCUMENT_GAP_THRESHOLD && !e.sourceDocUrl
  );

  const uncategorized = rawEntries.filter(e => e.category === 'Uncategorized');

  return (
    <div className="bg-white dark:bg-slate-900 border-l border-slate-200 p-6 h-full shadow-lg">
      <h2 className="text-lg font-bold mb-6 text-slate-800 dark:text-slate-100 uppercase tracking-tight">The Aoutha</h2>
      
      {dieFlags.length > 0 && (
        <div className="mb-8 p-4 bg-sky-50 rounded-lg border border-sky-200">
          <p className="text-xs text-sky-700 font-bold uppercase">Deductibility Insights</p>
          <p className="text-2xl font-black text-sky-900 mb-2">{dieFlags.length} Opportunities Found</p>
          <div className="space-y-3">
            {dieFlags.map((flag, index) => (
              <div key={index} className="text-sm text-slate-700 dark:text-slate-300">
                <p className='font-semibold'>{flag.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-xs text-amber-700 font-bold uppercase">Document Gaps (&gt;RM{DOCUMENT_GAP_THRESHOLD})</p>
          <p className="text-2xl font-black text-amber-900">{docGaps.length}</p>
        </div>
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="text-xs text-red-700 font-bold uppercase">Uncategorized Items</p>
          <p className="text-2xl font-black text-red-900">{uncategorized.length}</p>
        </div>
      </div>
    </div>
  );
};

export default AouthaPanel;
