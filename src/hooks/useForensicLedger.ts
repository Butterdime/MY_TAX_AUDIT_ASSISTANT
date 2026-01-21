import { useState, useMemo } from 'react';
import { LedgerEntry } from '../types';

export const useForensicLedger = (initialEntries: LedgerEntry[]) => {
  const [entries, setEntries] = useState<LedgerEntry[]>(initialEntries);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const updateCategory = (entryId: string, newCategory: string) => {
    setEntries(prev => prev.map(entry => 
      entry.id === entryId ? { ...entry, category: newCategory, auditStatus: 'VALIDATED' } : entry
    ));
  };

  const transactions = useMemo(() => {
    if (!searchQuery) return entries;
    return entries.filter(e => 
      (e.description ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [entries, searchQuery]);

  const stats = useMemo(() => {
    const total = entries.length;
    const auditReady = entries.filter(e => e.auditStatus === 'APPROVED').length;
    const highRisk = entries.filter(e => e.dieFlags && e.dieFlags.length > 0).length;
    
    return {
      total,
      uncategorized: entries.filter(e => e.category === 'Uncategorized').length,
      auditReady,
      highRisk,
      dieFlagsCount: highRisk, // Mapping highRisk to the count expected by UI
      readinessScore: total > 0 ? Math.round((auditReady / total) * 100) : 0
    };
  }, [entries]);

  return {
    transactions,
    isLoading,
    searchQuery,
    setSearchQuery,
    error,
    updateCategory,
    stats
  };
};