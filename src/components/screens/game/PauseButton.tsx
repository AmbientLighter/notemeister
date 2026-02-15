import React from 'react';
import { Play } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

interface PauseButtonProps {
  isPaused: boolean;
  onToggle: () => void;
}

const PauseButton: React.FC<PauseButtonProps> = ({ isPaused, onToggle }) => {
  const { t } = useTranslations();
  return (
    <button
      onClick={onToggle}
      className={`px-4 py-2 rounded-full font-bold transition-all transform active:scale-95 flex items-center gap-2 ${
        isPaused
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
      }`}
    >
      {isPaused ? (
        <Play className="w-4 h-4 fill-current" />
      ) : (
        <div className="w-4 h-4 flex gap-1 justify-center items-center">
          <div className="w-1 h-3 bg-current rounded-full" />
          <div className="w-1 h-3 bg-current rounded-full" />
        </div>
      )}
      {isPaused ? t.resume : t.pause}
    </button>
  );
};

export default PauseButton;
