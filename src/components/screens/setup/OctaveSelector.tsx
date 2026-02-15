import React from 'react';
import { OCTAVE_RANGES } from '@/constants';
import { useTranslations } from '@/hooks/useTranslations';
import { useGameStore } from '@/store/useGameStore';

const OctaveSelector: React.FC = () => {
  const { t } = useTranslations();
  const settings = useGameStore((state) => state.settings);
  const toggleOctaveGroup = useGameStore((state) => state.toggleOctaveGroup);
  const getOctaveStatus = useGameStore((state) => state.getOctaveStatus);

  return (
    <div className="mb-8">
      <label className="block text-center text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-widest">
        {t.selectOctaves}
      </label>
      <div className="flex flex-wrap gap-3 justify-center">
        {OCTAVE_RANGES[settings.clef].map((octave) => {
          const status = getOctaveStatus(octave);
          return (
            <button
              key={octave}
              onClick={() => toggleOctaveGroup(octave)}
              className={`w-14 h-14 rounded-2xl font-bold text-xl flex items-center justify-center transition-all duration-300 border-2 transform active:scale-90 ${
                status === 'full'
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200 dark:shadow-none scale-105 z-10'
                  : status === 'partial'
                    ? 'bg-indigo-100 dark:bg-indigo-900/50 border-indigo-400 text-indigo-700 dark:text-indigo-300'
                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-400 hover:border-indigo-200'
              }`}
            >
              {octave}
            </button>
          );
        })}
      </div>
      <p className="text-[10px] uppercase font-bold text-center text-slate-400 dark:text-slate-500 mt-4 tracking-tighter">
        Click to toggle entire octaves
      </p>
    </div>
  );
};

export default OctaveSelector;
