import React, { useState, useEffect, useRef } from 'react';
import { SentenceItem } from '../types';
import { Illustration } from './Illustrations';
import { soundManager } from '../utils/audio';
import { Volume2, ChevronRight, ChevronLeft, CheckCircle2, Play, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSubscription } from '../context/SubscriptionContext';

interface SentencesModuleProps {
  sentences: SentenceItem[];
  speechRate: number;
  fontSize: 'normal' | 'large' | 'huge';
  onRequireSubscription?: (contentTitle: string) => void;
}

export const SentencesModule: React.FC<SentencesModuleProps> = ({
  sentences,
  speechRate,
  fontSize,
  onRequireSubscription,
}) => {
  const { isContentUnlocked } = useSubscription();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [highlightedWordIndex, setHighlightedWordIndex] = useState<number | null>(null);
  const [isPlayingSentence, setIsPlayingSentence] = useState(false);
  const playRunRef = useRef(0);

  useEffect(() => {
    return () => {
      playRunRef.current += 1;
      soundManager.stopSpeech();
    };
  }, []);

  const currentSentence = sentences[currentIndex] || sentences[0];

  const sentenceFontSizeClass =
    fontSize === 'huge'
      ? 'text-3xl md:text-5xl'
      : fontSize === 'large'
      ? 'text-2xl md:text-4xl'
      : 'text-xl md:text-3xl';

  const handleSelectSentence = (idx: number) => {
    if (!isContentUnlocked('sentencesCount', idx)) {
      soundManager.playPop();
      onRequireSubscription?.(`الْجُمْلَةُ رَقْمُ ${idx + 1}`);
      return;
    }

    playRunRef.current += 1;
    soundManager.stopSpeech();
    setIsPlayingSentence(false);
    setCurrentIndex(idx);
    setHighlightedWordIndex(null);
    soundManager.playPop();
  };

  const handleNext = () => {
    const nextIdx = currentIndex < sentences.length - 1 ? currentIndex + 1 : 0;
    if (!isContentUnlocked('sentencesCount', nextIdx)) {
      soundManager.playPop();
      onRequireSubscription?.(`الْجُمْلَةُ رَقْمُ ${nextIdx + 1}`);
    } else {
      handleSelectSentence(nextIdx);
    }
  };

  const handlePrev = () => {
    const prevIdx = currentIndex > 0 ? currentIndex - 1 : sentences.length - 1;
    if (!isContentUnlocked('sentencesCount', prevIdx)) {
      soundManager.playPop();
      onRequireSubscription?.(`الْجُمْلَةُ رَقْمُ ${prevIdx + 1}`);
    } else {
      handleSelectSentence(prevIdx);
    }
  };

  // Word-by-word guided speech synchronized to each MP3's completion
  const handlePlayWordByWord = async () => {
    if (isPlayingSentence) return;
    const runId = ++playRunRef.current;
    setIsPlayingSentence(true);
    soundManager.playPop();

    const words = currentSentence.words;
    for (let i = 0; i < words.length; i++) {
      if (playRunRef.current !== runId) break;
      setHighlightedWordIndex(i);
      await new Promise<void>((resolve) => {
        soundManager.speakArabic(words[i], speechRate * 0.85, resolve);
      });
      if (playRunRef.current !== runId) break;
      await new Promise<void>((resolve) => setTimeout(resolve, 220));
    }

    if (playRunRef.current === runId) {
      setHighlightedWordIndex(null);
      setIsPlayingSentence(false);
    }
  };

  // Click single word to hear it isolated
  const handleWordClick = (word: string, idx: number) => {
    playRunRef.current += 1;
    setIsPlayingSentence(false);
    setHighlightedWordIndex(idx);
    soundManager.playPop();
    soundManager.speakArabic(word, speechRate, () => {
      setHighlightedWordIndex((prev) => (prev === idx ? null : prev));
    });
  };

  const handlePraiseChild = () => {
    soundManager.playSuccessChime();
    soundManager.speakArabic('بَارَكَ اللَّهُ فِيكَ يَا بَطَل! قِرَاءَةٌ مُمَيَّزَةٌ جِدًّا!', speechRate);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="space-y-3">
      {/* Compact Top Navigation Selector */}
      <div className="bg-white rounded-2xl p-2.5 px-4 shadow-2xs border border-amber-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-xs font-black text-slate-700 shrink-0 ml-1">الْجُمْلَةُ:</span>
          {sentences.map((_, idx) => {
            const isUnlocked = isContentUnlocked('sentencesCount', idx);
            return (
              <button
                key={idx}
                onClick={() => handleSelectSentence(idx)}
                className={`relative w-8 h-8 rounded-xl font-black text-xs md:text-sm transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                  currentIndex === idx
                    ? 'bg-amber-500 text-white shadow-2xs scale-105'
                    : isUnlocked
                    ? 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 hover:border-amber-300'
                }`}
              >
                {!isUnlocked && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[8px] shadow-2xs">
                    <Lock className="w-2 h-2" />
                  </span>
                )}
                {idx + 1}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handlePrev}
            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg font-bold flex items-center gap-0.5 text-xs cursor-pointer border border-amber-200"
          >
            <ChevronRight className="w-4 h-4" />
            <span>السَّابِقُ</span>
          </button>

          <span className="text-xs font-bold text-slate-500">
            {currentIndex + 1} / {sentences.length}
          </span>

          <button
            onClick={handleNext}
            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg font-bold flex items-center gap-0.5 text-xs cursor-pointer border border-amber-200"
          >
            <span>التَّالِي</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Compact Sentence Stage */}
      {currentSentence && (
        <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border-2 border-amber-300">
          <div className="flex flex-col md:flex-row items-center gap-5">
            {/* Real Life Compact Image */}
            <div className="shrink-0 flex flex-col items-center">
              <div className="w-44 h-44 md:w-52 md:h-52 rounded-2xl overflow-hidden border-2 border-amber-300 shadow-md bg-amber-50">
                <Illustration
                  name={currentSentence.image}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  alt={currentSentence.sentence}
                />
              </div>
            </div>

            {/* Sentence Interactive Reading Area in Single Viewport */}
            <div className="flex-1 w-full space-y-4">
              {/* Big Sentence Words Box with Interactive Word Clicking */}
              <div className="p-4 md:p-6 bg-gradient-to-br from-amber-50/70 via-white to-yellow-50/50 rounded-2xl border border-amber-200 text-center">
                <div
                  className={`flex flex-wrap items-center justify-center gap-2 md:gap-3 font-black text-amber-950 ${sentenceFontSizeClass} tashkeel-display-word select-none py-2`}
                >
                  {currentSentence.words.map((word, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleWordClick(word, idx)}
                      className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer font-black tashkeel-word ${
                        highlightedWordIndex === idx
                          ? 'bg-amber-500 text-white scale-105 shadow-sm ring-2 ring-amber-300'
                          : 'hover:bg-amber-100 text-amber-950 border border-transparent hover:border-amber-200'
                      }`}
                    >
                      {word}
                    </button>
                  ))}
                </div>

                <span className="text-xs text-slate-500 font-bold block mt-1">
                  انْقُرْ عَلَى أَيِّ كَلِمَةٍ لِسَمَاعِهَا وَحْدَهَا
                </span>
              </div>

              {/* Action Buttons: Word-by-word & Full Sentence */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  onClick={handlePlayWordByWord}
                  disabled={isPlayingSentence}
                  className={`py-2 px-4 font-black text-xs md:text-sm rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer ${
                    isPlayingSentence
                      ? 'bg-amber-300 text-amber-900 cursor-not-allowed'
                      : 'bg-amber-500 hover:bg-amber-600 text-white active:scale-95'
                  }`}
                >
                  <Play className={`w-4 h-4 ${isPlayingSentence ? 'animate-spin' : ''}`} />
                  <span>{isPlayingSentence ? 'جَارِي الْقِرَاءَةِ...' : 'اقْرَأْ كَلِمَةً كَلِمَةً'}</span>
                </button>

                <button
                  onClick={() => {
                    soundManager.playPop();
                    soundManager.speakArabic(currentSentence.sentence, speechRate);
                  }}
                  className="py-2 px-4 bg-white hover:bg-amber-50 border border-amber-300 text-amber-950 font-black text-xs md:text-sm rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Volume2 className="w-4 h-4 text-amber-600" />
                  <span>قِرَاءَةُ الْجُمْلَةِ كَامِلَةً</span>
                </button>

                <button
                  onClick={handlePraiseChild}
                  className="py-2 px-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 font-black text-xs md:text-sm rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>قَرَأْتُهَا بِنَفْسِي! 🌟</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
