export type Language = 'ar' | 'en';

export interface Translations {
  appName: string;
  appTagline: string;
  
  // Navigation Tabs
  navHome: string;
  navLetters: string;
  navSpelling: string;
  navWords: string;
  navStories: string;
  navMath: string;
  navFocus: string;
  navScience: string;
  navChemistry: string;
  navColoring: string;
  navGames: string;
  navAvatar: string;
  navPlans: string;
  navPrivacy: string;

  // Home Screen
  welcomeHero: string;
  welcomeSubtitle: string;
  heroGreeting: string;
  changeAvatarBtn: string;
  exploreCategories: string;
  installAppBtn: string;
  installAppDesc: string;

  // Sections
  secLettersTitle: string;
  secLettersSubtitle: string;
  secSpellingTitle: string;
  secSpellingSubtitle: string;
  secWordsTitle: string;
  secWordsSubtitle: string;
  secStoriesTitle: string;
  secStoriesSubtitle: string;
  secMathTitle: string;
  secMathSubtitle: string;
  secFocusTitle: string;
  secFocusSubtitle: string;
  secScienceTitle: string;
  secScienceSubtitle: string;
  secChemistryTitle: string;
  secChemistrySubtitle: string;
  secColoringTitle: string;
  secColoringSubtitle: string;
  secGamesTitle: string;
  secGamesSubtitle: string;
  secAvatarTitle: string;
  secAvatarSubtitle: string;

  // Words & Sentences & Letters
  tabWordsWithDiacritics: string;
  tabSentenceReading: string;

  // Educational Modules Action Buttons & Labels
  btnPronounceLetter: string;
  btnTraceLetter: string;
  btnClearCanvas: string;
  letterLabel: string;
  prevLetter: string;
  nextLetter: string;
  harakaFatha: string;
  harakaDamma: string;
  harakaKasra: string;
  harakaSukoon: string;
  harakaDescription: string;
  btnPronounceWord: string;
  btnReadSentence: string;
  wordSyllables: string;
  wordMeaning: string;
  prevWord: string;
  nextWord: string;
  btnReadWordByWord: string;
  btnPraiseChild: string;
  sentenceInstruction: string;
  prevSentence: string;
  nextSentence: string;
  spellingTitle: string;
  btnBlendWord: string;
  spellingInstruction: string;

  // Parental Gate & Safety (Google Play / App Store Kids compliance)
  parentalGateTitle: string;
  parentalGateNotice: string;
  parentalGateQuestionPrompt: string;
  parentalGateSubmit: string;
  parentalGateCancel: string;
  parentalGateError: string;
  parentZoneTitle: string;
  kidSafetyBadge: string;
  kidSafetyBadgeDesc: string;

  // Store compliance & Privacy
  privacyTitle: string;
  privacyCoppa: string;
  privacyCoppaDesc: string;
  privacyNoAds: string;
  privacyNoAdsDesc: string;
  privacyOffline: string;
  privacyOfflineDesc: string;
  privacyAudio: string;
  privacyAudioDesc: string;
  close: string;
  backToHome: string;

  // Footer
  footerRights: string;
  footerQuality: string;
}

