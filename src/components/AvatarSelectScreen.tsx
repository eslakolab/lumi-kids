import React, { useState } from 'react';
import {
  CHILD_AVATARS,
  ChildAvatar,
  saveAvatarChoice,
  saveChildName,
} from '../data/avatarData';
import { soundManager } from '../utils/audio';
import { Volume2, Sparkles, Check, ArrowRight, ArrowLeft, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../context/LanguageContext';

interface AvatarSelectScreenProps {
  currentAvatar: ChildAvatar;
  childName: string;
  speechRate: number;
  onSaveAvatar: (avatar: ChildAvatar, name: string) => void;
  onBack: () => void;
}

const PRESET_NICKNAMES_AR = [
  'الْبَطَلُ الصَّغِيرُ',
  'الْمُسْتَكْشِفُ',
  'الْمُبْدِعُ الذَّكِيُّ',
  'الْأَمِيرُ اللَّطِيفُ',
  'الْأَمِيرَةُ الْجَمِيلَةُ',
  'نَجْمُ التَّفَوُّقِ',
];

const PRESET_NICKNAMES_EN = [
  'Little Hero',
  'Explorer',
  'Creative Mind',
  'Super Star',
  'Little Champion',
  'Curious Brain',
];

export const AvatarSelectScreen: React.FC<AvatarSelectScreenProps> = ({
  currentAvatar,
  childName,
  speechRate,
  onSaveAvatar,
  onBack,
}) => {
  const { language, direction } = useLanguage();
  const [selectedAvatar, setSelectedAvatar] = useState<ChildAvatar>(currentAvatar);
  const [name, setName] = useState<string>(
    childName || (language === 'ar' ? 'الْبَطَلُ الصَّغِيرُ' : 'Little Hero')
  );

  const presets = language === 'ar' ? PRESET_NICKNAMES_AR : PRESET_NICKNAMES_EN;

  const handleSelectAvatar = (avatar: ChildAvatar) => {
    setSelectedAvatar(avatar);
    soundManager.playPop();
    const phrase = language === 'ar' ? avatar.cheerPhrase : avatar.cheerPhraseEn;
    soundManager.speak(phrase, language, speechRate);
  };

  const handleHearCheer = () => {
    soundManager.playStarSparkle();
    const phrase = language === 'ar' ? selectedAvatar.cheerPhrase : selectedAvatar.cheerPhraseEn;
    soundManager.speak(phrase, language, speechRate);
  };

  const handleConfirm = () => {
    const defaultHero = language === 'ar' ? 'الْبَطَلُ الصَّغِيرُ' : 'Little Hero';
    const finalName = name.trim() || defaultHero;

    saveAvatarChoice(selectedAvatar.id);
    saveChildName(finalName);

    soundManager.playSuccessChime();
    const baseMsg =
      language === 'ar'
        ? `رَائِعٌ جِدًّا! أَصْبَحْتَ الآنَ ${selectedAvatar.name}!`
        : `Awesome! You are now ${selectedAvatar.nameEn}!`;
    const welcomeMsg =
      language === 'ar' ? `أَهْلًا بِكَ يَا ${finalName}!` : `Welcome ${finalName}!`;

    soundManager.speakSequential([baseMsg, welcomeMsg], language, speechRate);

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.5 },
    });

    onSaveAvatar(selectedAvatar, finalName);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Top Header Bar */}
      <div className="bg-white rounded-3xl p-4 md:p-5 shadow-2xs border border-amber-200 flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-100 hover:bg-amber-100 text-slate-800 hover:text-amber-950 rounded-2xl font-black text-sm flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
        >
          {direction === 'rtl' ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          <span>{language === 'ar' ? 'الْعَوْدَةُ لِلرَّئِيسِيَّةِ' : 'Back to Home'}</span>
        </button>

        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500 animate-spin" />
          <h1 className="text-base md:text-xl font-black text-amber-950">
            {language === 'ar' ? 'اخْتِيَارُ شَخْصِيَّتِكَ (الْأَفَاتَار)' : 'Choose Your Hero Avatar'}
          </h1>
        </div>

        <button
          onClick={handleConfirm}
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl font-black text-sm flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 transition-all"
        >
          <Check className="w-5 h-5" />
          <span>{language === 'ar' ? 'حِفْظُ الشَّخْصِيَّةِ' : 'Save Avatar'}</span>
        </button>
      </div>

      {/* Main Selected Avatar Showcase */}
      <div className="bg-gradient-to-br from-amber-50 via-white to-orange-50/60 rounded-3xl p-6 md:p-8 border-2 border-amber-300 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
          {/* Avatar Picture with Interactive Glow */}
          <div className="relative shrink-0">
            <div className={`w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden border-4 ${selectedAvatar.borderColor} shadow-md bg-white p-1`}>
              <img
                src={selectedAvatar.image}
                alt={selectedAvatar.name}
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-2 -left-2 bg-amber-500 text-white p-2 rounded-full shadow-sm border-2 border-white">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          {/* Details & Voice Cheer */}
          <div className={`flex-1 ${direction === 'rtl' ? 'text-center md:text-right' : 'text-center md:text-left'} space-y-3`}>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border shadow-2xs bg-white text-amber-900 border-amber-200">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>{language === 'ar' ? 'شَخْصِيَّتُكَ الْحَالِيَّةُ الْمُخْتَارَةُ' : 'Currently Selected Character'}</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-amber-950">
              {language === 'ar' ? selectedAvatar.name : selectedAvatar.nameEn}
            </h2>

            <p className="text-sm md:text-base font-bold text-slate-700 max-w-lg">
              {language === 'ar' ? selectedAvatar.description : selectedAvatar.descriptionEn}
            </p>

            <div className={`pt-2 flex flex-wrap items-center justify-center ${direction === 'rtl' ? 'md:justify-start' : 'md:justify-start'} gap-3`}>
              <button
                onClick={handleHearCheer}
                className="px-4 py-2 bg-white hover:bg-amber-100 text-amber-950 font-black text-sm rounded-xl border border-amber-300 shadow-2xs flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Volume2 className="w-4 h-4 text-amber-600 animate-pulse" />
                <span>{language === 'ar' ? 'اسْتَمِعْ لِصَوْتِ التَّشْجِيعِ 🔊' : 'Listen to Voice Cheer 🔊'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Child Nickname Customizer */}
        <div className="mt-6 pt-6 border-t border-amber-200/80">
          <label className="block text-sm font-black text-amber-950 mb-2">
            {language === 'ar'
              ? 'مَاذَا تُحِبُّ أَنْ نُنَادِيَكَ يَا بَطَل؟ (لَقَبُكَ فِي لُومِي):'
              : 'What would you like us to call you, Little Hero? (Your Lumi Nickname):'}
          </label>

          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={language === 'ar' ? 'اكْتُبِ اسْمَكَ أَوْ لَقَبَكَ هُنَا...' : 'Type your name or nickname here...'}
              className="w-full sm:max-w-xs px-4 py-2.5 rounded-xl border-2 border-amber-300 focus:border-amber-500 focus:outline-hidden bg-white font-black text-slate-900 text-sm md:text-base shadow-2xs"
            />

            <div className="flex items-center gap-1.5 flex-wrap">
              {presets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    setName(preset);
                    soundManager.playPop();
                  }}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                    name === preset
                      ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                      : 'bg-white hover:bg-amber-50 text-slate-700 border-amber-200'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid of All Available Avatars */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-base font-black text-slate-800">
            {language === 'ar' ? 'اخْتَرْ شَخْصِيَّتَكَ مِنْ بَيْنِ الْأَصْدِقَاءِ:' : 'Choose from your Lumi friends:'}
          </span>
          <span className="text-xs text-slate-500 font-bold">
            {language === 'ar' ? 'اضْغَطْ عَلَى الصُّورَةِ لِاخْتِيَارِهَا' : 'Tap any picture to select'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6">
          {CHILD_AVATARS.map((avatar) => {
            const isSelected = selectedAvatar.id === avatar.id;

            return (
              <div
                key={avatar.id}
                onClick={() => handleSelectAvatar(avatar)}
                className={`p-4 md:p-5 rounded-3xl border-3 flex flex-col items-center text-center gap-3 transition-all cursor-pointer relative select-none ${
                  isSelected
                    ? 'bg-amber-100/70 border-amber-500 ring-4 ring-amber-300 shadow-md scale-102'
                    : 'bg-white hover:bg-amber-50/50 border-amber-200 shadow-2xs hover:border-amber-300'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 bg-emerald-500 text-white p-1 rounded-full shadow-2xs">
                    <Check className="w-4 h-4" />
                  </div>
                )}

                {/* Avatar Portrait */}
                <div className={`w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-3 ${avatar.borderColor} shadow-sm bg-white p-0.5`}>
                  <img
                    src={avatar.image}
                    alt={language === 'ar' ? avatar.name : avatar.nameEn}
                    className="w-full h-full object-cover rounded-full"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-black text-slate-900">
                    {language === 'ar' ? avatar.name : avatar.nameEn}
                  </h3>
                  <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${avatar.badgeColor}`}>
                    {language === 'ar' ? avatar.title : avatar.titleEn}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 font-bold leading-relaxed">
                  {language === 'ar' ? avatar.description : avatar.descriptionEn}
                </p>

                <div className="w-full pt-2 border-t border-slate-100 flex items-center justify-center text-amber-700 text-xs font-black">
                  <span>{isSelected ? (language === 'ar' ? '✓ مُخْتَارٌ حَالِيًّا' : '✓ Selected') : (language === 'ar' ? 'اخْتِيَارٌ' : 'Choose')}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
