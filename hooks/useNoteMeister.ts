import { useState } from 'react';
import { Screen } from '../types';
import { TRANSLATIONS } from '../constants';
import { useTheme } from './useTheme';
import { useSettings } from './useSettings';
import { useGameState } from './useGameState';

export const useNoteMeister = () => {
    const [screen, setScreen] = useState<Screen>('setup');

    // 1. Theme Management
    const { darkMode, toggleDarkMode } = useTheme();

    // 2. Settings Management
    const {
        settings,
        setSettings,
        handleLanguageChange,
        handleClefChange,
        toggleOctaveGroup,
        toggleSingleNote,
        getOctaveStatus
    } = useSettings();

    const t = TRANSLATIONS[settings.language];

    // 3. Game State Management
    const {
        currentNote,
        feedback,
        isProcessing,
        lastCorrectNote,
        lastIncorrectNote,
        stats,
        noteStats,
        sortMethod,
        setSortMethod,
        startGame: startGameState,
        handleNoteSelect
    } = useGameState(settings, t);

    // Orchestration Handlers
    const startGame = () => {
        setScreen('game');
        startGameState();
    };

    const finishGame = () => setScreen('results');

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
