// Centralized image and illustration resolver for letter examples in Arabic (فَتْحَة، ضَمَّة، كَسْرَة، سُكُون)

import { resolveAssetUrl } from './assetResolver';

export const IBRIK_TEAPOT_IMAGE = resolveAssetUrl('/src/assets/images/real_ibrik_teapot_1793189726918.jpg');
export const APPLE_IMAGE = resolveAssetUrl('/src/assets/images/real_red_apple_1792962871845.jpg');
export const RABBIT_IMAGE = resolveAssetUrl('/src/assets/images/real_rabbit_pet_1792847755421.jpg');
export const CAT_IMAGE = resolveAssetUrl('/src/assets/images/real_cat_pet_1792847741756.jpg');
export const FISH_IMAGE = resolveAssetUrl('/src/assets/images/real_goldfish_pet_1792847770289.jpg');
export const HORSE_IMAGE = resolveAssetUrl('/src/assets/images/real_horse_animal_1792847786785.jpg');
export const CAMEL_IMAGE = resolveAssetUrl('/src/assets/images/real_camel_animal_1792847800819.jpg');
export const LION_IMAGE = resolveAssetUrl('/src/assets/images/real_lion_wildlife_1792843119204.jpg');
export const BOOK_IMAGE = resolveAssetUrl('/src/assets/images/real_book_reading_1792962856581.jpg');
export const HOUSE_IMAGE = resolveAssetUrl('/src/assets/images/real_cozy_house_1792962856930.jpg');
export const SUN_IMAGE = resolveAssetUrl('/src/assets/images/real_bright_sun_1792962857338.jpg');
export const CAR_IMAGE = resolveAssetUrl('/src/assets/images/real_family_car_1792962871621.jpg');
export const BALL_IMAGE = resolveAssetUrl('/src/assets/images/real_soccer_ball_1792962871327.jpg');
export const FLOWER_IMAGE = resolveAssetUrl('/src/assets/images/real_garden_flower_1792962857102.jpg');
export const GREEN_TREE_IMAGE = resolveAssetUrl('/src/assets/images/real_apple_tree_1792843118453.jpg');
export const SCHOOL_BUILDING_IMAGE = resolveAssetUrl('/src/assets/images/real_school_building_1792843119232.jpg');

export interface LetterExampleVisual {
  word: string;
  image: string;
  fallbackIcon?: string;
  alt: string;
}

