import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Note, NoteName, StandardSettings } from '@/types';
import { generateRandomNote } from '@/utils/musicLogic';
import { audioEngine } from '@/utils/audio';
import { useGameStore } from './useGameStore';
import { NOTE_NAMES } from '@/constants';

interface StandardState {
  // Settings
  settings: StandardSettings;

  // Session State
  currentNote: Note | null;
  feedback: { type: 'correct' | 'incorrect'; message?: string } | null;
  isProcessing: boolean;
  lastCorrectNote: NoteName | null;
  lastIncorrectNote: NoteName | null;
  startTime: number;

  // Actions
  updateSettings: (settings: Partial<StandardSettings>) => void;
  toggleOctaveGroup: (octave: number) => void;
  toggleSingleNote: (key: string) => void;
  getOctaveStatus: (octave: number) => 'full' | 'partial' | 'none';
  initializeSettings: () => void;

  startGame: () => void;
  nextTurn: () => void;
  handleNoteSelect: (
    selectedName: NoteName,
    translations: { correctAnswer: string; incorrectAnswer: string }
  ) => void;
  resetSession: () => void;
}

const DEFAULT_SETTINGS: StandardSettings = {
  activeNotes: NOTE_NAMES.map((name) => `${name}4`),
  tempo: 'normal',
};

export const useStandardStore = create<StandardState>()(
  persist(
    (set, get) => ({
      // Settings
      settings: DEFAULT_SETTINGS,

      // Session State
      currentNote: null,
      feedback: null,
      isProcessing: false,
      lastCorrectNote: null,
      lastIncorrectNote: null,
      startTime: 0,

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      initializeSettings: () => {
        const { settings } = get();
        const { settings: globalSettings } = useGameStore.getState();
        if (settings.activeNotes.length === 0) {
          const defaultOctaves = globalSettings.clef === 'treble' ? [4] : [3, 4];
          const newNotes: string[] = [];
          for (const oct of defaultOctaves) {
            for (const name of NOTE_NAMES) {
              newNotes.push(`${name}${oct}`);
            }
          }
          get().updateSettings({ activeNotes: newNotes });
        }
      },

      toggleOctaveGroup: (octave) => {
        const { settings } = get();
        const octaveNotes = NOTE_NAMES.map((name) => `${name}${octave}`);
        const allSelected = octaveNotes.every((k) => settings.activeNotes.includes(k));

        let newActive = [...settings.activeNotes];

        if (allSelected) {
          newActive = newActive.filter((k) => !octaveNotes.includes(k));
        } else {
          for (const k of octaveNotes) {
            if (!newActive.includes(k)) newActive.push(k);
          }
        }

        if (newActive.length > 0) {
          get().updateSettings({ activeNotes: newActive });
        }
      },

      toggleSingleNote: (key) => {
        const { settings } = get();
        const current = settings.activeNotes;
        if (current.includes(key)) {
          if (current.length > 1) {
            get().updateSettings({ activeNotes: current.filter((k) => k !== key) });
          }
        } else {
          get().updateSettings({ activeNotes: [...current, key] });
        }
      },

      getOctaveStatus: (octave) => {
        const { settings } = get();
        const octaveNotes = NOTE_NAMES.map((name) => `${name}${octave}`);
        const selectedCount = octaveNotes.filter((k) => settings.activeNotes.includes(k)).length;
        if (selectedCount === 7) return 'full';
        if (selectedCount > 0) return 'partial';
        return 'none';
      },

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
        const { settings } = get();
        const { settings: globalSettings } = useGameStore.getState();
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
          audioEngine.playNote(newNote, globalSettings.instrument);
        }
      },

      handleNoteSelect: (selectedName, t) => {
        const { isProcessing, currentNote, startTime, settings } = get();
        const { recordTurn } = useGameStore.getState();

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
    }),
    {
      name: 'note-meister-standard-storage',
      partialize: (state) => ({
        settings: state.settings,
      }),
    }
  )
);
