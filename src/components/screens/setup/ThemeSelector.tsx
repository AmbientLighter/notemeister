import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useTranslations } from '@/hooks/useTranslations';
import type { AppTheme } from '@/types';

const ThemeSelector: React.FC = () => {
  const { t } = useTranslations();
  const { theme: currentTheme, setTheme } = useTheme();

  const themes: { id: AppTheme; label: string; icon: React.ReactNode }[] = [
    { id: 'light', label: t.themeLight, icon: <Sun className="w-5 h-5" /> },
    { id: 'dark', label: t.themeDark, icon: <Moon className="w-5 h-5" /> },
    { id: 'system', label: t.themeSystem, icon: <Monitor className="w-5 h-5" /> },
  ];

  return (
    <div className="mb-8">
      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-widest">
        {t.selectTheme}
      </label>
      <div className="grid grid-cols-3 gap-3">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => setTheme(theme.id)}
            className={`py-4 px-3 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-3 transform active:scale-95 ${
              currentTheme === theme.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none'
                : 'bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-100 dark:hover:border-indigo-900'
            }`}
          >
            {theme.icon}
            <span className="text-sm tracking-tight">{theme.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;
