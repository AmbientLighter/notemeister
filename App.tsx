import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GameSettings, GameStats, Note, NoteName, Language, ClefType } from './types';
import { TRANSLATIONS, OCTAVE_RANGES } from './constants';
import { generateRandomNote } from './utils/musicLogic';
import StaffCanvas from './components/StaffCanvas';
import Keyboard from './components/Keyboard';

type Screen = 'setup' | 'game' | 'results';
type SortMethod = 'difficulty' | 'name' | 'time';

const App: React.FC = () => {
  // --- State ---
  const [screen, setScreen] = useState<Screen>('setup');
  
  // Settings
  const [settings, setSettings] = useState<GameSettings>({
    language: 'en',
    clef: 'treble',
    selectedOctaves: [4, 5] // Default for treble
  });

  // Game Data
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect'; message: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastCorrectNote, setLastCorrectNote] = useState<NoteName | null>(null);
  const [lastIncorrectNote, setLastIncorrectNote] = useState<NoteName | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [sortMethod, setSortMethod] = useState<SortMethod>('difficulty');

  // Stats
  const [stats, setStats] = useState<GameStats>({
    correct: 0,
    total: 0,
    streak: 0,
    history: []
  });

  const t = TRANSLATIONS[settings.language];

  // --- Derived State ---
  // Moved useMemo to top level to comply with Rules of Hooks
  const noteStats = useMemo(() => {
      const groups: Record<string, { totalTime: number; correct: number; count: number }> = {};
      
      stats.history.forEach(item => {
          const name = item.note.name;
          if (!groups[name]) groups[name] = { totalTime: 0, correct: 0, count: 0 };
          groups[name].totalTime += item.timeTaken;
          groups[name].correct += item.correct ? 1 : 0;
          groups[name].count += 1;
      });

      const rows = Object.entries(groups).map(([name, data]) => ({
          name,
          avgTime: data.totalTime / data.count,
          accuracy: (data.correct / data.count) * 100,
          count: data.count
      }));

      return rows.sort((a, b) => {
          if (sortMethod === 'name') return a.name.localeCompare(b.name);
          if (sortMethod === 'time') return b.avgTime - a.avgTime;
          // difficulty: Lowest accuracy first, then highest time
          if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
          return b.avgTime - a.avgTime;
      });
  }, [stats.history, sortMethod]);

  // --- Handlers ---

  const handleLanguageChange = (lang: Language) => {
    setSettings(prev => ({ ...prev, language: lang }));
  };

  const handleClefChange = (clef: ClefType) => {
    setSettings(prev => ({
      ...prev,
      clef,
      selectedOctaves: clef === 'treble' ? [4, 5] : [2, 3] // Reset octaves to sensible defaults
    }));
  };

  const toggleOctave = (octave: number) => {
    setSettings(prev => {
      const current = prev.selectedOctaves;
      if (current.includes(octave)) {
        // Prevent deselecting the last octave
        if (current.length === 1) return prev;
        return { ...prev, selectedOctaves: current.filter(o => o !== octave).sort() };
      } else {
        return { ...prev, selectedOctaves: [...current, octave].sort() };
      }
    });
  };

  const startGame = () => {
    setStats({ correct: 0, total: 0, streak: 0, history: [] });
    setScreen('game');
    nextTurn(true);
  };

  const nextTurn = useCallback((firstTurn = false) => {
    const newNote = generateRandomNote(settings.clef, settings.selectedOctaves, currentNote || undefined);
    setCurrentNote(newNote);
    setFeedback(null);
    setIsProcessing(false);
    setLastCorrectNote(null);
    setLastIncorrectNote(null);
    setStartTime(Date.now());
  }, [settings.clef, settings.selectedOctaves, currentNote]);

  const handleNoteSelect = (selectedName: NoteName) => {
    if (isProcessing || !currentNote) return;
    setIsProcessing(true);

    const timeTaken = Date.now() - startTime;
    const isCorrect = selectedName === currentNote.name;

    // Update stats
    setStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
      streak: isCorrect ? prev.streak + 1 : 0,
      history: [...prev.history, {
        note: currentNote,
        timeTaken,
        correct: isCorrect,
        timestamp: Date.now()
      }]
    }));

    if (isCorrect) {
      setFeedback({ type: 'correct', message: t.correctAnswer });
      setLastCorrectNote(currentNote.name);
      // Auto advance
      setTimeout(() => {
        nextTurn();
      }, 800);
    } else {
      setFeedback({ type: 'incorrect', message: `${t.incorrectAnswer} ${currentNote.name}` });
      setLastIncorrectNote(selectedName);
      setLastCorrectNote(currentNote.name);
      // Auto advance slower on error to let them see
      setTimeout(() => {
        nextTurn();
      }, 2000);
    }
  };

  const finishGame = () => {
    setScreen('results');
  };

  // --- Render Helpers ---

  const renderSetup = () => (
    <div className="bg-white p-6 md:p-10 rounded-3xl shadow-xl max-w-lg w-full animate-fade-in">
      <div className="flex justify-center gap-2 mb-8">
        {(['en', 'ru', 'uk', 'et'] as Language[]).map(lang => (
          <button
            key={lang}
            onClick={() => handleLanguageChange(lang)}
            className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
              settings.language === lang ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>

      <h1 className="text-3xl font-bold text-center text-slate-800 mb-2">{t.title}</h1>
      <p className="text-center text-slate-500 mb-8">{t.subtitle}</p>

      {/* Clef Selection */}
      <div className="mb-8">
        <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">{t.selectClef}</label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleClefChange('treble')}
            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
              settings.clef === 'treble' 
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                : 'border-slate-200 hover:border-indigo-200 text-slate-600'
            }`}
          >
            <span className="text-4xl">𝄞</span>
            <span className="font-semibold">{t.trebleClef}</span>
          </button>
          <button
            onClick={() => handleClefChange('bass')}
            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
              settings.clef === 'bass' 
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                : 'border-slate-200 hover:border-indigo-200 text-slate-600'
            }`}
          >
            <span className="text-4xl">𝄢</span>
            <span className="font-semibold">{t.bassClef}</span>
          </button>
        </div>
      </div>

      {/* Octave Selection */}
      <div className="mb-8">
        <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">{t.selectOctaves}</label>
        <div className="flex flex-wrap gap-3 justify-center">
          {OCTAVE_RANGES[settings.clef].map(octave => (
            <button
              key={octave}
              onClick={() => toggleOctave(octave)}
              className={`w-12 h-12 rounded-lg font-bold text-lg flex items-center justify-center transition-all ${
                settings.selectedOctaves.includes(octave)
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105'
                  : 'bg-white border-2 border-slate-200 text-slate-400 hover:border-slate-300'
              }`}
            >
              {octave}
            </button>
          ))}
        </div>
        {settings.selectedOctaves.length === 0 && (
          <p className="text-red-500 text-sm mt-2 text-center">{t.noOctavesSelected}</p>
        )}
      </div>

      <button
        onClick={startGame}
        disabled={settings.selectedOctaves.length === 0}
        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-lg shadow-lg shadow-indigo-200 transition-transform active:scale-95"
      >
        {t.startSession}
      </button>
    </div>
  );

  const renderGame = () => (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto items-center">
      {/* Header Stats */}
      <div className="w-full grid grid-cols-3 md:grid-cols-4 gap-4 p-4 md:p-6 bg-white rounded-b-3xl shadow-sm mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-indigo-600">{stats.correct}</div>
          <div className="text-xs text-slate-500 uppercase font-semibold">{t.correct}</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-700">{Math.round((stats.correct / (stats.total || 1)) * 100)}%</div>
          <div className="text-xs text-slate-500 uppercase font-semibold">{t.accuracy}</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-500">{stats.streak}</div>
          <div className="text-xs text-slate-500 uppercase font-semibold">{t.streak}</div>
        </div>
        <div className="hidden md:block text-center">
            <button 
                onClick={finishGame}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-semibold transition-colors"
            >
                {t.finishSession}
            </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full flex flex-col items-center justify-center p-4 gap-6">
        
        {/* Feedback Bubble */}
        <div className={`h-8 md:h-12 flex items-center justify-center transition-all duration-300 transform ${feedback ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
           {feedback && (
             <span className={`px-6 py-2 rounded-full font-bold shadow-sm ${feedback.type === 'correct' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {feedback.message}
             </span>
           )}
        </div>

        {/* Canvas */}
        <div className="w-full max-w-2xl aspect-[2/1] md:aspect-[2.5/1] relative">
            <StaffCanvas 
                clef={settings.clef} 
                note={currentNote} 
                className="w-full h-full"
            />
            {/* Range Indicators (Optional visual flair) */}
            <div className="absolute top-2 right-2 flex gap-1">
                {settings.selectedOctaves.map(o => (
                    <span key={o} className="text-[10px] bg-slate-100 text-slate-400 px-1 rounded border border-slate-200">{o}</span>
                ))}
            </div>
        </div>

        {/* Question Text */}
        <p className="text-slate-400 font-medium text-lg">{t.question}</p>

        {/* Keyboard */}
        <Keyboard 
            onNoteSelect={handleNoteSelect}
            disabled={isProcessing}
            lastCorrectNote={lastCorrectNote}
            lastIncorrectNote={lastIncorrectNote}
        />
      </div>
      
      {/* Mobile Finish Button */}
      <div className="md:hidden p-4 w-full">
         <button 
            onClick={finishGame}
            className="w-full py-3 bg-slate-200 text-slate-600 font-bold rounded-xl"
        >
            {t.finishSession}
        </button>
      </div>
    </div>
  );

  const renderResults = () => {
    const accuracy = Math.round((stats.correct / (stats.total || 1)) * 100);
    const avgTime = stats.history.length 
        ? Math.round(stats.history.reduce((acc, curr) => acc + curr.timeTaken, 0) / stats.history.length) 
        : 0;

    return (
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl max-w-xl w-full text-center animate-fade-in my-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">{t.resultsTitle}</h2>
            <p className="text-slate-500 mb-8">{t.sessionSummary}</p>

            {/* Summary Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-indigo-50 p-4 rounded-2xl">
                    <div className="text-3xl font-bold text-indigo-600">{stats.correct}/{stats.total}</div>
                    <div className="text-xs text-indigo-400 font-bold uppercase mt-1">{t.correct}</div>
                </div>
                <div className="bg-emerald-50 p-4 rounded-2xl">
                    <div className="text-3xl font-bold text-emerald-600">{accuracy}%</div>
                    <div className="text-xs text-emerald-400 font-bold uppercase mt-1">{t.accuracy}</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-2xl">
                    <div className="text-3xl font-bold text-orange-500">{stats.streak}</div>
                    <div className="text-xs text-orange-400 font-bold uppercase mt-1">Best {t.streak}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                    <div className="text-3xl font-bold text-slate-600">{(avgTime / 1000).toFixed(1)}s</div>
                    <div className="text-xs text-slate-400 font-bold uppercase mt-1">{t.avgTime}</div>
                </div>
            </div>

            {/* Detailed Stats */}
            {noteStats.length > 0 && (
                <div className="mb-8 text-left">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-700">{t.sortBy}</h3>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setSortMethod('difficulty')}
                                className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${sortMethod === 'difficulty' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}
                            >
                                {t.sortDifficulty}
                            </button>
                            <button 
                                onClick={() => setSortMethod('time')}
                                className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${sortMethod === 'time' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}
                            >
                                {t.sortTime}
                            </button>
                            <button 
                                onClick={() => setSortMethod('name')}
                                className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${sortMethod === 'name' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}
                            >
                                {t.sortName}
                            </button>
                        </div>
                    </div>
                    
                    <div className="overflow-hidden rounded-xl border border-slate-200">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3 text-left">{t.statNote}</th>
                                    <th className="px-4 py-3 text-center">{t.statAccuracy}</th>
                                    <th className="px-4 py-3 text-right">{t.statTime}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {noteStats.map((item) => (
                                    <tr key={item.name} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-bold text-slate-700">
                                            <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                                                {item.name}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full ${item.accuracy >= 80 ? 'bg-emerald-500' : item.accuracy >= 50 ? 'bg-orange-400' : 'bg-red-500'}`}
                                                        style={{ width: `${item.accuracy}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-medium text-slate-600">{Math.round(item.accuracy)}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right text-slate-600 font-mono">
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
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-lg shadow-lg shadow-indigo-200 transition-all"
            >
                {t.startNewSession}
            </button>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
      {screen === 'setup' && renderSetup()}
      {screen === 'game' && renderGame()}
      {screen === 'results' && renderResults()}
    </div>
  );
};

export default App;