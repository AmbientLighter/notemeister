import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useTranslations } from '@/hooks/useTranslations';
import type { AppTheme } from '@/types';
import Dropdown from '@/components/common/Dropdown';

const ThemeSelector: React.FC = () => {
  const { t } = useTranslations();
  const { theme: currentTheme, setTheme } = useTheme();

  const themes: { id: AppTheme; label: string; icon: React.ReactNode }[] = [
    { id: 'light', label: t.themeLight, icon: <Sun className="w-5 h-5 text-amber-500" /> },
    { id: 'dark', label: t.themeDark, icon: <Moon className="w-5 h-5 text-indigo-400" /> },
    { id: 'system', label: t.themeSystem, icon: <Monitor className="w-5 h-5 text-slate-400" /> },
  ];

  return (
    <Dropdown
      label={t.selectTheme}
      options={themes}
      value={currentTheme}
      onChange={setTheme}
      className="mb-8"
    />
  );
};

export default ThemeSelector;
