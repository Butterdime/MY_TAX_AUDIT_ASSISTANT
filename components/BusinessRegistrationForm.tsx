
import React, { useEffect, useState } from 'react';
import { BusinessProfile, BusinessType, StatementDateRange } from '../types';

interface Props {
  profile: BusinessProfile;
  onSubmit: (profile: BusinessProfile) => void;
  statementDateRange?: StatementDateRange;
  isExpanded: boolean;
  onToggle: () => void;
}

const BUSINESS_TYPES: { value: BusinessType; label: string }[] = [
  { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'llp', label: 'Limited Liability Partnership (LLP)' },
  { value: 'sdn_bhd', label: 'Sendirian Berhad (Sdn Bhd)' },
  { value: 'bhd', label: 'Berhad (Bhd)' },
  { value: 'other', label: 'Other' },
];

const COMMON_FYES = [
  { value: '31-12', label: '31 Dec (Calendar Year)' },
  { value: '30-06', label: '30 June' },
  { value: '31-03', label: '31 March' },
  { value: '30-09', label: '30 Sept' },
];

export const BusinessRegistrationForm: React.FC<Props> = ({ 
  profile, 
  onSubmit, 
  statementDateRange, 
  isExpanded, 
  onToggle 
}) => {
  const [localProfile, setLocalProfile] = useState<BusinessProfile>(profile);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  useEffect(() => {
    if (statementDateRange) {
      const start = new Date(statementDateRange.earliest_transaction_date);
      const month = start.getMonth() + 1; // 1-12

      let inferred = '31-12';
      if (month === 7) inferred = '30-06';
      else if (month === 4) inferred = '31-03';
      else if (month === 10) inferred = '30-09';
      else if (month === 1) inferred = '31-12';

      setSuggestion(inferred);
      // Auto-populate if user hasn't manually set a specific non-default one or if it's currently empty
      if (!localProfile.financial_year_end || localProfile.financial_year_end === '31-12') {
        setLocalProfile(prev => ({ ...prev, financial_year_end: inferred }));
      }
    }
  }, [statementDateRange]);

  const handleChange = (field: keyof BusinessProfile, value: string) => {
    const updated = { ...localProfile, [field]: value };
    setLocalProfile(updated);
    onSubmit(updated);
  };

  return (
    <section className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${!isExpanded ? 'max-h-16 opacity-75' : 'max-h-[800px]'}`}>
      <div 
        className="bg-slate-50 px-8 py-3 border-b flex items-center justify-between cursor-pointer" 
        onClick={onToggle}
      >
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <span className="w-5 h-5 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center text-[10px]">0</span>
          Business Profile & Entity Context
        </h2>
        <div className="flex items-center gap-2">
          {!isExpanded && localProfile.legal_name && (
            <span className="text-xs font-bold text-indigo-600">
              {localProfile.legal_name} • {localProfile.business_type.replace('_', ' ')} (FYE: {localProfile.financial_year_end})
            </span>
          )}
          <svg className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isExpanded && (
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Legal Entity Name</label>
            <input 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
              value={localProfile.legal_name}
              onChange={e => handleChange('legal_name', e.target.value)}
              placeholder="e.g. Acme Sdn Bhd"
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Business Type</label>
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              value={localProfile.business_type}
              onChange={e => handleChange('business_type', e.target.value as BusinessType)}
            >
              {BUSINESS_TYPES.map(bt => <option key={bt.value} value={bt.value}>{bt.label}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Financial Year End</label>
            <div className="relative">
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none pr-8"
                value={COMMON_FYES.some(f => f.value === localProfile.financial_year_end) ? localProfile.financial_year_end : 'other'}
                onChange={e => {
                  const val = e.target.value;
                  if (val !== 'other') handleChange('financial_year_end', val);
                }}
              >
                {COMMON_FYES.map(f => (
                  <option key={f.value} value={f.value}>
                    {f.label} {suggestion === f.value ? '(Suggested)' : ''}
                  </option>
                ))}
                <option value="other">Other / Custom</option>
              </select>
              
              {(!COMMON_FYES.some(f => f.value === localProfile.financial_year_end)) && (
                <input 
                  className="mt-2 w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={localProfile.financial_year_end}
                  onChange={e => handleChange('financial_year_end', e.target.value)}
                  placeholder="Format: DD-MM (e.g. 15-05)"
                />
              )}
            </div>
            {suggestion && (
              <p className="text-[9px] text-indigo-500 font-bold mt-1 uppercase tracking-tighter">
                💡 Suggested {suggestion} based on statement date pattern
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Registration No (SSM)</label>
            <input 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              value={localProfile.registration_number}
              onChange={e => handleChange('registration_number', e.target.value)}
              placeholder="e.g. 202401012345"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Tax Identification (TIN)</label>
            <input 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              value={localProfile.tax_identification_number}
              onChange={e => handleChange('tax_identification_number', e.target.value)}
              placeholder="e.g. C 1234567890"
            />
          </div>
        </div>
      )}
    </section>
  );
};
