
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import { Transaction } from '../types';

interface Props {
  transactions: Transaction[];
}

interface MonthlyData {
  name: string;
  withdrawals: number;
  deposits: number;
  timestamp: number;
}

const TAG_COLORS: Record<string, string> = {
  revenue: '#10b981', 
  expense: '#f43f5e', 
  salary: '#6366f1', 
  epf_socso: '#a855f7', 
  loan_repayment: '#64748b', 
  director_drawing: '#0ea5e9', 
  tax_payment: '#f59e0b', 
  interbank_transfer: '#94a3b8', 
  other: '#cbd5e1' 
};

export const AuditVisualizations: React.FC<Props> = ({ transactions }) => {
  const { t } = useTranslation();
  
  const barData = useMemo(() => {
    const monthlyMap = transactions.reduce((acc, t) => {
      const date = new Date(t.date);
      if (isNaN(date.getTime())) return acc;
      
      const key = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!acc[key]) {
        acc[key] = { name: key, withdrawals: 0, deposits: 0, timestamp: date.getTime() };
      }
      acc[key].withdrawals += t.withdrawal_amount;
      acc[key].deposits += t.deposit_amount;
      return acc;
    }, {} as Record<string, MonthlyData>);

    return (Object.values(monthlyMap) as MonthlyData[]).sort((a, b) => a.timestamp - b.timestamp);
  }, [transactions]);

  const pieData = useMemo(() => {
    const counts = transactions.reduce((acc, t) => {
      const type = t.audit_tags.type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).map(([name, value]) => ({ 
      name: name.replace('_', ' ').toUpperCase(), 
      key: name,
      value 
    }));
  }, [transactions]);

  if (transactions.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs">2</span>
          {t('analytics_dashboard')}
        </h2>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">{t('visual_audit')}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
           <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
             <svg className="w-3 h-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
             {t('monthly_flow')}
           </h3>
           <div className="h-[320px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis 
                   dataKey="name" 
                   fontSize={10} 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fill: '#94a3b8', fontWeight: 600 }}
                 />
                 <YAxis 
                   fontSize={10} 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fill: '#94a3b8', fontWeight: 600 }}
                   tickFormatter={(value) => `RM ${value >= 1000 ? (value/1000).toFixed(1) + 'k' : value}`}
                 />
                 <Tooltip 
                   cursor={{ fill: '#f8fafc' }} 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold' }}
                 />
                 <Legend 
                   iconType="circle" 
                   wrapperStyle={{ paddingTop: '24px', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }} 
                 />
                 <Bar dataKey="deposits" fill="#10b981" radius={[4, 4, 0, 0]} name={t('deposits')} />
                 <Bar dataKey="withdrawals" fill="#f43f5e" radius={[4, 4, 0, 0]} name={t('withdrawals')} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
           <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
             <svg className="w-3 h-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
             {t('tag_distribution')}
           </h3>
           <div className="h-[320px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={pieData}
                   cx="50%"
                   cy="45%"
                   innerRadius={70}
                   outerRadius={95}
                   paddingAngle={4}
                   dataKey="value"
                   nameKey="name"
                   stroke="none"
                 >
                   {pieData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={TAG_COLORS[entry.key] || '#cbd5e1'} />
                   ))}
                 </Pie>
                 <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold' }}
                 />
                 <Legend 
                   layout="horizontal"
                   verticalAlign="bottom"
                   align="center"
                   iconType="circle" 
                   wrapperStyle={{ fontSize: '8px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.02em', paddingTop: '20px' }} 
                 />
               </PieChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
};
