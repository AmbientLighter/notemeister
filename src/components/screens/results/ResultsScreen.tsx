import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useTranslations } from '@/hooks/useTranslations';
import { Check } from 'lucide-react';
import HeatmapCanvas from './HeatmapCanvas';
import DetailedStats from './DetailedStats';
import SummaryGrid from './SummaryGrid';
import { audioEngine } from '@/utils/audio';

const ResultsScreen: React.FC = () => {
  const { t } = useTranslations();
  const settings = useGameStore((state) => state.settings);
  const stats = useGameStore((state) => state.stats);
  const setScreen = useGameStore((state) => state.setScreen);

  const [showDetails, setShowDetails] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    setIsVisible(true);
  }, []);

  const noteStats = React.useMemo(() => {
    const groups: Record<string, { totalTime: number; correct: number; count: number }> = {};

    stats.history.forEach((item) => {
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
      count: data.count,
    }));
  }, [stats.history]);

  const { overallAccuracy, weakestNotes } = React.useMemo(() => {
    const total = stats.history.length;
    const correct = stats.history.filter((h) => h.correct).length;
    const accuracy = total > 0 ? (correct / total) * 100 : 0;

    const weakest = noteStats
      .filter((s) => s.accuracy < 80)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3)
      .map((s) => s.name);

    return { overallAccuracy: accuracy, weakestNotes: weakest };
  }, [stats.history, noteStats]);

  const feedbackText = React.useMemo(() => {
    if (overallAccuracy >= 95) return t.feedbackMastery;
    if (overallAccuracy >= 85) return t.feedbackExemplary;
    if (overallAccuracy >= 70) return t.feedbackProgress;
    if (overallAccuracy >= 50) return t.feedbackGettingThere;
    return t.feedbackKeepPracticing;
  }, [overallAccuracy, t]);

  const hasPlayedAudio = React.useRef(false);

  React.useEffect(() => {
    if (!hasPlayedAudio.current && overallAccuracy > 0) {
      const type = overallAccuracy >= 80 ? 'success' : 'failure';
      audioEngine.playMelody(type, settings.instrument);
      hasPlayedAudio.current = true;
    }
  }, [overallAccuracy, settings.instrument]);

  return (
    <>
      <div className="fixed inset-0 opacity-5 pointer-events-none z-0">
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-900 dark:via-indigo-100 to-transparent"></div>
        <div className="absolute top-2/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-900 dark:via-indigo-100 to-transparent"></div>
        <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-900 dark:via-indigo-100 to-transparent"></div>
      </div>

      {/* Main content container */}
      <div
        className={`relative z-10 w-full max-w-2xl pt-0 px-6 sm:px-12 pb-6 sm:pb-12 transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
                sm:bg-white/80 sm:dark:bg-slate-800/80 sm:backdrop-blur-3xl sm:rounded-[3rem] sm:shadow-2xl sm:border sm:border-white/50 sm:dark:border-slate-700/50`}
      >
        {/* Success icon with pulsing animation */}
        <div
          className={`pt-12 mb-8 flex justify-center transition-all duration-700 delay-200 ${isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-indigo-400 dark:bg-indigo-500 animate-ping opacity-20"></div>
            <div className="absolute inset-0 rounded-full bg-indigo-300 dark:bg-indigo-400 animate-pulse opacity-30"></div>
            <div className="relative bg-gradient-to-br from-indigo-600 to-purple-700 rounded-full p-6 shadow-xl">
              <Check size={48} className="text-white" strokeWidth={3} />
            </div>
          </div>
        </div>

        {/* Success message */}
        <div
          className={`text-center space-y-2 mb-12 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-indigo-800 via-purple-700 to-blue-800 dark:from-indigo-200 dark:via-purple-200 dark:to-blue-200 bg-clip-text text-transparent">
            {t.resultsTitle}
          </h1>
          <p className="text-xl text-slate-700 dark:text-slate-300 font-bold tracking-tight">
            {feedbackText}
          </p>
          {weakestNotes.length > 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {t.focusOn}{' '}
              <span className="font-mono bg-indigo-50 dark:bg-slate-900/50 px-2 py-0.5 rounded border border-indigo-100 dark:border-slate-700">
                {weakestNotes.join(', ')}
              </span>
            </p>
          )}
        </div>

        {/* Primary Stats (Heatmap) */}
        <div
          className={`mb-12 transition-all duration-700 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <div className="flex justify-between items-center mb-6 px-2">
            <h3 className="font-bold text-slate-500 dark:text-slate-500 uppercase text-xs tracking-[0.2em]">
              {t.performanceAnalysis}
            </h3>
          </div>
          <HeatmapCanvas noteStats={noteStats} clef={settings.clef} />
        </div>

        {/* Action Buttons */}
        <div
          className={`mb-8 grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12 transition-all duration-700 delay-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <button
            onClick={() => setScreen('setup')}
            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white py-5 px-8 rounded-2xl font-bold shadow-xl shadow-indigo-200 dark:shadow-none hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-lg"
          >
            {t.startNewSession}
          </button>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm text-indigo-800 dark:text-indigo-200 py-5 px-8 rounded-2xl font-bold border-2 border-white/80 dark:border-slate-600/50 hover:bg-white/80 dark:hover:bg-slate-600 transition-all text-lg shadow-lg"
          >
            {showDetails ? t.backToOverview : t.reviewProgress}
          </button>
        </div>

        {/* Toggleable Details */}
        <div
          className={`mt-8 transition-all duration-700 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          {showDetails && (
            <>
              <div className="bg-white/30 dark:bg-slate-800/30 backdrop-blur-md p-6 rounded-3xl border border-white/50 dark:border-slate-700/50 shadow-lg">
                <SummaryGrid />
              </div>
              <div className="mt-8 bg-white/30 dark:bg-slate-800/30 backdrop-blur-md p-6 rounded-3xl border border-white/50 dark:border-slate-700/50 shadow-lg animate-fade-in">
                <DetailedStats noteStats={noteStats} />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ResultsScreen;
