// src/components/TabSwitch.tsx
import React from 'react';

const TABS = [
  { id: 'setup', label: '01 Setup', progress: 20 },
  { id: 'extraction', label: '02 Extraction', progress: 40 },
  { id: 'refinement', label: '03 Refinement', progress: 60 },
  { id: 'tax', label: '04 Tax', progress: 80 },
  { id: 'export', label: '05 Export', progress: 100 },
];

interface TabSwitchProps {
  activeTab: string;
  onTabChange: (id: string) => void;
}

export const TabSwitch: React.FC<TabSwitchProps> = ({ activeTab, onTabChange }) => {
  const currentProgress = TABS.find(t => t.id === activeTab)?.progress || 20;

  return (
    <div className="w-full mb-12">
      {/* Progress Rail */}
      <div className="fixed top-[76px] left-0 w-full h-[2px] bg-white/5 z-50">
        <div 
          className="h-full bg-[#00D9FF] transition-all duration-700 ease-in-out shadow-[0_0_10px_#00D9FF]"
          style={{ width: `${currentProgress}%` }}
        />
      </div>

      <nav className="flex justify-between border-b border-white/5 pt-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`pb-4 text-[11px] font-extrabold uppercase tracking-[0.2em] transition-all ${
              activeTab === tab.id ? 'text-[#00D9FF] border-b-2 border-[#00D9FF]' : 'text-gray-500 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};
