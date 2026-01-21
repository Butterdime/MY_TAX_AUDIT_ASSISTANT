import { useState, useEffect } from 'react';
import { LedgerEntry } from '../types';

// --- MASSIVE ACTIVATION YA 2017 TEST HARNESS ---
const massiveActivationYA2017: LedgerEntry[] = [
    {
      id: 'ya2017_001',
      transactionDate: '2017-01-15',
      description: 'ANNUAL STAFF DINNER - GALA EVENT',
      amount: 100000,
      type: 'DEBIT',
      sourceDocUrl: 'https://docs.example.com/invoice_001.pdf',
      supportingDocUrl: 'https://docs.example.com/receipt_001.pdf',
      category: 'Entertainment',
      confidenceScore: 0.85,
      status: 'PENDING',
      auditStatus: 'PENDING',
      eInvoiceStatus: 'MISSING',
      dieFlags: ['MISCLASSIFICATION_RISK'],
      metadata: { accountCode: 8201, notes: 'Consider Staff Welfare classification' }
    },
    {
      id: 'ya2017_002',
      transactionDate: '2017-02-20',
      description: 'PURCHASE OF CNC AUTOMATION ROBOT',
      amount: 150000,
      type: 'DEBIT',
      sourceDocUrl: 'https://docs.example.com/invoice_002.pdf',
      supportingDocUrl: 'https://docs.example.com/invoice_002.pdf',
      category: 'Capital Expenditure',
      confidenceScore: 0.98,
      status: 'VALIDATED',
      auditStatus: 'VALIDATED',
      eInvoiceStatus: 'VALIDATED',
      dieFlags: [],
      metadata: { accountCode: 7102, notes: 'Automation Capital Allowance eligible' }
    },
    {
      id: 'ya2017_003',
      transactionDate: '2017-03-10',
      description: 'JANUARY SALARY PAYROLL',
      amount: 1500,
      type: 'DEBIT',
      sourceDocUrl: 'https://docs.example.com/payroll_001.pdf',
      supportingDocUrl: 'https://docs.example.com/payroll_001.pdf',
      category: 'Staff Costs',
      confidenceScore: 0.95,
      status: 'PENDING',
      auditStatus: 'PENDING',
      eInvoiceStatus: 'EXEMPT',
      dieFlags: ['MINIMUM_WAGE_RISK'],
      metadata: { accountCode: 8402, notes: 'Below 2026 minimum wage floor' }
    },
    {
      id: 'ya2017_004',
      transactionDate: '2017-04-05',
      description: 'SOFTWARE LICENSING FEES',
      amount: 25000,
      type: 'DEBIT',
      sourceDocUrl: 'https://docs.example.com/invoice_003.pdf',
      supportingDocUrl: 'https://docs.example.com/invoice_003.pdf',
      category: 'Software',
      confidenceScore: 0.90,
      status: 'PENDING',
      auditStatus: 'PENDING',
      eInvoiceStatus: 'VALIDATED',
      dieFlags: [],
      metadata: { accountCode: 7102, notes: 'Automation CA eligible' }
    },
    {
      id: 'ya2017_005',
      transactionDate: '2017-05-12',
      description: 'SERVICE REVENUE - PROJECT ALPHA',
      amount: 50000,
      type: 'CREDIT',
      sourceDocUrl: 'https://docs.example.com/invoice_rev_001.pdf',
      supportingDocUrl: 'https://docs.example.com/invoice_rev_001.pdf',
      category: 'Revenue',
      confidenceScore: 0.92,
      status: 'VALIDATED',
      auditStatus: 'VALIDATED',
      eInvoiceStatus: 'VALIDATED',
      dieFlags: [],
      metadata: { accountCode: 4000, notes: 'Software sales revenue' }
    }
  ];

export const useSovereignSubstrate = (entityId: string) => {
    const [data, setData] = useState<LedgerEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // In a real application, you would fetch data from an API
                // For now, we'll just use the mock data
                await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
                setData(massiveActivationYA2017);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [entityId]);

    return { data, loading, error };
};