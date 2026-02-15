import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { useTranslations } from '../hooks/useTranslations';

const TempoSelector: React.FC = () => {
  const { t } = useTranslations();
  const settings = useGameStore((state) => state.settings);
  const updateSettings = useGameStore((state) => state.updateSettings);

  const tempos = [
    { id: 'slow', label: t.tempoSlow },
    { id: 'normal', label: t.tempoNormal },
    { id: 'fast', label: t.tempoFast },
  ] as const;

  return (
    <div className="mb-8">
      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-widest">
        {t.selectTempo}
      </label>
      <div className="grid grid-cols-3 gap-3">
        {tempos.map((mode) => (
          <button
            key={mode.id}
            onClick={() => updateSettings({ tempo: mode.id })}
            className={`py-3 rounded-2xl font-bold text-sm transition-all duration-300 transform active:scale-95 ${
              settings.tempo === mode.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none'
                : 'bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-100 dark:hover:border-indigo-900'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TempoSelector;
