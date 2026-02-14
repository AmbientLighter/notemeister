import { ClefType, Note, NoteName } from '../types';
import { NOTE_NAMES } from '../constants';

const NOTE_INDEX_MAP: Record<NoteName, number> = {
  'C': 0, 'D': 1, 'E': 2, 'F': 3, 'G': 4, 'A': 5, 'B': 6
};

// Calculates a unique numerical index for a note to compare pitch height
export const getAbsoluteNoteIndex = (name: NoteName, octave: number): number => {
  return octave * 7 + NOTE_INDEX_MAP[name];
};

// Returns visual position relative to the staff top line.
// 0 = Top Line
// Positive = Downwards
// Negative = Upwards
// Each step is 0.5 (half a line space)
export const getNoteVisualPosition = (clef: ClefType, note: Note): number => {
  // Reference notes (Top Line of the staff)
  // Treble: F5 (Index: 5*7 + 3 = 38)
  // Bass: A3 (Index: 3*7 + 5 = 26)
  
  let refIndex = 0;
  if (clef === 'treble') {
    refIndex = getAbsoluteNoteIndex('F', 5);
  } else {
    refIndex = getAbsoluteNoteIndex('A', 3);
  }

  const noteIndex = getAbsoluteNoteIndex(note.name, note.octave);
  
  // If note is lower than ref, index is smaller, result is positive (drawn below)
  // If note is higher than ref, index is larger, result is negative (drawn above)
  return refIndex - noteIndex;
};

export const generateRandomNote = (clef: ClefType, allowedOctaves: number[], lastNote?: Note): Note => {
  // Filter out invalid octaves if any passed
  if (allowedOctaves.length === 0) {
    // Fallback defaults
    allowedOctaves = clef === 'treble' ? [4, 5] : [2, 3];
  }

  const octave = allowedOctaves[Math.floor(Math.random() * allowedOctaves.length)];
  const name = NOTE_NAMES[Math.floor(Math.random() * NOTE_NAMES.length)];
  
  const newNote: Note = {
    name,
    octave,
    absoluteIndex: getAbsoluteNoteIndex(name, octave)
  };

  // Prevent same note twice in a row for better training variety
  if (lastNote && lastNote.absoluteIndex === newNote.absoluteIndex) {
    return generateRandomNote(clef, allowedOctaves, lastNote);
  }

  return newNote;
};
