import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useSessionStore } from '@/store/useSessionStore';
import { useScrollingStore } from '@/store/useScrollingStore';
import FinishSessionButton from './FinishSessionButton';
import { useTranslations } from '@/hooks/useTranslations';

const StatsHeader: React.FC = () => {
  const { t } = useTranslations();
  const stats = useGameStore((state) => state.stats);
  const settings = useGameStore((state) => state.settings);
  const missedNotes = useScrollingStore((state) => state.missedNotes);
  const isPaused = useScrollingStore((state) => state.isPaused);
  const setPaused = useScrollingStore((state) => state.setPaused);

  const isDemo = settings.gameMode === 'demo';

  if (isDemo) {
    return (
      <div className="w-full flex justify-between items-center py-4 px-6 bg-white dark:bg-slate-800 sm:rounded-b-3xl shadow-sm mb-6 transition-colors duration-200">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setPaused(!isPaused)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all active:scale-95 shadow-lg ${
              isPaused
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200 dark:shadow-none'
                : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200 dark:shadow-none'
            }`}
          >
            {isPaused ? (
              <>
                <span className="text-xl">▶</span> {t.resume}
              </>
            ) : (
              <>
                <span className="text-xl">⏸</span> {t.pause}
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <FinishSessionButton />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pt-0 pb-4 px-4 sm:p-6 bg-white dark:bg-slate-800 sm:rounded-b-3xl shadow-sm mb-4 sm:mb-6 transition-colors duration-200">
      <div className="text-center">
        <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
          {stats.correct}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">
          {t.correct}
        </div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-slate-700 dark:text-slate-200">
          {Math.round((stats.correct / (stats.total || 1)) * 100)}%
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">
          {t.accuracy}
        </div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-orange-500">{stats.streak}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">
          {t.streak}
        </div>
      </div>
      {settings.gameMode === 'scrolling' && (
        <div className="text-center">
          <div className="text-2xl font-bold text-rose-500">{missedNotes}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">
            {t.missed}
          </div>
        </div>
      )}
      {settings.gameMode !== 'scrolling' && (
        <div className="hidden lg:block text-center col-span-full lg:col-span-1 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-700 pt-4 lg:pt-0 lg:pl-4">
          <FinishSessionButton />
        </div>
      )}
    </div>
  );
};

export default StatsHeader;
