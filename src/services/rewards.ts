// Points, Gamification, Badges, and Certificate Generator Engine
// Designed for clean extensibility, offline persistence, and multi-track achievement tracking
import { resolveAssetUrl } from '../utils/assetResolver';

export interface BadgeItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'letters' | 'spelling' | 'stories' | 'math' | 'art' | 'streak';
  requiredCount: number;
  unlocked: boolean;
  unlockedAt?: string;
  starReward: number;
}

export interface CertificateData {
  id: string;
  childName: string;
  avatarUrl: string;
  courseTitle: string;
  completionDate: string;
  totalStars: number;
  masteredLettersCount: number;
  certificateNumber: string;
}

const LOCAL_BADGES_KEY = 'lumi_child_badges_v1';
const LOCAL_CERTIFICATES_KEY = 'lumi_child_certificates_v1';

const INITIAL_BADGES: BadgeItem[] = [
  {
    id: 'badge_letters_master',
    title: 'بَطَلُ الْحُرُوفِ الْأَبْجَدِيَّةِ',
    description: 'أَتْقَنْتَ تَعَلُّمَ وَنُطْقَ أَكْثَرَ مِنْ ١٠ حُرُوفٍ عَرَبِيَّةٍ مَعَ الْحَرَكَاتِ!',
    icon: '👑',
    category: 'letters',
    requiredCount: 10,
    unlocked: true,
    unlockedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    starReward: 25,
  },
  {
    id: 'badge_sukoon_expert',
    title: 'فَارِسُ السُّكُونِ «أَتْ»',
    description: 'أَتْقَنْتَ صَوْتَ السُّكُونِ لِلْحُرُوفِ بِطَرِيقَةٍ صَوْتِيَّةٍ صَحِيحَةٍ.',
    icon: '🎯',
    category: 'letters',
    requiredCount: 5,
    unlocked: true,
    unlockedAt: new Date(Date.now() - 86400000).toISOString(),
    starReward: 20,
  },
  {
    id: 'badge_spelling_star',
    title: 'نَجْمُ التَّهْجِئَةِ وَالتَّنْوِينِ',
    description: 'قَرَأْتَ وَرَكَّبْتَ كَلِمَاتٍ مُشَكَّلَةً بِتَنْوِينِ الضَّمِّ وَالْفَتْحِ!',
    icon: '⭐',
    category: 'spelling',
    requiredCount: 6,
    unlocked: false,
    starReward: 30,
  },
  {
    id: 'badge_story_reader',
    title: 'صَدِيقُ الْقِصَصِ الْوَاقِعِيَّةِ',
    description: 'اسْتَمَعْتَ وَتَفَاعَلْتَ مَعَ قِصَّتَيْنِ كَامِلَتَيْنِ مَعَ أَبْطَالِ لُومِي.',
    icon: '📚',
    category: 'stories',
    requiredCount: 2,
    unlocked: false,
    starReward: 35,
  },
  {
    id: 'badge_math_genius',
    title: 'عَبْقَرِيُّ الْحِسَابِ الصَّغِيرُ',
    description: 'حَلَلْتَ ٥ مَسَائِلَ جَمْعٍ وَعَدٍّ لِلْأَشْيَاءِ بِنَجَاحٍ تَامٍّ.',
    icon: '🧮',
    category: 'math',
    requiredCount: 5,
    unlocked: false,
    starReward: 20,
  },
  {
    id: 'badge_artist',
    title: 'فَنَّانُ مَرْسَمِ الْأَلْوَانِ',
    description: 'أَبْدَعْتَ فِي تَلْوِينِ لَوْحَتَيْنِ فِي مَرْسَمِ لُومِي لِلْفُنُونِ.',
    icon: '🎨',
    category: 'art',
    requiredCount: 2,
    unlocked: true,
    unlockedAt: new Date().toISOString(),
    starReward: 15,
  },
  {
    id: 'badge_streak_7',
    title: 'سِلْسِلَةُ التَّفَوُّقِ (٧ أَيَّامٍ)',
    description: 'ثَابَرْتَ عَلَى التَّعَلُّمِ لِمُدَّةِ أُسْبُوعٍ كَامِلٍ دُونَ انْقِطَاعٍ!',
    icon: '🔥',
    category: 'streak',
    requiredCount: 7,
    unlocked: false,
    starReward: 50,
  },
];

class RewardsService {
  private badges: BadgeItem[] = [];

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const saved = localStorage.getItem(LOCAL_BADGES_KEY);
      this.badges = saved ? JSON.parse(saved) : INITIAL_BADGES;
    } catch {
      this.badges = INITIAL_BADGES;
    }
  }

  private saveState() {
    try {
      localStorage.setItem(LOCAL_BADGES_KEY, JSON.stringify(this.badges));
    } catch (e) {
      console.error(e);
    }
  }

  public getAllBadges(): BadgeItem[] {
    return this.badges;
  }

  public getUnlockedBadges(): BadgeItem[] {
    return this.badges.filter((b) => b.unlocked);
  }

  public unlockBadge(badgeId: string): boolean {
    let unlocked = false;
    this.badges = this.badges.map((b) => {
      if (b.id === badgeId && !b.unlocked) {
        unlocked = true;
        return {
          ...b,
          unlocked: true,
          unlockedAt: new Date().toISOString(),
        };
      }
      return b;
    });

    if (unlocked) {
      this.saveState();
    }
    return unlocked;
  }

  // Generate an official Child Achievement Certificate
  public generateCertificate(childName: string, avatarUrl: string, totalStars: number): CertificateData {
    const certNumber = 'LUMI-CERT-' + Math.floor(100000 + Math.random() * 900000);
    const dateFormatted = new Date().toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const cert: CertificateData = {
      id: 'cert_' + Date.now(),
      childName: childName || 'بَطَلُ لُومِي',
      avatarUrl: resolveAssetUrl(avatarUrl || '/src/assets/images/avatar_boy_explorer_1793016699238.jpg'),
      courseTitle: 'شَهَادَةُ إِتْمَامِ مَسَارِ الْحُرُوفِ وَالْقِرَاءَةِ التَّأْسِيسِيَّةِ',
      completionDate: dateFormatted,
      totalStars: totalStars || 85,
      masteredLettersCount: 28,
      certificateNumber: certNumber,
    };

    try {
      const existing = localStorage.getItem(LOCAL_CERTIFICATES_KEY);
      const list = existing ? JSON.parse(existing) : [];
      list.push(cert);
      localStorage.setItem(LOCAL_CERTIFICATES_KEY, JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }

    return cert;
  }
}

export const rewardsService = new RewardsService();
