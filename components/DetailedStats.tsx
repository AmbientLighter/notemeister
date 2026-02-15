import React, { useState, useMemo } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { SortMethod } from '../types';

interface DetailedStatsProps {
    noteStats: any[]; // Aggregated but unsorted stats
}

const DetailedStats: React.FC<DetailedStatsProps> = ({ noteStats }) => {
    const { t } = useTranslations();
    const [sortMethod, setSortMethod] = useState<SortMethod>('difficulty');

    const sortedStats = useMemo(() => {
        return [...noteStats].sort((a, b) => {
            if (sortMethod === 'name') {
                return a.name.localeCompare(b.name, undefined, { numeric: true });
            }
            if (sortMethod === 'time') {
                return b.avgTime - a.avgTime;
            }
            // Difficulty (default): Lowest accuracy first, then slowest time
            if (a.accuracy !== b.accuracy) {
                return a.accuracy - b.accuracy;
            }
            return b.avgTime - a.avgTime;
        });
    }, [noteStats, sortMethod]);

    if (noteStats.length === 0) return null;

    return (
        <div className="mb-8 text-left animate-slide-down w-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-wider">{t.sortBy}</h3>
                <div className="flex gap-1">
                    <button
                        onClick={() => setSortMethod('difficulty')}
                        className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${sortMethod === 'difficulty' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}
                    >
                        {t.sortDifficulty}
                    </button>
                    <button
                        onClick={() => setSortMethod('time')}
                        className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${sortMethod === 'time' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}
                    >
                        {t.sortTime}
                    </button>
                    <button
                        onClick={() => setSortMethod('name')}
                        className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${sortMethod === 'name' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}
                    >
                        {t.sortName}
                    </button>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-200">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                        <tr>
                            <th className="px-5 py-4 text-left">{t.statNote}</th>
                            <th className="px-5 py-4 text-center">{t.statAccuracy}</th>
                            <th className="px-5 py-4 text-right">{t.statTime}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {sortedStats.map((item) => (
                            <tr key={item.name} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                                <td className="px-5 py-4 font-bold text-slate-700 dark:text-slate-300">
                                    <span className="w-9 h-9 text-xs font-mono rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-600 shadow-sm">
                                        {item.name}
                                    </span>
                                </td>
                                <td className="px-5 py-4 text-center">
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="w-20 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${item.accuracy >= 80 ? 'bg-emerald-500' : item.accuracy >= 50 ? 'bg-orange-400' : 'bg-red-500'}`}
                                                style={{ width: `${item.accuracy}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 min-w-[3ch]">{Math.round(item.accuracy)}%</span>
                                    </div>
                                </td>
                                <td className="px-5 py-4 text-right text-slate-600 dark:text-slate-300 font-mono font-medium">
                                    {(item.avgTime / 1000).toFixed(2)}s
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DetailedStats;
