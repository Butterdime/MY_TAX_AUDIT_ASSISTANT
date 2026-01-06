
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BusinessProfile, BusinessType, StatementDateRange } from '../types';

interface Props {
  profile: BusinessProfile;
  onSubmit: (profile: BusinessProfile) => void;
  statementDateRange?: StatementDateRange;
  isExpanded: boolean;
  onToggle: () => void;
}

const BUSINESS_TYPES: { value: BusinessType; key: string }[] = [
  { value: 'sole_proprietorship', key: 'bt_sole_proprietorship' },
  { value: 'partnership', key: 'bt_partnership' },
  { value: 'llp', key: 'bt_llp' },
  { value: 'sdn_bhd', key: 'bt_sdn_bhd' },
  { value: 'bhd', key: 'bt_bhd' },
  { value: 'other', key: 'bt_other' },
];

const COMMON_FYES = [
  { value: '31-12', key: 'fye_31_12' },
  { value: '30-06', key: 'fye_30_06' },
  { value: '31-03', key: 'fye_31_03' },
  { value: '30-09', key: 'fye_30_09' },
];

export const BusinessRegistrationForm: React.FC<Props> = ({ 
  profile, 
  onSubmit, 
  statementDateRange, 
  isExpanded, 
  onToggle 
}) => {
  const { t } = useTranslation();
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

  const getBusinessTypeName = (type: BusinessType) => {
    const found = BUSINESS_TYPES.find(bt => bt.value === type);
    return found ? t(found.key) : type;
  };

  const getFyeLabel = (val: string) => {
    const found = COMMON_FYES.find(f => f.value === val);
    return found ? t(found.key) : val;
  };

  return (
    <section className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${!isExpanded ? 'max-h-16 opacity-75' : 'max-h-[800px]'}`}>
      <div 
        className="bg-slate-50 px-8 py-3 border-b flex items-center justify-between cursor-pointer" 
        onClick={onToggle}
      >
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <span className="w-5 h-5 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center text-[10px]">0</span>
          {t('profile_title')}
        </h2>
        <div className="flex items-center gap-2">
          {!isExpanded && localProfile.legal_name && (
            <span className="text-xs font-bold text-indigo-600">
              {localProfile.legal_name} • {getBusinessTypeName(localProfile.business_type)} ({t('fye')}: {localProfile.financial_year_end})
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
            <label className="text-[10px] font-bold text-slate-400 uppercase">{t('legal_name')}</label>
            <input 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
              value={localProfile.legal_name}
              onChange={e => handleChange('legal_name', e.target.value)}
              placeholder={t('placeholder_legal_name')}
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">{t('business_type')}</label>
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              value={localProfile.business_type}
              onChange={e => handleChange('business_type', e.target.value as BusinessType)}
            >
              {BUSINESS_TYPES.map(bt => <option key={bt.value} value={bt.value}>{t(bt.key)}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">{t('fye')}</label>
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
                    {t(f.key)} {suggestion === f.value ? '*' : ''}
                  </option>
                ))}
                <option value="other">{t('other_custom')}</option>
              </select>
              
              {(!COMMON_FYES.some(f => f.value === localProfile.financial_year_end)) && (
                <input 
                  className="mt-2 w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={localProfile.financial_year_end}
                  onChange={e => handleChange('financial_year_end', e.target.value)}
                  placeholder={t('format_ddmm')}
                />
              )}
            </div>
            {suggestion && (
              <p className="text-[9px] text-indigo-500 font-bold mt-1 uppercase tracking-tighter">
                💡 {t('suggested_fye')}: {getFyeLabel(suggestion)}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">{t('reg_no')}</label>
            <input 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              value={localProfile.registration_number}
              onChange={e => handleChange('registration_number', e.target.value)}
              placeholder={t('placeholder_reg_no')}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">{t('tin')}</label>
            <input 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              value={localProfile.tax_identification_number}
              onChange={e => handleChange('tax_identification_number', e.target.value)}
              placeholder={t('placeholder_tin')}
            />
          </div>
        </div>
      )}
    </section>
  );
};
