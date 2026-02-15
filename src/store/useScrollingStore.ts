import { create } from 'zustand';
import type { Note, NoteName, ScrollingNote } from '@/types';
import { generateRandomNote } from '@/utils/musicLogic';
import { audioEngine } from '@/utils/audio';
import { useGameStore } from './useGameStore';

interface ScrollingState {
  scrollingNotes: ScrollingNote[];
  missedNotes: number;
  lastSpawnTime: number;
  feedback: { type: 'correct' | 'incorrect'; message?: string } | null;
  lastCorrectNote: NoteName | null;
  lastIncorrectNote: NoteName | null;

  // Actions
  startGame: () => void;
  spawnNote: () => void;
  updateNotePositions: (deltaTime: number, speed: number) => void;
  hitNote: (
    selectedName: NoteName,
    translations: { correctAnswer: string; incorrectAnswer: string }
  ) => void;
  resetSession: () => void;
}

export const useScrollingStore = create<ScrollingState>((set, get) => ({
  scrollingNotes: [],
  missedNotes: 0,
  lastSpawnTime: 0,
  feedback: null,
  lastCorrectNote: null,
  lastIncorrectNote: null,

  resetSession: () =>
    set({
      scrollingNotes: [],
      missedNotes: 0,
      lastSpawnTime: 0,
      feedback: null,
      lastCorrectNote: null,
      lastIncorrectNote: null,
    }),

  startGame: () => {
    audioEngine.init();
    const { resetStats, setScreen } = useGameStore.getState();
    resetStats();
    setScreen('game');
    get().resetSession();
    get().spawnNote();
  },

  spawnNote: () => {
    const { settings } = useGameStore.getState();
    const { scrollingNotes } = get();
    const lastNote =
      scrollingNotes.length > 0 ? scrollingNotes[scrollingNotes.length - 1].note : undefined;
    const newNote = generateRandomNote(settings.activeNotes, lastNote);

    if (newNote) {
      const newNode = {
        id: Math.random().toString(36).substr(2, 9),
        note: newNote,
        x: 100,
        spawnedAt: Date.now(),
      };
      set({ scrollingNotes: [...scrollingNotes, newNode], lastSpawnTime: Date.now() });
    }
  },

  updateNotePositions: (deltaTime, speed) => {
    const { scrollingNotes, missedNotes } = get();
    const { recordTurn } = useGameStore.getState();

    let newMissed = missedNotes;
    const updatedNotes = scrollingNotes
      .map((n) => ({ ...n, x: n.x - speed * deltaTime }))
      .filter((n) => {
        if (n.x < 5) {
          newMissed++;
          recordTurn(n.note, 0, false);
          return false;
        }
        return true;
      });

    set({ scrollingNotes: updatedNotes, missedNotes: newMissed });
  },

  hitNote: (selectedName, t) => {
    const { scrollingNotes } = get();
    const { recordTurn, settings } = useGameStore.getState();

    if (scrollingNotes.length === 0) return;

    const targetNode = scrollingNotes.reduce((prev, curr) => (prev.x < curr.x ? prev : curr));
    if (targetNode.x > 80) return;

    const isCorrect = selectedName === targetNode.note.name;
    const timeTaken = Date.now() - targetNode.spawnedAt;

    recordTurn(targetNode.note, timeTaken, isCorrect);

    if (isCorrect) {
      audioEngine.playNote(targetNode.note, settings.instrument);
      set({
        scrollingNotes: scrollingNotes.filter((n) => n.id !== targetNode.id),
        lastCorrectNote: targetNode.note.name,
        feedback: { type: 'correct', message: t.correctAnswer },
      });
      setTimeout(() => set({ feedback: null }), 500);
    } else {
      set({
        lastIncorrectNote: selectedName,
        feedback: {
          type: 'incorrect',
          message: `${t.incorrectAnswer} ${targetNode.note.name}`,
        },
      });
      setTimeout(() => set({ feedback: null }), 1000);
    }
  },
}));
