import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { useTranslations } from '../hooks/useTranslations';

const SummaryGrid: React.FC = () => {
  const { t } = useTranslations();
  const stats = useGameStore((state) => state.stats);

  const accuracy = Math.round((stats.correct / (stats.total || 1)) * 100);
  const avgTime = stats.history.length
    ? Math.round(
        stats.history.reduce((acc, curr) => acc + curr.timeTaken, 0) / stats.history.length
      )
    : 0;

  return (
    <div className="grid grid-cols-2 gap-3 mb-8">
      <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-3xl transition-colors duration-200">
        <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
          {stats.correct}/{stats.total}
        </div>
        <div className="text-[10px] text-indigo-400 dark:text-indigo-300 font-bold uppercase mt-1 tracking-wider">
          {t.correct}
        </div>
      </div>
      <div className="bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-3xl transition-colors duration-200">
        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{accuracy}%</div>
        <div className="text-[10px] text-emerald-400 dark:text-emerald-300 font-bold uppercase mt-1 tracking-wider">
          {t.accuracy}
        </div>
      </div>
      <div className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-3xl transition-colors duration-200">
        <div className="text-2xl font-bold text-orange-500">{stats.streak}</div>
        <div className="text-[10px] text-orange-400 dark:text-orange-300 font-bold uppercase mt-1 tracking-wider">
          {t.streak}
        </div>
      </div>
      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl transition-colors duration-200">
        <div className="text-2xl font-bold text-slate-600 dark:text-slate-300">
          {(avgTime / 1000).toFixed(1)}s
        </div>
        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-1 tracking-wider">
          {t.avgTime}
        </div>
      </div>
    </div>
  );
};

export default SummaryGrid;