// Map example words to their image/illustration
export const LETTER_EXAMPLES_MAP: Record<string, string> = {
  // Alif
  'أَرْنَبٌ': RABBIT_IMAGE,
  'أُذُنٌ': 'ear',
  'إِبْرِيقٌ': IBRIK_TEAPOT_IMAGE,
  'فَأْرٌ': 'mouse',

  // Baa
  'بَيْتٌ': HOUSE_IMAGE,
  'بُرْتُقَالٌ': 'orange',
  'بِنْتٌ': resolveAssetUrl('/src/assets/images/avatar_girl_artist_1793016699157.jpg'),
  'حَبْلٌ': 'rope',

  // Taa
  'تَمْرٌ': 'dates',
  'تُفَّاحٌ': APPLE_IMAGE,
  'تِمْسَاحٌ': 'crocodile',
  'كَتْكُوتٌ': 'chick',

  // Thaa
  'ثَعْلَبٌ': 'fox',
  'ثُعْبَانٌ': 'snake',
  'ثِيَابٌ': 'clothes',
  'مِثْقَالٌ': 'scale',

  // Jeem
  'جَمَلٌ': CAMEL_IMAGE,
  'جُبْنٌ': 'cheese',
  'جِدَارٌ': 'wall',
  'نَجْمٌ': 'star',

  // Haa
  'حَلِيبٌ': 'milk',
  'حُوتٌ': 'whale',
  'حِصَانٌ': HORSE_IMAGE,
  'بَحْرٌ': 'sea',

  // Khaa
  'خَرُوفٌ': 'sheep',
  'خُبْزٌ': 'bread',
  'خِيَارٌ': 'cucumber',
  'نَخْلَةٌ': 'palmtree',

  // Daal
  'دَرَّاجَةٌ': 'bicycle',
  'دُبٌّ': 'bear',
  'دِيكٌ': 'rooster',
  'هَدْهَدٌ': 'hoopoe',

  // Dhaal
  'ذَهَبٌ': 'gold',
  'ذُرَةٌ': 'corn',
  'ذِئْبٌ': 'wolf',
  'بَذْرَةٌ': 'seed',

  // Raa
  'رَجُلٌ': resolveAssetUrl('/src/assets/images/real_father_child_1792843118553.jpg'),
  'رُمَّانٌ': 'pomegranate',
  'رِيشَةٌ': 'feather',
  'بَرْقٌ': 'lightning',

  // Zaay
  'زَهْرَةٌ': FLOWER_IMAGE,
  'زُبْدَةٌ': 'butter',
  'زِرٌّ': 'button',
  'مَزْرَعَةٌ': 'farm',

  // Seen
  'سَمَكَةٌ': FISH_IMAGE,
  'سُلَحْفَاةٌ': 'turtle',
  'سِتَارٌ': 'curtain',
  'شَمْسٌ': SUN_IMAGE,

  // Sheen
  'شَجَرَةٌ': GREEN_TREE_IMAGE,
  'شُرْطِيٌّ': 'policeman',
  'شِبْلٌ': LION_IMAGE,
  'عُشٌّ': 'nest',

  // Saad
  'صَقْرٌ': resolveAssetUrl('/src/assets/images/avatar_cute_falcon_1793016700087.jpg'),
  'صُنْدُوقٌ': 'box',
  'صِنَّارَةٌ': 'fishing_rod',
  'قَصْرٌ': 'palace',

  // Daad
  'ضَوْءٌ': SUN_IMAGE,
  'ضُيُوفٌ': 'guests',
  'ضِرْسٌ': 'tooth',
  'حَوْضٌ': 'pond',

  // Taa (Heavy)
  'طَيَّارَةٌ': 'airplane',
  'طُيُورٌ': 'birds',
  'طِفْلٌ': resolveAssetUrl('/src/assets/images/avatar_boy_explorer_1793016699238.jpg'),
  'قِطْفٌ': 'grape_bunch',

  // Zaa (Heavy)
  'ظَبْيٌ': 'deer',
  'ظُفْرٌ': 'fingernail',
  'ظِلٌّ': 'shadow',
  'عَظْمٌ': 'bone',

  // Ayn
  'عَسَلٌ': 'honey',
  'عُصْفُورٌ': 'sparrow',
  'عِنَبٌ': 'grapes',

  // Ghayn
  'غَزَالٌ': 'gazelle',
  'غُرَابٌ': 'crow',
  'غِطَاءٌ': 'blanket',
  'مَغْرِبٌ': 'sunset',

  // Faa
  'فَرَاشَةٌ': 'butterfly',
  'فُرْشَاةٌ': 'brush',
  'فِيلٌ': 'elephant',

  // Qaaf
  'قَلَمٌ': 'pencil',
  'قُبَّعَةٌ': 'hat',
  'قِطَارٌ': 'train',

  // Kaaf
  'كِتَابٌ': BOOK_IMAGE,
  'كُرَةٌ': BALL_IMAGE,
  'كِتَابَةٌ': 'writing',
  'مَكْتَبٌ': 'desk',

  // Laam
  'لَيْمُونٌ': 'lemon',
  'لُعْبَةٌ': 'toy',
  'لِسَانٌ': 'tongue',
  'قَلْبٌ': 'heart',

  // Meem
  'مَدْرَسَةٌ': SCHOOL_BUILDING_IMAGE,
  'مُعَلِّمٌ': 'teacher',
  'مِقَصٌّ': 'scissors',

  // Noon
  'نَجْمَةٌ': 'star',
  'نُورٌ': SUN_IMAGE,
  'نِسْرٌ': 'eagle',
  'عَيْنٌ': 'eye',

  // Haa
  'هَرَمٌ': 'pyramid',
  'هُدْهُدٌ': 'hoopoe',
  'هِلَالٌ': 'crescent',
  'فَهْدٌ': 'cheetah',

  // Waaw
  'وَرْدَةٌ': FLOWER_IMAGE,
  'وُجُوهٌ': 'faces',
  'وِسَادَةٌ': 'pillow',
  'مَوْزٌ': 'banana',

  // Yaa
  'يَدٌ': 'hand',
  'يُوسُفِيٌّ': 'mandarin',
  'يَنَابِيعُ': 'springs',
};

