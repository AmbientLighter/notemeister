import React from 'react';
import { NOTE_NAMES } from '../constants';
import { NoteName } from '../types';

interface KeyboardProps {
  onNoteSelect: (note: NoteName) => void;
  disabled: boolean;
  lastCorrectNote: NoteName | null;
  lastIncorrectNote: NoteName | null;
}

const Keyboard: React.FC<KeyboardProps> = ({ 
  onNoteSelect, 
  disabled, 
  lastCorrectNote, 
  lastIncorrectNote 
}) => {
  return (
    <div className="grid grid-cols-7 gap-2 md:gap-4 w-full max-w-2xl mx-auto p-4">
      {NOTE_NAMES.map((note) => {
        let btnClass = "bg-white text-slate-800 border-b-4 border-slate-300 hover:bg-slate-50 hover:border-slate-400 active:border-b-0 active:translate-y-1";
        
        if (disabled) {
            if (note === lastCorrectNote) {
                btnClass = "bg-green-500 text-white border-b-4 border-green-700 shadow-[0_0_15px_rgba(34,197,94,0.5)]";
            } else if (note === lastIncorrectNote) {
                btnClass = "bg-red-500 text-white border-b-4 border-red-700 opacity-60";
            } else {
                btnClass = "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed";
            }
        }

        return (
          <button
            key={note}
            onClick={() => !disabled && onNoteSelect(note)}
            disabled={disabled}
            className={`
              h-16 md:h-24 rounded-lg font-bold text-xl md:text-2xl transition-all duration-100 select-none
              flex items-center justify-center shadow-sm
              ${btnClass}
            `}
          >
            {note}
          </button>
        );
      })}
    </div>
  );
};

export default Keyboard;
