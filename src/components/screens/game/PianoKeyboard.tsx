import React, { useMemo } from 'react';
import type { NoteName } from '@/types';
import { useGameStore } from '@/store/useGameStore';
import { audioEngine } from '@/utils/audio';

interface PianoKeyboardProps {
  onNote: (note: NoteName) => void;
  activeNotes?: string[]; // Optional to highlight currently played notes
}

const PianoKeyboard: React.FC<PianoKeyboardProps> = ({ onNote }) => {
  const settings = useGameStore((state) => state.settings);
  const { instrument } = settings;

  // Define keys for approximately 2 octaves (matching typical staff range)
  // C3 to B4
  const keys = useMemo(() => {
    const noteNames: NoteName[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const allKeys: { name: NoteName; octave: number; isBlack: boolean }[] = [];

    [3, 4].forEach((octave) => {
      noteNames.forEach((name) => {
        allKeys.push({ name, octave, isBlack: false });
        // Add black keys after C, D, F, G, A
        if (['C', 'D', 'F', 'G', 'A'].includes(name)) {
          allKeys.push({ name, octave, isBlack: true });
        }
      });
    });

    return allKeys;
  }, []);

  const handleKeyPress = (name: NoteName, octave: number) => {
    audioEngine.playNote({ name, octave, absoluteIndex: 0 }, instrument);
    onNote(name);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 select-none">
      <div className="relative h-48 flex justify-center perspective-1000">
        {keys.map((key, index) => (
          <button
            key={`${key.name}${key.octave}-${index}`}
            onMouseDown={() => !key.isBlack && handleKeyPress(key.name, key.octave)}
            onPointerDown={() => !key.isBlack && handleKeyPress(key.name, key.octave)}
            className={`
              relative transition-all duration-75 active:scale-95
              ${
                key.isBlack
                  ? 'bg-slate-800 dark:bg-black w-8 h-28 -mx-4 z-10 rounded-b-md shadow-lg border-x border-slate-700/50 hover:bg-slate-700 pointer-events-auto'
                  : 'bg-white dark:bg-slate-100 w-12 h-48 border border-slate-200 dark:border-slate-300 rounded-b-xl shadow-md hover:bg-slate-50 z-0'
              }
              ${key.isBlack ? 'active:bg-slate-600' : 'active:bg-indigo-50'}
              flex items-end justify-center pb-4
            `}
            style={key.isBlack ? { marginLeft: '-1rem', marginRight: '-1rem' } : {}}
          >
            {!key.isBlack && (
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                {key.name}
                {key.octave}
              </span>
            )}
            {key.isBlack && (
              <button
                onPointerDown={(e) => {
                  e.stopPropagation();
                  handleKeyPress(key.name, key.octave);
                }}
                className="absolute inset-0 w-full h-full"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PianoKeyboard;
