import 'dotenv/config';
import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import { execFile } from 'child_process';
import { promisify } from 'util';
import * as esbuild from 'esbuild';
import { GoogleGenAI } from '@google/genai';
import {
  AudioLang,
  normalizeAudioText,
  normalizeAudioLookupKey,
} from '../src/utils/audioNormalizer';
import { getSukoonSound } from '../src/utils/phonics';

const execFileAsync = promisify(execFile);

const ROOT_DIR = path.resolve(import.meta.dirname, '..');
const AUDIO_OUT_DIR = path.join(ROOT_DIR, 'public', 'audio');
const MANIFEST_TS_PATH = path.join(ROOT_DIR, 'src', 'data', 'audioManifest.ts');
const MANIFEST_JSON_PATH = path.join(AUDIO_OUT_DIR, 'manifest.json');

export interface AudioCatalogEntry {
  id: string;
  filename: string;
  text: string;
  ttsText: string;
  lang: AudioLang;
  category: string;
}

const ARABIC_NUMBERS: Record<number, string> = {
  1: 'وَاحِدٌ',
  2: 'اِثْنَانِ',
  3: 'ثَلَاثَةٌ',
  4: 'أَرْبَعَةٌ',
  5: 'خَمْسَةٌ',
  6: 'سِتَّةٌ',
  7: 'سَبْعَةٌ',
  8: 'ثَمَانِيَةٌ',
  9: 'تِسْعَةٌ',
  10: 'عَشَرَةٌ',
};

function makeFileId(category: string, lang: AudioLang, normalizedText: string): string {
  const cleanCat = category.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  const hash = crypto
    .createHash('sha256')
    .update(`${lang}|${normalizedText}`, 'utf8')
    .digest('hex')
    .slice(0, 12);
  return `${lang}_${cleanCat}_${hash}`;
}

/**
 * Loads pure data modules (initialData.ts, storiesData.ts, avatarData.ts) in Node
 * by stubbing Vite's import.meta.glob-based assetResolver.
 */
async function loadDataModule<T = Record<string, unknown>>(relPath: string): Promise<T> {
  const entryPath = path.join(ROOT_DIR, relPath);
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lumi-data-'));
  const outFile = path.join(outDir, 'bundle.mjs');

  try {
    await esbuild.build({
      entryPoints: [entryPath],
      bundle: true,
      format: 'esm',
      platform: 'node',
      outfile: outFile,
      plugins: [
        {
          name: 'stub-asset-resolver',
          setup(build) {
            build.onResolve({ filter: /assetResolver/ }, () => ({
              path: 'asset-resolver-stub',
              namespace: 'stub',
            }));
            build.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({
              contents: 'export function resolveAssetUrl(p) { return p || ""; }',
              loader: 'js',
            }));
          },
        },
      ],
    });

    const mod = await import(`file://${outFile}?t=${Date.now()}`);
    return mod as T;
  } finally {
    fs.rmSync(outDir, { recursive: true, force: true });
  }
}

/**
 * Extracts and evaluates a static array literal constant directly from a TSX source file
 * without relying on the TypeScript compiler JS AST (which is absent in TS 7).
 */
function extractLiteralConst<T>(relPath: string, constName: string): T {
  const fullPath = path.join(ROOT_DIR, relPath);
  const src = fs.readFileSync(fullPath, 'utf8');

  const declRegex = new RegExp(`\\b(?:export\\s+)?const\\s+${constName}(?:\\s*:[^=]+)?\\s*=\\s*\\[`, 'm');
  const match = declRegex.exec(src);
  if (!match) {
    throw new Error(`Could not find const ${constName} in ${relPath}`);
  }

  const startIdx = match.index + match[0].length - 1;
  let depth = 0;
  let inString: "'" | '"' | '`' | null = null;
  let inLineComment = false;
  let inBlockComment = false;
  let escaped = false;
  let endIdx = -1;

  for (let i = startIdx; i < src.length; i++) {
    const ch = src[i];
    const next = src[i + 1];

    if (inLineComment) {
      if (ch === '\n') inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false;
        i++;
      }
      continue;
    }
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === inString) {
        inString = null;
      }
      continue;
    }

    if (ch === '/' && next === '/') {
      inLineComment = true;
      i++;
      continue;
    }
    if (ch === '/' && next === '*') {
      inBlockComment = true;
      i++;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      inString = ch;
      continue;
    }
    if (ch === '[') {
      depth++;
    } else if (ch === ']') {
      depth--;
      if (depth === 0) {
        endIdx = i;
        break;
      }
    }
  }

  if (endIdx === -1) {
    throw new Error(`Unclosed array literal for const ${constName} in ${relPath}`);
  }

  const rawArray = src.slice(startIdx, endIdx + 1);
  const { code } = esbuild.transformSync(`(${rawArray})`, { loader: 'ts' });
  const evaluator = new Function(`"use strict"; return ${code}`);
  return evaluator() as T;
}

