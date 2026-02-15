import { useGameStore } from '@/store/useGameStore';
import type { NoteName, Note } from '@/types';
import { useKeyboardInput } from './useKeyboardInput';
import { useMidiInput } from './useMidiInput';
import { useMicrophoneInput } from './useMicrophoneInput';

export const useInputManager = (
  onNote: (note: NoteName) => void,
  targetNote: Note | null,
  disabled: boolean = false
) => {
  const inputMode = useGameStore((state) => state.settings.inputMode);

  // Keyboard Input
  useKeyboardInput(onNote, !disabled && inputMode === 'keyboard');

  // MIDI Input
  useMidiInput(onNote, !disabled && inputMode === 'midi');

  // Microphone Input
  const micInput = useMicrophoneInput(onNote, targetNote, !disabled && inputMode === 'microphone');

  return {
    ...micInput,
    inputMode,
  };
};
