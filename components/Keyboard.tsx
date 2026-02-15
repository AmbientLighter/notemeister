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
    <div className="flex flex-wrap md:grid md:grid-cols-7 gap-3 md:gap-4 w-full max-w-3xl mx-auto p-4 justify-center">
      {NOTE_NAMES.map((note) => {
        // Default (Light/Dark)
        let btnClass = "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 border-b-4 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 hover:border-slate-400 dark:hover:border-slate-500 active:border-b-0 active:translate-y-1";
        
        if (disabled) {
            if (note === lastCorrectNote) {
                // Correct
                btnClass = "bg-green-500 dark:bg-green-600 text-white border-b-4 border-green-700 dark:border-green-800 shadow-[0_0_15px_rgba(34,197,94,0.5)]";
            } else if (note === lastIncorrectNote) {
                // Incorrect
                btnClass = "bg-red-500 dark:bg-red-600 text-white border-b-4 border-red-700 dark:border-red-800 opacity-60";
            } else {
                // Disabled Standard
                btnClass = "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-700 cursor-not-allowed";
            }
        }

        return (
          <button
            key={note}
            onClick={() => !disabled && onNoteSelect(note)}
            disabled={disabled}
            className={`
              h-24 md:h-32 
              w-[22%] md:w-auto flex-grow md:flex-grow-0
              rounded-xl md:rounded-2xl
              font-bold text-3xl md:text-5xl 
              transition-all duration-100 select-none
              flex items-center justify-center shadow-md
              active:scale-95
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