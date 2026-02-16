import { create } from 'zustand';
import type { Note, NoteName, ScrollingNote, Song } from '@/types';
import { generateRandomNote } from '@/utils/musicLogic';
import { audioEngine } from '@/utils/audio';
import { useGameStore } from './useGameStore';
import { SONGS } from '@/data/songs';

interface ScrollingState {
  scrollingNotes: ScrollingNote[];
  missedNotes: number;
  lastSpawnTime: number;
  feedback: { type: 'correct' | 'incorrect'; message?: string } | null;
  lastCorrectNote: NoteName | null;
  lastIncorrectNote: NoteName | null;
  isPaused: boolean;
  activeSong: Song | null;
  songCurrentNoteIndex: number;
  startTime: number;

  // Actions
  startGame: () => void;
  spawnNote: () => void;
  updateNotePositions: (deltaTime: number, speed: number) => void;
  hitNote: (
    selectedName: NoteName,
    translations: { correctAnswer: string; incorrectAnswer: string }
  ) => void;
  resetSession: () => void;
  setPaused: (paused: boolean) => void;
}

export const useScrollingStore = create<ScrollingState>((set, get) => ({
  scrollingNotes: [],
  missedNotes: 0,
  lastSpawnTime: 0,
  feedback: null,
  lastCorrectNote: null,
  lastIncorrectNote: null,
  isPaused: false,
  activeSong: null,
  songCurrentNoteIndex: 0,
  startTime: 0,

  resetSession: () =>
    set({
      scrollingNotes: [],
      missedNotes: 0,
      lastSpawnTime: 0,
      feedback: null,
      lastCorrectNote: null,
      lastIncorrectNote: null,
      isPaused: false,
      activeSong: null,
      songCurrentNoteIndex: 0,
      startTime: 0,
    }),

  setPaused: (paused) => set({ isPaused: paused }),

  startGame: () => {
    audioEngine.init();
    const { settings, resetStats, setScreen } = useGameStore.getState();
    resetStats();
    setScreen('game');
    get().resetSession();

    const selectedSong = settings.selectedSongId
      ? SONGS.find((s) => s.id === settings.selectedSongId) || null
      : null;

    set({ activeSong: selectedSong, startTime: Date.now() });

    if (!selectedSong) {
      get().spawnNote();
    }
  },

  spawnNote: () => {
    const { settings } = useGameStore.getState();
    const { scrollingNotes, activeSong, songCurrentNoteIndex } = get();

    let newNote: Note | undefined;

    if (activeSong) {
      if (songCurrentNoteIndex < activeSong.notes.length) {
        newNote = activeSong.notes[songCurrentNoteIndex].note;
        set({ songCurrentNoteIndex: songCurrentNoteIndex + 1 });
      }
    } else {
      const lastNote =
        scrollingNotes.length > 0 ? scrollingNotes[scrollingNotes.length - 1].note : undefined;
      newNote = generateRandomNote(settings.activeNotes, lastNote);
    }

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

  updateNotePositions: (deltaTime: number, speed: number) => {
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

    // Auto-finish song if all notes are processed
    const activeSong = get().activeSong;
    if (
      activeSong &&
      get().songCurrentNoteIndex >= activeSong.notes.length &&
      updatedNotes.length === 0
    ) {
      setTimeout(() => {
        useGameStore.getState().setScreen('results');
      }, 1500); // Small delay for the last note feedback
    }
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
      const remainingNotes = scrollingNotes.filter((n) => n.id !== targetNode.id);
      set({
        scrollingNotes: remainingNotes,
        lastCorrectNote: targetNode.note.name,
        feedback: { type: 'correct', message: t.correctAnswer },
      });
      setTimeout(() => set({ feedback: null }), 500);

      // Auto-finish song if all notes are processed
      const activeSong = get().activeSong;
      if (
        activeSong &&
        get().songCurrentNoteIndex >= activeSong.notes.length &&
        remainingNotes.length === 0
      ) {
        setTimeout(() => {
          useGameStore.getState().setScreen('results');
        }, 1500);
      }
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
