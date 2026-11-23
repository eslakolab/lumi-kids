export type AudioLang = 'ar' | 'en';

/**
 * Normalizes text for deterministic audio manifest lookup.
 * Collapses whitespace and trims surrounding spaces/quotes.
 */
export function normalizeAudioText(text: string): string {
  return (text || '')
    .replace(/\u200f|\u200e/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalizes text even further by stripping leading/trailing punctuation and guillemets
 * so token variations like "الصَّغِيرَ." and "الصَّغِيرَ" resolve to the same MP3 file.
 */
export function normalizeAudioLookupKey(text: string): string {
  return normalizeAudioText(text)
    .replace(/^[«»"'`.,!؟،؛:()\-–—\s]+/, '')
    .replace(/[«»"'`.,!؟،؛:()\-–—\s]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function makeAudioKey(text: string, lang: AudioLang = 'ar'): string {
  return `${lang}|${normalizeAudioText(text)}`;
}

export function makeFallbackAudioKey(text: string, lang: AudioLang = 'ar'): string {
  return `${lang}|${normalizeAudioLookupKey(text)}`;
}
