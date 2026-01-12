import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';

export const resolveAuditGap = async (
  entryId: string, 
  updates: { category?: string; docUrl?: string }
) => {
  const entryRef = doc(db, 'ledger_entries', entryId);

  const finalUpdate: any = {};
  
  if (updates.category) {
    finalUpdate.category = updates.category;
  }
  
  if (updates.docUrl) {
    // We add to the array to allow multiple supporting documents
    finalUpdate.supportingDocLinks = arrayUnion(updates.docUrl);
  }

  return await updateDoc(entryRef, finalUpdate);
};
