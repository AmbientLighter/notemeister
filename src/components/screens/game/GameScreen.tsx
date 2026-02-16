import React from 'react';
import type { NoteName } from '@/types';
import { useGameStore } from '@/store/useGameStore';
import { useSessionStore } from '@/store/useSessionStore';
import { useScrollingMode } from '@/hooks/useScrollingMode';
import PauseButton from './PauseButton';
import StaffCanvas from './StaffCanvas';
import ScrollingStaffCanvas from './ScrollingStaffCanvas';
import Keyboard from './Keyboard';
import StatsHeader from './StatsHeader';
import FinishSessionButton from './FinishSessionButton';
import FeedbackBubble from './FeedbackBubble';
import { useTranslations } from '@/hooks/useTranslations';
import { useInputManager } from '@/hooks/inputs/useInputManager';
import MicStatusOverlay from './MicStatusOverlay';
import PianoKeyboard from './PianoKeyboard';

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
    isActive: isMicActive,
    error: micError,
    startDetection,
    detectedNote,
  } = useInputManager(onNoteSelect, currentNote, isProcessing);

  // Session Recovery: If on game screen but no note (e.g. reload), start turn
  React.useEffect(() => {
    if (settings.gameMode === 'standard' && !currentNote) {
      nextTurn();
    }
  }, [currentNote, nextTurn, settings.gameMode]);

  function onNoteSelect(name: NoteName) {
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
  }

  return (
    <div className="flex flex-col h-full w-full sm:max-w-4xl sm:mx-auto items-center">
      <StatsHeader />

      {/* Main Content Area */}
      <div className="flex-1 w-full flex flex-col items-center justify-center p-2 sm:p-4 gap-4 sm:gap-6">
        <div className="w-full flex justify-between items-center px-4">
          <FeedbackBubble feedback={feedback} />

          {settings.gameMode === 'scrolling' && (
            <div className="flex gap-2">
              <PauseButton isPaused={isPaused} onToggle={() => setPaused(!isPaused)} />

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

        {/* Keyboard / Input Interface */}
        {settings.inputMode === 'keyboard' && (
          <Keyboard
            onNoteSelect={onNoteSelect}
            disabled={isProcessing}
            lastCorrectNote={lastCorrectNote}
            lastIncorrectNote={lastIncorrectNote}
          />
        )}

        {settings.inputMode === 'virtual_keyboard' && <PianoKeyboard onNote={onNoteSelect} />}
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
