
import React from 'react';
import { UserProfile, SupportedLanguage } from '../types';
import { useTranslation } from 'react-i18next';

interface Props {
  user: UserProfile;
  onUpdateLanguage: (lang: SupportedLanguage) => void;
  onSignOut: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const UserSettings: React.FC<Props> = ({ user, onUpdateLanguage, onSignOut, isOpen, onClose }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <h2 className="font-bold text-slate-800">{t('settings')}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="p-8 space-y-8">
          <div className="flex items-center gap-4">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.display_name} className="w-16 h-16 rounded-full border-2 border-indigo-100 shadow-sm" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                {user.display_name?.[0] || user.email[0]}
              </div>
            )}
            <div>
              <h3 className="font-bold text-slate-800 text-lg">{user.display_name}</h3>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('language')}</label>
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
              value={user.preferred_language}
              onChange={(e) => onUpdateLanguage(e.target.value as SupportedLanguage)}
            >
              <option value="en">English (US)</option>
              <option value="ms">Bahasa Malaysia</option>
              <option value="zh">中文 (Chinese)</option>
            </select>
          </div>

          <div className="pt-4 border-t">
            <button 
              onClick={onSignOut}
              className="w-full bg-rose-50 text-rose-600 px-4 py-3 rounded-xl text-sm font-bold hover:bg-rose-100 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              {t('sign_out')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
