import React from 'react';
import { Mic, Activity } from 'lucide-react';

interface MicStatusOverlayProps {
  isActive: boolean;
  detectedNote: string;
  error: string | null;
  onActivate: () => void;
}

import { useTranslations } from '@/hooks/useTranslations';

const MicStatusOverlay: React.FC<MicStatusOverlayProps> = ({
  isActive,
  detectedNote,
  error,
  onActivate,
}) => {
  const { t } = useTranslations();

  return (
    <div className="flex flex-col items-end gap-1">
      {!isActive ? (
        <button
          onClick={onActivate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-full flex items-center gap-2 shadow-md transition-all active:scale-95"
        >
          <Mic size={16} />
          <span className="text-xs font-bold uppercase tracking-tight">{t.activateMic}</span>
        </button>
      ) : (
        <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-indigo-100 dark:border-indigo-900/40 px-3 py-1.5 rounded-full shadow-lg">
          <Activity className="text-indigo-500 animate-pulse" size={16} />
          {detectedNote !== '-' ? (
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">{t.detected}</span>
              <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                {detectedNote}
              </span>
            </div>
          ) : (
            <span className="text-[10px] uppercase font-bold text-slate-400 animate-pulse">
              ...
            </span>
          )}
        </div>
      )}
      {error && (
        <span className="text-[10px] text-red-500 font-bold bg-white/80 dark:bg-red-950/30 px-2 py-1 rounded-md">
          {error}
        </span>
      )}
    </div>
  );
};

export default MicStatusOverlay;