function formatTtsPrompt(text: string, lang: AudioLang, overrideTtsText?: string): string {
  if (overrideTtsText) return overrideTtsText;
  let cleaned = normalizeAudioText(text)
    .replace(/\s*\.\.\s*/g, '، ')
    .replace(/[«»]/g, '');
  if (lang === 'ar') {
    cleaned = cleaned.replace(/[()]/g, ' ');
  }
  return cleaned.replace(/\s+/g, ' ').trim();
}

async function buildCatalog(): Promise<AudioCatalogEntry[]> {
  const initialData = await loadDataModule<{
    INITIAL_LETTERS: Array<{
      id: string;
      char: string;
      name: string;
      variants: Record<
        'fatha' | 'damma' | 'kasra' | 'sukoon',
        { text: string; example: string; spokenSound?: string }
      >;
    }>;
    INITIAL_WORDS: Array<{ word: string; syllables: string[]; sentence: string }>;
    INITIAL_SENTENCES: Array<{ sentence: string; words: string[] }>;
    INITIAL_MATH_PROBLEMS: Array<{ story: string }>;
    INITIAL_COMPARISONS: Array<{
      countA: number;
      countB: number;
      correct: 'A' | 'B' | 'EQUAL';
    }>;
    INITIAL_ANIMALS: Array<{
      titleWithTashkeel: string;
      soundName: string;
      soundText: string;
      description: string;
      food: string;
      home: string;
    }>;
    INITIAL_CHEMISTRY_TOPICS: Array<{
      title: string;
      concept: string;
      funFact: string;
    }>;
  }>('src/data/initialData.ts');

  const storiesData = await loadDataModule<{
    REALISTIC_STORIES: Array<{
      pages: Array<{
        sentenceAudioText: string;
        hotspots: Array<{ name: string }>;
      }>;
    }>;
  }>('src/data/storiesData.ts');

  const avatarData = await loadDataModule<{
    CHILD_AVATARS: Array<{
      name: string;
      nameEn: string;
      cheerPhrase: string;
      cheerPhraseEn: string;
    }>;
  }>('src/data/avatarData.ts');

  const spellingWords = extractLiteralConst<
    Array<{ word: string; letters: Array<{ char: string; harakaType: string }> }>
  >('src/components/SpellingModule.tsx', 'SPELLING_WORDS');

  const focusItems = extractLiteralConst<Array<{ id: string; name: string }>>(
    'src/components/FocusModule.tsx',
    'FOCUS_ITEMS'
  );

  const animalQuiz = extractLiteralConst<Array<{ question: string }>>(
    'src/components/AnimalsModule.tsx',
    'ANIMAL_QUIZ_QUESTIONS'
  );

  const paletteColors = extractLiteralConst<Array<{ name: string; hex: string }>>(
    'src/components/ColoringModule.tsx',
    'PALETTE'
  );

  const mascotPhrases = extractLiteralConst<string[]>(
    'src/components/StarMascot.tsx',
    'CHEERFUL_PHRASES'
  );

  const presetNicknamesAr = extractLiteralConst<string[]>(
    'src/components/AvatarSelectScreen.tsx',
    'PRESET_NICKNAMES_AR'
  );

  const presetNicknamesEn = extractLiteralConst<string[]>(
    'src/components/AvatarSelectScreen.tsx',
    'PRESET_NICKNAMES_EN'
  );

  const shapeQuestions = extractLiteralConst<Array<{ nameWithTashkeel: string }>>(
    'src/components/BrainGamesModule.tsx',
    'shapeQuestions'
  );

  const entriesMap = new Map<string, AudioCatalogEntry>();

  const addEntry = (
    text: string,
    lang: AudioLang,
    category: string,
    overrideTtsText?: string
  ) => {
    const norm = normalizeAudioText(text);
    if (!norm) return;
    const key = `${lang}|${norm}`;
    if (entriesMap.has(key)) return;

    const id = makeFileId(category, lang, norm);
    entriesMap.set(key, {
      id,
      filename: `${id}.mp3`,
      text: norm,
      ttsText: formatTtsPrompt(norm, lang, overrideTtsText),
      lang,
      category,
    });
  };

  // 1. Home Welcome & Star Mascot
  addEntry(
    'مَرْحَبًا بِكَ يَا بَطَلِي فِي لُومِي! اخْتَرْ قِسْمَكَ الْمُفَضَّلَ لِنَبْدَأَ التَّعَلُّمَ!',
    'ar',
    'welcome'
  );
  for (const phrase of mascotPhrases) {
    addEntry(phrase, 'ar', 'mascot');
  }

  // 2. Letters Module (28 letters × 4 tashkeel + examples + tracing praise)
  for (const letter of initialData.INITIAL_LETTERS) {
    addEntry(letter.name, 'ar', 'letter_name');
    (['fatha', 'damma', 'kasra', 'sukoon'] as const).forEach((tashkeel) => {
      const variant = letter.variants[tashkeel];
      const letterVoice =
        tashkeel === 'sukoon'
          ? variant.spokenSound || getSukoonSound(letter.char)
          : variant.text;
      addEntry(`${letter.name} .. ${letterVoice}`, 'ar', 'letter_intro');
      addEntry(`${letterVoice} .. ${variant.example}`, 'ar', 'letter_sound');
      addEntry(variant.example, 'ar', 'letter_example');
    });
  }
  addEntry('أَحْسَنْتَ يَا بَطَل! كِتَابَةٌ رَائِعَةٌ!', 'ar', 'letter_praise');

  // 3. Spelling Module
  for (const sp of spellingWords) {
    addEntry(sp.word, 'ar', 'spelling_word');
    addEntry(`مُمْتَازٌ! كَلِمَةُ ${sp.word}!`, 'ar', 'spelling_praise');
    for (const l of sp.letters) {
      const spoken =
        l.harakaType === 'sukoon' || l.char.includes('ْ')
          ? getSukoonSound(l.char)
          : l.char;
      addEntry(spoken, 'ar', 'spelling_chunk');
    }
  }
  addEntry('ابْدَأْ بِالْحَرْفِ الْأَوَّلِ ثُمَّ الثَّانِي!', 'ar', 'spelling_hint');

  // 4. Words Module
  for (const w of initialData.INITIAL_WORDS) {
    addEntry(w.word, 'ar', 'word');
    for (const syl of w.syllables) {
      addEntry(syl, 'ar', 'word_syllable');
    }
    addEntry(w.sentence, 'ar', 'word_sentence');
  }

  // 5. Sentences Module
  for (const s of initialData.INITIAL_SENTENCES) {
    addEntry(s.sentence, 'ar', 'sentence');
    for (const tok of s.words) {
      addEntry(tok, 'ar', 'sentence_word');
    }
  }
  addEntry('بَارَكَ اللَّهُ فِيكَ يَا بَطَل! قِرَاءَةٌ مُمَيَّزَةٌ جِدًّا!', 'ar', 'sentence_praise');

  // 6. Stories Module
  for (const story of storiesData.REALISTIC_STORIES) {
    for (const page of story.pages) {
      addEntry(page.sentenceAudioText, 'ar', 'story_sentence');
      for (const spot of page.hotspots) {
        addEntry(spot.name, 'ar', 'story_hotspot');
      }
    }
  }
  addEntry('مُمْتَازٌ! لَقَدْ تَعَرَّفْتَ عَلَى جَمِيعِ الْأَشْيَاءِ!', 'ar', 'story_praise');

  // 7. Math Module
  for (let n = 1; n <= 10; n++) {
    addEntry(`${n}`, 'ar', 'math_number', ARABIC_NUMBERS[n]);
  }
  for (const comp of initialData.INITIAL_COMPARISONS) {
    addEntry(
      `قَارِنْ بَيْنَ ${comp.countA} وَ ${comp.countB}. ضَعْ إِشَارَةَ أَكْبَر مِنْ، أَصْغَر مِنْ، أَوْ يُسَاوِي!`,
      'ar',
      'math_compare_prompt'
    );
    const signWord =
      comp.countA > comp.countB
        ? `${comp.countA} أَكْبَرُ مِنْ ${comp.countB}`
        : comp.countA < comp.countB
        ? `${comp.countA} أَصْغَرُ مِنْ ${comp.countB}`
        : `${comp.countA} يُسَاوِي ${comp.countB}`;
    addEntry(`صَحِيح! ${signWord}!`, 'ar', 'math_compare_praise');
  }
  for (const prob of initialData.INITIAL_MATH_PROBLEMS) {
    addEntry(prob.story, 'ar', 'math_problem');
  }
  addEntry('صَحِيحٌ مُمْتَاز! أَنْتَ بَطَلُ الرِّيَاضِيَّاتِ!', 'ar', 'math_praise');
  addEntry('حَاوِلْ مَرَّةً أُخْرَى، عُدَّ الرُّسُومَ بِهُدُوءٍ!', 'ar', 'math_retry');
  addEntry('حَاوِلْ مَرَّةً أُخْرَى، قَارِنْ بَيْنَ الْعَدَدَيْنِ!', 'ar', 'math_compare_retry');

  // 8. Focus Module
  for (const item of focusItems) {
    addEntry(item.name, 'ar', 'focus_item');
    addEntry(`انْظُرْ جَيِّدًا إِلَى هَذَا الشَّكْلِ: ${item.name}`, 'ar', 'focus_intro');
    addEntry(`مُمْتَازٌ! كَانَتْ ${item.name}`, 'ar', 'focus_praise');
  }
  addEntry('رَكِّزْ فِي هَذَيْنِ الشَّكْلَيْنِ', 'ar', 'focus_prompt');
  addEntry('رَكِّزْ جَيِّدًا فِي هَذِهِ الْأَشْكَالِ', 'ar', 'focus_prompt');
  addEntry('انْظُرْ جَيِّدًا وَتَذَكَّرْ هَذِهِ الْأَشْكَالَ', 'ar', 'focus_prompt');
  addEntry('مَا هُوَ الشَّكْلُ الَّذِي كَانَ مَوْجُودًا؟', 'ar', 'focus_question');
  addEntry('مَا هُمَا الشَّيْئَانِ اللَّذَانِ اخْتَفَيَا؟', 'ar', 'focus_question');
  addEntry('مَا هُوَ الشَّكْلُ الَّذِي اخْتَفَى؟', 'ar', 'focus_question');
  addEntry('شَاهِدِ الْأَشْكَالَ مَرَّةً أُخْرَى بِهُدُوءٍ', 'ar', 'focus_prompt');
  addEntry('أَحْسَنْتَ! الشَّكْلُ الَّذِي اخْتَفَى هُوَ', 'ar', 'focus_praise_prefix');

  // 9. Animals Module
  for (const animal of initialData.INITIAL_ANIMALS) {
    addEntry(animal.titleWithTashkeel, 'ar', 'animal_name');
    addEntry(
      `صَوْتُ ${animal.titleWithTashkeel} هُوَ ${animal.soundName} .. ${animal.soundText}`,
      'ar',
      'animal_voice'
    );
    addEntry(
      `${animal.titleWithTashkeel}. ${animal.description}. طَعَامُهُ: ${animal.food}. بِيئَتُهُ: ${animal.home}`,
      'ar',
      'animal_desc'
    );
    addEntry(
      `أَحْسَنْتَ يَا بَطَلُ! إِجَابَةٌ صَحِيحَةٌ! هَذَا هُوَ ${animal.titleWithTashkeel}`,
      'ar',
      'animal_quiz_praise'
    );
  }
  for (const q of animalQuiz) {
    addEntry(q.question, 'ar', 'animal_quiz_question');
  }
  addEntry('حَاوِلْ مَرَّةً أُخْرَى، اسْتَمِعْ لِلسُّؤَالِ جَيِّدًا!', 'ar', 'animal_quiz_retry');

  // 10. Chemistry Module
  addEntry(
    'أَهْلًا بِكَ فِي مُخْتَبَرِ الْكِيمْيَاءِ الْبَسِيطَةِ! هَيَّا نَكْتَشِفْ سِرَّ الْمَاءِ وَالْأَلْوَانِ مَعًا!',
    'ar',
    'chem_welcome'
  );
  for (const topic of initialData.INITIAL_CHEMISTRY_TOPICS) {
    addEntry(`${topic.title} .. ${topic.concept}`, 'ar', 'chem_topic');
    addEntry(`${topic.concept}. مَعْلُومَةٌ مُمْتِعَةٌ: ${topic.funFact}`, 'ar', 'chem_fact');
  }
  addEntry('عِنْدَ التَّبْرِيدِ الشَّدِيدِ يَتَحَوَّلُ الْمَاءُ إِلَى ثَلْجٍ صَلْبٍ يُمْكِنُ إِمْسَاكُهُ!', 'ar', 'chem_water');
  addEntry('فِي حَرَارَةِ الْغُرْفَةِ يَكُونُ الْمَاءُ سَائِلًا عَذْبًا نَشْرَبُهُ وَنَسْبَحُ فِيهِ!', 'ar', 'chem_water');
  addEntry('عِنْدَ التَّسْخِينِ عَلَى النَّارِ يَتَصَاعَدُ الْمَاءُ فِي الْهَوَاءِ عَلَى شَكْلِ بُخَارٍ!', 'ar', 'chem_water');
  for (const colorResult of [
    'الْبُرْتُقَالِيَّ',
    'الْأَخْضَرَ',
    'الْبَنَفْسَجِيَّ',
    'الْأَحْمَرَ',
    'الْأَصْفَرَ',
    'الْأَزْرَقَ',
  ]) {
    addEntry(
      `عِنْدَمَا مَزَجْنَا اللَّوْنَيْنِ، تَكَوَّنَ اللَّوْنُ ${colorResult}! سِحْرُ الْكِيمْيَاءِ!`,
      'ar',
      'chem_color_mix'
    );
  }
  for (const floatItem of ['تُفَّاحَةٌ لَذِيذَةٌ', 'قِطْعَةُ خَشَبٍ']) {
    addEntry(`${floatItem} تَطْفُو فَوْقَ الْمَاءِ لِأَنَّهَا خَفِيفَةٌ!`, 'ar', 'chem_float');
  }
  for (const sinkItem of ['حَجَرٌ صَغِيرٌ', 'مِفْتَاحٌ مَعْدِنِيٌّ']) {
    addEntry(`${sinkItem} غَرِقَتْ فِي قَاعِ الْمَاءِ لِأَنَّهَا ثَقِيلَةٌ!`, 'ar', 'chem_sink');
  }
  addEntry(
    'عِنْدَ تَحْرِيكِ السُّكَّرِ فِي الْمَاءِ يَذُوبُ تَمَامًا وَيَخْتَفِي، وَيُصْبِحُ الْمَاءُ كُلُّهُ حُلْوَ الْمَذَاقِ!',
    'ar',
    'chem_dissolve'
  );
  addEntry(
    'الرَّمْلُ لَا يَذُوبُ فِي الْمَاءِ، بَلْ يَبْقَى فِي الْأَسْفَلِ لِأَنَّ حَبَّاتِهِ لَا تَذُوبُ!',
    'ar',
    'chem_dissolve'
  );

  // 11. Coloring Module
  for (const c of paletteColors) {
    addEntry(`لَوْنُ ${c.name}`, 'ar', 'coloring_color');
  }
  addEntry('لَوْحَةٌ فَنِّيَّةٌ رَائِعَةٌ يَا فَنَّانِي الصَّغِير! أَنْتَ مَوْهُوبٌ جِدًّا!', 'ar', 'coloring_praise');

  // 12. Brain Games Module
  for (const sq of shapeQuestions) {
    addEntry(`أَحْسَنْتَ يَا عَبْقَرِيّ! هَذَا هُوَ ${sq.nameWithTashkeel}!`, 'ar', 'game_shape_praise');
  }
  addEntry('حَاوِلْ مَرَّةً أُخْرَى، تَأَمَّلْ عَدَدَ الْأَضْلَاعِ وَالانْحِنَاءَاتِ!', 'ar', 'game_shape_retry');
  addEntry('إِجَابَةٌ ذَكِيَّةٌ جِدًّا! لَقَدِ اكْتَشَفْتَ النَّمَطَ الصَّحِيحَ!', 'ar', 'game_pattern_praise');
  addEntry('انْظُرْ لِلتَّسَلْسُلِ مَرَّةً أُخْرَى، مَا هُوَ الشَّكْلُ الَّذِي يَتَكَرَّرُ؟', 'ar', 'game_pattern_retry');
  for (const w of initialData.INITIAL_WORDS) {
    addEntry(`صَحِيح! هَذِهِ كَلِمَةُ ${w.word}! أَنْتَ ذَكِيٌّ جِدًّا!`, 'ar', 'game_match_praise');
  }
  addEntry('حَاوِلْ مَرَّةً أُخْرَى، انْظُرْ لِلصُّورَةِ جَيِّدًا!', 'ar', 'game_match_retry');
  for (const label of ['نجمة', 'تفاحة', 'سيارة']) {
    addEntry(`أَحْسَنْت! تَطَابَقَ ${label}!`, 'ar', 'game_memory_praise');
  }

  // 13. Avatar Select Screen (ar & en)
  for (const av of avatarData.CHILD_AVATARS) {
    addEntry(av.cheerPhrase, 'ar', 'avatar_cheer');
    addEntry(av.cheerPhraseEn, 'en', 'avatar_cheer');
    addEntry(`رَائِعٌ جِدًّا! أَصْبَحْتَ الآنَ ${av.name}!`, 'ar', 'avatar_confirm');
    addEntry(`Awesome! You are now ${av.nameEn}!`, 'en', 'avatar_confirm');
  }
  for (const preset of presetNicknamesAr) {
    addEntry(`أَهْلًا بِكَ يَا ${preset}!`, 'ar', 'avatar_welcome');
  }
  for (const preset of presetNicknamesEn) {
    addEntry(`Welcome ${preset}!`, 'en', 'avatar_welcome');
  }

  // 14. Subscription Plans messages
  const subMessages = [
    'تم إلغاء عملية الاشتراك من قِبل المستخدم.',
    'تعذر إتمام عملية الاشتراك عبر متجر Google Play.',
    'تم تأكيد الاشتراك عبر Google Play Billing بنجاح! فُتحت جميع الدروس.',
    'تم تأكيد الاشتراك عبر Apple App Store بنجاح! فُتحت جميع الدروس.',
    'تم الاشتراك بنجاح! فُتحت جميع الأقسام والدروس.',
    'تعذر إتمام عملية الدفع. يرجى المحاولة مرة أخرى.',
    'تم استعادة اشتراكك الفعّال بنجاح عبر حساب Google Play!',
    'تم استعادة اشتراكك الفعّال بنجاح عبر حساب Apple ID!',
    'تم استعادة اشتراكك الفعّال بنجاح!',
    'لم يتم العثور على اشتراكات فعّالة مسجلة بحساب Google Play الحالي.',
    'لم يتم العثور على اشتراكات فعّالة مسجلة بحساب Apple ID الحالي.',
    'لم يتم العثور على اشتراك سابق فعال.',
  ];
  for (const msg of subMessages) {
    addEntry(msg, 'ar', 'subscription');
  }

  return Array.from(entriesMap.values());
}

