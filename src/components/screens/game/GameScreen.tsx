import React from 'react';
import type { NoteName } from '@/types';
import { useGameStore } from '@/store/useGameStore';
import { useSessionStore } from '@/store/useSessionStore';
import StaffCanvas from './StaffCanvas';
import Keyboard from './Keyboard';
import StatsHeader from './StatsHeader';
import FinishSessionButton from './FinishSessionButton';
import { useTranslations } from '@/hooks/useTranslations';
import { usePitchDetection } from '@/hooks/usePitchDetection';
import { useMidi } from '@/hooks/useMidi';
import MicStatusOverlay from './MicStatusOverlay';

const GameScreen: React.FC = () => {
  const { t } = useTranslations();

  // Persisted State
  const settings = useGameStore((state) => state.settings);

  // Session State
  const currentNote = useSessionStore((state) => state.currentNote);
  const feedback = useSessionStore((state) => state.feedback);
  const isProcessing = useSessionStore((state) => state.isProcessing);
  const lastCorrectNote = useSessionStore((state) => state.lastCorrectNote);
  const lastIncorrectNote = useSessionStore((state) => state.lastIncorrectNote);
  const handleNoteSelect = useSessionStore((state) => state.handleNoteSelect);
  const nextTurn = useSessionStore((state) => state.nextTurn);
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
    if (!currentNote) {
      nextTurn();
    }
  }, [currentNote, nextTurn]);

  const onNoteSelect = (name: NoteName) => {
    handleNoteSelect(name, {
      correctAnswer: t.correctAnswer,
      incorrectAnswer: t.incorrectAnswer,
    });
  };

  // Auto-advance if detected note matches current note
  React.useEffect(() => {
    if (settings.instrument === 'microphone' && isMicActive && !isProcessing && currentNote) {
      const targetKey = `${currentNote.name}${currentNote.octave}`;
      if (detectedNote === targetKey) {
        resetNote();
        onNoteSelect(currentNote.name);
      }
    }
  }, [detectedNote, isMicActive, isProcessing, currentNote, settings.instrument]);

  // Handle clean up or auto-start (optional, usually needs user gesture)
  React.useEffect(() => {
    if (settings.instrument !== 'microphone' && isMicActive) {
      stopDetection();
    }
  }, [settings.instrument, isMicActive, stopDetection]);

  // Keyboard Input Support
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isProcessing || settings.instrument === 'microphone') return;

      const key = e.key.toUpperCase();
      // Only handle A, B, C, D, E, F, G keys
      if (/^[A-G]$/.test(key)) {
        onNoteSelect(key as NoteName);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isProcessing, settings.instrument, onNoteSelect]);

  // MIDI Input Support
  useMidi((name, octave) => {
    if (isProcessing) return;
    onNoteSelect(name);
  });
  return (
    <div className="flex flex-col h-full w-full sm:max-w-4xl sm:mx-auto items-center">
      <StatsHeader />

      {/* Main Content Area */}
      <div className="flex-1 w-full flex flex-col items-center justify-center p-2 sm:p-4 gap-4 sm:gap-6">
        {/* Feedback Bubble */}
        <div
          className={`h-8 md:h-12 flex items-center justify-center transition-all duration-300 transform ${feedback ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
        >
          {feedback && (
            <span
              className={`px-6 py-2 rounded-full font-bold shadow-sm ${
                feedback.type === 'correct'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
              }`}
            >
              {feedback.message}
            </span>
          )}
        </div>

        <div className="w-full max-w-3xl aspect-[3/2] sm:aspect-[2/1] md:aspect-[2.5/1] relative">
          <StaffCanvas clef={settings.clef} note={currentNote} className="w-full h-full" />

          {/* Microphone Status Overlay */}
          {settings.instrument === 'microphone' && (
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
          {settings.instrument === 'microphone' && isMicActive && currentNote
            ? t.playThisNote
            : t.question}
        </p>

        {/* Keyboard */}
        {settings.instrument !== 'microphone' && (
          <Keyboard
            onNoteSelect={onNoteSelect}
            disabled={isProcessing}
            lastCorrectNote={lastCorrectNote}
            lastIncorrectNote={lastIncorrectNote}
          />
        )}
      </div>

      {/* Mobile Finish Button */}
      <div className="md:hidden p-4 w-full">
        <FinishSessionButton className="w-full py-3 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold sm:rounded-xl" />
      </div>
    </div>
  );
};

export default GameScreen;
