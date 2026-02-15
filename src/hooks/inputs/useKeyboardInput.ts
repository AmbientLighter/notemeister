import { useEffect, useCallback } from 'react';
import type { NoteName } from '@/types';

export const useKeyboardInput = (onNote: (note: NoteName) => void, enabled: boolean) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      // Only handle A, B, C, D, E, F, G keys
      if (/^[A-G]$/.test(key)) {
        onNote(key as NoteName);
      }
    },
    [onNote]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);
};
