import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import type { LedgerEntry } from '../types';
import type { UILedgerEntry } from '../types/viewModels';
import { toUILedgerEntry } from '../types/viewModels';

export interface ForensicState {
  entries: UILedgerEntry[];
  rawEntries: LedgerEntry[];
  loading: boolean;
  error: string | null;
  handleRunAudit: () => Promise<void> | void;
}

const ForensicContext = createContext<ForensicState | undefined>(undefined);

export const ForensicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rawEntries, setRawEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRunAudit = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // In a real app, this would involve file parsing and API calls.
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
          metadata: { accountCode: 8201, notes: 'Consider Staff Welfare classification' },
          accountCode: '8201',
          entityId: 'test-entity',
        },
      ];
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRawEntries(massiveActivationYA2017);
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  }, []);

  const entries = useMemo(() => rawEntries.map(toUILedgerEntry), [rawEntries]);

  const value = useMemo(() => ({ entries, rawEntries, loading, error, handleRunAudit }), [entries, rawEntries, loading, error, handleRunAudit]);

  return (
    <ForensicContext.Provider value={value}>
      {children}
    </ForensicContext.Provider>
  );
};

export const useForensicContext = () => {
  const ctx = useContext(ForensicContext);
  if (!ctx) throw new Error('useForensicContext must be used within ForensicProvider');
  return ctx;
};
