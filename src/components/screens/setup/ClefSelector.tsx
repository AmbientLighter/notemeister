import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useTranslations } from '@/hooks/useTranslations';

const ClefSelector: React.FC = () => {
  const { t } = useTranslations();
  const settings = useGameStore((state) => state.settings);
  const handleClefChange = useGameStore((state) => state.handleClefChange);

  return (
    <div className="mb-8">
      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-widest">
        {t.selectClef}
      </label>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleClefChange('treble')}
          className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all duration-300 transform active:scale-95 ${
            settings.clef === 'treble'
              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 shadow-lg shadow-indigo-100 dark:shadow-none'
              : 'border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-700 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800'
          }`}
        >
          <span className="text-5xl">𝄞</span>
          <span className="font-bold tracking-tight">{t.trebleClef}</span>
        </button>
        <button
          onClick={() => handleClefChange('bass')}
          className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all duration-300 transform active:scale-95 ${
            settings.clef === 'bass'
              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 shadow-lg shadow-indigo-100 dark:shadow-none'
              : 'border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-700 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800'
          }`}
        >
          <span className="text-5xl">𝄢</span>
          <span className="font-bold tracking-tight">{t.bassClef}</span>
        </button>
      </div>
    </div>
  );
};

export default ClefSelector;
