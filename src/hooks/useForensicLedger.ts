import { useState, useMemo } from 'react';
import transactionsData from '../data/forensic-transactions.json';
import { LedgerEntry } from '../types';

export const useForensicLedger = () => {
    const [searchQuery, setSearchQuery] = useState('');

    // In a real app, this might be fetched from an API or Firestore
    const transactions: LedgerEntry[] = transactionsData as LedgerEntry[];

    const filteredTransactions = useMemo(() => {
        return transactions.filter((t) =>
            t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [transactions, searchQuery]);

    const stats = useMemo(() => {
        const total = transactions.length;
        const missingEInvoices = transactions.filter(t => t.eInvoiceStatus === 'missing').length;
        const dieFlagsCount = transactions.filter(t => (t.dieFlags?.length ?? 0) > 0).length;
        const auditReadyCount = transactions.filter(t => t.status === 'AUDIT_READY' && t.eInvoiceStatus === 'valid').length;

        // Readiness score calculation: (Audit Ready / Total) * 100
        // In the prototype it shows 68%
        const readinessScore = total > 0 ? Math.round((auditReadyCount / total) * 100) : 0;

        return {
            total,
            missingEInvoices,
            dieFlagsCount,
            readinessScore,
            threshold: 80
        };
    }, [transactions]);

    const exportCSV = () => {
        const headers = ['Date', 'Description', 'Amount', 'Category', 'E-Invoice Status', 'Status'];
        const rows = transactions.map(t => [
            (t as any).date || 'N/A',
            t.description,
            t.debit.toFixed(2),
            t.category,
            t.eInvoiceStatus || 'N/A',
            t.status
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "forensic_ledger_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return {
        transactions: filteredTransactions,
        searchQuery,
        setSearchQuery,
        stats,
        exportCSV
    };
};
