export type TashkeelType = 'fatha' | 'damma' | 'kasra' | 'sukoon';

export interface LetterItem {
  id: string;
  char: string;
  name: string;
  variants: {
    fatha: { text: string; example: string; exampleMeaning: string; spokenSound?: string };
    damma: { text: string; example: string; exampleMeaning: string; spokenSound?: string };
    kasra: { text: string; example: string; exampleMeaning: string; spokenSound?: string };
    sukoon: { text: string; example: string; exampleMeaning: string; spokenSound?: string };
  };
  color: string;
}

export interface WordItem {
  id: string;
  word: string; // Vocalized with full tashkeel or English word
  plainWord: string; // Without tashkeel
  syllables: string[]; // Chunked breakdown for slow reading (e.g. ["أَ", "بٌ"] or ["Ap", "ple"])
  meaning: string;
  image: string; // Image path or illustration
  category: string;
  sentence: string;
}

export interface SentenceItem {
  id: string;
  sentence: string; // Full vocalized sentence
  words: string[];
  image: string;
  meaning: string;
}

export interface MathItem {
  id: string;
  type: 'addition' | 'subtraction' | 'multiplication' | 'division' | 'counting';
  num1: number;
  num2: number;
  operator: '+' | '-' | '×' | '÷' | '=';
  result: number;
  itemType: 'apple' | 'star' | 'rabbit' | 'car' | 'ball';
  story: string;
}

export interface AppSettings {
  fontSize: 'normal' | 'large' | 'huge';
  speechRate: number; // 0.5 to 1.0 (slower for learning difficulties)
  highlightVowels: boolean;
  soundEnabled: boolean;
}
