import React, { useMemo } from 'react';
import type { NoteName } from '@/types';
import { useGameStore } from '@/store/useGameStore';
import { useScrollingStore } from '@/store/useScrollingStore';
import { audioEngine } from '@/utils/audio';

interface PianoKeyboardProps {
  onNote: (note: NoteName) => void;
  activeNotes?: string[]; // Optional to highlight currently played notes
}

const PianoKeyboard: React.FC<PianoKeyboardProps> = ({
  onNote,
  activeNotes: externalActiveNotes,
}) => {
  const settings = useGameStore((state) => state.settings);
  const demoActiveNote = useScrollingStore((state) => state.demoActiveNote);
  const { instrument } = settings;

  // Combine external active notes with demo active note
  const activeNotes = useMemo(() => {
    const notes: { name: NoteName; octave?: number }[] = (externalActiveNotes || []).map((n) => {
      const name = n.replace(/[0-9]/g, '') as NoteName;
      const octave = parseInt(n.replace(/^\D+/g, ''), 10);
      return { name, octave: isNaN(octave) ? undefined : octave };
    });
    if (demoActiveNote) {
      notes.push({ name: demoActiveNote.name, octave: demoActiveNote.octave });
    }
    return notes;
  }, [externalActiveNotes, demoActiveNote]);

  // Determine the relevant octave range based on current context
  const targetOctaves = useMemo(() => {
    const usedOctaves = new Set<number>();

    if (settings.gameMode === 'standard') {
      const currentNote = useGameStore.getState().settings.activeNotes; // Simplified: check what's enabled
      currentNote.forEach((n) => {
        const octave = parseInt(n.replace(/^\D+/g, ''), 10);
        if (!isNaN(octave)) usedOctaves.add(octave);
      });
    } else {
      const activeSong = useScrollingStore.getState().activeSong;
      if (activeSong) {
        activeSong.notes.forEach((sn) => usedOctaves.add(sn.note.octave));
      } else {
        settings.activeNotes.forEach((n) => {
          const octave = parseInt(n.replace(/^\D+/g, ''), 10);
          if (!isNaN(octave)) usedOctaves.add(octave);
        });
      }
    }

    if (usedOctaves.size === 0) return [3, 4]; // Default

    const min = Math.min(...usedOctaves);
    const max = Math.max(...usedOctaves);

    // Ensure at least a small range for visual balance
    const range = [];
    for (let i = min; i <= max; i++) {
      range.push(i);
    }
    return range;
  }, [settings.gameMode, settings.activeNotes, useScrollingStore((state) => state.activeSong)]);

  // Define keys based on calculated octaves
  const keys = useMemo(() => {
    const noteNames: NoteName[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const allKeys: { name: NoteName; octave: number; isBlack: boolean }[] = [];

    targetOctaves.forEach((octave) => {
      noteNames.forEach((name) => {
        allKeys.push({ name, octave, isBlack: false });
        // Add black keys after C, D, F, G, A
        if (['C', 'D', 'F', 'G', 'A'].includes(name)) {
          allKeys.push({ name, octave, isBlack: true });
        }
      });
    });

    return allKeys;
  }, [targetOctaves]);

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
                  ? 'w-8 h-28 -mx-4 z-10 rounded-b-md shadow-lg border-x border-slate-700/50 hover:bg-slate-700 pointer-events-auto'
                  : 'w-12 h-48 border border-slate-200 dark:border-slate-300 rounded-b-xl shadow-md hover:bg-slate-50 z-0'
              }
              ${
                activeNotes.some(
                  (n) =>
                    !key.isBlack &&
                    n.name === key.name &&
                    (n.octave === undefined || n.octave === key.octave)
                )
                  ? 'bg-indigo-500 dark:bg-indigo-400 text-white scale-95 shadow-indigo-300/50'
                  : key.isBlack
                    ? 'bg-slate-800 dark:bg-black active:bg-slate-600'
                    : 'bg-white dark:bg-slate-100 active:bg-indigo-50'
              }
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
