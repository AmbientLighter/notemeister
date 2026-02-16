import { Song, NoteName } from '@/types';

// Helper to create a note object compatible with VexFlow format
const n = (name: NoteName, octave: number, duration: string = 'q') => {
  const note = {
    name,
    octave,
    absoluteIndex: octave * 7 + ['C', 'D', 'E', 'F', 'G', 'A', 'B'].indexOf(name),
  };
  return {
    keys: [`${name.toLowerCase()}/${octave}`],
    duration,
    note,
  };
};

export const SONGS: Song[] = [
  {
    id: 'c-major-scale',
    name: '🎹 C Major Scale',
    bpm: 60,
    notes: [n('C', 4), n('D', 4), n('E', 4), n('F', 4), n('G', 4), n('A', 4), n('B', 4), n('C', 5)],
  },
  {
    id: 'twinkle-twinkle',
    name: '✨ Twinkle Twinkle',
    bpm: 80,
    notes: [
      n('C', 4),
      n('C', 4),
      n('G', 4),
      n('G', 4),
      n('A', 4),
      n('A', 4),
      n('G', 4, 'h'),
      n('F', 4),
      n('F', 4),
      n('E', 4),
      n('E', 4),
      n('D', 4),
      n('D', 4),
      n('C', 4, 'h'),
    ],
  },
  {
    id: 'ode-to-joy',
    name: '🇪🇺 Ode to Joy',
    bpm: 120,
    notes: [
      n('E', 4),
      n('E', 4),
      n('F', 4),
      n('G', 4),
      n('G', 4),
      n('F', 4),
      n('E', 4),
      n('D', 4),
      n('C', 4),
      n('C', 4),
      n('D', 4),
      n('E', 4),
      n('E', 4, 'h'),
      n('D', 4, '8'),
      n('D', 4, 'q'),
    ],
  },
  {
    id: 'mary-had-a-little-lamb',
    name: '🐑 Mary Had a Little Lamb',
    bpm: 90,
    notes: [
      n('E', 4),
      n('D', 4),
      n('C', 4),
      n('D', 4),
      n('E', 4),
      n('E', 4),
      n('E', 4, 'h'),
      n('D', 4),
      n('D', 4),
      n('D', 4, 'h'),
      n('E', 4),
      n('G', 4),
      n('G', 4, 'h'),
    ],
  },
];
