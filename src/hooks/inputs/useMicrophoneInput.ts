import { usePitchDetection } from '@/hooks/inputs/usePitchDetection';
import type { Note, NoteName } from '@/types';
import { useEffect } from 'react';

export const useMicrophoneInput = (
  onNote: (note: NoteName) => void,
  targetNote: Note | null,
  enabled: boolean
) => {
  const {
    note: detectedNote,
    isActive,
    error,
    resetNote,
    startDetection,
    stopDetection,
  } = usePitchDetection();

  // Auto-advance if detected note matches current note
  useEffect(() => {
    if (enabled && isActive && targetNote && detectedNote !== '-') {
      const targetKey = `${targetNote.name}${targetNote.octave}`;
      if (detectedNote === targetKey) {
        resetNote();
        onNote(targetNote.name);
      }
    }
  }, [detectedNote, isActive, targetNote, onNote, resetNote, enabled]);

  // Handle activation/deactivation
  useEffect(() => {
    if (enabled && !isActive) {
      // In a real app, we might need a user gesture to start detection
      // But for now we follow the existing pattern in GameScreen
    } else if (!enabled && isActive) {
      stopDetection();
    }
  }, [enabled, isActive, stopDetection]);

  return {
    startDetection,
    stopDetection,
    isActive,
    detectedNote,
    error,
  };
};
