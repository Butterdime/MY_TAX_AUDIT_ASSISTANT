
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FinancialYearSummary as FYSummary } from '../types';

interface Props {
  summaries: FYSummary[];
  onMonthClick: (monthLabel: string) => void;
}

export const FinancialYearSummary: React.FC<Props> = ({ summaries, onMonthClick }) => {
  const { t } = useTranslation();
  if (!summaries || summaries.length === 0) return null;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {summaries.map((fy, fyIdx) => (
        <div key={fyIdx} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {t('fy_label')}: {fy.financial_year_label}
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white border px-3 py-1 rounded-full shadow-sm">
              {t('fye')} {fy.financial_year_end_date}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {fy.months.map((month, mIdx) => (
              <div 
                key={mIdx} 
                onClick={() => onMonthClick(month.month_label)}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{month.month_label}</h4>
                    <p className="text-[9px] text-slate-400 font-medium">{month.start_date} - {month.end_date}</p>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-50 group-hover:bg-indigo-50 transition-colors">
                    <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500 font-medium">{t('deposits')}</span>
                    <span className="text-emerald-600 font-bold font-mono">RM {month.total_deposits.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500 font-medium">{t('withdrawals')}</span>
                    <span className="text-rose-500 font-bold font-mono">RM {month.total_withdrawals.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                  
                  <div className="pt-2 border-t border-slate-50 space-y-1.5">
                    <div className="flex justify-between items-center text-[9px]">
                      <span className="text-slate-400 uppercase font-bold tracking-tighter">{t('salary_epf')}</span>
                      <span className="text-indigo-600 font-bold font-mono">
                        {(month.by_audit_type.salary + month.by_audit_type.epf_socso).toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[9px]">
                      <span className="text-slate-400 uppercase font-bold tracking-tighter">{t('director_draw')}</span>
                      <span className="text-sky-600 font-bold font-mono">{month.by_audit_type.director_drawing.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between items-center text-[9px]">
                      <span className="text-slate-400 uppercase font-bold tracking-tighter">{t('tax_paid')}</span>
                      <span className="text-amber-600 font-bold font-mono">{month.by_audit_type.tax_payment.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
