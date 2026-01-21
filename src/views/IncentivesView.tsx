import React from 'react';
import { IncentiveSignals } from '../types';
import IncentiveProfile from '../components/incentives/IncentiveProfile';

interface Props {
  signals: IncentiveSignals;
  setSignals: React.Dispatch<React.SetStateAction<IncentiveSignals>>;
}

const IncentivesView: React.FC<Props> = ({ signals, setSignals }) => {

  const handleUpdate = (key: keyof IncentiveSignals, value: boolean) => {
    setSignals((prev: IncentiveSignals) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <IncentiveProfile signals={signals} onUpdate={handleUpdate} />
    </div>
  );
};

export default IncentivesView;