function writeManifestFiles(entries: AudioCatalogEntry[]) {
  fs.mkdirSync(AUDIO_OUT_DIR, { recursive: true });

  const exactMap: Record<string, string> = {};
  const fallbackMap: Record<string, string> = {};

  for (const entry of entries) {
    const publicPath = `/audio/${entry.filename}`;
    const exactKey = `${entry.lang}|${normalizeAudioText(entry.text)}`;
    exactMap[exactKey] = publicPath;

    const stripped = normalizeAudioLookupKey(entry.text);
    if (stripped) {
      const fbKey = `${entry.lang}|${stripped}`;
      if (!fallbackMap[fbKey]) {
        fallbackMap[fbKey] = publicPath;
      }
    }
  }

  const tsContent = `// AUTO-GENERATED BY scripts/generate-audio.ts - DO NOT EDIT MANUALLY
import {
  AudioLang,
  makeAudioKey,
  makeFallbackAudioKey,
} from '../utils/audioNormalizer';

export const AUDIO_EXACT_MANIFEST: Record<string, string> = ${JSON.stringify(exactMap, null, 2)};

export const AUDIO_FALLBACK_MANIFEST: Record<string, string> = ${JSON.stringify(fallbackMap, null, 2)};

export const AUDIO_MANIFEST_COUNT = ${entries.length};

export function resolveLocalAudioUrl(text: string, lang: AudioLang = 'ar'): string | null {
  const exactKey = makeAudioKey(text, lang);
  if (AUDIO_EXACT_MANIFEST[exactKey]) {
    return AUDIO_EXACT_MANIFEST[exactKey];
  }
  const fbKey = makeFallbackAudioKey(text, lang);
  if (AUDIO_FALLBACK_MANIFEST[fbKey]) {
    return AUDIO_FALLBACK_MANIFEST[fbKey];
  }
  return null;
}
`;

  fs.writeFileSync(MANIFEST_TS_PATH, tsContent, 'utf8');
  fs.writeFileSync(
    MANIFEST_JSON_PATH,
    JSON.stringify(
      entries.map((e) => ({
        id: e.id,
        file: `/audio/${e.filename}`,
        lang: e.lang,
        category: e.category,
        text: e.text,
      })),
      null,
      2
    ),
    'utf8'
  );
}

