import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy, where, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../firebase';
import type { LedgerEntry } from '../types';
import type { UILedgerEntry } from '../types/viewModels';
import { toUILedgerEntry } from '../types/viewModels';

export const useLedgerEntries = (yearId: string) => {
  const [canonicalEntries, setCanonicalEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!yearId) return;

    const q = query(
      collection(db, 'ledger_entries'), 
      where('yearId', '==', yearId),
      orderBy('transactionDate', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot) => {
      const data = snapshot.docs.map(doc => {
        const docData = doc.data() as DocumentData;
        return {
          id: doc.id,
          ...docData
        } as LedgerEntry;
      });
      
      setCanonicalEntries(data);
      setLoading(false);
    }, (err) => {
      console.error("Firestore Listen Error:", err);
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [yearId]);

  const uiEntries = useMemo(() => {
    return canonicalEntries.map(toUILedgerEntry);
  }, [canonicalEntries]);

  return { canonicalEntries, uiEntries, loading, error };
};
