import { useState, useEffect } from 'react';
import { GameSettings, Language, ClefType } from '../types';
import { NOTE_NAMES } from '../constants';

const detectLanguage = (): Language => {
    const browserLang = (navigator.language || (navigator as any).userLanguage || 'en').split('-')[0];
    const supported: Language[] = ['en', 'ru', 'uk', 'et'];
    return supported.includes(browserLang as Language) ? (browserLang as Language) : 'en';
};

export const useSettings = () => {
    const [settings, setSettings] = useState<GameSettings>({
        language: detectLanguage(),
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

    const getOctaveStatus = (octave: number): 'full' | 'partial' | 'none' => {
        const octaveNotes = NOTE_NAMES.map(name => `${name}${octave}`);
        const selectedCount = octaveNotes.filter(k => settings.activeNotes.includes(k)).length;
        if (selectedCount === 7) return 'full';
        if (selectedCount > 0) return 'partial';
        return 'none';
    };

    return {
        settings,
        setSettings,
        handleLanguageChange,
        handleClefChange,
        toggleOctaveGroup,
        toggleSingleNote,
        getOctaveStatus
    };
};
