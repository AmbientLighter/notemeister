import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useTranslations } from '@/hooks/useTranslations';

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
        'px-6 py-2.5 bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white rounded-full text-sm font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:scale-105 active:scale-95 transition-all transform flex items-center gap-2'
      }
    >
      <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
      {t.finishSession}
    </button>
  );
};

export default FinishSessionButton;
