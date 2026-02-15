import React from 'react';
import { useNoteMeister } from './hooks/useNoteMeister';
import SetupScreen from './components/SetupScreen';
import GameScreen from './components/GameScreen';
import ResultsScreen from './components/ResultsScreen';

const App: React.FC = () => {
  const {
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
  } = useNoteMeister();

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 transition-colors duration-300">
        {/* Global Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="fixed top-4 right-4 p-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full shadow-lg z-50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? (
            // Sun Icon
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
            </svg>
          ) : (
            // Moon Icon
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
            </svg>
          )}
        </button>

        {screen === 'setup' && (
          <SetupScreen
            settings={settings}
            darkMode={darkMode}
            t={t}
            handleLanguageChange={handleLanguageChange}
            handleClefChange={handleClefChange}
            toggleSingleNote={toggleSingleNote}
            toggleOctaveGroup={toggleOctaveGroup}
            getOctaveStatus={getOctaveStatus}
            setSettings={setSettings}
            startGame={startGame}
          />
        )}
        {screen === 'game' && (
          <GameScreen
            settings={settings}
            stats={stats}
            currentNote={currentNote}
            feedback={feedback}
            isProcessing={isProcessing}
            lastCorrectNote={lastCorrectNote}
            lastIncorrectNote={lastIncorrectNote}
            t={t}
            darkMode={darkMode}
            handleNoteSelect={handleNoteSelect}
            finishGame={finishGame}
          />
        )}
        {screen === 'results' && (
          <ResultsScreen
            stats={stats}
            noteStats={noteStats}
            sortMethod={sortMethod}
            t={t}
            setSortMethod={setSortMethod}
            setScreen={setScreen}
          />
        )}
      </div>
    </div>
  );
};

export default App;