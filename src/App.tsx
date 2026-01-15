import React, { useState, useEffect } from "react";

// Λ-SERUM (v3.0) TYPE DEFINITIONS
interface StatusCardProps {
  label: string;
  active: boolean;
  complete: boolean;
}

interface YearTransitionProps {
  isVisible: boolean;
}

interface LedgerEntry {
  id: string;
  date: string;
  description: string;
  debit?: number;
  credit?: number;
  status: "cleared" | "pending";
}

// SOVEREIGN SINGLE-FILE COMPONENT: App.tsx
// Do not decompose, refactor, or create sub-components.
// This is the single source of truth for the MYAUDIT Λ v1.2 substrate.

const StatusCard: React.FC<StatusCardProps> = ({ label, active, complete }) => (
  <div
    className={`p-4 rounded-xl border transition-all duration-500 flex items-center gap-3 ${
      active
        ? "bg-[#151518] border-[#2E5BFF]/30 opacity-100 translate-y-0"
        : "bg-transparent border-transparent opacity-0 translate-y-4"
    }`}
  >
    <div
      className={`w-2 h-2 rounded-full ${
        complete
          ? "bg-[#00D9FF] shadow-[0_0_8px_#00D9FF]"
          : "bg-gray-600 animate-pulse"
      }`}
    />
    <span
      className={`text-sm tracking-wide ${
        complete ? "text-white" : "text-gray-400"
      }`}
    >
      {label}
    </span>
  </div>
);

const YearTransitionScreen: React.FC<YearTransitionProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center animate-fadeIn">
      <div className="text-[#00D9FF] text-9xl font-bold animate-pulse">Λ</div>
      <div className="text-white text-5xl font-mono mt-4">2025 → 2026</div>
      <div className="text-gray-400 text-xl mt-2">
        YEAR-END TRANSITION PROTOCOL
      </div>
    </div>
  );
};

const ledgerData: LedgerEntry[] = [
  {
    id: "txn_01",
    date: "2025-12-15",
    description: "Acquisition of K-3 Audit Drone",
    debit: 5000,
    status: "cleared",
  },
  {
    id: "txn_02",
    date: "2025-12-20",
    description: "Service Revenue: RPR Corp",
    credit: 15000,
    status: "cleared",
  },
  {
    id: "txn_03",
    date: "2025-12-28",
    description: "Forensic Software License",
    debit: 3200,
    status: "pending",
  },
  {
    id: "txn_04",
    date: "2026-01-05",
    description: "Service Revenue: Sentinel Gov",
    credit: 45000,
    status: "cleared",
  },
  {
    id: "txn_05",
    date: "2026-01-12",
    description: "Data Processing Fees",
    debit: 1200,
    status: "cleared",
  },
];

