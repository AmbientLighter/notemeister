import React from 'react';
import { GameSettings, GameStats, Note, NoteName } from '../types';
import StaffCanvas from './StaffCanvas';
import Keyboard from './Keyboard';

interface GameScreenProps {
    settings: GameSettings;
    stats: GameStats;
    currentNote: Note | null;
    feedback: { type: 'correct' | 'incorrect'; message: string } | null;
    isProcessing: boolean;
    lastCorrectNote: NoteName | null;
    lastIncorrectNote: NoteName | null;
    t: any;
    darkMode: boolean;
    handleNoteSelect: (selectedName: NoteName) => void;
    finishGame: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({
    settings,
    stats,
    currentNote,
    feedback,
    isProcessing,
    lastCorrectNote,
    lastIncorrectNote,
    t,
    darkMode,
    handleNoteSelect,
    finishGame
}) => {
    return (
        <div className="flex flex-col h-full w-full sm:max-w-4xl sm:mx-auto items-center">
            {/* Header Stats */}
            <div className="w-full grid grid-cols-3 md:grid-cols-4 gap-4 p-4 md:p-6 bg-white dark:bg-slate-800 sm:rounded-b-3xl shadow-sm mb-4 sm:mb-6 transition-colors duration-200">
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
            <div className="flex-1 w-full flex flex-col items-center justify-center p-2 sm:p-4 gap-4 sm:gap-6">
                {/* Feedback Bubble */}
                <div className={`h-8 md:h-12 flex items-center justify-center transition-all duration-300 transform ${feedback ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                    {feedback && (
                        <span className={`px-6 py-2 rounded-full font-bold shadow-sm ${feedback.type === 'correct'
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
                    className="w-full py-3 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold sm:rounded-xl"
                >
                    {t.finishSession}
                </button>
            </div>
        </div>
    );
};

export default GameScreen;
