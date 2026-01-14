// src/components/layout/Header.tsx
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="fixed top-0 w-full z-50 bg-[#2B2F33]/90 backdrop-blur-md border-b border-white/5 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-end">
        <div className="flex items-center">
          {/* λ Sans-serif Engineering */}
          <span className="text-4xl font-extrabold text-[#00D9FF] leading-none transform scale-y-[1.15] mr-2">λ</span>
          <div className="flex flex-col leading-none">
            <span className="text-2xl font-extrabold tracking-tighter text-[#F5F7FA]">MYΛUDIT</span>
            <span className="text-[9px] tracking-[0.3em] text-[#00D9FF] font-medium mt-1 uppercase">Sovereign Identity</span>
          </div>
        </div>
        <div className="text-right pb-1">
          <p className="text-[10px] font-bold tracking-widest text-[#00D9FF] uppercase">asia-southeast1 locked</p>
          <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-0.5">Sentinel v1.0 Active</p>
        </div>
      </div>
    </header>
  );
};
