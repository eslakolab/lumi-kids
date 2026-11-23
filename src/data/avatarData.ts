import { resolveAssetUrl } from '../utils/assetResolver';

export interface ChildAvatar {
  id: string;
  name: string;
  nameEn: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  image: string;
  badgeColor: string;
  borderColor: string;
  cheerPhrase: string;
  cheerPhraseEn: string;
}

export const CHILD_AVATARS: ChildAvatar[] = [
  {
    id: 'explorer',
    name: 'الْمُسْتَكْشِفُ الصَّغِيرُ',
    nameEn: 'Little Explorer',
    title: 'مُسْتَكْشِفٌ شُجَاعٌ',
    titleEn: 'Brave Explorer',
    description: 'يُحِبُّ الْمُغَامَرَاتِ وَاسْتِكْشَافَ الطَّبِيعَةِ وَالْأَمَاكِنِ الْجَدِيدَةِ!',
    descriptionEn: 'Loves adventures, nature walks, and discovering new worlds!',
    image: resolveAssetUrl('/src/assets/images/avatar_boy_explorer_1793016699238.jpg'),
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    borderColor: 'border-emerald-400 ring-emerald-200',
    cheerPhrase: 'أَهْلًا بِالْمُسْتَكْشِفِ الصَّغِيرِ! هَيَّا نَسْتَكْشِفْ عَالَمَ التَّعَلُّمِ مَعًا!',
    cheerPhraseEn: 'Welcome Little Explorer! Let us discover the joyful world of learning together!',
  },
  {
    id: 'artist',
    name: 'الْفَنَّانَةُ الْمُبْدِعَةُ',
    nameEn: 'Creative Artist',
    title: 'رَسَّامَةٌ ذَكِيَّةٌ',
    titleEn: 'Smart Painter',
    description: 'تُحِبُّ الْأَلْوَانَ الزَّاهِيَةَ وَالرَّسْمَ وَالْإِبْدَاعَ فِي كُلِّ يَوْمٍ!',
    descriptionEn: 'Loves bright colors, painting, and daily artistic creativity!',
    image: resolveAssetUrl('/src/assets/images/avatar_girl_artist_1793016699157.jpg'),
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
    borderColor: 'border-rose-400 ring-rose-200',
    cheerPhrase: 'أَهْلًا بِالْفَنَّانَةِ الْمُبْدِعَةِ! يَوْمُنَا مَلِيءٌ بِالْأَلْوَانِ وَالْفَرَحِ!',
    cheerPhraseEn: 'Hello Creative Artist! Our day is full of colors, imagination, and fun!',
  },
  {
    id: 'astronaut',
    name: 'رَائِدُ الْفَضَاءِ',
    nameEn: 'Little Astronaut',
    title: 'عَالِمُ النُّجُومِ',
    titleEn: 'Star Explorer',
    description: 'يَطِيرُ بَيْنَ النُّجُومِ وَالْكَوَاكِبِ لِيَتَعَلَّمَ أَسْرَارَ الْكَوْنِ!',
    descriptionEn: 'Soars among stars and planets uncovering cosmic mysteries!',
    image: resolveAssetUrl('/src/assets/images/avatar_little_astronaut_1793016700623.jpg'),
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
    borderColor: 'border-blue-400 ring-blue-200',
    cheerPhrase: 'مَرْحَبًا يَا رَائِدَ الْفَضَاءِ الصَّغِيرَ! سَنَنْطَلِقُ إِلَى قِمَّةِ النَّجَاحِ!',
    cheerPhraseEn: 'Hello Little Astronaut! We will launch together toward the stars of success!',
  },
  {
    id: 'falcon',
    name: 'الصَّقْرُ اللَّطِيفُ',
    nameEn: 'Gentle Falcon',
    title: 'سَرِيعٌ وَذَكِيٌّ',
    titleEn: 'Swift & Smart',
    description: 'يُحَلِّقُ عَالِيًا بِجَنَاحَيْهِ الذَّهَبِيَّيْنِ وَيَرَى الْأَشْيَاءَ بِدِقَّةٍ!',
    descriptionEn: 'Flies high with golden wings and observes everything with keen eyesight!',
    image: resolveAssetUrl('/src/assets/images/avatar_cute_falcon_1793016700087.jpg'),
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    borderColor: 'border-amber-400 ring-amber-200',
    cheerPhrase: 'يَا لَهُ مِنْ صَقْرٍ رَائِعٍ! أَنْتَ سَرِيعُ الْفَهْمِ وَالنَّبَاهَةِ!',
    cheerPhraseEn: 'What a magnificent falcon! You are swift, bright, and observant!',
  },
  {
    id: 'star',
    name: 'نَجْمُورُ اللَّامِعُ',
    nameEn: 'Shining Star Najmour',
    title: 'نَجْمُ لُومِي',
    titleEn: 'Lumi Star Hero',
    description: 'صَدِيقُ الْأَطْفَالِ الْمَرِحُ الَّذِي يُشِعُّ نُورًا وَتَفَاؤُلًا!',
    descriptionEn: 'Every child’s cheerful buddy beaming with optimism and starlight!',
    image: resolveAssetUrl('/src/assets/images/star_mascot_1792840098218.jpg'),
    badgeColor: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    borderColor: 'border-yellow-400 ring-yellow-200',
    cheerPhrase: 'نَجْمُورُ سَعِيدٌ جِدًّا بِكَ! سَنَتَعَلَّمُ وَنَمْرَحُ كُلَّ يَوْمٍ!',
    cheerPhraseEn: 'Najmour is so thrilled to be with you! Let us learn and celebrate every single day!',
  },
  {
    id: 'lion',
    name: 'الْأَسَدُ الشُّجَاعُ',
    nameEn: 'Brave Little Lion',
    title: 'بَطَلٌ قَوِيٌّ',
    titleEn: 'Mighty Champion',
    description: 'مَلِكُ الْغَابَةِ الشُّجَاعُ الَّذِي لَا يَخَافُ الصِّعَابَ!',
    descriptionEn: 'The brave king of the jungle who fearlessly overcomes challenges!',
    image: resolveAssetUrl('/src/assets/images/real_lion_wildlife_1792843119204.jpg'),
    badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
    borderColor: 'border-orange-400 ring-orange-200',
    cheerPhrase: 'أَنْتَ أَسَدٌ شُجَاعٌ وَقَوِيٌّ! تَقَدَّمْ يَا بَطَلِي!',
    cheerPhraseEn: 'You are a strong and brave lion! March forward, little hero!',
  },
];

export const DEFAULT_AVATAR = CHILD_AVATARS[0];

export const LOCAL_STORAGE_AVATAR_KEY = 'lumi_child_avatar_id';
export const LOCAL_STORAGE_NAME_KEY = 'lumi_child_custom_name';

export function getSavedAvatar(): ChildAvatar {
  try {
    const savedId = localStorage.getItem(LOCAL_STORAGE_AVATAR_KEY);
    if (savedId) {
      const found = CHILD_AVATARS.find((a) => a.id === savedId);
      if (found) return found;
    }
  } catch {
    // Ignore localStorage errors
  }
  return DEFAULT_AVATAR;
}

export function saveAvatarChoice(avatarId: string): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_AVATAR_KEY, avatarId);
  } catch {
    // Ignore localStorage errors
  }
}

export function getSavedChildName(): string {
  try {
    return localStorage.getItem(LOCAL_STORAGE_NAME_KEY) || 'الْبَطَلُ الصَّغِيرُ';
  } catch {
    return 'الْبَطَلُ الصَّغِيرُ';
  }
}

export function saveChildName(name: string): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_NAME_KEY, name);
  } catch {
    // Ignore localStorage errors
  }
}
