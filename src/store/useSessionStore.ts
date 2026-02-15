import { create } from 'zustand';
import type { Note, NoteName } from '../types';
import { generateRandomNote } from '../utils/musicLogic';
import { audioEngine } from '../utils/audio';
import { useGameStore } from './useGameStore';

interface SessionState {
  // Session State
  currentNote: Note | null;
  feedback: { type: 'correct' | 'incorrect'; message?: string } | null;
  isProcessing: boolean;
  lastCorrectNote: NoteName | null;
  lastIncorrectNote: NoteName | null;
  startTime: number;

  // Actions
  startGame: () => void;
  nextTurn: () => void;
  handleNoteSelect: (
    selectedName: NoteName,
    translations: { correctAnswer: string; incorrectAnswer: string }
  ) => void;
  resetSession: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  currentNote: null,
  feedback: null,
  isProcessing: false,
  lastCorrectNote: null,
  lastIncorrectNote: null,
  startTime: 0,

  resetSession: () =>
    set({
      currentNote: null,
      feedback: null,
      isProcessing: false,
      lastCorrectNote: null,
      lastIncorrectNote: null,
      startTime: 0,
    }),

  startGame: () => {
    audioEngine.init();
    const { resetStats, setScreen } = useGameStore.getState();
    resetStats();
    setScreen('game');
    get().resetSession();
    get().nextTurn();
  },

  nextTurn: () => {
    const { settings } = useGameStore.getState();
    const { currentNote } = get();

    const newNote = generateRandomNote(settings.activeNotes, currentNote || undefined);

    set({
      currentNote: newNote,
      feedback: null,
      isProcessing: false,
      lastCorrectNote: null,
      lastIncorrectNote: null,
      startTime: Date.now(),
    });

    if (newNote) {
      audioEngine.playNote(newNote, settings.instrument);
    }
  },

  handleNoteSelect: (selectedName, t) => {
    const { isProcessing, currentNote, startTime } = get();
    const { settings, recordTurn } = useGameStore.getState();

    if (isProcessing || !currentNote) return;

    set({ isProcessing: true });

    const timeTaken = Date.now() - startTime;
    const isCorrect = selectedName === currentNote.name;

    // Update global stats
    recordTurn(currentNote, timeTaken, isCorrect);

    // Timing logic for feedback
    let delayCorrect = 300;
    let delayIncorrect = 1200;

    if (settings.tempo === 'fast') {
      delayCorrect = 0;
      delayIncorrect = 500;
    } else if (settings.tempo === 'slow') {
      delayCorrect = 1000;
      delayIncorrect = 2000;
    }

    if (isCorrect) {
      set({
        feedback: { type: 'correct', message: t.correctAnswer },
        lastCorrectNote: currentNote.name,
      });
      setTimeout(() => {
        get().nextTurn();
      }, delayCorrect);
    } else {
      // Haptic Feedback for incorrect answers
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([50]);
      }
      set({
        feedback: { type: 'incorrect', message: `${t.incorrectAnswer} ${currentNote.name}` },
        lastIncorrectNote: selectedName,
        lastCorrectNote: currentNote.name,
      });
      setTimeout(() => {
        get().nextTurn();
      }, delayIncorrect);
    }
  },
}));