export default function App() {
  const [showYearEnd, setShowYearEnd] = useState(false);
  const [currentView, setCurrentView] = useState<"dashboard" | "ledger">(
    "dashboard",
  );

  const turnover = ledgerData.reduce(
    (acc, item) => acc + (item.credit || 0),
    0,
  );
  const taxLiability = turnover * 0.15; // Simplified 15% flat tax

  useEffect(() => {
    if (showYearEnd) {
      const timer = setTimeout(() => setShowYearEnd(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [showYearEnd]);

  const handleYearEnd = () => {
    setShowYearEnd(true);
  };

  const renderLedgerRow = (entry: LedgerEntry) => (
    <tr key={entry.id} className="border-b border-gray-800 hover:bg-gray-800/50">
      <td className="py-4 px-4 text-gray-300">{entry.date}</td>
      <td className="py-4 px-4 text-gray-300">{entry.description}</td>
      <td className="py-4 px-4 text-white font-mono text-right">
        {entry.debit ? `RM ${entry.debit.toLocaleString()}` : "-"}
      </td>
      <td className="py-4 px-4 text-white font-mono text-right">
        {entry.credit ? `RM ${entry.credit.toLocaleString()}` : "-"}
      </td>
      <td className="py-4 px-4 text-right">
        <span
          className={`px-3 py-1 text-sm rounded-full ${
            entry.status === "cleared"
              ? "bg-green-500/10 text-green-400"
              : "bg-yellow-500/10 text-yellow-400"
          }`}
        >
          {entry.status.toUpperCase()}
        </span>
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-[#0d1112] text-white font-sans">
      <YearTransitionScreen isVisible={showYearEnd} />

      <header className="border-b border-gray-800/50 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Icon removed, text-only wordmark */}
            <h1 className="text-2xl font-semibold tracking-wider">
              MYAUDIT <span className="text-xs text-gray-400 align-middle">v1.4</span>
            </h1>
          </div>
          <nav className="flex gap-2">
            <button
              onClick={() => setCurrentView("dashboard")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                currentView === "dashboard"
                  ? "bg-[#2E5BFF] text-white shadow-[0_0_10px_#2E5BFF40]"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView("ledger")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                currentView === "ledger"
                  ? "bg-[#2E5BFF] text-white shadow-[0_0_10px_#2E5BFF40]"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white"
              }`}
            >
              Forensic Ledger
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {currentView === "dashboard" ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#151518]/80 border border-gray-800/60 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-sm font-medium text-gray-400">
                  Total Turnover (MYR)
                </h3>
                <p className="text-4xl font-bold text-white mt-2">
                  RM {turnover.toLocaleString()}
                </p>
              </div>
              <div className="bg-[#151518]/80 border border-gray-800/60 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-sm font-medium text-gray-400">
                  Tax Liability (MYR)
                </h3>
                <p className="text-4xl font-bold text-[#00D9FF] mt-2">
                  RM {taxLiability.toLocaleString()}
                </p>
              </div>
              <div className="bg-[#151518]/80 border border-gray-800/60 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-sm font-medium text-gray-400">
                  Compliance Status
                </h3>
                <p className="text-4xl font-bold text-green-500 mt-2">READY</p>
              </div>
            </div>

            <div className="bg-[#151518]/80 border border-gray-800/60 rounded-xl p-6 backdrop-blur-sm">
              <h2 className="text-xl font-bold mb-6">
                SENTINEL Processing Pipeline
              </h2>
              <div className="space-y-3">
                <StatusCard
                  label="YA 2025 Ledger Reconciliation"
                  active={true}
                  complete={true}
                />
                <StatusCard
                  label="Automated Forensic Analysis (K-3 Drone)"
                  active={true}
                  complete={true}
                />
                <StatusCard
                  label="YA 2026 Tax Projection"
                  active={true}
                  complete={false}
                />
                <StatusCard
                  label="RPR-KONTROL Audit Report Generation"
                  active={false}
                  complete={false}
                />
              </div>
            </div>

            <div className="bg-[#151518]/80 border border-gray-800/60 rounded-xl p-6 backdrop-blur-sm">
              <h2 className="text-xl font-bold mb-4">Year-End Operations</h2>
              <p className="text-gray-400 mb-4">
                Execute the transition from YA 2025 to YA 2026. This process is
                irreversible.
              </p>
              <button
                onClick={handleYearEnd}
                className="px-6 py-3 bg-gradient-to-r from-[#2E5BFF] to-[#00D9FF] hover:opacity-80 text-white rounded-lg font-semibold transition-opacity duration-300"
              >
                Engage Year-End Transition Protocol (2025 → 2026)
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#151518]/80 border border-gray-800/60 rounded-xl p-6 backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-6">YA 2026 Forensic Ledger</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-700">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">
                      Date
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">
                      Description
                    </th>
                    <th className="py-3 px-4 text-right text-sm font-medium text-gray-400">
                      Debit (MYR)
                    </th>
                    <th className="py-3 px-4 text-right text-sm font-medium text-gray-400">
                      Credit (MYR)
                    </th>
                    <th className="py-3 px-4 text-right text-sm font-medium text-gray-400">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>{ledgerData.map(renderLedgerRow)}</tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-gray-800/50 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span>MYAUDIT AUDIT LAYER</span>
          </div>
          <div className="flex items-center gap-4 font-mono">
            <span>v1.2-STABLE</span>
            <span>|</span>
            <span>SENTINEL ACTIVE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
