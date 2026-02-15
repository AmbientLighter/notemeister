import React from 'react';
import { Keyboard, Mic, Usb } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { useTranslations } from '@/hooks/useTranslations';
import type { InputMode } from '@/types';

const InputMethodSelector: React.FC = () => {
  const { settings, updateSettings } = useGameStore();
  const { t } = useTranslations();

  const methods: { id: InputMode; icon: React.ReactNode; label: string; color: string }[] = [
    {
      id: 'keyboard',
      icon: <Keyboard className="w-6 h-6" />,
      label: t.inputModeKeyboard,
      color: 'text-amber-500',
    },
    {
      id: 'midi',
      icon: <Usb className="w-6 h-6" />,
      label: t.inputModeMidi,
      color: 'text-blue-500',
    },
    {
      id: 'microphone',
      icon: <Mic className="w-6 h-6" />,
      label: t.inputModeMicrophone,
      color: 'text-rose-500',
    },
  ];

  return (
    <div className="mb-8">
      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-widest">
        {t.selectInputMode}
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {methods.map(({ id, icon, label, color }) => (
          <button
            key={id}
            onClick={() => updateSettings({ inputMode: id })}
            className={`py-4 px-3 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-3 transform active:scale-95 ${
              settings.inputMode === id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none'
                : 'bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-100 dark:hover:border-indigo-900'
            }`}
          >
            <div
              className={`transition-transform duration-300 ${settings.inputMode === id ? 'text-white' : color}`}
            >
              {icon}
            </div>
            <span className="text-sm tracking-tight">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default InputMethodSelector;
