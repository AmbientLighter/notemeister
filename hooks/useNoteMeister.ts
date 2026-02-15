import { useState, useCallback, useMemo, useEffect } from 'react';
import { GameSettings, GameStats, Note, NoteName, Language, ClefType, Screen, SortMethod } from '../types';
import { TRANSLATIONS, OCTAVE_RANGES, NOTE_NAMES } from '../constants';
import { generateRandomNote } from '../utils/musicLogic';
import { audioEngine } from '../utils/audio';

export const useNoteMeister = () => {
    const [screen, setScreen] = useState<Screen>('setup');
    const [darkMode, setDarkMode] = useState(() =>
        window.matchMedia('(prefers-color-scheme: dark)').matches
    );

    // Sync with system theme changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => setDarkMode(e.matches);

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Settings
    const [settings, setSettings] = useState<GameSettings>({
        language: 'en',
        clef: 'treble',
        activeNotes: [],
        tempo: 'normal',
        instrument: 'piano'
    });

    // Initialize active notes default on first load or clef change
    useEffect(() => {
        if (settings.activeNotes.length === 0) {
            const defaultOctaves = settings.clef === 'treble' ? [4] : [3];
            const newNotes: string[] = [];
            defaultOctaves.forEach(oct => {
                NOTE_NAMES.forEach(name => newNotes.push(`${name}${oct}`));
            });
            setSettings(prev => ({ ...prev, activeNotes: newNotes }));
        }
    }, [settings.clef]);

    // Game Data
    const [currentNote, setCurrentNote] = useState<Note | null>(null);
    const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect'; message: string } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [lastCorrectNote, setLastCorrectNote] = useState<NoteName | null>(null);
    const [lastIncorrectNote, setLastIncorrectNote] = useState<NoteName | null>(null);
    const [startTime, setStartTime] = useState<number>(0);
    const [sortMethod, setSortMethod] = useState<SortMethod>('difficulty');

    // Stats
    const [stats, setStats] = useState<GameStats>({
        correct: 0,
        total: 0,
        streak: 0,
        history: []
    });

    const t = TRANSLATIONS[settings.language];

    // --- Derived State ---
    const noteStats = useMemo(() => {
        const groups: Record<string, { totalTime: number; correct: number; count: number }> = {};

        stats.history.forEach(item => {
            const name = item.note.name;
            if (!groups[name]) groups[name] = { totalTime: 0, correct: 0, count: 0 };
            groups[name].totalTime += item.timeTaken;
            groups[name].correct += item.correct ? 1 : 0;
            groups[name].count += 1;
        });

        const rows = Object.entries(groups).map(([name, data]) => ({
            name,
            avgTime: data.totalTime / data.count,
            accuracy: (data.correct / data.count) * 100,
            count: data.count
        }));

        return rows.sort((a, b) => {
            if (sortMethod === 'name') return a.name.localeCompare(b.name);
            if (sortMethod === 'time') return b.avgTime - a.avgTime;
            if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
            return b.avgTime - a.avgTime;
        });
    }, [stats.history, sortMethod]);

    // --- Handlers ---
    const toggleDarkMode = () => setDarkMode(!darkMode);

    const handleLanguageChange = (lang: Language) => {
        setSettings(prev => ({ ...prev, language: lang }));
    };

    const handleClefChange = (clef: ClefType) => {
        setSettings(prev => ({
            ...prev,
            clef,
            activeNotes: []
        }));
    };

    const toggleOctaveGroup = (octave: number) => {
        setSettings(prev => {
            const octaveNotes = NOTE_NAMES.map(name => `${name}${octave}`);
            const allSelected = octaveNotes.every(k => prev.activeNotes.includes(k));

            let newActive = [...prev.activeNotes];

            if (allSelected) {
                newActive = newActive.filter(k => !octaveNotes.includes(k));
            } else {
                octaveNotes.forEach(k => {
                    if (!newActive.includes(k)) newActive.push(k);
                });
            }

            if (newActive.length === 0) return prev;
            return { ...prev, activeNotes: newActive };
        });
    };

    const toggleSingleNote = (key: string) => {
        setSettings(prev => {
            const current = prev.activeNotes;
            if (current.includes(key)) {
                if (current.length === 1) return prev;
                return { ...prev, activeNotes: current.filter(k => k !== key) };
            } else {
                return { ...prev, activeNotes: [...current, key] };
            }
        });
    };

    const nextTurn = useCallback((firstTurn = false) => {
        const newNote = generateRandomNote(
            settings.activeNotes,
            currentNote || undefined
        );
        setCurrentNote(newNote);
        setFeedback(null);
        setIsProcessing(false);
        setLastCorrectNote(null);
        setLastIncorrectNote(null);
        setStartTime(Date.now());

        if (newNote) {
            audioEngine.playNote(newNote, settings.instrument);
        }
    }, [settings.activeNotes, currentNote, settings.instrument]);

    const startGame = () => {
        audioEngine.init();
        setStats({ correct: 0, total: 0, streak: 0, history: [] });
        setScreen('game');
        nextTurn(true);
    };

    const handleNoteSelect = (selectedName: NoteName) => {
        if (isProcessing || !currentNote) return;
        setIsProcessing(true);

        const timeTaken = Date.now() - startTime;
        const isCorrect = selectedName === currentNote.name;

        setStats(prev => ({
            correct: prev.correct + (isCorrect ? 1 : 0),
            total: prev.total + 1,
            streak: isCorrect ? prev.streak + 1 : 0,
            history: [...prev.history, {
                note: currentNote,
                timeTaken,
                correct: isCorrect,
                timestamp: Date.now()
            }]
        }));

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
            setFeedback({ type: 'correct', message: t.correctAnswer });
            setLastCorrectNote(currentNote.name);
            setTimeout(() => {
                nextTurn();
            }, delayCorrect);
        } else {
            setFeedback({ type: 'incorrect', message: `${t.incorrectAnswer} ${currentNote.name}` });
            setLastIncorrectNote(selectedName);
            setLastCorrectNote(currentNote.name);
            setTimeout(() => {
                nextTurn();
            }, delayIncorrect);
        }
    };

    const finishGame = () => setScreen('results');

    const getOctaveStatus = (octave: number): 'full' | 'partial' | 'none' => {
        const octaveNotes = NOTE_NAMES.map(name => `${name}${octave}`);
        const selectedCount = octaveNotes.filter(k => settings.activeNotes.includes(k)).length;
        if (selectedCount === 7) return 'full';
        if (selectedCount > 0) return 'partial';
        return 'none';
    };

    return {
        screen,
        darkMode,
        settings,
        currentNote,
        feedback,
        isProcessing,
        lastCorrectNote,
        lastIncorrectNote,
        stats,
        noteStats,
        sortMethod,
        t,
        setScreen,
        setSettings,
        setSortMethod,
        toggleDarkMode,
        handleLanguageChange,
        handleClefChange,
        toggleOctaveGroup,
        toggleSingleNote,
        startGame,
        handleNoteSelect,
        finishGame,
        getOctaveStatus
    };
};
