import React from 'react';
import { GameStats, SortMethod, Screen } from '../types';
import HeatmapCanvas from './HeatmapCanvas';

interface ResultsScreenProps {
    stats: GameStats;
    noteStats: any[];
    sortMethod: SortMethod;
    t: any;
    clef: 'treble' | 'bass';
    darkMode: boolean;
    setSortMethod: (method: SortMethod) => void;
    setScreen: (screen: Screen) => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({
    stats,
    noteStats,
    sortMethod,
    t,
    clef,
    darkMode,
    setSortMethod,
    setScreen
}) => {
    const [showDetails, setShowDetails] = React.useState(false);
    const accuracy = Math.round((stats.correct / (stats.total || 1)) * 100);
    const avgTime = stats.history.length
        ? Math.round(stats.history.reduce((acc, curr) => acc + curr.timeTaken, 0) / stats.history.length)
        : 0;

    return (
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 md:p-8 sm:rounded-3xl shadow-xl sm:max-w-xl w-full text-center animate-fade-in sm:my-8 transition-colors duration-200">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">{t.resultsTitle}</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">{t.sessionSummary}</p>

            {/* Visual Heatmap - PRIMARY UI */}
            <div className="mb-8">
                <div className="flex justify-between items-end mb-4">
                    <h3 className="font-bold text-slate-700 dark:text-slate-300 font-mono uppercase text-xs tracking-wider">{t.performanceAnalysis || 'Performance Analysis'}</h3>
                    <div className="flex gap-2 text-[10px] font-bold uppercase tracking-tighter">
                        <span className="text-emerald-500">Perfect</span>
                        <span className="text-slate-300">→</span>
                        <span className="text-red-500">Practice</span>
                    </div>
                </div>
                <HeatmapCanvas
                    noteStats={noteStats}
                    clef={clef}
                    darkMode={darkMode}
                />
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-2xl">
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.correct}/{stats.total}</div>
                    <div className="text-[10px] text-indigo-400 dark:text-indigo-300 font-bold uppercase mt-1">{t.correct}</div>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/30 p-3 rounded-2xl">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{accuracy}%</div>
                    <div className="text-[10px] text-emerald-400 dark:text-emerald-300 font-bold uppercase mt-1">{t.accuracy}</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/30 p-3 rounded-2xl">
                    <div className="text-2xl font-bold text-orange-500">{stats.streak}</div>
                    <div className="text-[10px] text-orange-400 dark:text-orange-300 font-bold uppercase mt-1">{t.streak}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-2xl">
                    <div className="text-2xl font-bold text-slate-600 dark:text-slate-300">{(avgTime / 1000).toFixed(1)}s</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-1">{t.avgTime}</div>
                </div>
            </div>

            <button
                onClick={() => setShowDetails(!showDetails)}
                className="mb-8 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-center gap-1 mx-auto"
            >
                {showDetails ? 'Hide Details' : 'Show Detailed Statistics'}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`}>
                    <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
            </button>

            {/* Detailed Stats - HIDDEN BY DEFAULT */}
            {showDetails && noteStats.length > 0 && (
                <div className="mb-8 text-left animate-slide-down">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-700 dark:text-slate-300">{t.sortBy}</h3>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setSortMethod('difficulty')}
                                className={`px-2 py-1 text-[10px] font-bold rounded-full transition-colors ${sortMethod === 'difficulty' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}
                            >
                                {t.sortDifficulty}
                            </button>
                            <button
                                onClick={() => setSortMethod('time')}
                                className={`px-2 py-1 text-[10px] font-bold rounded-full transition-colors ${sortMethod === 'time' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}
                            >
                                {t.sortTime}
                            </button>
                            <button
                                onClick={() => setSortMethod('name')}
                                className={`px-2 py-1 text-[10px] font-bold rounded-full transition-colors ${sortMethod === 'name' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}
                            >
                                {t.sortName}
                            </button>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-semibold uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3 text-left">{t.statNote}</th>
                                    <th className="px-4 py-3 text-center">{t.statAccuracy}</th>
                                    <th className="px-4 py-3 text-right">{t.statTime}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {noteStats.map((item) => (
                                    <tr key={item.name} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                        <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">
                                            <span className="w-9 h-9 text-xs rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center border border-slate-200 dark:border-slate-600">
                                                {item.name}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-16 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${item.accuracy >= 80 ? 'bg-emerald-500' : item.accuracy >= 50 ? 'bg-orange-400' : 'bg-red-500'}`}
                                                        style={{ width: `${item.accuracy}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{Math.round(item.accuracy)}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300 font-mono">
                                            {(item.avgTime / 1000).toFixed(2)}s
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <button
                onClick={() => setScreen('setup')}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-lg shadow-lg shadow-indigo-200 dark:shadow-none transition-all"
            >
                {t.startNewSession}
            </button>
        </div>
    );
};

export default ResultsScreen;
