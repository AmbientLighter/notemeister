import React from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { useGameStore } from '../store/useGameStore';
import DetailedStats from './DetailedStats';
import HeatmapCanvas from './HeatmapCanvas';
import SummaryGrid from './SummaryGrid';

const ResultsScreen: React.FC = () => {
    const { t } = useTranslations();
    const settings = useGameStore((state) => state.settings);
    const stats = useGameStore((state) => state.stats);

    const noteStats = React.useMemo(() => {
        const groups: Record<string, { totalTime: number; correct: number; count: number }> = {};

        stats.history.forEach(item => {
            const id = `${item.note.name}${item.note.octave}`;
            if (!groups[id]) groups[id] = { totalTime: 0, correct: 0, count: 0 };
            groups[id].totalTime += item.timeTaken;
            groups[id].correct += item.correct ? 1 : 0;
            groups[id].count += 1;
        });

        return Object.entries(groups).map(([id, data]) => ({
            name: id,
            avgTime: data.totalTime / data.count,
            accuracy: (data.correct / data.count) * 100,
            count: data.count
        }));
    }, [stats.history]);

    // Actions
    const setScreen = useGameStore((state) => state.setScreen);
    const [showDetails, setShowDetails] = React.useState(false);


    return (
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 md:p-8 sm:rounded-3xl shadow-xl sm:max-w-xl w-full text-center animate-fade-in sm:my-8 transition-colors duration-200">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">{t.resultsTitle}</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">{t.sessionSummary}</p>

            {/* Visual Heatmap - PRIMARY UI */}
            <div className="mb-8">
                <div className="flex justify-between items-end mb-4">
                    <h3 className="font-bold text-slate-700 dark:text-slate-300 font-mono uppercase text-xs tracking-wider">{t.performanceAnalysis}</h3>
                    <div className="flex gap-2 text-[10px] font-bold uppercase tracking-tighter">
                        <span className="text-emerald-500">Perfect</span>
                        <span className="text-slate-300">→</span>
                        <span className="text-red-500">Practice</span>
                    </div>
                </div>
                <HeatmapCanvas
                    noteStats={noteStats}
                    clef={settings.clef}
                />
            </div>

            <SummaryGrid />

            <button
                onClick={() => setShowDetails(!showDetails)}
                className="mb-8 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-center gap-1 mx-auto"
            >
                {showDetails ? 'Hide Details' : 'Show Detailed Statistics'}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`}>
                    <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
            </button>

            {showDetails && <DetailedStats noteStats={noteStats} />}

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
