import React from 'react';
import type { NoteName } from '@/types';
import { useGameStore } from '@/store/useGameStore';
import { useStandardStore } from '@/store/useStandardStore';
import StaffCanvas from './StaffCanvas';
import Keyboard from './Keyboard';
import FeedbackBubble from './FeedbackBubble';
import { useTranslations } from '@/hooks/useTranslations';
import { useInputManager } from '@/hooks/inputs/useInputManager';
import MicStatusOverlay from './MicStatusOverlay';
import PianoKeyboard from './PianoKeyboard';
import FinishSessionButton from './FinishSessionButton';

const StandardGame: React.FC = () => {
  const { t } = useTranslations();

  // Settings
  const globalSettings = useGameStore((state) => state.settings);
  const standardSettings = useStandardStore((state) => state.settings);

  // Session State
  const currentNote = useStandardStore((state) => state.currentNote);
  const feedback = useStandardStore((state) => state.feedback);
  const isProcessing = useStandardStore((state) => state.isProcessing);
  const lastCorrectNote = useStandardStore((state) => state.lastCorrectNote);
  const lastIncorrectNote = useStandardStore((state) => state.lastIncorrectNote);
  const handleNoteSelect = useStandardStore((state) => state.handleNoteSelect);
  const nextTurn = useStandardStore((state) => state.nextTurn);

  const {
    isActive: isMicActive,
    error: micError,
    startDetection: startMicDetection,
    detectedNote,
  } = useInputManager(onNoteSelect, currentNote, isProcessing);

  // Initial turn
  React.useEffect(() => {
    if (!currentNote) {
      nextTurn();
    }
  }, [currentNote, nextTurn]);

  function onNoteSelect(name: NoteName) {
    handleNoteSelect(name, {
      correctAnswer: t.correctAnswer,
      incorrectAnswer: t.incorrectAnswer,
    });
  }

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center p-2 sm:p-4 gap-4 sm:gap-6">
      <div className="w-full flex justify-between items-center px-4">
        <div className="flex-1">
          <FeedbackBubble feedback={feedback} />
        </div>

        <div className="flex items-center gap-3">
          {(globalSettings.inputMode === 'microphone' || globalSettings.inputMode === 'voice') && (
            <MicStatusOverlay
              isActive={isMicActive}
              detectedNote={detectedNote}
              error={micError}
              onActivate={startMicDetection}
            />
          )}
        </div>
      </div>

      <div className="w-full max-w-3xl aspect-[3/2] sm:aspect-[2/1] md:aspect-[2.5/1] relative">
        <StaffCanvas clef={globalSettings.clef} note={currentNote} className="w-full h-full" />
      </div>

      {/* Question Text */}
      <p className="text-slate-400 dark:text-slate-500 font-medium text-lg">
        {globalSettings.inputMode === 'microphone' && isMicActive && currentNote
          ? t.playThisNote
          : t.question}
      </p>

      {/* Inputs */}
      {globalSettings.inputMode === 'keyboard' && (
        <Keyboard
          onNoteSelect={onNoteSelect}
          disabled={isProcessing}
          lastCorrectNote={lastCorrectNote}
          lastIncorrectNote={lastIncorrectNote}
        />
      )}

      {globalSettings.inputMode === 'virtual_keyboard' && <PianoKeyboard onNote={onNoteSelect} />}

      {/* Mobile Finish Button */}
      <div className="md:hidden p-4 w-full">
        <FinishSessionButton className="w-full py-3 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold sm:rounded-xl" />
      </div>
    </div>
  );
};

export default StandardGame;
