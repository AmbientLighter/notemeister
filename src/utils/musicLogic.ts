import type { ClefType, Note, NoteName } from '../types';

const NOTE_INDEX_MAP: Record<NoteName, number> = {
  C: 0,
  D: 1,
  E: 2,
  F: 3,
  G: 4,
  A: 5,
  B: 6,
};

// Calculates a unique numerical index for a note to compare pitch height
export const getAbsoluteNoteIndex = (name: NoteName, octave: number): number =>
  octave * 7 + NOTE_INDEX_MAP[name];

// Helper to convert Note to "C4" string
export const getNoteKey = (note: Note): string => `${note.name}${note.octave}`;

// Helper to convert "C4" string to Note object
export const parseNoteKey = (key: string): Note => {
  const name = key.charAt(0) as NoteName;
  const octave = Number.parseInt(key.slice(1), 10);
  return {
    name,
    octave,
    absoluteIndex: getAbsoluteNoteIndex(name, octave),
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

  const refIndex = clef === 'treble' ? getAbsoluteNoteIndex('F', 5) : getAbsoluteNoteIndex('A', 3);

  const noteIndex = getAbsoluteNoteIndex(note.name, note.octave);

  // If note is lower than ref, index is smaller, result is positive (drawn below)
  // If note is higher than ref, index is larger, result is negative (drawn above)
  return refIndex - noteIndex;
};

export const generateRandomNote = (activeNotes: string[], lastNote?: Note): Note => {
  // Fallback if empty (should be prevented by UI)
  if (!activeNotes || activeNotes.length === 0) {
    return { name: 'C', octave: 4, absoluteIndex: getAbsoluteNoteIndex('C', 4) };
  }

  const randomKey = activeNotes[Math.floor(Math.random() * activeNotes.length)];
  const newNote = parseNoteKey(randomKey);

  // Prevent same note twice in a row for better training variety
  // Only try to prevent if there is more than 1 possible combination
  if (lastNote && lastNote.absoluteIndex === newNote.absoluteIndex && activeNotes.length > 1) {
    return generateRandomNote(activeNotes, lastNote);
  }

  return newNote;
};

// Music Theory Constants for Pitch Detection
const CHROMATIC_TO_NATURAL_MAP: Record<number, string> = {
  0: 'C',
  1: 'C', // C# -> C
  2: 'D',
  3: 'E', // D# -> E
  4: 'E',
  5: 'F',
  6: 'F', // F# -> F
  7: 'G',
  8: 'G', // G# -> G
  9: 'A',
  10: 'B', // A# -> B
  11: 'B',
};

/**
 * Converts a frequency (Hz) to a musical note name and octave.
 * Filter out obviously incorrect or extreme frequencies before calling.
 */
export const getNoteFromFrequency = (freq: number): { name: string; octave: number } | null => {
  // 440Hz is A4
  const number = 12 * Math.log2(freq / 440) + 69;
  const rounded = Math.round(number);

  // Standard modulo for potential negative numbers
  const noteIndex = ((rounded % 12) + 12) % 12;
  const noteName = CHROMATIC_TO_NATURAL_MAP[noteIndex];
  const octave = Math.floor(rounded / 12) - 1;

  if (noteName) {
    return { name: noteName, octave };
  }
  return null;
};
