import { useState, useEffect } from 'react';

export const useTheme = () => {
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

    return {
        darkMode
    };
};
