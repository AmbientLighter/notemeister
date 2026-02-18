import React from 'react';
import type { NoteName } from '@/types';
import { useGameStore } from '@/store/useGameStore';
import { useScrollingMode } from '@/hooks/useScrollingMode';
import { useScrollingStore } from '@/store/useScrollingStore';
import PauseButton from './PauseButton';
import OSMDCanvas from './OSMDCanvas';
import ScrollingStaffCanvas from './ScrollingStaffCanvas';
import FeedbackBubble from './FeedbackBubble';
import { useTranslations } from '@/hooks/useTranslations';
import { useInputManager } from '@/hooks/inputs/useInputManager';
import MicStatusOverlay from './MicStatusOverlay';
import PianoKeyboard from './PianoKeyboard';
import FinishSessionButton from './FinishSessionButton';
import { convertToMusicXML } from '@/utils/musicXmlUtils';

const ScrollingGame: React.FC = () => {
  const { t } = useTranslations();
  const globalSettings = useGameStore((state) => state.settings);

  const { scrollingNotes, hitNote, feedback, isPaused, setPaused, currentNoteIndex, activeSong } =
    useScrollingMode();

  const isDemo = globalSettings.gameMode === 'demo';

  const musicXML = React.useMemo(() => {
    if (!activeSong) return '';
    return convertToMusicXML(activeSong, globalSettings.clef);
  }, [activeSong, globalSettings.clef]);

  const {
    isActive: isMicActive,
    error: micError,
    startDetection: startMicDetection,
    detectedNote,
  } = useInputManager(onNoteSelect, null, false);

  function onNoteSelect(name: NoteName) {
    hitNote(name, {
      correctAnswer: t.correctAnswer,
      incorrectAnswer: t.incorrectAnswer,
    });
  }

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center p-2 sm:p-4 gap-4 sm:gap-6">
      <div className="w-full flex justify-between items-center px-4">
        <div className="flex-1">{!isDemo && <FeedbackBubble feedback={feedback} />}</div>

        <div className="flex items-center gap-3">
          {(globalSettings.inputMode === 'microphone' || globalSettings.inputMode === 'voice') &&
            !isDemo && (
              <MicStatusOverlay
                isActive={isMicActive}
                detectedNote={detectedNote}
                error={micError}
                onActivate={startMicDetection}
              />
            )}

          {!isDemo && (
            <div className="flex gap-2">
              <PauseButton isPaused={isPaused} onToggle={() => setPaused(!isPaused)} />
              {isPaused && (
                <FinishSessionButton className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full font-bold shadow-lg shadow-rose-200 active:scale-95 transition-all flex items-center gap-2" />
              )}
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-3xl aspect-[3/2] sm:aspect-[2/1] md:aspect-[2.5/1] relative">
        {activeSong ? (
          <OSMDCanvas
            xml={musicXML}
            clef={globalSettings.clef}
            cursorIndex={currentNoteIndex}
            className="w-full h-full"
          />
        ) : (
          <ScrollingStaffCanvas
            clef={globalSettings.clef}
            notes={scrollingNotes}
            className="w-full h-full"
          />
        )}
      </div>

      {(globalSettings.inputMode === 'virtual_keyboard' || isDemo) && (
        <PianoKeyboard onNote={onNoteSelect} />
      )}
    </div>
  );
};

export default ScrollingGame;
