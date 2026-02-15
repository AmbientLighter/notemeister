import React from 'react';
import { Mic, Activity } from 'lucide-react';

interface MicStatusOverlayProps {
  isActive: boolean;
  detectedNote: string;
  error: string | null;
  onActivate: () => void;
}

const MicStatusOverlay: React.FC<MicStatusOverlayProps> = ({
  isActive,
  detectedNote,
  error,
  onActivate,
}) => {
  return (
    <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
      {!isActive ? (
        <button
          onClick={onActivate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg transition-all animate-pulse"
        >
          <Mic size={18} />
          <span className="text-sm font-bold uppercase tracking-tight">Activate Mic</span>
        </button>
      ) : (
        <div className="flex flex-col items-end">
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-indigo-100 dark:border-indigo-900/50 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-xl">
            <Activity className="text-indigo-500 animate-pulse" size={18} />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">
                Detected
              </span>
              <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 leading-none">
                {detectedNote}
              </span>
            </div>
          </div>
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