function splitTtsText(text: string, maxLen: number = 175): string[] {
  const clean = text.trim();
  if (clean.length <= maxLen) return [clean];
  const parts: string[] = [];
  let rest = clean;
  while (rest.length > maxLen) {
    let cut = -1;
    for (const sep of ['.', '!', '؟', '،', ',', ' ']) {
      const idx = rest.lastIndexOf(sep, maxLen);
      if (idx > 40) {
        cut = idx + 1;
        break;
      }
    }
    if (cut === -1) cut = maxLen;
    parts.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) parts.push(rest);
  return parts;
}

function isQuota429Error(err: unknown): boolean {
  const anyErr = err as { status?: number; code?: number; message?: string };
  if (anyErr?.status === 429 || anyErr?.code === 429) return true;
  const msg = String(anyErr?.message || err || '');
  return msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('Quota exceeded');
}

async function generateMp3ViaFallbackTts(
  entry: AudioCatalogEntry,
  tmpDir: string,
  outPath: string
): Promise<void> {
  const chunks = splitTtsText(entry.ttsText, 175);
  const chunkFiles: string[] = [];
  const tmpMp3Path = path.join(tmpDir, `${entry.id}_fb_out.mp3`);

  try {
    for (let i = 0; i < chunks.length; i++) {
      const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${entry.lang}&q=${encodeURIComponent(chunks[i])}`;
      let buf: Buffer | null = null;
      let lastErr: unknown;
      for (let attempt = 1; attempt <= 4; attempt++) {
        try {
          const res = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36',
            },
          });
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }
          const arr = await res.arrayBuffer();
          if (arr.byteLength < 300) {
            throw new Error(`Short audio payload (${arr.byteLength} bytes)`);
          }
          buf = Buffer.from(arr);
          break;
        } catch (err) {
          lastErr = err;
          await new Promise((r) => setTimeout(r, 600 * attempt));
        }
      }
      if (!buf) {
        throw lastErr || new Error(`Fallback TTS failed for ${entry.id} chunk ${i}`);
      }
      const chunkPath = path.join(tmpDir, `${entry.id}_chunk_${i}.mp3`);
      fs.writeFileSync(chunkPath, buf);
      chunkFiles.push(chunkPath);
    }

    if (chunkFiles.length === 1) {
      await execFileAsync('ffmpeg', [
        '-y',
        '-i',
        chunkFiles[0],
        '-codec:a',
        'libmp3lame',
        '-b:a',
        '64k',
        '-ar',
        '24000',
        '-ac',
        '1',
        tmpMp3Path,
      ]);
    } else {
      const listPath = path.join(tmpDir, `${entry.id}_concat.txt`);
      fs.writeFileSync(
        listPath,
        chunkFiles.map((f) => `file '${f.replace(/'/g, "'\\''")}'`).join('\n'),
        'utf8'
      );
      await execFileAsync('ffmpeg', [
        '-y',
        '-f',
        'concat',
        '-safe',
        '0',
        '-i',
        listPath,
        '-codec:a',
        'libmp3lame',
        '-b:a',
        '64k',
        '-ar',
        '24000',
        '-ac',
        '1',
        tmpMp3Path,
      ]);
      if (fs.existsSync(listPath)) fs.unlinkSync(listPath);
    }

    fs.copyFileSync(tmpMp3Path, outPath);
    fs.unlinkSync(tmpMp3Path);
  } finally {
    for (const f of chunkFiles) {
      if (fs.existsSync(f)) fs.unlinkSync(f);
    }
    if (fs.existsSync(tmpMp3Path)) fs.unlinkSync(tmpMp3Path);
  }
}

