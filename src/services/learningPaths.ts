// Multi-Track Educational Curricula and Future AI Adaptive Recommendation Service
// Supports: KG / Grade 1 / Advanced Reading / STEM tracks and AI-powered personalized progression

export interface LearningTrack {
  id: string;
  title: string;
  ageGroup: string;
  icon: string;
  color: string;
  description: string;
  totalModules: number;
  completedModules: number;
  targetSkills: string[];
}

export interface AIRecommendation {
  recommendedTrackId: string;
  recommendedLessonTitle: string;
  targetSkill: string;
  reason: string;
  difficultyAdjustment: 'easier' | 'optimal' | 'challenge';
  confidenceScore: number;
}

export const LEARNING_TRACKS: LearningTrack[] = [
  {
    id: 'track_kg',
    title: 'مَسَارُ الرَّوْضَةِ وَالتَّمْهِيدِيِّ (KG)',
    ageGroup: '٣ - ٥ سَنَوَاتٍ',
    icon: '🌱',
    color: 'from-emerald-400 to-teal-500',
    description: 'اسْتِكْشَافُ الْحُرُوفِ الْأَبْجَدِيَّةِ، التَّعَرُّفُ الصَّوْتِيُّ، وَأَلْعَابُ التَّلْوِينِ وَالْأَشْكَالِ.',
    totalModules: 12,
    completedModules: 9,
    targetSkills: ['التعرف الصوتي', 'ربط الحرف بالصورة', 'تتبع الخطوط'],
  },
  {
    id: 'track_grade1',
    title: 'مَسَارُ التَّأْسِيسِ وَالْحَرَكَاتِ (الصف الأول)',
    ageGroup: '٥ - ٧ سَنَوَاتٍ',
    icon: '📖',
    color: 'from-amber-400 to-orange-500',
    description: 'إِتْقَانُ حَرَكَاتِ الْفَتْحِ وَالضَّمِّ وَالْكَسْرِ، نُطْقُ السُّكُونِ (أَتْ)، وَتَهْجِئَةُ الْكَلِمَاتِ.',
    totalModules: 18,
    completedModules: 14,
    targetSkills: ['الحركات الثلاث', 'صوت السكون الصامت', 'تحليل المقاطع الصوتية'],
  },
  {
    id: 'track_reading_advanced',
    title: 'مَسَارُ الطَّلَاقَةِ وَالْقِرَاءَةِ الْمُتَقَدِّمَةِ',
    ageGroup: '٧ - ٩ سَنَوَاتٍ',
    icon: '🌟',
    color: 'from-blue-400 to-indigo-500',
    description: 'التَّنْوِينُ بِأَنْوَاعِهِ، حُرُوفُ الْمَدِّ، قِرَاءَةُ الْجُمَلِ الطَّوِيلَةِ، وَالْقِصَصُ الْوَاقِعِيَّةُ.',
    totalModules: 20,
    completedModules: 8,
    targetSkills: ['التنوين بأنواعه', 'فهم المقروء', 'القراءة التعبيرية المسترسلة'],
  },
  {
    id: 'track_stem_logic',
    title: 'مَسَارُ الرِّيَاضِيَّاتِ وَالْعُلُومِ وَالذَّكَاءِ',
    ageGroup: '٥ - ٩ سَنَوَاتٍ',
    icon: '🚀',
    color: 'from-purple-400 to-pink-500',
    description: 'الْجَمْعُ وَالطَّرْحُ الْمُصَوَّرُ، عَالَمُ الْحَيَوَانَاتِ، تَجَارِبُ الْمُخْتَبَرِ، وَأَلْعَابُ التَّرْكِيزِ.',
    totalModules: 15,
    completedModules: 10,
    targetSkills: ['العد والحساب الذهني', 'الملاحظة العلمية', 'حل المشكلات والذاكرة'],
  },
];

class LearningPathsManager {
  private activeTrackId: string = 'track_grade1';

  public getTracks(): LearningTrack[] {
    return LEARNING_TRACKS;
  }

  public getActiveTrack(): LearningTrack {
    return LEARNING_TRACKS.find((t) => t.id === this.activeTrackId) || LEARNING_TRACKS[1];
  }

  public setActiveTrack(trackId: string) {
    this.activeTrackId = trackId;
    try {
      localStorage.setItem('lumi_active_track_id', trackId);
    } catch (e) {
      console.error(e);
    }
  }

  // Adaptive AI Recommendation Engine
  // Evaluates performance signals and dynamically generates tailored curriculum hints
  public getAIRecommendation(progress: {
    completedLettersCount: number;
    spellingScore: number;
    starsCount: number;
  }): AIRecommendation {
    if (progress.completedLettersCount < 10) {
      return {
        recommendedTrackId: 'track_grade1',
        recommendedLessonTitle: 'تَدْرِيبُ حَرَكَاتِ الْفَتْحِ وَالضَّمِّ لِبَاقِي الْحُرُوفِ',
        targetSkill: 'تَثْبِيتُ الْحَرَكَاتِ التَّأْسِيسِيَّةِ',
        reason: 'أَظْهَرَ الطِّفْلُ اسْتِيعَابًا رَائِعًا لِلْحُرُوفِ الْأُولَى، وَالْأَفْضَلُ الْآنَ إِكْمَالُ حُرُوفِ الْمُسْتَوَى الْأَوَّلِ.',
        difficultyAdjustment: 'optimal',
        confidenceScore: 94,
      };
    } else if (progress.spellingScore < 20) {
      return {
        recommendedTrackId: 'track_grade1',
        recommendedLessonTitle: 'تَحَدِّي نُطْقِ السُّكُونِ «أَتْ» وَتَهْجِئَةِ «تُفَّاحٌ»',
        targetSkill: 'السُّكُونُ وَتَنْوِينُ الضَّمِّ',
        reason: 'تَمَّ اكْتِشَافُ حَاجَةِ الطِّفْلِ لِتَمْرِينٍ إِضَافِيٍّ عَلَى مَقَاطِعِ السُّكُونِ لِتَعْزِيزِ طَلَاقَتِهِ.',
        difficultyAdjustment: 'optimal',
        confidenceScore: 91,
      };
    } else {
      return {
        recommendedTrackId: 'track_reading_advanced',
        recommendedLessonTitle: 'قِرَاءَةُ قِصَّةِ «أَحْمَدُ فِي الْمَزْرَعَةِ الْخَضْرَاءِ»',
        targetSkill: 'الْقِرَاءَةُ الْمُسْتَرْسِلَةُ وَفَهْمُ الْمَقْرُوءِ',
        reason: 'مُسْتَوَى الطِّفْلِ مُتَقَدِّمٌ جِدًّا! يُمْكِنُهُ الْآنَ الِانْتِقَالُ لِقِرَاءَةِ الْجُمَلِ وَالْقِصَصِ الْكَامِلَةِ.',
        difficultyAdjustment: 'challenge',
        confidenceScore: 96,
      };
    }
  }
}

export const learningPathsManager = new LearningPathsManager();
