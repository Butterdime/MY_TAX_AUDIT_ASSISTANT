
import { useState } from 'react';
import RefinementView from './views/RefinementView';
import RiskSimulationView from './views/RiskSimulationView';

const ExtractionView = () => (
  <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
    <h2 className="text-2xl font-bold text-gray-800">Extraction View</h2>
    <p className="mt-4 text-gray-600">Content for data extraction goes here.</p>
  </div>
);

function App() {
  const [activeTab, setActiveTab] = useState<'extraction' | 'refinement' | 'risk-simulator'>('extraction');

  const renderContent = () => {
    switch (activeTab) {
      case 'extraction':
        return <ExtractionView />;
      case 'refinement':
        return <RefinementView />;
      case 'risk-simulator':
        return <RiskSimulationView />;
      default:
        return <ExtractionView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans tracking-tight">
      <div className="max-w-7xl mx-auto p-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tighter">MYAUDIT 🔍</h1>
          <p className="text-slate-600">AI-Powered Forensic Audit & Tax Assistant</p>
        </header>

        <nav className="flex justify-center mb-8 p-1 bg-slate-100 rounded-lg w-max mx-auto">
          {['extraction', 'refinement', 'risk simulator'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.replace(' ', '-') as 'extraction' | 'refinement' | 'risk-simulator')}
              className={`px-6 py-2 text-sm font-semibold rounded-md capitalize ${
                activeTab === tab.replace(' ', '-')
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:bg-slate-200'
              }`}>
              {tab}
            </button>
          ))}
        </nav>

        <main>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
