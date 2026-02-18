import React, { useState } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { useGameStore } from '@/store/useGameStore';
import { useStandardStore } from '@/store/useStandardStore';
import { useScrollingStore } from '@/store/useScrollingStore';
import ClefSelector from './ClefSelector';
import InstrumentSelector from './InstrumentSelector';
import InteractiveStaff from './InteractiveStaff';
import LanguagePicker from './LanguagePicker';
import OctaveSelector from './OctaveSelector';
import TempoSelector from './TempoSelector';
import SongSelector from './SongSelector';
import InputMethodSelector from './InputMethodSelector';
import ThemeSelector from './ThemeSelector';
import {
  ChevronDown,
  ChevronUp,
  Settings2,
  List,
  Play,
  MonitorPlay,
  ArrowLeft,
} from 'lucide-react';
import type { GameMode } from '@/types';

const SetupScreen: React.FC = () => {
  const { t } = useTranslations();
  const settings = useGameStore((state) => state.settings);
  const updateSettings = useGameStore((state) => state.updateSettings);

  // Standard Store
  const standardSettings = useStandardStore((state) => state.settings);
  const toggleSingleNote = useStandardStore((state) => state.toggleSingleNote);
  const startStandardGame = useStandardStore((state) => state.startGame);

  // Scrolling Store
  const startScrollingGame = useScrollingStore((state) => state.startGame);
  const fetchAvailableSongs = useScrollingStore((state) => state.fetchAvailableSongs);

  // Setup Step State
  const [step, setStep] = useState<'mode' | 'config'>('mode');
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  React.useEffect(() => {
    fetchAvailableSongs();
  }, [fetchAvailableSongs]);

  const handleModeSelect = (mode: GameMode) => {
    updateSettings({ gameMode: mode });
    setStep('config');
  };

  const startGame = () => {
    if (settings.gameMode === 'scrolling' || settings.gameMode === 'demo') {
      startScrollingGame();
    } else {
      startStandardGame();
    }
  };

  const renderModeSelection = () => (
    <div className="w-full space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 gap-4">
        {/* Standard Mode Card */}
        <button
          onClick={() => handleModeSelect('standard')}
          className="group relative bg-white dark:bg-slate-800 p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 text-left"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
              <List className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {t.modeStandard}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Practice individual notes at your own pace. Perfect for learning to read sheet
                music.
              </p>
            </div>
          </div>
        </button>

        {/* Scrolling Mode Card */}
        <button
          onClick={() => handleModeSelect('scrolling')}
          className="group relative bg-white dark:bg-slate-800 p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 text-left"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
              <Play className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {t.modeScrolling}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Play along with scrolling notes. Test your reaction time and sight-reading speed.
              </p>
            </div>
          </div>
        </button>

        {/* Demo Mode Card */}
        <button
          onClick={() => handleModeSelect('demo')}
          className="group relative bg-white dark:bg-slate-800 p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 text-left"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-2xl text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300">
              <MonitorPlay className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {t.modeDemo}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Sit back and watch the AI play. Useful for demonstration or relaxed listening.
              </p>
            </div>
          </div>
        </button>
      </div>

      <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
        <div className="grid grid-cols-2 gap-4">
          <ThemeSelector />
          <LanguagePicker />
        </div>
      </div>
    </div>
  );

  const renderConfiguration = () => (
    <div className="w-full animate-slide-in-right">
      <button
        onClick={() => setStep('mode')}
        className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold mb-6 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
      >
        <div className="p-1 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </div>
        {t.backToOverview || 'Back to Modes'}
      </button>

      {/* Standard Mode Config */}
      {settings.gameMode === 'standard' && (
        <div className="mb-10">
          <OctaveSelector />
          <label className="block text-center text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-widest">
            {t.selectNotes}
          </label>
          <InteractiveStaff
            clef={settings.clef}
            activeNotes={standardSettings.activeNotes}
            onToggleNote={toggleSingleNote}
          />
          {standardSettings.activeNotes.length === 0 && (
            <p className="text-red-500 text-xs font-bold mt-4 text-center animate-bounce uppercase tracking-tighter">
              {t.noNotesSelected}
            </p>
          )}
        </div>
      )}

      {/* Scrolling/Demo Mode Config */}
      {(settings.gameMode === 'scrolling' || settings.gameMode === 'demo') && (
        <div className="mb-10">
          <SongSelector />
        </div>
      )}

      <button
        onClick={startGame}
        disabled={settings.gameMode === 'standard' && standardSettings.activeNotes.length === 0}
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
            <ClefSelector />
            <TempoSelector />
            <InputMethodSelector />
            <InstrumentSelector />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-800 p-6 sm:p-10 sm:rounded-[3rem] shadow-2xl sm:max-w-xl w-full animate-fade-in transition-colors duration-200 border border-slate-100 dark:border-slate-700/50">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-3 tracking-tight">
          {step === 'mode'
            ? t.title
            : settings.gameMode === 'standard'
              ? t.modeStandard
              : settings.gameMode === 'scrolling'
                ? t.modeScrolling
                : t.modeDemo}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          {step === 'mode' ? t.subtitle : t.setupTitle || 'Customize your session'}
        </p>
      </div>

      {step === 'mode' ? renderModeSelection() : renderConfiguration()}
    </div>
  );
};

export default SetupScreen;
