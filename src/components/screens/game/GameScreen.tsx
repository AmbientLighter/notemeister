import React from 'react';
import type { NoteName } from '@/types';
import { useGameStore } from '@/store/useGameStore';
import { useSessionStore } from '@/store/useSessionStore';
import { useScrollingMode } from '@/hooks/useScrollingMode';
import { Play } from 'lucide-react';
import StaffCanvas from './StaffCanvas';
import ScrollingStaffCanvas from './ScrollingStaffCanvas';
import Keyboard from './Keyboard';
import StatsHeader from './StatsHeader';
import FinishSessionButton from './FinishSessionButton';
import FeedbackBubble from './FeedbackBubble';
import { useTranslations } from '@/hooks/useTranslations';
import { usePitchDetection } from '@/hooks/usePitchDetection';
import { useMidi } from '@/hooks/useMidi';
import MicStatusOverlay from './MicStatusOverlay';

const GameScreen: React.FC = () => {
  const { t } = useTranslations();

  // Persisted State
  const settings = useGameStore((state) => state.settings);

  // Session State (Standard)
  const standardNote = useSessionStore((state) => state.currentNote);
  const standardFeedback = useSessionStore((state) => state.feedback);
  const standardIsProcessing = useSessionStore((state) => state.isProcessing);
  const standardLastCorrectNote = useSessionStore((state) => state.lastCorrectNote);
  const standardLastIncorrectNote = useSessionStore((state) => state.lastIncorrectNote);
  const handleNoteSelect = useSessionStore((state) => state.handleNoteSelect);
  const nextTurn = useSessionStore((state) => state.nextTurn);

  // Scrolling State
  const {
    scrollingNotes,
    hitNote,
    feedback: scrollingFeedback,
    lastCorrectNote: scrollingLastCorrectNote,
    lastIncorrectNote: scrollingLastIncorrectNote,
    isPaused,
    setPaused,
  } = useScrollingMode();

  // Derived Values based on Mode
  const isScrolling = settings.gameMode === 'scrolling';
  const feedback = isScrolling ? scrollingFeedback : standardFeedback;
  const isProcessing = isScrolling ? false : standardIsProcessing;
  const lastCorrectNote = isScrolling ? scrollingLastCorrectNote : standardLastCorrectNote;
  const lastIncorrectNote = isScrolling ? scrollingLastIncorrectNote : standardLastIncorrectNote;
  const currentNote = isScrolling ? null : standardNote;
  const {
    note: detectedNote,
    isActive: isMicActive,
    error: micError,
    startDetection,
    stopDetection,
    resetNote,
  } = usePitchDetection();

  // Session Recovery: If on game screen but no note (e.g. reload), start turn
  React.useEffect(() => {
    if (settings.gameMode === 'standard' && !currentNote) {
      nextTurn();
    }
  }, [currentNote, nextTurn, settings.gameMode]);

  const onNoteSelect = (name: NoteName) => {
    if (settings.gameMode === 'scrolling') {
      hitNote(name, {
        correctAnswer: t.correctAnswer,
        incorrectAnswer: t.incorrectAnswer,
      });
    } else {
      handleNoteSelect(name, {
        correctAnswer: t.correctAnswer,
        incorrectAnswer: t.incorrectAnswer,
      });
    }
  };

  // Auto-advance if detected note matches current note
  React.useEffect(() => {
    if (settings.inputMode === 'microphone' && isMicActive && !isProcessing && currentNote) {
      const targetKey = `${currentNote.name}${currentNote.octave}`;
      if (detectedNote === targetKey) {
        resetNote();
        onNoteSelect(currentNote.name);
      }
    }
  }, [detectedNote, isMicActive, isProcessing, currentNote, settings.inputMode]);

  // Handle clean up or auto-start (optional, usually needs user gesture)
  React.useEffect(() => {
    if (settings.inputMode !== 'microphone' && isMicActive) {
      stopDetection();
    }
  }, [settings.inputMode, isMicActive, stopDetection]);

  // Keyboard Input Support
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isProcessing || settings.inputMode !== 'keyboard') return;

      const key = e.key.toUpperCase();
      // Only handle A, B, C, D, E, F, G keys
      if (/^[A-G]$/.test(key)) {
        onNoteSelect(key as NoteName);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isProcessing, settings.inputMode, onNoteSelect]);

  // MIDI Input Support
  useMidi((name, _octave) => {
    if (isProcessing) return;
    onNoteSelect(name);
  }, settings.inputMode === 'midi');

  return (
    <div className="flex flex-col h-full w-full sm:max-w-4xl sm:mx-auto items-center">
      <StatsHeader />

      {/* Main Content Area */}
      <div className="flex-1 w-full flex flex-col items-center justify-center p-2 sm:p-4 gap-4 sm:gap-6">
        <div className="w-full flex justify-between items-center px-4">
          <FeedbackBubble feedback={feedback} />

          {settings.gameMode === 'scrolling' && (
            <div className="flex gap-2">
              <button
                onClick={() => setPaused(!isPaused)}
                className={`px-4 py-2 rounded-full font-bold transition-all transform active:scale-95 flex items-center gap-2 ${
                  isPaused
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {isPaused ? (
                  <Play className="w-4 h-4 fill-current" />
                ) : (
                  <div className="w-4 h-4 flex gap-1 justify-center items-center">
                    <div className="w-1 h-3 bg-current rounded-full" />
                    <div className="w-1 h-3 bg-current rounded-full" />
                  </div>
                )}
                {isPaused ? t.resume : t.pause}
              </button>

              {isPaused && (
                <FinishSessionButton className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full font-bold shadow-lg shadow-rose-200 active:scale-95 transition-all flex items-center gap-2" />
              )}
            </div>
          )}
        </div>

        <div className="w-full max-w-3xl aspect-[3/2] sm:aspect-[2/1] md:aspect-[2.5/1] relative">
          {settings.gameMode === 'scrolling' ? (
            <ScrollingStaffCanvas
              clef={settings.clef}
              notes={scrollingNotes}
              className="w-full h-full"
            />
          ) : (
            <StaffCanvas clef={settings.clef} note={currentNote} className="w-full h-full" />
          )}

          {/* Microphone Status Overlay */}
          {settings.inputMode === 'microphone' && (
            <MicStatusOverlay
              isActive={isMicActive}
              detectedNote={detectedNote}
              error={micError}
              onActivate={startDetection}
            />
          )}
        </div>

        {/* Question Text */}
        <p className="text-slate-400 dark:text-slate-500 font-medium text-lg">
          {settings.inputMode === 'microphone' && isMicActive && currentNote
            ? t.playThisNote
            : t.question}
        </p>

        {/* Keyboard */}
        {settings.inputMode !== 'microphone' && (
          <Keyboard
            onNoteSelect={onNoteSelect}
            disabled={isProcessing}
            lastCorrectNote={lastCorrectNote}
            lastIncorrectNote={lastIncorrectNote}
          />
        )}
      </div>

      {/* Mobile Finish Button */}
      {!isScrolling && (
        <div className="md:hidden p-4 w-full">
          <FinishSessionButton className="w-full py-3 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold sm:rounded-xl" />
        </div>
      )}
    </div>
  );
};

export default GameScreen;
