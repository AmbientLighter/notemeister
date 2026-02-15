import React, { useState, useCallback, useMemo } from 'react';
import { GameSettings, GameStats, Note, NoteName, Language, ClefType } from './types';
import { TRANSLATIONS, OCTAVE_RANGES, NOTE_NAMES } from './constants';
import { generateRandomNote, getNoteKey, parseNoteKey } from './utils/musicLogic';
import StaffCanvas from './components/StaffCanvas';
import InteractiveStaff from './components/InteractiveStaff';
import Keyboard from './components/Keyboard';

type Screen = 'setup' | 'game' | 'results';
type SortMethod = 'difficulty' | 'name' | 'time';

const App: React.FC = () => {
  // --- State ---
  const [screen, setScreen] = useState<Screen>('setup');
  const [darkMode, setDarkMode] = useState(false);
  
  // Settings
  const [settings, setSettings] = useState<GameSettings>({
    language: 'en',
    clef: 'treble',
    activeNotes: [], // Initialized in useEffect or manually
    tempo: 'normal'
  });

  // Initialize active notes default on first load or clef change
  React.useEffect(() => {
    // Default to ONE octave (4 for treble, 3 for bass) to start simple
    if (settings.activeNotes.length === 0) {
        const defaultOctaves = settings.clef === 'treble' ? [4] : [3];
        const newNotes: string[] = [];
        defaultOctaves.forEach(oct => {
            NOTE_NAMES.forEach(name => newNotes.push(`${name}${oct}`));
        });
        setSettings(prev => ({ ...prev, activeNotes: newNotes }));
    }
  }, [settings.clef]);

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

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleLanguageChange = (lang: Language) => {
    setSettings(prev => ({ ...prev, language: lang }));
  };

  const handleClefChange = (clef: ClefType) => {
    setSettings(prev => ({
      ...prev,
      clef,
      activeNotes: [] // Will trigger effect to reset defaults
    }));
  };

  // Bulk toggle for entire octave
  const toggleOctaveGroup = (octave: number) => {
    setSettings(prev => {
      const octaveNotes = NOTE_NAMES.map(name => `${name}${octave}`);
      const allSelected = octaveNotes.every(k => prev.activeNotes.includes(k));
      
      let newActive = [...prev.activeNotes];
      
      if (allSelected) {
          // Deselect all in this octave
          newActive = newActive.filter(k => !octaveNotes.includes(k));
      } else {
          // Select all in this octave
          octaveNotes.forEach(k => {
              if (!newActive.includes(k)) newActive.push(k);
          });
      }
      
      // Ensure at least one note remains if we are deselecting
      if (newActive.length === 0) return prev;

      return { ...prev, activeNotes: newActive };
    });
  };

  const toggleSingleNote = (key: string) => {
    setSettings(prev => {
      const current = prev.activeNotes;
      if (current.includes(key)) {
        if (current.length === 1) return prev; // Prevent empty
        return { ...prev, activeNotes: current.filter(k => k !== key) };
      } else {
        return { ...prev, activeNotes: [...current, key] };
      }
    });
  };

  // Helper to check if an octave is fully, partially, or not selected
  const getOctaveStatus = (octave: number): 'full' | 'partial' | 'none' => {
      const octaveNotes = NOTE_NAMES.map(name => `${name}${octave}`);
      const selectedCount = octaveNotes.filter(k => settings.activeNotes.includes(k)).length;
      
      if (selectedCount === 7) return 'full';
      if (selectedCount > 0) return 'partial';
      return 'none';
  };

  const startGame = () => {
    setStats({ correct: 0, total: 0, streak: 0, history: [] });
    setScreen('game');
    nextTurn(true);
  };

  const nextTurn = useCallback((firstTurn = false) => {
    const newNote = generateRandomNote(
      settings.activeNotes,
      currentNote || undefined
    );
    setCurrentNote(newNote);
    setFeedback(null);
    setIsProcessing(false);
    setLastCorrectNote(null);
    setLastIncorrectNote(null);
    setStartTime(Date.now());
  }, [settings.activeNotes, currentNote]);

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

    // Determine delays based on tempo settings
    let delayCorrect = 300;
    let delayIncorrect = 1200;

    if (settings.tempo === 'fast') {
        delayCorrect = 0;
        delayIncorrect = 500;
    } else if (settings.tempo === 'slow') {
        delayCorrect = 1000;
        delayIncorrect = 2000;
    }

    if (isCorrect) {
      setFeedback({ type: 'correct', message: t.correctAnswer });
      setLastCorrectNote(currentNote.name);
      // Auto advance
      setTimeout(() => {
        nextTurn();
      }, delayCorrect);
    } else {
      setFeedback({ type: 'incorrect', message: `${t.incorrectAnswer} ${currentNote.name}` });
      setLastIncorrectNote(selectedName);
      setLastCorrectNote(currentNote.name);
      // Auto advance slower on error to let them see
      setTimeout(() => {
        nextTurn();
      }, delayIncorrect);
    }
  };

  const finishGame = () => {
    setScreen('results');
  };

  // --- Render Helpers ---

  const renderSetup = () => (
    <div className="bg-white dark:bg-slate-800 p-6 md:p-10 rounded-3xl shadow-xl max-w-lg w-full animate-fade-in transition-colors duration-200">
      <div className="flex justify-center gap-2 mb-8">
        {(['en', 'ru', 'uk', 'et'] as Language[]).map(lang => (
          <button
            key={lang}
            onClick={() => handleLanguageChange(lang)}
            className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
              settings.language === lang 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>

      <h1 className="text-3xl font-bold text-center text-slate-800 dark:text-white mb-2">{t.title}</h1>
      <p className="text-center text-slate-500 dark:text-slate-400 mb-8">{t.subtitle}</p>

      {/* Clef Selection */}
      <div className="mb-8">
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide">{t.selectClef}</label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleClefChange('treble')}
            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
              settings.clef === 'treble' 
                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' 
                : 'border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            <span className="text-4xl">𝄞</span>
            <span className="font-semibold">{t.trebleClef}</span>
          </button>
          <button
            onClick={() => handleClefChange('bass')}
            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
              settings.clef === 'bass' 
                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' 
                : 'border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            <span className="text-4xl">𝄢</span>
            <span className="font-semibold">{t.bassClef}</span>
          </button>
        </div>
      </div>

      {/* Interactive Staff Selection */}
      <div className="mb-8">
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide">{t.selectNotes}</label>
        
        <InteractiveStaff 
          clef={settings.clef}
          activeNotes={settings.activeNotes}
          onToggleNote={toggleSingleNote}
          darkMode={darkMode}
        />

        {settings.activeNotes.length === 0 && (
          <p className="text-red-500 text-sm mt-2 text-center">{t.noNotesSelected}</p>
        )}
      </div>

      {/* Octave Bulk Selection */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide">{t.selectOctaves}</label>
        <div className="flex flex-wrap gap-3 justify-center">
          {OCTAVE_RANGES[settings.clef].map(octave => {
            const status = getOctaveStatus(octave);
            return (
                <button
                key={octave}
                onClick={() => toggleOctaveGroup(octave)}
                className={`w-12 h-12 rounded-lg font-bold text-lg flex items-center justify-center transition-all border-2 ${
                    status === 'full'
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none scale-105'
                    : status === 'partial'
                    ? 'bg-indigo-100 dark:bg-indigo-900/50 border-indigo-400 text-indigo-700 dark:text-indigo-300'
                    : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500'
                }`}
                >
                {octave}
                </button>
            );
          })}
        </div>
        <p className="text-xs text-center text-slate-400 mt-2">Use these buttons to select/deselect entire octaves.</p>
      </div>

      {/* Tempo Selection */}
      <div className="mb-8">
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide">{t.selectTempo}</label>
        <div className="grid grid-cols-3 gap-3">
            {(['slow', 'normal', 'fast'] as const).map((mode) => (
                <button
                    key={mode}
                    onClick={() => setSettings(s => ({ ...s, tempo: mode }))}
                    className={`py-3 rounded-xl font-bold transition-all ${
                        settings.tempo === mode
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                        : 'bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500'
                    }`}
                >
                    {mode === 'slow' ? t.tempoSlow : mode === 'normal' ? t.tempoNormal : t.tempoFast}
                </button>
            ))}
        </div>
      </div>

      <button
        onClick={startGame}
        disabled={settings.activeNotes.length === 0}
        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-xl text-lg shadow-lg shadow-indigo-200 dark:shadow-none transition-transform active:scale-95"
      >
        {t.startSession}
      </button>
    </div>
  );

  const renderGame = () => (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto items-center">
      {/* Header Stats */}
      <div className="w-full grid grid-cols-3 md:grid-cols-4 gap-4 p-4 md:p-6 bg-white dark:bg-slate-800 rounded-b-3xl shadow-sm mb-6 transition-colors duration-200">
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
            <button 
                onClick={finishGame}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-semibold transition-colors"
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
             <span className={`px-6 py-2 rounded-full font-bold shadow-sm ${
               feedback.type === 'correct' 
                 ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' 
                 : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
             }`}>
                {feedback.message}
             </span>
           )}
        </div>

        {/* Canvas */}
        <div className="w-full max-w-2xl aspect-[2/1] md:aspect-[2.5/1] relative">
            <StaffCanvas 
                clef={settings.clef} 
                note={currentNote} 
                darkMode={darkMode}
                className="w-full h-full"
            />
        </div>

        {/* Question Text */}
        <p className="text-slate-400 dark:text-slate-500 font-medium text-lg">{t.question}</p>

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
            className="w-full py-3 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl"
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
        <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl shadow-xl max-w-xl w-full text-center animate-fade-in my-8 transition-colors duration-200">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">{t.resultsTitle}</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">{t.sessionSummary}</p>

            {/* Summary Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-2xl">
                    <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{stats.correct}/{stats.total}</div>
                    <div className="text-xs text-indigo-400 dark:text-indigo-300 font-bold uppercase mt-1">{t.correct}</div>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-2xl">
                    <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{accuracy}%</div>
                    <div className="text-xs text-emerald-400 dark:text-emerald-300 font-bold uppercase mt-1">{t.accuracy}</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-2xl">
                    <div className="text-3xl font-bold text-orange-500">{stats.streak}</div>
                    <div className="text-xs text-orange-400 dark:text-orange-300 font-bold uppercase mt-1">Best {t.streak}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl">
                    <div className="text-3xl font-bold text-slate-600 dark:text-slate-300">{(avgTime / 1000).toFixed(1)}s</div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase mt-1">{t.avgTime}</div>
                </div>
            </div>

            {/* Detailed Stats */}
            {noteStats.length > 0 && (
                <div className="mb-8 text-left">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-700 dark:text-slate-300">{t.sortBy}</h3>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setSortMethod('difficulty')}
                                className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${sortMethod === 'difficulty' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}
                            >
                                {t.sortDifficulty}
                            </button>
                            <button 
                                onClick={() => setSortMethod('time')}
                                className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${sortMethod === 'time' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}
                            >
                                {t.sortTime}
                            </button>
                            <button 
                                onClick={() => setSortMethod('name')}
                                className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${sortMethod === 'name' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}
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
                                            <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center border border-slate-200 dark:border-slate-600">
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

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 transition-colors duration-300">
        {/* Global Dark Mode Toggle */}
        <button 
          onClick={toggleDarkMode}
          className="fixed top-4 right-4 p-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full shadow-lg z-50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? (
             // Sun Icon
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
             </svg>
          ) : (
            // Moon Icon
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
            </svg>
          )}
        </button>

        {screen === 'setup' && renderSetup()}
        {screen === 'game' && renderGame()}
        {screen === 'results' && renderResults()}
      </div>
    </div>
  );
};

export default App;