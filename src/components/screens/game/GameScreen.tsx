import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import StatsHeader from './StatsHeader';
import StandardGame from './StandardGame';
import ScrollingGame from './ScrollingGame';

const GameScreen: React.FC = () => {
  const gameMode = useGameStore((state) => state.settings.gameMode);

  return (
    <div className="flex flex-col h-full w-full sm:max-w-4xl sm:mx-auto items-center">
      <StatsHeader />
      {gameMode === 'standard' ? <StandardGame /> : <ScrollingGame />}
    </div>
  );
};

export default GameScreen;
