import React, { useEffect } from 'react';
import {
  STAR_MASCOT_IMAGE,
  LION_IMAGE,
  CHEMISTRY_LAB_IMAGE,
  COLORING_STUDIO_IMAGE,
  SCHOOL_BUILDING_IMAGE,
} from '../data/initialData';
import { ChildAvatar } from '../data/avatarData';
import { soundManager } from '../utils/audio';
import { ArrowLeft, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { AppNavTab } from './HeaderNav';
import { useLanguage } from '../context/LanguageContext';
import { PWAInstallButton } from './PWAInstallButton';
import { resolveAssetUrl } from '../utils/assetResolver';

// Ensures the welcome speech only sounds ONCE per user session across the entire app
let hasSpokenWelcomeOnce = false;

interface HomeScreenProps {
  onNavigate: (tab: AppNavTab) => void;
  speechRate: number;
  currentAvatar: ChildAvatar;
  childName: string;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  speechRate,
  currentAvatar,
  childName,
}) => {
  const { language, direction, t } = useLanguage();

  // Welcoming speech on application opening (only when browser user-activation is active)
  useEffect(() => {
    if (hasSpokenWelcomeOnce) return;
    const nav = navigator as Navigator & { userActivation?: { hasBeenActive: boolean } };
    if (!nav.userActivation?.hasBeenActive) return;

    hasSpokenWelcomeOnce = true;
    soundManager.playStarSparkle();
    const welcomeText = 'مَرْحَبًا بِكَ يَا بَطَلِي فِي لُومِي! اخْتَرْ قِسْمَكَ الْمُفَضَّلَ لِنَبْدَأَ التَّعَلُّمَ!';
    soundManager.speakArabic(welcomeText, speechRate);
  }, [speechRate]);

  const sections = [
    {
      id: 'letters',
      tab: 'letters' as const,
      title: t('secLettersTitle'),
      subtitle: t('secLettersSubtitle'),
      symbol: 'أ ب ت',
      borderColor: 'border-orange-300',
      bgColor: 'bg-orange-50/50',
    },
    {
      id: 'spelling',
      tab: 'spelling' as const,
      title: t('secSpellingTitle'),
      subtitle: t('secSpellingSubtitle'),
      symbol: 'فَـ ـتَـ ـحَ',
      borderColor: 'border-amber-400',
      bgColor: 'bg-amber-50/50',
    },
    {
      id: 'words',
      tab: 'words' as const,
      title: t('secWordsTitle'),
      subtitle: t('secWordsSubtitle'),
      image: SCHOOL_BUILDING_IMAGE,
      borderColor: 'border-amber-300',
      bgColor: 'bg-amber-50/50',
    },
    {
      id: 'stories',
      tab: 'stories' as const,
      title: t('secStoriesTitle'),
      subtitle: t('secStoriesSubtitle'),
      image: resolveAssetUrl('/src/assets/images/story_park_scene_1792856464136.jpg'),
      borderColor: 'border-emerald-400',
      bgColor: 'bg-emerald-50/50',
    },
    {
      id: 'math',
      tab: 'math' as const,
      title: t('secMathTitle'),
      subtitle: t('secMathSubtitle'),
      symbol: '5 > 3',
      borderColor: 'border-emerald-300',
      bgColor: 'bg-emerald-50/50',
    },
    {
      id: 'focus',
      tab: 'focus' as const,
      title: t('secFocusTitle'),
      subtitle: t('secFocusSubtitle'),
      symbol: '🍎 ⚽ ❓',
      borderColor: 'border-purple-400',
      bgColor: 'bg-purple-50/50',
    },
    {
      id: 'animals',
      tab: 'animals' as const,
      title: t('secScienceTitle'),
      subtitle: t('secScienceSubtitle'),
      image: LION_IMAGE,
      borderColor: 'border-sky-300',
      bgColor: 'bg-sky-50/50',
    },
    {
      id: 'chemistry',
      tab: 'chemistry' as const,
      title: t('secChemistryTitle'),
      subtitle: t('secChemistrySubtitle'),
      image: CHEMISTRY_LAB_IMAGE,
      borderColor: 'border-purple-300',
      bgColor: 'bg-purple-50/50',
    },
    {
      id: 'coloring',
      tab: 'coloring' as const,
      title: t('secColoringTitle'),
      subtitle: t('secColoringSubtitle'),
      image: COLORING_STUDIO_IMAGE,
      borderColor: 'border-rose-300',
      bgColor: 'bg-rose-50/50',
    },
    {
      id: 'games',
      tab: 'games' as const,
      title: t('secGamesTitle'),
      subtitle: t('secGamesSubtitle'),
      symbol: '🧩',
      borderColor: 'border-amber-400',
      bgColor: 'bg-amber-50/50',
    },
    {
      id: 'avatar',
      tab: 'avatar' as const,
      title: t('secAvatarTitle'),
      subtitle: t('secAvatarSubtitle'),
      image: currentAvatar.image,
      borderColor: 'border-amber-400',
      bgColor: 'bg-amber-50/50',
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      {/* Calm, Compact Intro Banner with Corner Avatar Widget */}
      <div className="bg-gradient-to-r from-amber-200/90 via-amber-100 to-orange-200/80 rounded-3xl p-4 md:p-5 border border-amber-300 flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden shadow-xs">
        {/* Welcome Text & Star Mascot */}
        <div className="flex items-center gap-3.5 w-full md:w-auto">
          <div className="w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-full overflow-hidden border-2 border-white shadow-2xs bg-amber-100 animate-soft-float">
            <img
              src={STAR_MASCOT_IMAGE}
              alt="Lumi Star Mascot"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-2xl font-black text-amber-950">
                {t('welcomeHero')} 🌟
              </h1>
            </div>
            <p className="text-xs md:text-sm font-bold text-amber-900/90 mt-0.5 max-w-xl">
              {t('welcomeSubtitle')}
            </p>
          </div>
        </div>

        {/* Right side: Install CTA + CORNER AVATAR WIDGET */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap sm:flex-nowrap">
          {/* PWA Install Button Banner */}
          <PWAInstallButton variant="banner" />

          {/* CORNER AVATAR WIDGET: شَخْصِيَّةُ الطِّفْلِ فِي زَاوِيَةِ الشَّاشَةِ الرَّئِيسِيَّةِ */}
          <div
            onClick={() => {
              soundManager.playPop();
              onNavigate('avatar');
            }}
            className="w-full sm:w-auto bg-white/95 hover:bg-white rounded-2xl p-2.5 px-4 border-2 border-amber-400 shadow-xs flex items-center justify-between sm:justify-start gap-3 cursor-pointer transition-all hover:scale-102 active:scale-95 group shrink-0"
            title={language === 'ar' ? 'اضْغَطْ هُنَا لِاخْتِيَارِ أَوْ تَغْيِيرِ شَخْصِيَّتِكَ' : 'Click to customize your hero avatar'}
          >
            {/* Avatar Picture with Star Badge */}
            <div className="relative shrink-0">
              <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-3 ${currentAvatar.borderColor} shadow-2xs bg-amber-50 group-hover:scale-105 transition-transform`}>
                <img
                  src={currentAvatar.image}
                  alt={currentAvatar.name}
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-1 -left-1 bg-amber-500 text-white p-1 rounded-full text-[10px] shadow-2xs border-2 border-white">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-slate-500">
                  {language === 'ar' ? 'شَخْصِيَّتِي:' : 'Avatar:'}
                </span>
                <span className="text-xs font-black text-amber-900 line-clamp-1">{currentAvatar.name}</span>
              </div>
              <div className="text-sm md:text-base font-black text-slate-900 group-hover:text-amber-800 transition-colors">
                {language === 'ar' ? `أَهْلًا يَا ${childName}! 👋` : `Hello ${childName}! 👋`}
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-600 group-hover:text-amber-800 transition-colors">
                <span>{t('changeAvatarBtn')} 🎨</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Safety & Store Compliance Bar - Navigates to full-screen safety center */}
      <div
        onClick={() => {
          soundManager.playPop();
          onNavigate('privacy');
        }}
        className="bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200 rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs text-emerald-900 font-bold cursor-pointer transition-all hover:scale-[1.01] active:scale-98 shadow-2xs group"
        title={language === 'ar' ? 'اضْغَطْ لِفَتْحِ مَرْكَزِ أَمَانِ الطِّفْلِ وَسِيَاسَةِ الْخُصُوصِيَّةِ' : 'Tap to open Child Safety & Privacy Policy'}
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 group-hover:scale-110 transition-transform" />
          <span>{t('kidSafetyBadge')}</span>
          <span className="hidden sm:inline text-emerald-700/80">• {t('kidSafetyBadgeDesc')}</span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-emerald-200/80 text-emerald-950 font-black text-[11px] group-hover:bg-emerald-300 transition-colors">
          Google Play & iOS Family Safe ➔
        </span>
      </div>

      {/* Horizontal Organized Layout of Sections */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-sm font-black text-slate-800">{t('exploreCategories')}:</span>
          <span className="text-xs text-slate-500 font-bold">
            {language === 'ar' ? 'تَمَّ التَّنْظِيمُ أُفُقِيًّا لِرَاحَةِ الطِّفْلِ' : 'Kid-friendly layout'}
          </span>
        </div>

        {/* Clean, Serene Horizontal Grid Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {sections.map((section) => (
            <div
              key={section.id}
              onClick={() => {
                soundManager.playPop();
                onNavigate(section.tab);
              }}
              className={`group bg-white hover:${section.bgColor} rounded-2xl p-3.5 border-2 ${section.borderColor} shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between`}
            >
              <div className="w-full aspect-16/10 rounded-xl overflow-hidden mb-2.5 bg-slate-50 border border-slate-100 flex items-center justify-center">
                {section.image ? (
                  <img
                    src={section.image}
                    alt={section.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 via-amber-50 to-orange-100">
                    <span className="text-xl md:text-2xl font-black text-purple-900">{section.symbol}</span>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm md:text-base font-black text-slate-900 group-hover:text-amber-950 transition-colors">
                  {section.title}
                </h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5 line-clamp-2">
                  {section.subtitle}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-amber-800 text-xs font-black">
                <span>{language === 'ar' ? 'دُخُولٌ' : 'Enter'}</span>
                {direction === 'rtl' ? (
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