export const translations: Record<Language, Translations> = {
  ar: {
    appName: 'لُومِي',
    appTagline: 'تَعَلَّمْ وَامْرَحْ',
    navHome: 'الرَّئِيسِيَّةُ',
    navLetters: 'الْحُرُوفُ',
    navSpelling: 'التَّهْجِئَةُ 🔤',
    navWords: 'الْكَلِمَاتُ وَالْجُمَلُ',
    navStories: 'قِصَصٌ قَصِيرَةٌ 📖',
    navMath: 'الرِّيَاضِيَّاتُ',
    navFocus: 'التَّرْكِيزُ 👁️',
    navScience: 'الْعُلُومُ',
    navChemistry: 'الْكِيمْيَاءُ',
    navColoring: 'التَّلْوِينُ',
    navGames: 'أَلْعَابُ الذَّكَاءِ',
    navAvatar: 'شَخْصِيَّتِي',
    navPlans: 'خِطَطُ الِاشْتِرَاكِ',
    navPrivacy: 'أَمَانُ الطِّفْلِ 🛡️',

    welcomeHero: 'مَرْحَبًا بِكَ فِي عَالَمِ لُومِي التَّعْلِيمِيِّ!',
    welcomeSubtitle: 'تَعْلِيمٌ مَرِحٌ مُصَمَّمٌ لِبِنَاءِ ثِقَةِ الطِّفْلِ بِالصُّوَرِ الْوَاقِعِيَّةِ وَالصَّوْتِ الْوَاضِحِ.',
    heroGreeting: 'أَهْلًا يَا بَطَلِي',
    changeAvatarBtn: 'تَبْدِيلُ الشَّخْصِيَّةِ',
    exploreCategories: 'اسْتَكْشِفِ الْأَقْسَامَ التَّعْلِيمِيَّةَ',
    installAppBtn: 'تَثْبِيتُ التَّطْبِيقِ',
    installAppDesc: 'تَثْبِيتُ لُومِي كَتَطْبِيقٍ أَصْلِيٍّ عَلَى شَاشَةِ هَاتِفِكَ',

    secLettersTitle: 'الْحُرُوفُ الْهِجَائِيَّةُ',
    secLettersSubtitle: 'الْحُرُوفُ بِالْحَرَكَاتِ وَالتَّتَبُّعِ التَّفَاعُلِيِّ',
    secSpellingTitle: 'قِسْمُ التَّهْجِئَةِ 🔤',
    secSpellingSubtitle: 'تَهْجِئَةُ كَلِمَاتٍ ثُلَاثِيَّةٍ بِالْحَرَكَاتِ الْمَضْبُوطَةِ',
    secWordsTitle: 'الْكَلِمَاتُ وَالْجُمَلُ',
    secWordsSubtitle: 'تَعَلُّمُ الْقِرَاءَةِ مَعَ الصُّوَرِ الْوَاقِعِيَّةِ',
    secStoriesTitle: 'قِصَصٌ قَصِيرَةٌ 📖',
    secStoriesSubtitle: 'حِكَايَاتٌ مُصَوَّرَةٌ بِوَاقِعِيَّةٍ وَتَسْمِيَةُ الْأَشْيَاءِ',
    secMathTitle: 'الرِّيَاضِيَّاتُ وَالْحِسَابُ',
    secMathSubtitle: 'الْمُقَارَنَةُ وَالْجَمْعُ وَالطَّرْحُ الْمُبَسَّطُ',
    secFocusTitle: 'قِسْمُ التَّرْكِيزِ 👁️',
    secFocusSubtitle: 'تَذَكُّرُ الْأَشْكَالِ وَاخْتِفَاؤُهَا وَتَقْوِيَةُ الذَّاكِرَةِ',
    secScienceTitle: 'الْعُلُومُ وَالْحَيَوَانَاتُ',
    secScienceSubtitle: 'حَيَوَانَاتٌ وَأَصْوَاتٌ وَحَقَائِقُ عِلْمِيَّةٌ بَدِيهِيَّةٌ',
    secChemistryTitle: 'مُخْتَبَرُ الْكِيمْيَاءِ',
    secChemistrySubtitle: 'تَجَارِبُ بَدِيهِيَّةٌ بَسِيطَةٌ وَتَفَاعُلَاتٌ آمِنَةٌ',
    secColoringTitle: 'اسْتُودْيُو التَّلْوِينِ',
    secColoringSubtitle: 'تَلْوِينُ الرُّسُومِ الْمُمْتِعَةِ وَتَنْمِيَةُ الْحِسِّ الْفَنِّيِّ',
    secGamesTitle: 'أَلْعَابُ الذَّكَاءِ',
    secGamesSubtitle: 'تَمْيِيزُ الْأَشْكَالِ وَالْأَنْمَاطِ وَالْأَحْجَامِ',
    secAvatarTitle: 'شَخْصِيَّتِي (الْأَفَاتَار) 🌟',
    secAvatarSubtitle: 'اخْتِيَارُ الشَّخْصِيَّةِ وَاللَّقَبِ التَّحْفِيزِيِّ',

    tabWordsWithDiacritics: '📖 الْكَلِمَاتُ بِالْحَرَكَاتِ',
    tabSentenceReading: '🌟 قِرَاءَةُ الْجُمَلِ',

    btnPronounceLetter: 'انْطِقِ الْحَرْفَ بِالْحَرَكَةِ',
    btnTraceLetter: 'تَتَبَّعْ كِتَابَةَ الْحَرْفِ',
    btnClearCanvas: 'مَسْحُ اللَّوْحَةِ',
    letterLabel: 'حَرْفُ',
    prevLetter: 'السَّابِق',
    nextLetter: 'التَّالِي',
    harakaFatha: 'الْفَتْحَةُ',
    harakaDamma: 'الضَّمَّةُ',
    harakaKasra: 'الْكَسْرَةُ',
    harakaSukoon: 'السُّكُونُ',
    harakaDescription: 'تَشْكِيلُ الْحَرْفِ',
    btnPronounceWord: 'انْطِقِ الْكَلِمَةَ كَامِلَةً',
    btnReadSentence: 'قِرَاءَةُ جُمْلَةِ الْكَلِمَةِ',
    wordSyllables: 'تَقْسِيمُ الْمَقَاطِعِ الصَّوْتِيَّةِ',
    wordMeaning: 'مَعْنَى الْكَلِمَةِ',
    prevWord: 'الْكَلِمَةُ السَّابِقَةُ',
    nextWord: 'الْكَلِمَةُ التَّالِيَةُ',
    btnReadWordByWord: 'قِرَاءَةٌ تَدْرِيجِيَّةٌ (كَلِمَةٌ بِكَلِمَةٍ)',
    btnPraiseChild: 'أَحْسَنْتَ يَا بَطَل! 🎉',
    sentenceInstruction: 'انْقُرْ عَلَى أَيِّ كَلِمَةٍ لِسَمَاعِ نُطْقِهَا الْمُنْفَصِلِ',
    prevSentence: 'الْجُمْلَةُ السَّابِقَةُ',
    nextSentence: 'الْجُمْلَةُ التَّالِيَةُ',
    spellingTitle: 'قِسْمُ التَّهْجِئَةِ 🔤',
    btnBlendWord: 'دَمْجُ الْأَصْوَاتِ وَنُطْقُ الْكَلِمَةِ',
    spellingInstruction: 'اضْغَطْ عَلَى كُلِّ حَرْفٍ لِسَمَاعِ صَوْتِهِ ثُمَّ ادْمِجْهَا مَعًا',

    parentalGateTitle: 'بَوَّابَةُ الْوَالِدَيْنِ (Parental Gate)',
    parentalGateNotice: 'هَذِهِ الْمِنْطَقَةُ مُخَصَّصَةٌ لِلْكِبَارِ وَأَوْلِيَاءِ الْأُمُورِ فَقَطْ، حِمَايَةً لِأَطْفَالِنَا وَفْقًا لِمَعَايِيرِ App Store وَ Google Play.',
    parentalGateQuestionPrompt: 'يُرْجَى حَلُّ الْمَسْأَلَةِ الرِّيَاضِيَّةِ التَّالِيَةِ لِتَأْكِيدِ هُوِيَّةِ وَلِيِّ الْأَمْرِ:',
    parentalGateSubmit: 'تَأْكِيدُ الدُّخُولِ',
    parentalGateCancel: 'إِلْغَاءٌ',
    parentalGateError: 'إِجَابَةٌ غَيْرُ صَحِيحَةٍ. حَاوِلْ مَرَّةً أُخْرَى بِمَسْأَلَةٍ جَدِيدَةٍ.',
    parentZoneTitle: 'مِنْطَقَةُ الْوَالِدَيْنِ وَالْإِعْدَادَاتِ',
    kidSafetyBadge: 'آمِنٌ 100% لِلْأَطْفَالِ',
    kidSafetyBadgeDesc: 'مُتَطَابِقٌ مَعَ قَوَانِينِ حِمَايَةِ خُصُوصِيَّةِ الْأَطْفَالِ (COPPA) وَسِيَاسَاتِ الْعَائِلَةِ فِي الْمَتَاجِرِ الْعَالَمِيَّةِ.',

    privacyTitle: 'سِيَاسَةُ خُصُوصِيَّةِ وَأَمَانِ الطِّفْلِ',
    privacyCoppa: 'خَالٍ تَمَامًا مِنَ الْإِعْلَانَاتِ وَالتَّتَبُّعِ',
    privacyCoppaDesc: 'لَا يَحْتَوِي التَّطْبِيقُ عَلَى أَيِّ إِعْلَانَاتٍ تَجَارِيَّةٍ أَوْ أَدَوَاتِ تَتَبُّعٍ تَابِعَةٍ لِأَطْرَافٍ ثَالِثَةٍ.',
    privacyNoAds: 'حِمَايَةُ الْبَيَانَاتِ الشَّخْصِيَّةِ (COPPA & GDPR-K)',
    privacyNoAdsDesc: 'لَا نَجْمَعُ أَيَّ بَيَانَاتٍ شَخْصِيَّةٍ أَوْ صُوَرٍ لِلْأَطْفَالِ. جَمِيعُ الْإِعْدَادَاتِ تُحْفَظُ مَحَلِّيًّا عَلَى جِهَازِكُمْ.',
    privacyOffline: 'يَعْمَلُ دُونَ إِنْتَرْنِت (Offline-Ready)',
    privacyOfflineDesc: 'يُمْكِنُ اسْتِخْدَامُ التَّطْبِيقِ كَامِلًا فِي السَّيَّارَةِ أَوْ أَثْنَاءِ السَّفَرِ دُونَ الْحَاجَةِ لِاتِّصَالِ إِنْتَرْنِت دَائِمٍ.',
    privacyAudio: 'مُعَالَجَةٌ صَوْتِيَّةٌ مَحَلِّيَّةٌ',
    privacyAudioDesc: 'النُّطْقُ الصَّوْتِيُّ لِلْحُرُوفِ وَالْكَلِمَاتِ يَتِمُّ دَاخِلَ الْجِهَازِ بِأَعْلَى مَعَايِيرِ الْأَمَانِ.',
    close: 'إِغْلَاقٌ',
    backToHome: 'الْعَوْدَةُ لِلرَّئِيسِيَّةِ',

    footerRights: 'لُومِي — تَعْلِيمٌ مَرِحٌ وَهَادِئٌ لِلْأَطْفَالِ',
    footerQuality: 'صُوَرٌ وَاقِعِيَّةٌ • نُطْقٌ صَوْتِيٌّ نَقِيٌّ • مُتَطَابِقٌ مَعَ مَتَاجِرِ التَّطْبِيقَاتِ',
  },
  en: {
    appName: 'Lumi',
    appTagline: 'Learn & Play',
    navHome: 'Home',
    navLetters: 'Letters',
    navSpelling: 'Spelling 🔤',
    navWords: 'Words & Sentences',
    navStories: 'Short Stories 📖',
    navMath: 'Math',
    navFocus: 'Focus 👁️',
    navScience: 'Science',
    navChemistry: 'Chemistry',
    navColoring: 'Coloring',
    navGames: 'Brain Games',
    navAvatar: 'My Avatar',
    navPlans: 'Subscription Plans',
    navPrivacy: 'Kid Safety 🛡️',

    welcomeHero: 'Welcome to Lumi Children Learning World!',
    welcomeSubtitle: 'A playful educational platform built to develop children’s skills with realistic imagery, clear speech, and calm pace.',
    heroGreeting: 'Hello Little Hero',
    changeAvatarBtn: 'Change Avatar',
    exploreCategories: 'Explore Learning Modules',
    installAppBtn: 'Install App',
    installAppDesc: 'Install Lumi directly onto your home screen for quick offline access',

    secLettersTitle: 'Alphabet Letters',
    secLettersSubtitle: 'Capital and small letter forms with interactive handwriting tracing',
    secSpellingTitle: 'Spelling Studio 🔤',
    secSpellingSubtitle: 'Phonics breakdown for 3-letter words with clear calligraphic vowels',
    secWordsTitle: 'Words & Sentences',
    secWordsSubtitle: 'Reading vocabulary with high quality realistic real-life photos',
    secStoriesTitle: 'Short Stories 📖',
    secStoriesSubtitle: 'Illustrated realistic mini-stories with interactive object naming',
    secMathTitle: 'Mathematics & Counting',
    secMathSubtitle: 'Number comparisons, addition, subtraction, and visual counting',
    secFocusTitle: 'Focus & Memory 👁️',
    secFocusSubtitle: 'Observing objects, disappearing items, and cognitive recall',
    secScienceTitle: 'Science & Animals',
    secScienceSubtitle: 'Animals, sounds, and intuitive nature facts',
    secChemistryTitle: 'Chemistry Lab',
    secChemistrySubtitle: 'Safe and intuitive experiments showing cause and effect',
    secColoringTitle: 'Coloring Studio',
    secColoringSubtitle: 'Interactive coloring canvas developing creative artistic motor skills',
    secGamesTitle: 'Brain Games',
    secGamesSubtitle: 'Geometric shape matching, pattern discovery, and sorting',
    secAvatarTitle: 'My Avatar 🌟',
    secAvatarSubtitle: 'Choose your hero character, nickname, and celebration badge',

    tabWordsWithDiacritics: '📖 Vocabulary Words',
    tabSentenceReading: '🌟 Sentence Reading',

    btnPronounceLetter: 'Pronounce Letter & Sound',
    btnTraceLetter: 'Trace Letter',
    btnClearCanvas: 'Clear Canvas',
    letterLabel: 'Letter',
    prevLetter: 'Previous',
    nextLetter: 'Next',
    harakaFatha: 'Phonics Sound',
    harakaDamma: 'Capital',
    harakaKasra: 'Small',
    harakaSukoon: 'Phonics Blend',
    harakaDescription: 'Phonics & Letter Forms',
    btnPronounceWord: 'Pronounce Whole Word',
    btnReadSentence: 'Read Example Sentence',
    wordSyllables: 'Phonic Syllables',
    wordMeaning: 'Word Meaning',
    prevWord: 'Previous Word',
    nextWord: 'Next Word',
    btnReadWordByWord: 'Word-by-Word Reading',
    btnPraiseChild: 'Great Job, Hero! 🎉',
    sentenceInstruction: 'Tap any word to hear its pronunciation',
    prevSentence: 'Previous Sentence',
    nextSentence: 'Next Sentence',
    spellingTitle: 'Spelling Studio 🔤',
    btnBlendWord: 'Blend Sounds & Read Word',
    spellingInstruction: 'Tap each letter to hear its sound, then blend them together',

    parentalGateTitle: 'Parental Gate',
    parentalGateNotice: 'This section is restricted to adults and parents to protect children in accordance with Apple App Store and Google Play Families guidelines.',
    parentalGateQuestionPrompt: 'Please solve this math question to confirm you are an adult:',
    parentalGateSubmit: 'Confirm & Enter',
    parentalGateCancel: 'Cancel',
    parentalGateError: 'Incorrect answer. Please try again with a new question.',
    parentZoneTitle: 'Parents Zone & Settings',
    kidSafetyBadge: '100% Kid Safe & COPPA Compliant',
    kidSafetyBadgeDesc: 'Zero ads, zero 3rd-party tracking, and family-friendly certified.',

    privacyTitle: 'Children Safety & Privacy Policy',
    privacyCoppa: 'Zero Advertisements & Zero Tracking',
    privacyCoppaDesc: 'The app contains no third-party advertisements, tracking pixels, or commercial sponsorships.',
    privacyNoAds: 'Data Protection (COPPA & GDPR-K Compliant)',
    privacyNoAdsDesc: 'We do not collect personal identifying information or photos. All settings remain strictly local to your device.',
    privacyOffline: 'Offline-Ready Architecture',
    privacyOfflineDesc: 'Lumi works seamlessly offline during flights, car journeys, or in low-connectivity classrooms.',
    privacyAudio: 'Local On-Device Audio Synthesis',
    privacyAudioDesc: 'Pronunciation is synthesized locally inside the browser using native platform speech engines.',
    close: 'Close',
    backToHome: 'Back to Home',

    footerRights: 'Lumi — Calm & Joyful Education for Kids',
    footerQuality: 'Realistic Imagery • Pristine Voice • Store Certified',
  },
};