async function generateMp3ForEntry(
  ai: GoogleGenAI | null,
  entry: AudioCatalogEntry,
  tmpDir: string,
  state: { geminiQuotaExhausted: boolean }
): Promise<'skipped' | 'generated'> {
  const outPath = path.join(AUDIO_OUT_DIR, entry.filename);
  if (fs.existsSync(outPath) && fs.statSync(outPath).size > 500) {
    return 'skipped';
  }

  const stylePrompt =
    entry.lang === 'ar'
      ? "Warm, cheerful, gentle Arabic children's teacher, clear articulation with full diacritics"
      : "Warm, cheerful, gentle English children's teacher, clear and friendly articulation";

  if (ai && !state.geminiQuotaExhausted) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash-lite-tts',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: entry.ttsText,
                  speechMetadata: {
                    style: stylePrompt,
                  },
                },
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Kore' },
              },
            },
          },
        });

        const base64Audio =
          response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
          throw new Error(`Empty audio response for ${entry.id}`);
        }

        const wavPath = path.join(tmpDir, `${entry.id}.wav`);
        const tmpMp3Path = path.join(tmpDir, `${entry.id}.mp3`);
        fs.writeFileSync(wavPath, Buffer.from(base64Audio, 'base64'));

        await execFileAsync('ffmpeg', [
          '-y',
          '-i',
          wavPath,
          '-codec:a',
          'libmp3lame',
          '-b:a',
          '64k',
          '-ar',
          '24000',
          '-ac',
          '1',
          tmpMp3Path,
        ]);

        fs.copyFileSync(tmpMp3Path, outPath);
        fs.unlinkSync(tmpMp3Path);
        if (fs.existsSync(wavPath)) fs.unlinkSync(wavPath);
        return 'generated';
      } catch (err) {
        if (isQuota429Error(err)) {
          if (!state.geminiQuotaExhausted) {
            state.geminiQuotaExhausted = true;
            console.warn(
              `[AudioGen] Gemini TTS 429 quota limit reached on ${entry.id}; switching remaining entries to Google TTS fallback.`
            );
          }
          break;
        }
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 1000));
        }
      }
    }
  }

  await generateMp3ViaFallbackTts(entry, tmpDir, outPath);
  return 'generated';
}

