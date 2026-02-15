import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useTheme } from '@/hooks/useTheme';
import SetupScreen from '@/components/screens/setup/SetupScreen';
import GameScreen from '@/components/screens/game/GameScreen';
import ResultsScreen from '@/components/screens/results/ResultsScreen';

const SCREEN_COMPONENTS: Record<string, React.FC> = {
  setup: SetupScreen,
  game: GameScreen,
  results: ResultsScreen,
};

const App: React.FC = () => {
  const { darkMode } = useTheme();
  const screen = useGameStore((state) => state.screen);

  const ActiveScreen = SCREEN_COMPONENTS[screen] || SetupScreen;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-start sm:items-center justify-center p-0 sm:p-4 transition-colors duration-300">
      <ActiveScreen />
    </div>
  );
};

export default App;
