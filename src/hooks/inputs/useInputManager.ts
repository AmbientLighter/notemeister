import { useGameStore } from '@/store/useGameStore';
import type { NoteName, Note } from '@/types';
import { useKeyboardInput } from './useKeyboardInput';
import { useMidiInput } from './useMidiInput';
import { useTranslations } from '@/hooks/useTranslations';
import { useMicrophoneInput } from './useMicrophoneInput';
import { useSpeechInput } from './useSpeechInput';

export const useInputManager = (
  onNote: (note: NoteName) => void,
  targetNote: Note | null,
  disabled: boolean = false
) => {
  const { language } = useTranslations();
  const inputMode = useGameStore((state) => state.settings.inputMode);

  // Keyboard Input
  useKeyboardInput(onNote, !disabled && inputMode === 'keyboard');

  // MIDI Input
  useMidiInput(onNote, !disabled && inputMode === 'midi');

  // Microphone Input
  const micInput = useMicrophoneInput(onNote, targetNote, !disabled && inputMode === 'microphone');

  // Voice Input (Speech to Text)
  const voiceInput = useSpeechInput(onNote, !disabled && inputMode === 'voice', language);

  return {
    isActive: micInput.isActive || voiceInput.isActive,
    error: micInput.error || voiceInput.error,
    startDetection:
      inputMode === 'microphone' ? micInput.startDetection : voiceInput.startRecognition,
    stopDetection: inputMode === 'microphone' ? micInput.stopDetection : voiceInput.stopRecognition,
    detectedNote: inputMode === 'microphone' ? micInput.detectedNote : voiceInput.lastNote,
    inputMode,
  };
};
