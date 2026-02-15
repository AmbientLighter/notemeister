export type Language = 'en' | 'ru' | 'uk' | 'et';
export type ClefType = 'treble' | 'bass';
export type NoteName = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
export type Tempo = 'slow' | 'normal' | 'fast';
export type Instrument = 'silence' | 'piano' | 'guitar' | 'flute' | 'microphone';

export type Screen = 'setup' | 'game' | 'results';
export type SortMethod = 'difficulty' | 'name' | 'time';

export interface Note {
  name: NoteName;
  octave: number;
  absoluteIndex: number; // calculated as octave * 7 + nameIndex
}

export interface NoteStat {
  name: string;
  avgTime: number;
  accuracy: number;
  count: number;
}

export interface GameSettings {
  clef: ClefType;
  // activeNotes stores specific notes like "C4", "D5", etc.
  activeNotes: string[];
  tempo: Tempo;
  instrument: Instrument;
}

export interface GameStats {
  correct: number;
  total: number;
  streak: number;
  history: GameHistoryItem[];
}

export interface GameHistoryItem {
  note: Note;
  timeTaken: number;
  correct: boolean;
  timestamp: number;
}

export interface Translations {
  title: string;
  subtitle: string;
  setupTitle: string;
  selectLanguage: string;
  selectClef: string;
  selectOctaves: string;
  selectNotes: string;
  selectTempo: string;
  tempoSlow: string;
  tempoNormal: string;
  tempoFast: string;
  startSession: string;
  correct: string;
  total: string;
  accuracy: string;
  streak: string;
  trebleClef: string;
  bassClef: string;
  question: string;
  finishSession: string;
  resultsTitle: string;
  sessionSummary: string;
  startNewSession: string;
  correctAnswer: string;
  incorrectAnswer: string;
  octave: string;
  noOctavesSelected: string;
  noNotesSelected: string;
  avgTime: string;
  statNote: string;
  statAccuracy: string;
  statTime: string;
  sortBy: string;
  sortDifficulty: string;
  sortName: string;
  sortTime: string;
  selectInstrument: string;
  instrumentSilence: string;
  instrumentPiano: string;
  instrumentGuitar: string;
  instrumentFlute: string;
  instrumentMicrophone: string;
  micAccessRequired: string;
  performanceAnalysis: string;
  concealDetails: string;
  viewDeepMetrics: string;
  focusOn: string;
  feedbackMastery: string;
  feedbackExemplary: string;
  feedbackProgress: string;
  feedbackGettingThere: string;
  feedbackKeepPracticing: string;
  quoteExpert: string;
  quoteStrong: string;
  quoteConsistency: string;
  reviewProgress: string;
  backToOverview: string;
  playOrSing: string;
  playThisNote: string;
}
