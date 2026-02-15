import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { useSessionStore } from '../store/useSessionStore';
import InteractiveStaff from './InteractiveStaff';
import { useTranslations } from '../hooks/useTranslations';
import LanguagePicker from './LanguagePicker';
import ClefSelector from './ClefSelector';
import OctaveSelector from './OctaveSelector';
import TempoSelector from './TempoSelector';
import InstrumentSelector from './InstrumentSelector';

const SetupScreen: React.FC = () => {
    const { t } = useTranslations();
    const settings = useGameStore((state) => state.settings);
    const toggleSingleNote = useGameStore((state) => state.toggleSingleNote);
    const startGame = useSessionStore((state) => state.startGame);

    return (
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-10 sm:rounded-[3rem] shadow-2xl sm:max-w-xl w-full animate-fade-in transition-colors duration-200 border border-slate-100 dark:border-slate-700/50">
            <LanguagePicker />

            <div className="text-center mb-10">
                <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-3 tracking-tight">{t.title}</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">{t.subtitle}</p>
            </div>

            <ClefSelector />

            {/* Interactive Staff Selection */}
            <div className="mb-10">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-widest">{t.selectNotes}</label>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-inner">
                    <InteractiveStaff
                        clef={settings.clef}
                        activeNotes={settings.activeNotes}
                        onToggleNote={toggleSingleNote}
                    />
                </div>
                {settings.activeNotes.length === 0 && (
                    <p className="text-red-500 text-xs font-bold mt-4 text-center animate-bounce uppercase tracking-tighter">
                        {t.noNotesSelected}
                    </p>
                )}
            </div>

            <OctaveSelector />
            <TempoSelector />
            <InstrumentSelector />

            <button
                onClick={startGame}
                disabled={settings.activeNotes.length === 0}
                className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed text-white font-black rounded-3xl text-xl shadow-xl shadow-indigo-200 dark:shadow-none transition-all transform hover:-translate-y-1 active:scale-95"
            >
                {t.startSession}
            </button>
        </div>
    );
};

export default SetupScreen;
