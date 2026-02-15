import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useTranslations } from '@/hooks/useTranslations';
import type { Instrument } from '@/types';

const InstrumentSelector: React.FC = () => {
  const { t } = useTranslations();
  const settings = useGameStore((state) => state.settings);
  const updateSettings = useGameStore((state) => state.updateSettings);

  const instruments = [
    { id: 'piano', label: t.instrumentPiano, icon: '🎹' },
    { id: 'guitar', label: t.instrumentGuitar, icon: '🎸' },
    { id: 'flute', label: t.instrumentFlute, icon: '🎷' },
    { id: 'silence', label: t.instrumentSilence, icon: '🔇' },
  ] as { id: Instrument; label: string; icon: string }[];

  return (
    <div className="mb-8">
      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-widest">
        {t.selectInstrument}
      </label>
      <div className="grid grid-cols-2 gap-3">
        {instruments.map((inst) => (
          <button
            key={inst.id}
            onClick={() => updateSettings({ instrument: inst.id })}
            className={`py-4 px-3 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-3 transform active:scale-95 ${
              settings.instrument === inst.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none'
                : 'bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-100 dark:hover:border-indigo-900'
            }`}
          >
            <span className="text-2xl">{inst.icon}</span>
            <span className="text-sm tracking-tight">{inst.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default InstrumentSelector;
