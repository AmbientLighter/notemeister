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
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-start sm:items-center justify-center p-0 sm:p-4 transition-colors duration-300">
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
            clef={settings.clef}
            darkMode={darkMode}
            setSortMethod={setSortMethod}
            setScreen={setScreen}
          />
        )}
      </div>
    </div>
  );
};

export default App;