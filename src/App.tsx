// src/App.tsx
import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { TabSwitch } from './components/TabSwitch';
import SetupView from './views/SetupView';
import ExtractionView from './views/ExtractionView';
import RefinementView from './views/RefinementView';
import TaxView from './views/TaxView';
import AuditLogView from './components/audit/AuditLogView'; // Export Tab 5

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('setup');

  return (
    <div className="min-h-screen bg-[#2B2F33] text-[#F5F7FA] font-sans">
      <Header />
      <main className="pt-32 pb-12 max-w-7xl mx-auto px-6">
        <TabSwitch activeTab={activeTab} onTabChange={setActiveTab} />
        
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {activeTab === 'setup' && <SetupView />}
          {activeTab === 'extraction' && <ExtractionView />}
          {activeTab === 'refinement' && <RefinementView />}
          {activeTab === 'tax' && <TaxView />}
          {activeTab === 'export' && <AuditLogView />}
        </section>
      </main>
      
      <footer className="text-center py-12 text-[10px] text-gray-600 uppercase tracking-[0.4em]">
        Advisory Information Only • RPR COMMUNICATIONS © 2026
      </footer>
    </div>
  );
};

export default App;