function getArgNumber(flag: string, fallback: number): number {
  const prefix = `${flag}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  if (!match) return fallback;
  const parsed = Number(match.slice(prefix.length));
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function saveBatchProgress(entries: AudioCatalogEntry[], batchesCompleted: number) {
  const progressPath = path.join(AUDIO_OUT_DIR, '.batch-progress.json');
  let ready = 0;
  let nextIndex = entries.length;
  for (let i = 0; i < entries.length; i++) {
    const p = path.join(AUDIO_OUT_DIR, entries[i].filename);
    if (fs.existsSync(p) && fs.statSync(p).size > 500) {
      ready++;
    } else if (nextIndex === entries.length) {
      nextIndex = i;
    }
  }
  fs.writeFileSync(
    progressPath,
    JSON.stringify(
      {
        total: entries.length,
        completed: ready,
        remaining: entries.length - ready,
        nextIndex,
        batchSize: 25,
        batchesCompleted,
        stoppedReason: ready === entries.length ? 'completed' : 'in_progress',
        updatedAt: new Date().toISOString(),
      },
      null,
      2
    ),
    'utf8'
  );
  return ready;
}

async function main() {
  const manifestOnly = process.argv.includes('--manifest-only');
  const testOnly = process.argv.includes('--test-only');
  const batchSize = Math.min(25, getArgNumber('--batch-size', 25));
  const maxBatches = getArgNumber('--max-batches', Number.MAX_SAFE_INTEGER);

  const apiKey = process.env.GEMINI_API_KEY;
  console.log(`GEMINI_API_KEY exists: ${Boolean(apiKey)}`);

  const ai = apiKey
    ? new GoogleGenAI({
        apiKey,
        apiVersion: 'v1beta',
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
      })
    : null;
  const ttsState = { geminiQuotaExhausted: !apiKey };

  if (testOnly) {
    fs.mkdirSync(AUDIO_OUT_DIR, { recursive: true });
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lumi-tts-test-'));
    try {
      const testEntry: AudioCatalogEntry = {
        id: 'test-ar',
        filename: 'test-ar.mp3',
        text: 'مَرْحَبًا بِكَ يَا بَطَلِي فِي لُومِي!',
        ttsText: 'مَرْحَبًا بِكَ يَا بَطَلِي فِي لُومِي!',
        lang: 'ar',
        category: 'test',
      };
      const testPath = path.join(AUDIO_OUT_DIR, testEntry.filename);
      if (fs.existsSync(testPath)) fs.unlinkSync(testPath);
      await generateMp3ForEntry(ai, testEntry, tmpDir, ttsState);
      const stats = fs.statSync(testPath);
      console.log(`[AudioGen] Test MP3 generated: public/audio/${testEntry.filename} (${stats.size} bytes)`);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
    return;
  }

  console.log('[AudioGen] Extracting all spoken phrases from Lumi Kids...');
  const entries = await buildCatalog();
  writeManifestFiles(entries);
  console.log(`[AudioGen] Wrote ${entries.length} entries to src/data/audioManifest.ts`);

  if (manifestOnly) {
    console.log('[AudioGen] --manifest-only completed.');
    return;
  }

  const pendingEntries = entries.filter((e) => {
    const p = path.join(AUDIO_OUT_DIR, e.filename);
    return !fs.existsSync(p) || fs.statSync(p).size <= 500;
  });

  const alreadyDone = entries.length - pendingEntries.length;
  console.log(
    `[AudioGen] Resuming: ${alreadyDone}/${entries.length} MP3s already exist, ${pendingEntries.length} remaining.`
  );

  if (pendingEntries.length === 0) {
    saveBatchProgress(entries, Math.ceil(entries.length / batchSize));
    console.log('[AudioGen] All entries already exist! Nothing to generate.');
    return;
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lumi-tts-'));
  let generated = 0;
  let failed = 0;

  try {
    const concurrency = 6;
    const totalBatches = Math.ceil(pendingEntries.length / batchSize);
    const batchesToRun = Math.min(totalBatches, maxBatches);
    const failedAll: AudioCatalogEntry[] = [];

    for (let b = 0; b < batchesToRun; b++) {
      const batch = pendingEntries.slice(b * batchSize, (b + 1) * batchSize);
      let cursor = 0;

      async function worker() {
        while (cursor < batch.length) {
          const idx = cursor++;
          const entry = batch[idx];
          try {
            const status = await generateMp3ForEntry(ai, entry, tmpDir, ttsState);
            if (status === 'generated') generated++;
          } catch (err) {
            failedAll.push(entry);
            console.error(`[AudioGen] Failed ${entry.id} (batch ${b + 1}):`, (err as Error)?.message || err);
          }
        }
      }

      await Promise.all(Array.from({ length: concurrency }, () => worker()));
      const readyCount = saveBatchProgress(entries, b + 1);
      console.log(
        `[AudioGen] Batch ${b + 1}/${batchesToRun} saved: ${readyCount}/${entries.length} ready (+${generated} new this run)`
      );
    }

    let retryQueue = failedAll;
    for (let pass = 1; pass <= 2 && retryQueue.length > 0; pass++) {
      console.log(`[AudioGen] Retry pass ${pass}/2 for ${retryQueue.length} missing files...`);
      await new Promise((r) => setTimeout(r, 1500));
      const nextRetry: AudioCatalogEntry[] = [];
      let cursor = 0;

      async function retryWorker() {
        while (cursor < retryQueue.length) {
          const idx = cursor++;
          const entry = retryQueue[idx];
          try {
            const status = await generateMp3ForEntry(ai, entry, tmpDir, ttsState);
            if (status === 'generated') generated++;
          } catch (err) {
            nextRetry.push(entry);
            console.error(`[AudioGen] Retry failed ${entry.id}:`, (err as Error)?.message || err);
          }
        }
      }

      await Promise.all(Array.from({ length: 3 }, () => retryWorker()));
      retryQueue = nextRetry;
      saveBatchProgress(entries, batchesToRun);
    }

    const finalReady = saveBatchProgress(entries, batchesToRun);
    failed = entries.length - finalReady;
    console.log(
      `[AudioGen] Run complete: Ready=${finalReady}/${entries.length}, NewThisRun=${generated}, RemainingMissing=${failed}`
    );
    if (failed > 0) {
      process.exitCode = 1;
    }
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error('[AudioGen] Fatal error:', err);
  process.exit(1);
});
