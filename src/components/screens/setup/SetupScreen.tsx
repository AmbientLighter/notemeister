import React from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { useGameStore } from '@/store/useGameStore';
import { useSessionStore } from '@/store/useSessionStore';
import ClefSelector from './ClefSelector';
import InstrumentSelector from './InstrumentSelector';
import InteractiveStaff from './InteractiveStaff';
import LanguagePicker from './LanguagePicker';
import OctaveSelector from './OctaveSelector';
import TempoSelector from './TempoSelector';
import InputMethodSelector from './InputMethodSelector';
import ThemeSelector from './ThemeSelector';
import { ChevronDown, ChevronUp, Settings2 } from 'lucide-react';

const SetupScreen: React.FC = () => {
  const { t } = useTranslations();
  const settings = useGameStore((state) => state.settings);
  const toggleSingleNote = useGameStore((state) => state.toggleSingleNote);
  const startGame = useSessionStore((state) => state.startGame);
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  return (
    <div className="bg-white dark:bg-slate-800 p-6 sm:p-10 sm:rounded-[3rem] shadow-2xl sm:max-w-xl w-full animate-fade-in transition-colors duration-200 border border-slate-100 dark:border-slate-700/50">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-3 tracking-tight">
          {t.title}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">{t.subtitle}</p>
      </div>

      {/* Interactive Staff Selection */}
      <div className="mb-10">
        <OctaveSelector />
        <label className="block text-center text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-widest">
          {t.selectNotes}
        </label>
        <InteractiveStaff
          clef={settings.clef}
          activeNotes={settings.activeNotes}
          onToggleNote={toggleSingleNote}
        />
        {settings.activeNotes.length === 0 && (
          <p className="text-red-500 text-xs font-bold mt-4 text-center animate-bounce uppercase tracking-tighter">
            {t.noNotesSelected}
          </p>
        )}
      </div>

      <button
        onClick={startGame}
        disabled={settings.activeNotes.length === 0}
        className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed text-white font-black rounded-3xl text-xl shadow-xl shadow-indigo-200 dark:shadow-none transition-all transform hover:-translate-y-1 active:scale-95 mb-8"
      >
        {t.startSession}
      </button>

      <div className="mb-10">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold text-sm tracking-widest uppercase hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <Settings2 className="w-4 h-4" />
          {showAdvanced ? t.hideAdvancedSettings : t.showAdvancedSettings}
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAdvanced && (
          <div className="mt-6 space-y-8 p-6 rounded-[2rem] bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
            <LanguagePicker />
            <ClefSelector />
            <TempoSelector />
            <InputMethodSelector />
            <ThemeSelector />
            <InstrumentSelector />
          </div>
        )}
      </div>
    </div>
  );
};

export default SetupScreen;
