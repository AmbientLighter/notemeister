import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    GameSettings,
    GameStats,
    Note,
    NoteName,
    Screen,
    SortMethod,
    Language,
    ClefType
} from '../types';
import { generateRandomNote } from '../utils/musicLogic';
import { audioEngine } from '../utils/audio';
import { NOTE_NAMES } from '../constants';



interface GameState {
    // Navigation
    screen: Screen;
    settings: GameSettings;
    stats: GameStats;

    // Actions
    setScreen: (screen: Screen) => void;
    updateSettings: (settings: Partial<GameSettings>) => void;
    handleClefChange: (clef: ClefType) => void;
    toggleOctaveGroup: (octave: number) => void;
    toggleSingleNote: (key: string) => void;
    getOctaveStatus: (octave: number) => 'full' | 'partial' | 'none';
    initializeSettings: () => void;

    // Stats Management
    resetStats: () => void;
    recordTurn: (note: Note, timeTaken: number, correct: boolean) => void;

    // Selectors
    getNoteStats: () => any[];
}

const DEFAULT_SETTINGS: GameSettings = {
    clef: 'treble',
    activeNotes: NOTE_NAMES.map(name => `${name}4`),
    tempo: 'normal',
    instrument: 'piano',
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
                history: []
            },

            // Actions
            setScreen: (screen) => set({ screen }),

            updateSettings: (newSettings) => set((state) => ({
                settings: { ...state.settings, ...newSettings }
            })),

            handleClefChange: (clef) => {
                set((state) => ({
                    settings: { ...state.settings, clef, activeNotes: [] }
                }));
                get().initializeSettings();
            },

            initializeSettings: () => {
                const { settings } = get();
                if (settings.activeNotes.length === 0) {
                    const defaultOctaves = settings.clef === 'treble' ? [4] : [3, 4];
                    const newNotes: string[] = [];
                    defaultOctaves.forEach(oct => {
                        NOTE_NAMES.forEach(name => newNotes.push(`${name}${oct}`));
                    });
                    get().updateSettings({ activeNotes: newNotes });
                }
            },

            toggleOctaveGroup: (octave) => {
                const { settings } = get();
                const octaveNotes = NOTE_NAMES.map(name => `${name}${octave}`);
                const allSelected = octaveNotes.every(k => settings.activeNotes.includes(k));

                let newActive = [...settings.activeNotes];

                if (allSelected) {
                    newActive = newActive.filter(k => !octaveNotes.includes(k));
                } else {
                    octaveNotes.forEach(k => {
                        if (!newActive.includes(k)) newActive.push(k);
                    });
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
                        get().updateSettings({ activeNotes: current.filter(k => k !== key) });
                    }
                } else {
                    get().updateSettings({ activeNotes: [...current, key] });
                }
            },

            getOctaveStatus: (octave) => {
                const { settings } = get();
                const octaveNotes = NOTE_NAMES.map(name => `${name}${octave}`);
                const selectedCount = octaveNotes.filter(k => settings.activeNotes.includes(k)).length;
                if (selectedCount === 7) return 'full';
                if (selectedCount > 0) return 'partial';
                return 'none';
            },

            resetStats: () => set({
                stats: { correct: 0, total: 0, streak: 0, history: [] }
            }),

            recordTurn: (note, timeTaken, correct) => set((state) => ({
                stats: {
                    correct: state.stats.correct + (correct ? 1 : 0),
                    total: state.stats.total + 1,
                    streak: correct ? state.stats.streak + 1 : 0,
                    history: [...state.stats.history, {
                        note,
                        timeTaken,
                        correct,
                        timestamp: Date.now()
                    }]
                }
            })),

            getNoteStats: () => {
                const { stats } = get();
                const groups: Record<string, { totalTime: number; correct: number; count: number }> = {};

                stats.history.forEach(item => {
                    const id = `${item.note.name}${item.note.octave}`;
                    if (!groups[id]) groups[id] = { totalTime: 0, correct: 0, count: 0 };
                    groups[id].totalTime += item.timeTaken;
                    groups[id].correct += item.correct ? 1 : 0;
                    groups[id].count += 1;
                });

                return Object.entries(groups).map(([id, data]) => ({
                    name: id,
                    avgTime: data.totalTime / data.count,
                    accuracy: (data.correct / data.count) * 100,
                    count: data.count
                }));
            },
        }),
        {
            name: 'note-meister-storage',
            partialize: (state) => ({
                settings: state.settings,
                stats: state.stats,
                screen: state.screen
            }),
        }
    )
);
