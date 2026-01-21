import { LedgerEntry, DieFlag } from "../types";

const MISCLASSIFICATION_KEYWORDS: { keyword: string, category: string }[] = [
    { keyword: 'training', category: 'Staff Training' },
    { keyword: 'software', category: 'Software/Tools' },
    { keyword: 'consulting', category: 'Consulting' },
];

export function detectMisclassifications(entry: LedgerEntry): DieFlag[] {
    const flags: DieFlag[] = [];
    const description = entry.description ?? '';

    for (const { keyword, category } of MISCLASSIFICATION_KEYWORDS) {
        const hasKeyword = description.toLowerCase().includes(keyword.toLowerCase());

        if (hasKeyword && entry.category !== category) {
            flags.push({
                id: `${entry.id}-misclass`,
                entryId: entry.id,
                severity: 'med',
                message: `Entry \"${description}\" might be miscategorized. Suggestion: Re-categorize to \"${category}\".`,
                flagType: 'MISCLASSIFICATION_RISK',
                category: 'compliance',
                detectedAt: new Date().toISOString(),
            });
        }
    }

    return flags;
}

export function estimateRiskSimulation(entries: LedgerEntry[]) {
    const highRiskEntries = entries.filter(e => {
        const debit = e.type === 'DEBIT' ? e.amount : 0;
        return (debit > 500 && !e.supportingDocUrl) ||
               e.category === 'Uncategorized';
    });

    const estimatedExposure = highRiskEntries.reduce((acc, entry) => {
        const debit = entry.type === 'DEBIT' ? entry.amount : 0;
        return acc + debit;
    }, 0);

    const simulatedLeakage = estimatedExposure * 0.24; // 24% tax rate

    return {
        estimatedExposure,
        simulatedLeakage,
        riskLevel: simulatedLeakage > 10000 ? 'HIGH' : 'MEDIUM',
    };
}
