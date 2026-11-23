import React, { useState, useEffect } from 'react';
import { STAR_MASCOT_IMAGE } from '../data/initialData';
import { soundManager } from '../utils/audio';
import { Volume2, Sparkles, Heart } from 'lucide-react';

interface StarMascotProps {
  speechRate: number;
  customMessage?: string;
}

const CHEERFUL_PHRASES = [
  'مَرْحَبًا بِكَ يَا بَطَل! أَنَا نَجْمُور صَدِيقُكَ اللَّطِيف!',
  'أَنْتَ ذَكِيٌّ وَرَائِعٌ، وَأَنَا فَخُورٌ بِكَ!',
  'هَيَّا نَتَعَلَّمْ مَعًا خُطْوَةً بِخُطْوَةٍ بِكُلِّ فَرَح!',
  'كُلُّ شَيْءٍ سَهْلٌ عِنْدَمَا نُحَاوِلُ بِابْتِسَامَة!',
  'أَنْتَ نَجْمٌ حَقِيقِيٌّ يُضِيءُ فِي سَمَائِنَا!',
  'خُذْ وَقْتَكَ يَا صَدِيقِي، أَنَا مَعَكَ دَائِمًا!',
];

export const StarMascot: React.FC<StarMascotProps> = ({ speechRate, customMessage }) => {
  const [currentMessage, setCurrentMessage] = useState<string>(
    customMessage || CHEERFUL_PHRASES[0]
  );
  const [isWiggling, setIsWiggling] = useState(false);

  useEffect(() => {
    if (customMessage) {
      setCurrentMessage(customMessage);
    }
  }, [customMessage]);

  const handleInteract = () => {
    setIsWiggling(true);
    soundManager.playStarSparkle();

    // Pick next friendly phrase
    const nextPhrase =
      CHEERFUL_PHRASES[Math.floor(Math.random() * CHEERFUL_PHRASES.length)];
    setCurrentMessage(nextPhrase);

    // Speak in friendly Arabic
    soundManager.speakArabic(nextPhrase, speechRate);

    setTimeout(() => {
      setIsWiggling(false);
    }, 1200);
  };

  return (
    <div className="relative bg-gradient-to-r from-amber-100/90 via-yellow-50 to-amber-100/90 border-2 border-amber-300 rounded-3xl p-4 md:p-6 shadow-md">
      <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6">
        {/* Animated Interactive Star Avatar */}
        <div className="relative shrink-0 cursor-pointer group" onClick={handleInteract}>
          <div
            className={`w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-amber-400 shadow-lg bg-amber-200 transition-transform ${
              isWiggling ? 'scale-110 rotate-6' : 'hover:scale-105'
            } animate-soft-float`}
          >
            <img
              src={STAR_MASCOT_IMAGE}
              alt="نجمور الرفيق الذكي والمرح"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Sparkle decorative indicator */}
          <div className="absolute -top-1 -right-1 bg-amber-400 text-amber-950 p-1.5 rounded-full shadow-sm animate-bounce">
            <Sparkles className="w-4 h-4" />
          </div>

          <span className="sr-only">انقر على نجمور لسماع صوته وترحيبه</span>
        </div>

        {/* Speech Bubble for Child */}
        <div className="flex-1 text-right w-full">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-300 text-amber-950 font-bold text-sm md:text-base rounded-full shadow-xs">
                <Heart className="w-4 h-4 fill-amber-500 text-amber-500" />
                صَدِيقُكَ نَجْمُور
              </span>
            </div>

            <button
              onClick={handleInteract}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm font-bold text-amber-900 bg-white hover:bg-amber-100 border border-amber-300 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
              title="استمع لصوت نجمور"
            >
              <Volume2 className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>اِسْتَمِعْ لِي</span>
            </button>
          </div>

          <p className="text-lg md:text-xl font-bold text-amber-950 leading-relaxed tracking-wide select-none">
            {currentMessage}
          </p>
        </div>
      </div>
    </div>
  );
};
