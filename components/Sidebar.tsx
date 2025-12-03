
import React from 'react';
import { LayoutDashboard, ShoppingCart, Coffee, History, LogOut, Store, Languages, Users, Tag, Settings } from 'lucide-react';
import { ViewState, Language } from '../types';
import { translations } from '../translations';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  lang: Language;
  setLang: (lang: Language) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, lang, setLang }) => {
  const t = (key: string) => translations[key]?.[lang] || key;

  const menuItems = [
    { id: 'pos', label: t('pos'), sub: t('subtitle_pos'), icon: ShoppingCart },
    { id: 'dashboard', label: t('dashboard'), sub: t('subtitle_dash'), icon: LayoutDashboard },
    { id: 'products', label: t('products'), sub: t('subtitle_prod'), icon: Coffee },
    { id: 'categories', label: t('categories'), sub: t('subtitle_cat'), icon: Tag },
    { id: 'users', label: t('users'), sub: t('subtitle_users'), icon: Users },
    { id: 'history', label: t('history'), sub: t('subtitle_hist'), icon: History },
    { id: 'settings', label: t('settings'), sub: t('subtitle_settings'), icon: Settings },
  ];

  return (
    <div className="w-[280px] bg-white h-screen fixed left-0 top-0 shadow-2xl shadow-slate-200/50 z-50 flex flex-col justify-between p-4">
      <div>
        {/* Brand */}
        <div className="px-4 py-6 mb-2 flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Store size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 leading-none tracking-tight">Sabaidee</h1>
            <p className="text-xs font-bold text-indigo-500 mt-1 tracking-wide">POS SYSTEM</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id as ViewState)}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Icon 
                  size={24} 
                  className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <div className="text-left relative z-10">
                  <span className={`block font-bold text-[15px] ${isActive ? 'text-white' : 'text-slate-700'}`}>
                    {item.label}
                  </span>
                  <span className={`block text-[10px] uppercase tracking-wider font-semibold ${isActive ? 'text-slate-400' : 'text-slate-400'}`}>
                    {item.sub}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="space-y-4">
         {/* Language Toggle */}
        <button 
          onClick={() => setLang(lang === 'lo' ? 'en' : 'lo')}
          className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all"
        >
           <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
               <Languages size={18} />
             </div>
             <span className="text-sm font-bold text-slate-700">
               {lang === 'lo' ? 'ພາສາລາວ' : 'English'}
             </span>
           </div>
           <span className="text-xs font-bold text-slate-400 bg-white px-2 py-1 rounded-lg border">
             {lang === 'lo' ? 'LA' : 'EN'}
           </span>
        </button>

        {/* Footer / User Profile */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group cursor-pointer hover:bg-white hover:shadow-lg hover:shadow-slate-100 transition-all duration-300">
          <div className="flex items-center gap-3">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
              alt="User" 
              className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-white shadow-sm"
            />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate">Admin Manager</p>
              <p className="text-xs text-slate-400 truncate">{t('storeId')}: #8839</p>
            </div>
            <button className="text-slate-400 hover:text-red-500 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};