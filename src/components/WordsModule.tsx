import React, { useState } from 'react';
import { WordItem } from '../types';
import { Illustration } from './Illustrations';
import { soundManager } from '../utils/audio';
import { Volume2, ChevronRight, ChevronLeft, Sparkles, CheckCircle2, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSubscription } from '../context/SubscriptionContext';

interface WordsModuleProps {
  words: WordItem[];
  speechRate: number;
  fontSize: 'normal' | 'large' | 'huge';
  onRequireSubscription?: (contentTitle: string) => void;
}

export const WordsModule: React.FC<WordsModuleProps> = ({
  words,
  speechRate,
  fontSize,
  onRequireSubscription,
}) => {
  const { isContentUnlocked } = useSubscription();
  const [selectedWordIndex, setSelectedWordIndex] = useState(0);
  const [activeSyllable, setActiveSyllable] = useState<number | null>(null);

  const currentWord = words[selectedWordIndex] || words[0];

  const wordSizeClass =
    fontSize === 'huge'
      ? 'text-5xl md:text-7xl'
      : fontSize === 'large'
      ? 'text-4xl md:text-6xl'
      : 'text-3xl md:text-5xl';

  const handleSelectWord = (index: number, shouldSpeak = true) => {
    if (!isContentUnlocked('wordsCount', index)) {
      soundManager.playPop();
      onRequireSubscription?.(`كَلِمَةُ «${words[index].word}»`);
      return;
    }

    setSelectedWordIndex(index);
    soundManager.playPop();
    const word = words[index];
    if (word && shouldSpeak) {
      soundManager.speakArabic(word.word, speechRate);
    }
  };

  const handleNext = () => {
    const nextIdx = selectedWordIndex < words.length - 1 ? selectedWordIndex + 1 : 0;
    if (!isContentUnlocked('wordsCount', nextIdx)) {
      soundManager.playPop();
      onRequireSubscription?.(`كَلِمَةُ «${words[nextIdx].word}»`);
    } else {
      handleSelectWord(nextIdx, true);
    }
  };

  const handlePrev = () => {
    const prevIdx = selectedWordIndex > 0 ? selectedWordIndex - 1 : words.length - 1;
    if (!isContentUnlocked('wordsCount', prevIdx)) {
      soundManager.playPop();
      onRequireSubscription?.(`كَلِمَةُ «${words[prevIdx].word}»`);
    } else {
      handleSelectWord(prevIdx, true);
    }
  };

  const handleSyllableClick = (syllable: string, index: number) => {
    setActiveSyllable(index);
    soundManager.playPop();
    soundManager.speakArabic(syllable, speechRate * 0.9, () => {
      setActiveSyllable((prev) => (prev === index ? null : prev));
    });
  };

  const handleReadFullWord = () => {
    soundManager.playSuccessChime();
    soundManager.speakArabic(currentWord.word, speechRate);
    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.65 },
    });
  };

  const handleReadSentence = () => {
    soundManager.playPop();
    soundManager.speakArabic(currentWord.sentence, speechRate);
  };

  return (
    <div className="space-y-3 max-w-4xl mx-auto">
      {/* Sequential Navigation Bar */}
      <div className="bg-white rounded-2xl p-2.5 px-4 shadow-2xs border border-amber-200 flex items-center justify-between gap-3">
        {/* Next Button */}
        <button
          onClick={handleNext}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl font-black text-sm md:text-base flex items-center gap-2 cursor-pointer shadow-xs active:scale-95 transition-all"
        >
          <span>الْكَلِمَةُ التَّالِيَةُ</span>
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Word Counter Badge */}
        <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-xl border border-amber-200">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-black text-amber-950">
            الْكَلِمَةُ {selectedWordIndex + 1} مِنْ {words.length}
          </span>
        </div>

        {/* Previous Button */}
        <button
          onClick={handlePrev}
          className="px-4 py-2 bg-slate-100 hover:bg-amber-100 text-slate-800 hover:text-amber-950 rounded-xl font-black text-sm md:text-base flex items-center gap-2 cursor-pointer border border-slate-200 transition-all active:scale-95"
        >
          <ChevronRight className="w-5 h-5" />
          <span>الْكَلِمَةُ السَّابِقَةُ</span>
        </button>
      </div>

      {/* Main Word Stage */}
      {currentWord && (
        <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border-2 border-amber-300">
          <div className="flex flex-col md:flex-row items-center gap-5">
            {/* Real Life Compact Image */}
            <div className="shrink-0 flex flex-col items-center">
              <div className="w-44 h-44 md:w-52 md:h-52 rounded-2xl overflow-hidden border-2 border-amber-300 shadow-md bg-amber-50">
                <Illustration
                  name={currentWord.image}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  alt={currentWord.word}
                />
              </div>
            </div>

            {/* Word Details & Syllable Chunking */}
            <div className="flex-1 w-full space-y-3">
              {/* Word Display with Tashkeel and Tanween */}
              <div className="w-full bg-gradient-to-br from-amber-50/70 via-white to-orange-50/50 p-4 md:p-5 rounded-2xl border border-amber-200 text-center">
                <div
                  className={`font-black text-amber-950 ${wordSizeClass} tashkeel-display-word text-center select-none py-1`}
                >
                  {currentWord.word}
                </div>
                <p className="text-sm md:text-base font-bold text-slate-600 mt-1">
                  {currentWord.meaning}
                </p>
              </div>

              {/* Syllable Chunking in the same area */}
              <div className="flex items-center justify-center gap-2 flex-wrap py-1">
                {currentWord.syllables.map((syl, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSyllableClick(syl, idx)}
                    className={`px-4 py-2 rounded-xl font-black text-xl md:text-2xl transition-all cursor-pointer shadow-2xs ${
                      activeSyllable === idx
                        ? 'bg-amber-500 text-white scale-105 shadow-sm ring-2 ring-amber-300'
                        : 'bg-white text-amber-950 border border-amber-300 hover:bg-amber-50'
                    }`}
                  >
                    {syl}
                  </button>
                ))}
              </div>

              {/* Action Pronounce Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  onClick={handleReadFullWord}
                  className="py-2.5 px-5 bg-amber-500 hover:bg-amber-600 text-white font-black text-sm rounded-xl shadow-2xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Volume2 className="w-4 h-4 animate-pulse" />
                  <span>انْطِقِ الْكَلِمَةَ بِوُضُوحٍ</span>
                </button>

                <button
                  onClick={handleReadSentence}
                  className="py-2.5 px-5 bg-white hover:bg-amber-50 border border-amber-300 text-amber-950 font-black text-sm rounded-xl shadow-2xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Volume2 className="w-4 h-4 text-amber-600" />
                  <span>اسْتَمِعْ لِلْجُمْلَةِ: «{currentWord.sentence}»</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sequential Thumbnail Strip */}
      <div className="bg-white rounded-2xl p-2.5 px-3 shadow-2xs border border-amber-200">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin pb-1">
          {words.map((word, idx) => {
            const isUnlocked = isContentUnlocked('wordsCount', idx);
            return (
              <button
                key={word.id}
                onClick={() => handleSelectWord(idx, true)}
                className={`relative p-1.5 px-3 rounded-xl border flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                  selectedWordIndex === idx
                    ? 'border-amber-500 bg-amber-100 text-amber-950 font-black ring-1 ring-amber-400'
                    : isUnlocked
                    ? 'border-slate-200 hover:border-amber-300 bg-slate-50/50 text-slate-700'
                    : 'border-slate-200 bg-slate-100 text-slate-400 hover:border-amber-300'
                }`}
              >
                {!isUnlocked && (
                  <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                )}
                <div className="w-6 h-6 rounded-md overflow-hidden bg-white shrink-0">
                  <Illustration name={word.image} className="w-full h-full object-cover" />
                </div>
                <span className="text-sm font-black tashkeel-word">{word.word}</span>
                {selectedWordIndex === idx && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
