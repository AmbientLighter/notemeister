import { create } from 'zustand';
import type { Note, NoteName, ScrollingNote, Song } from '@/types';
import { generateRandomNote, getDurationMs } from '@/utils/musicLogic';
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
  songNextNoteTime: number;
  demoActiveNote: Note | null;
  currentNoteIndex: number; // Added for OSMD cursor tracking

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
  songNextNoteTime: 0,
  demoActiveNote: null,
  currentNoteIndex: 0,

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
      songNextNoteTime: 0,
      demoActiveNote: null,
      currentNoteIndex: 0,
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

    set({
      activeSong: selectedSong,
      startTime: Date.now(),
      songNextNoteTime: Date.now() + 1000, // Start first note after 1s
    });

    if (!selectedSong) {
      get().spawnNote();
    }
  },

  spawnNote: () => {
    const { settings } = useGameStore.getState();
    const { scrollingNotes, activeSong, songCurrentNoteIndex, songNextNoteTime } = get();

    let noteToSpawn: Note | undefined;
    let keys: string[] = [];
    let duration: string = 'q';
    let nextSpawnDelay = 1000; // Default for random

    if (activeSong) {
      if (songCurrentNoteIndex < activeSong.notes.length) {
        const songNote = activeSong.notes[songCurrentNoteIndex];
        noteToSpawn = songNote.note;
        keys = songNote.keys;
        duration = songNote.duration;

        // Calculate when the NEXT note should spawn based on current note duration
        nextSpawnDelay = getDurationMs(duration, activeSong.bpm);

        set({
          songCurrentNoteIndex: songCurrentNoteIndex + 1,
          songNextNoteTime: songNextNoteTime + nextSpawnDelay,
        });
      }
    } else {
      const lastNote =
        scrollingNotes.length > 0 ? scrollingNotes[scrollingNotes.length - 1].note : undefined;
      noteToSpawn = generateRandomNote(settings.activeNotes, lastNote);
      if (noteToSpawn) {
        keys = [`${noteToSpawn.name.toLowerCase()}/${noteToSpawn.octave}`];
        duration = 'q';
      }
      set({ lastSpawnTime: Date.now() });
    }

    if (noteToSpawn) {
      const newNode: ScrollingNote = {
        id: Math.random().toString(36).substr(2, 9),
        note: noteToSpawn,
        keys,
        duration,
        x: 100,
        spawnedAt: activeSong ? songNextNoteTime : Date.now(),
      };
      set({ scrollingNotes: [...scrollingNotes, newNode] });
    }
  },

  updateNotePositions: (deltaTime: number, speed: number) => {
    const {
      scrollingNotes,
      missedNotes,
      activeSong,
      songCurrentNoteIndex,
      songNextNoteTime,
      currentNoteIndex,
      isPaused,
    } = get();
    if (isPaused) return;

    const { recordTurn, settings } = useGameStore.getState();

    // Spawn song notes based on time
    if (
      activeSong &&
      songCurrentNoteIndex < activeSong.notes.length &&
      Date.now() >= songNextNoteTime
    ) {
      get().spawnNote();
    }

    // Spawn random notes based on overlap/distance (simplified)
    const currentNotes = get().scrollingNotes;
    if (
      !activeSong &&
      (currentNotes.length === 0 || currentNotes[currentNotes.length - 1].x < 70)
    ) {
      get().spawnNote();
    }

    // Refresh notes list before updating positions
    const finalNotes = get().scrollingNotes;
    let newMissed = missedNotes;
    const updatedNotes = finalNotes
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

    // Demo Mode: Auto-play
    if (settings.gameMode === 'demo') {
      if (activeSong) {
        // OSMD Mode: Auto-advance based on timing
        if (Date.now() >= songNextNoteTime) {
          const allNotes = activeSong.notes;
          if (currentNoteIndex < allNotes.length) {
            const targetNote = allNotes[currentNoteIndex];
            get().hitNote(targetNote.note.name, {
              correctAnswer: '...',
              incorrectAnswer: '...',
            });

            // Calculate timing for SUBSEQUENT note
            // We use the duration of the note we just "hit"
            const durationMs = getDurationMs(targetNote.duration, activeSong.bpm);
            set({ songNextNoteTime: Date.now() + durationMs });
          }
        }
      } else if (updatedNotes.length > 0) {
        // Random Scrolling Mode: Auto-play based on 'x' position
        const leftmostNote = updatedNotes.reduce((prev, curr) => (prev.x < curr.x ? prev : curr));
        if (leftmostNote.x < 15) {
          if (
            !get().demoActiveNote ||
            get().demoActiveNote.absoluteIndex !== leftmostNote.note.absoluteIndex
          ) {
            get().hitNote(leftmostNote.note.name, {
              correctAnswer: '...',
              incorrectAnswer: '...',
            });
            set({ demoActiveNote: leftmostNote.note });
            setTimeout(() => set({ demoActiveNote: null }), 300);
          }
        }
      }
    }
  },

  hitNote: (selectedName, t) => {
    const { scrollingNotes, activeSong, songCurrentNoteIndex, currentNoteIndex } = get();
    const { recordTurn, settings } = useGameStore.getState();

    if (activeSong) {
      // In Song Mode with OSMD, we use currentNoteIndex to find the target note
      const allNotes = activeSong.notes;
      if (currentNoteIndex >= allNotes.length) return;

      const targetSongNote = allNotes[currentNoteIndex];
      const isCorrect = selectedName === targetSongNote.note.name;

      recordTurn(targetSongNote.note, 0, isCorrect);

      if (isCorrect) {
        audioEngine.playNote(targetSongNote.note, settings.instrument);
        set({
          currentNoteIndex: currentNoteIndex + 1,
          lastCorrectNote: targetSongNote.note.name,
          feedback: { type: 'correct', message: t.correctAnswer },
        });
        setTimeout(() => set({ feedback: null }), 500);

        if (currentNoteIndex + 1 >= allNotes.length) {
          setTimeout(() => {
            const screen = settings.gameMode === 'demo' ? 'setup' : 'results';
            useGameStore.getState().setScreen(screen);
          }, 1500);
        }
      } else {
        set({
          lastIncorrectNote: selectedName,
          feedback: {
            type: 'incorrect',
            message: `${t.incorrectAnswer} ${targetSongNote.note.name}`,
          },
        });
        setTimeout(() => set({ feedback: null }), 1000);
      }
      return;
    }

    // Fallback for random scrolling (will still use scrollingNotes for now)
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
