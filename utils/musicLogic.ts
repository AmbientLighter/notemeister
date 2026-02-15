import { ClefType, Note, NoteName } from '../types';
import { NOTE_NAMES } from '../constants';

const NOTE_INDEX_MAP: Record<NoteName, number> = {
  'C': 0, 'D': 1, 'E': 2, 'F': 3, 'G': 4, 'A': 5, 'B': 6
};

// Calculates a unique numerical index for a note to compare pitch height
export const getAbsoluteNoteIndex = (name: NoteName, octave: number): number => {
  return octave * 7 + NOTE_INDEX_MAP[name];
};

// Helper to convert Note to "C4" string
export const getNoteKey = (note: Note): string => `${note.name}${note.octave}`;

// Helper to convert "C4" string to Note object
export const parseNoteKey = (key: string): Note => {
  const name = key.charAt(0) as NoteName;
  const octave = parseInt(key.slice(1), 10);
  return {
    name,
    octave,
    absoluteIndex: getAbsoluteNoteIndex(name, octave)
  };
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

export const generateRandomNote = (
  activeNotes: string[],
  lastNote?: Note
): Note => {
  // Fallback if empty (should be prevented by UI)
  if (!activeNotes || activeNotes.length === 0) {
    return { name: 'C', octave: 4, absoluteIndex: getAbsoluteNoteIndex('C', 4) };
  }

  const randomKey = activeNotes[Math.floor(Math.random() * activeNotes.length)];
  const newNote = parseNoteKey(randomKey);

  // Prevent same note twice in a row for better training variety
  // Only try to prevent if there is more than 1 possible combination
  if (lastNote && lastNote.absoluteIndex === newNote.absoluteIndex) {
    if (activeNotes.length > 1) {
        return generateRandomNote(activeNotes, lastNote);
    }
  }

  return newNote;
};