// Child-friendly emojis for concepts without local photographic asset
const FALLBACK_EMOJIS: Record<string, string> = {
  ear: '👂',
  mouse: '🐭',
  orange: '🍊',
  rope: '🪢',
  dates: '🌴',
  crocodile: '🐊',
  chick: '🐥',
  fox: '🦊',
  snake: '🐍',
  clothes: '👕',
  scale: '⚖️',
  cheese: '🧀',
  wall: '🧱',
  star: '⭐',
  milk: '🥛',
  whale: '🐋',
  sea: '🌊',
  sheep: '🐑',
  bread: '🍞',
  cucumber: '🥒',
  palmtree: '🌴',
  bicycle: '🚲',
  bear: '🐻',
  rooster: '🐓',
  hoopoe: '🪶',
  gold: '🪙',
  corn: '🌽',
  wolf: '🐺',
  seed: '🌱',
  pomegranate: '🍎',
  feather: '🪶',
  lightning: '⚡',
  butter: '🧈',
  button: '🔘',
  farm: '🚜',
  turtle: '🐢',
  curtain: '🪟',
  policeman: '👮',
  nest: '🪺',
  box: '📦',
  fishing_rod: '🎣',
  palace: '🏰',
  guests: '👥',
  tooth: '🦷',
  pond: '🏞️',
  airplane: '✈️',
  birds: '🕊️',
  grape_bunch: '🍇',
  deer: '🦌',
  fingernail: '💅',
  shadow: '👤',
  bone: '🦴',
  honey: '🍯',
  sparrow: '🐦',
  grapes: '🍇',
  gazelle: '🦌',
  crow: '🦅',
  blanket: '🧣',
  sunset: '🌅',
  eagle: '🦅',
  eye: '👁️',
  pyramid: '🔺',
  crescent: '🌙',
  cheetah: '🐆',
  faces: '😀',
  pillow: '🛋️',
  banana: '🍌',
  hand: '✋',
  mandarin: '🍊',
  springs: '💧',
};

export interface LetterVisualResult {
  isImage: boolean;
  src?: string;
  emoji?: string;
  word: string;
}

export function getLetterVisualData(exampleWord: string): LetterVisualResult {
  const clean = exampleWord.trim();
  let foundValue = LETTER_EXAMPLES_MAP[clean];

  if (!foundValue) {
    const strippedClean = clean.replace(/[\u064B-\u0652]/g, '');
    for (const [key, val] of Object.entries(LETTER_EXAMPLES_MAP)) {
      if (key.replace(/[\u064B-\u0652]/g, '') === strippedClean) {
        foundValue = val;
        break;
      }
    }
  }

  // Check if it's an image path (specifically for teapot إبريق or other real assets)
  if (foundValue && (foundValue.startsWith('/') || foundValue.startsWith('http') || foundValue.startsWith('data:image') || foundValue.includes('.'))) {
    return {
      isImage: true,
      src: resolveAssetUrl(foundValue),
      word: clean,
    };
  }

  // If identifier has emoji
  if (foundValue && FALLBACK_EMOJIS[foundValue]) {
    return {
      isImage: false,
      emoji: FALLBACK_EMOJIS[foundValue],
      word: clean,
    };
  }

  // If word itself is teapot / إبريق
  if (clean.includes('إِبْرِيق') || clean.includes('إبريق')) {
    return {
      isImage: true,
      src: IBRIK_TEAPOT_IMAGE,
      word: clean,
    };
  }

  return {
    isImage: true,
    src: IBRIK_TEAPOT_IMAGE,
    word: clean,
  };
}

export function getLetterExampleImage(exampleWord: string): string {
  const res = getLetterVisualData(exampleWord);
  return res.src || IBRIK_TEAPOT_IMAGE;
}

