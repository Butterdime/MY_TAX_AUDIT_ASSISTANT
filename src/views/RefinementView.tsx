
import React from 'react';
import AouthaPanel from '../components/aoutha/AouthaPanel';
import { useLedgerEntries } from '../hooks/useLedgerEntries';

const RefinementView: React.FC = () => {
  const { entries, loading } = useLedgerEntries();

  if (loading) return <div>Synchronizing with MYAUDIT Cloud...</div>;

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="col-span-3">
        Ledger Table Area (Refinement Phase)
      </div>
      <div className="col-span-1">
        <AouthaPanel entries={entries} />
      </div>
    </div>
  );
};

export default RefinementView;
