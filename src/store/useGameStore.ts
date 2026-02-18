import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { NOTE_NAMES } from '@/constants';
import type { ClefType, GameSettings, GameStats, Note, Screen, GlobalSettings } from '@/types';

interface GameState {
  // Navigation
  screen: Screen;
  settings: GameSettings;
  stats: GameStats;

  // Actions
  setScreen: (screen: Screen) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  handleClefChange: (clef: ClefType) => void;

  // Stats Management
  resetStats: () => void;
  recordTurn: (note: Note, timeTaken: number, correct: boolean) => void;
}

const DEFAULT_SETTINGS: GameSettings = {
  clef: 'treble',
  instrument: 'piano',
  inputMode: 'keyboard',
  gameMode: 'standard',
  language: 'en',
  theme: 'system',
  standard: {
    activeNotes: NOTE_NAMES.map((name) => `${name}4`),
    tempo: 'normal',
  },
  scrolling: {
    selectedSongId: null,
    tempo: 'normal',
  },
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // initial UI state
      screen: 'setup',

      // Persisted Settings
      settings: DEFAULT_SETTINGS,

      // Stats
      stats: {
        correct: 0,
        total: 0,
        streak: 0,
        history: [],
      },

      // Actions
      setScreen: (screen) => set({ screen }),

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      handleClefChange: (clef) => {
        set((state) => ({
          settings: { ...state.settings, clef },
        }));
      },

      resetStats: () =>
        set({
          stats: { correct: 0, total: 0, streak: 0, history: [] },
        }),

      recordTurn: (note, timeTaken, correct) =>
        set((state) => ({
          stats: {
            correct: state.stats.correct + (correct ? 1 : 0),
            total: state.stats.total + 1,
            streak: correct ? state.stats.streak + 1 : 0,
            history: [
              ...state.stats.history,
              {
                correct,
                note,
                timeTaken,
                timestamp: Date.now(),
              },
            ],
          },
        })),
    }),
    {
      name: 'note-meister-storage',
      version: 2,
      partialize: (state) => ({
        screen: state.screen,
        settings: {
          clef: state.settings.clef,
          instrument: state.settings.instrument,
          inputMode: state.settings.inputMode,
          language: state.settings.language,
          theme: state.settings.theme,
          gameMode: state.settings.gameMode,
        },
        stats: state.stats,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as GameState;
        return {
          ...currentState,
          ...persisted,
          settings: {
            ...DEFAULT_SETTINGS,
            ...persisted.settings,
            standard: {
              ...DEFAULT_SETTINGS.standard,
              ...(persisted.settings?.standard || {}),
            },
            scrolling: {
              ...DEFAULT_SETTINGS.scrolling,
              ...(persisted.settings?.scrolling || {}),
            },
          },
          stats: persisted.stats || currentState.stats,
        };
      },
    }
  )
);
