import { TashkeelType } from '../types';

/**
 * Phonetic pronunciation of Arabic consonants in a state of Sukoon.
 * In Arabic phonetics ("لَا يُبْدَأُ بِسَاكِنٍ"), a consonant in Sukoon cannot be
 * vocalized in isolation by speech engines without a preceding vowel (همزة مفتوحة).
 * Therefore, in pedagogical Arabic (القاعدة النورانية / تأسيس الأطفال / رياض الأطفال),
 * each consonant in Sukoon is sounded with an Alif-Fatha prefix: "أَ + الحرف ساكناً".
 * For example: حرف التاء في السكون ينطق "أَتْ" (أت).
 */
export const SUKOON_PHONETIC_SOUNDS: Record<string, string> = {
  'أ': 'أَءْ',
  'ء': 'أَءْ',
  'ا': 'أَءْ',
  'ب': 'أَبْ',
  'ت': 'أَتْ',
  'ث': 'أَثْ',
  'ج': 'أَجْ',
  'ح': 'أَحْ',
  'خ': 'أَخْ',
  'د': 'أَدْ',
  'ذ': 'أَذْ',
  'ر': 'أَرْ',
  'ز': 'أَزْ',
  'س': 'أَسْ',
  'ش': 'أَشْ',
  'ص': 'أَصْ',
  'ض': 'أَضْ',
  'ط': 'أَطْ',
  'ظ': 'أَظْ',
  'ع': 'أَعْ',
  'غ': 'أَغْ',
  'ف': 'أَفْ',
  'ق': 'أَقْ',
  'ك': 'أَكْ',
  'ل': 'أَلْ',
  'م': 'أَمْ',
  'ن': 'أَنْ',
  'ه': 'أَهْ',
  'هـ': 'أَهْ',
  'و': 'أَوْ',
  'ي': 'أَيْ',
  'ة': 'أَهْ',
  'ى': 'أَيْ',
};

/**
 * Strip Arabic diacritics to get bare consonant
 */
export function stripTashkeel(text: string): string {
  return text.replace(/[\u064B-\u0652\u0670]/g, '');
}

/**
 * Returns the authentic audible phonetic sound for a letter in Sukoon.
 * E.g., for letter 'ت' or 'تْ', returns 'أَتْ'.
 */
export function getSukoonSound(letterChar: string): string {
  const base = stripTashkeel(letterChar).trim();
  const first = base.charAt(0);
  return SUKOON_PHONETIC_SOUNDS[first] || (first ? `أَ${first}ْ` : 'أَتْ');
}

/**
 * Returns the exact speech text to vocalize through Web Speech API.
 * Ensures letters in Sukoon are audibly and clearly pronounced with a preceding hamza ("أَتْ", "أَبْ", etc.).
 */
export function getLetterPhoneticSpeech(letterChar: string, tashkeel: TashkeelType): string {
  if (tashkeel === 'sukoon') {
    return getSukoonSound(letterChar);
  }
  const base = stripTashkeel(letterChar).charAt(0);
  if (tashkeel === 'fatha') return `${base}َ`;
  if (tashkeel === 'damma') return `${base}ُ`;
  if (tashkeel === 'kasra') return `${base}ِ`;
  return base;
}
