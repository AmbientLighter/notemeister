import { useState, useCallback, useMemo } from 'react';
import { GameSettings, GameStats, Note, NoteName, SortMethod } from '../types';
import { generateRandomNote } from '../utils/musicLogic';
import { audioEngine } from '../utils/audio';

export const useGameState = (settings: GameSettings, t: any) => {
    const [currentNote, setCurrentNote] = useState<Note | null>(null);
    const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect'; message: string } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [lastCorrectNote, setLastCorrectNote] = useState<NoteName | null>(null);
    const [lastIncorrectNote, setLastIncorrectNote] = useState<NoteName | null>(null);
    const [startTime, setStartTime] = useState<number>(0);
    const [sortMethod, setSortMethod] = useState<SortMethod>('difficulty');
    const [stats, setStats] = useState<GameStats>({
        correct: 0,
        total: 0,
        streak: 0,
        history: []
    });

    const noteStats = useMemo(() => {
        const groups: Record<string, { totalTime: number; correct: number; count: number }> = {};

        stats.history.forEach(item => {
            const id = `${item.note.name}${item.note.octave}`;
            if (!groups[id]) groups[id] = { totalTime: 0, correct: 0, count: 0 };
            groups[id].totalTime += item.timeTaken;
            groups[id].correct += item.correct ? 1 : 0;
            groups[id].count += 1;
        });

        const rows = Object.entries(groups).map(([id, data]) => ({
            name: id,
            avgTime: data.totalTime / data.count,
            accuracy: (data.correct / data.count) * 100,
            count: data.count
        }));

        return rows.sort((a, b) => {
            if (sortMethod === 'name') return a.name.localeCompare(b.name, undefined, { numeric: true });
            if (sortMethod === 'time') return b.avgTime - a.avgTime;
            if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
            return b.avgTime - a.avgTime;
        });
    }, [stats.history, sortMethod]);

    const nextTurn = useCallback(() => {
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
        nextTurn();
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

    return {
        currentNote,
        feedback,
        isProcessing,
        lastCorrectNote,
        lastIncorrectNote,
        stats,
        noteStats,
        sortMethod,
        setSortMethod,
        startGame,
        handleNoteSelect
    };
};
