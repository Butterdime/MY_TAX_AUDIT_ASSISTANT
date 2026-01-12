import { firestore } from 'firebase-admin';

const SME_BANDS_2026 = [
    { threshold: 150000, rate: 0.15 },
    { threshold: 600000, rate: 0.17 },
    { threshold: Infinity, rate: 0.24 },
];

interface TaxEngineResult2026 {
    engineVersion: string;
    effectiveRate: number;
    taxPayable: number;
    chargeableIncome: number;
}

async function calculateTaxYA2026(chargeableIncome: number): Promise<TaxEngineResult2026> {
    let taxPayable = 0;
    let remainingIncome = chargeableIncome;

    for (const band of SME_BANDS_2026) {
        if (remainingIncome <= 0) break;

        const taxableAtThisBand = Math.min(remainingIncome, band.threshold);
        taxPayable += taxableAtThisBand * band.rate;
        remainingIncome -= taxableAtThisBand;
    }

    const effectiveRate = taxPayable / chargeableIncome;

    // Log the audit trail
    await firestore().collection('auditLogs').add({
        timestamp: firestore.FieldValue.serverTimestamp(),
        event: 'TAX_CALCULATION',
        details: {
            chargeableIncome,
            taxPayable,
            effectiveRate,
            engineVersion: 'YA2026_v1.0',
        },
    });

    return {
        engineVersion: 'YA2026_v1.0',
        effectiveRate,
        taxPayable,
        chargeableIncome,
    };
}
