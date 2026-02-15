import React from 'react';
import { useGameStore } from '../store/useGameStore';
import FinishSessionButton from './FinishSessionButton';
import { useTranslations } from '../hooks/useTranslations';

const StatsHeader: React.FC = () => {
    const { t } = useTranslations();
    const stats = useGameStore((state) => state.stats);

    return (
        <div className="w-full grid grid-cols-3 md:grid-cols-4 gap-4 pt-0 pb-4 px-4 sm:p-6 bg-white dark:bg-slate-800 sm:rounded-b-3xl shadow-sm mb-4 sm:mb-6 transition-colors duration-200">
            <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.correct}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">{t.correct}</div>
            </div>
            <div className="text-center">
                <div className="text-2xl font-bold text-slate-700 dark:text-slate-200">{Math.round((stats.correct / (stats.total || 1)) * 100)}%</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">{t.accuracy}</div>
            </div>
            <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">{stats.streak}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">{t.streak}</div>
            </div>
            <div className="hidden md:block text-center">
                <FinishSessionButton />
            </div>
        </div>
    );
};

export default StatsHeader;
