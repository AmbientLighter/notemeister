export type Language = 'en' | 'ru' | 'uk' | 'et';
export type ClefType = 'treble' | 'bass';
export type NoteName = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';

export interface Note {
  name: NoteName;
  octave: number;
  absoluteIndex: number; // calculated as octave * 7 + nameIndex
}

export interface GameSettings {
  language: Language;
  clef: ClefType;
  selectedOctaves: number[];
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
  avgTime: string;
}
