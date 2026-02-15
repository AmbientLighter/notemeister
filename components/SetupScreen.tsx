import React from 'react';
import { GameSettings, Language, ClefType, Instrument } from '../types';
import { OCTAVE_RANGES } from '../constants';
import InteractiveStaff from './InteractiveStaff';

interface SetupScreenProps {
    settings: GameSettings;
    darkMode: boolean;
    t: any;
    handleLanguageChange: (lang: Language) => void;
    handleClefChange: (clef: ClefType) => void;
    toggleSingleNote: (key: string) => void;
    toggleOctaveGroup: (octave: number) => void;
    getOctaveStatus: (octave: number) => 'full' | 'partial' | 'none';
    setSettings: React.Dispatch<React.SetStateAction<GameSettings>>;
    startGame: () => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({
    settings,
    darkMode,
    t,
    handleLanguageChange,
    handleClefChange,
    toggleSingleNote,
    toggleOctaveGroup,
    getOctaveStatus,
    setSettings,
    startGame
}) => {
    return (
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 md:p-10 sm:rounded-3xl shadow-xl sm:max-w-lg w-full animate-fade-in transition-colors duration-200">
            <div className="flex justify-center gap-2 mb-8">
                {(['en', 'ru', 'uk', 'et'] as Language[]).map(lang => (
                    <button
                        key={lang}
                        onClick={() => handleLanguageChange(lang)}
                        className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${settings.language === lang
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
                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${settings.clef === 'treble'
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                            : 'border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-700 text-slate-600 dark:text-slate-400'
                            }`}
                    >
                        <span className="text-4xl">𝄞</span>
                        <span className="font-semibold">{t.trebleClef}</span>
                    </button>
                    <button
                        onClick={() => handleClefChange('bass')}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${settings.clef === 'bass'
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
                                className={`w-12 h-12 rounded-lg font-bold text-lg flex items-center justify-center transition-all border-2 ${status === 'full'
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
                            className={`py-3 rounded-xl font-bold transition-all ${settings.tempo === mode
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                                : 'bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500'
                                }`}
                        >
                            {mode === 'slow' ? t.tempoSlow : mode === 'normal' ? t.tempoNormal : t.tempoFast}
                        </button>
                    ))}
                </div>
            </div>

            {/* Instrument Selection */}
            <div className="mb-8">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide">{t.selectInstrument}</label>
                <div className="grid grid-cols-2 gap-3">
                    {(['silence', 'piano', 'guitar', 'flute'] as Instrument[]).map((inst) => (
                        <button
                            key={inst}
                            onClick={() => setSettings(s => ({ ...s, instrument: inst }))}
                            className={`py-3 px-2 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${settings.instrument === inst
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                                : 'bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500'
                                }`}
                        >
                            <span className="text-xl">
                                {inst === 'silence' && '🔇'}
                                {inst === 'piano' && '🎹'}
                                {inst === 'guitar' && '🎸'}
                                {inst === 'flute' && '🎷'}
                            </span>
                            <span className="text-sm">
                                {inst === 'silence' ? t.instrumentSilence :
                                    inst === 'piano' ? t.instrumentPiano :
                                        inst === 'guitar' ? t.instrumentGuitar :
                                            t.instrumentFlute}
                            </span>
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
};

export default SetupScreen;
