import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { useTranslations } from '../hooks/useTranslations';

interface FinishSessionButtonProps {
  className?: string;
}

const FinishSessionButton: React.FC<FinishSessionButtonProps> = ({ className }) => {
  const { t } = useTranslations();
  const setScreen = useGameStore((state) => state.setScreen);
  const stats = useGameStore((state) => state.stats);

  const handleFinish = () => {
    if (stats.total < 3) {
      setScreen('setup');
    } else {
      setScreen('results');
    }
  };

  return (
    <button
      onClick={handleFinish}
      className={
        className ||
        'px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-semibold transition-colors'
      }
    >
      {t.finishSession}
    </button>
  );
};

export default FinishSessionButton;
