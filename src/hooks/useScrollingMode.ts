import { useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useScrollingStore } from '@/store/useScrollingStore';

export const useScrollingMode = () => {
  const settings = useGameStore((state) => state.settings);
  const scrollingNotes = useScrollingStore((state) => state.scrollingNotes);
  const updateNotePositions = useScrollingStore((state) => state.updateNotePositions);
  const hitNote = useScrollingStore((state) => state.hitNote);
  const feedback = useScrollingStore((state) => state.feedback);
  const lastCorrectNote = useScrollingStore((state) => state.lastCorrectNote);
  const lastIncorrectNote = useScrollingStore((state) => state.lastIncorrectNote);
  const isPaused = useScrollingStore((state) => state.isPaused);
  const setPaused = useScrollingStore((state) => state.setPaused);

  const isScrolling = settings.gameMode === 'scrolling' || settings.gameMode === 'demo';

  useEffect(() => {
    if (!isScrolling) return;

    let lastTime = performance.now();
    let frameId: number;

    const loop = (now: number) => {
      const deltaTime = now - lastTime;
      lastTime = now;

      const storeState = useScrollingStore.getState();

      if (!storeState.isPaused) {
        const speedMap = { slow: 0.01, normal: 0.02, fast: 0.04 };
        updateNotePositions(deltaTime, speedMap[settings.tempo]);
      }

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(frameId);
  }, [isScrolling, settings.tempo, updateNotePositions]);

  return {
    scrollingNotes,
    hitNote,
    feedback,
    lastCorrectNote,
    lastIncorrectNote,
    isPaused,
    setPaused,
    currentNoteIndex: useScrollingStore((state) => state.currentNoteIndex),
    activeSong: useScrollingStore((state) => state.activeSong),
  };
};
