import React, { useState } from 'react';
import { WordItem } from '../types';
import { Illustration } from './Illustrations';
import { soundManager } from '../utils/audio';
import { Sparkles, Brain, CheckCircle2, RotateCcw, Shapes, ListOrdered } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BrainGamesModuleProps {
  words: WordItem[];
  speechRate: number;
}

export const BrainGamesModule: React.FC<BrainGamesModuleProps> = ({ words, speechRate }) => {
  const [activeGame, setActiveGame] = useState<'shapes' | 'pattern' | 'match' | 'memory'>('shapes');

  // Game 1: Shape Recognition (تمييز الأشكال الهندسية)
  const shapeQuestions = [
    {
      targetShape: 'triangle',
      nameWithTashkeel: 'الْمُثَلَّثُ (لَهُ 3 أَضْلَاعٍ)',
      audioPrompt: 'أَيْنَ هُوَ الْمُثَلَّثُ؟ ابْحَثْ عَنِ الشَّكْلِ ذِي الثَّلَاثَةِ أَضْلَاع!',
      options: ['circle', 'triangle', 'square', 'rectangle'],
    },
    {
      targetShape: 'circle',
      nameWithTashkeel: 'الدَّائِرَةُ (مُسْتَدِيرَةٌ كَالشَّمْسِ)',
      audioPrompt: 'أَيْنَ هِيَ الدَّائِرَةُ الْمُسْتَدِيرَةُ؟',
      options: ['square', 'rectangle', 'circle', 'triangle'],
    },
    {
      targetShape: 'square',
      nameWithTashkeel: 'الْمُرَبَّعُ (أَضْلَاعُهُ الْأَرْبَعَةُ مُتَسَاوِيَةٌ)',
      audioPrompt: 'أَيْنَ هُوَ الْمُرَبَّعُ ذُو الْأَضْلَاعِ الْمُتَسَاوِيَةِ؟',
      options: ['rectangle', 'square', 'triangle', 'circle'],
    },
    {
      targetShape: 'rectangle',
      nameWithTashkeel: 'الْمُسْتَطِيلُ (شَكْلُهُ مِثْلُ الْبَابِ أَوِ الدَّفْتَرِ)',
      audioPrompt: 'أَيْنَ هُوَ الْمُسْتَطِيلُ؟',
      options: ['circle', 'triangle', 'rectangle', 'square'],
    },
    {
      targetShape: 'triangle',
      nameWithTashkeel: 'الْمُثَلَّثُ (مِثْلُ قِطْعَةِ الْجُبْنِ أَوِ الْهَرَمِ)',
      audioPrompt: 'أَيْنَ هُوَ الْمُثَلَّثُ الَّذِي يُشْبِهُ قِطْعَةَ الْجُبْنِ؟',
      options: ['square', 'triangle', 'circle', 'rectangle'],
    },
    {
      targetShape: 'circle',
      nameWithTashkeel: 'الدَّائِرَةُ (مِثْلُ السَّاعَةِ أَوِ الصَّحْنِ)',
      audioPrompt: 'أَيْنَ هِيَ الدَّائِرَةُ الَّتِي لَيْسَ لَهَا أَيُّ زَاوِيَةٍ؟',
      options: ['triangle', 'square', 'circle', 'rectangle'],
    },
    {
      targetShape: 'square',
      nameWithTashkeel: 'الْمُرَبَّعُ (مِثْلُ صُنْدُوقِ الْهَدَايَا)',
      audioPrompt: 'أَيْنَ هُوَ الْمُرَبَّعُ الَّذِي لَهُ أَرْبَعَةُ رُؤُوسٍ؟',
      options: ['circle', 'square', 'triangle', 'rectangle'],
    },
    {
      targetShape: 'rectangle',
      nameWithTashkeel: 'الْمُسْتَطِيلُ (لَهُ ضِلْعَانِ طَوِيلَانِ وَضِلْعَانِ قَصِيرَانِ)',
      audioPrompt: 'أَيْنَ هُوَ الْمُسْتَطِيلُ ذُو الضِّلْعَيْنِ الطَّوِيلَيْنِ؟',
      options: ['square', 'triangle', 'rectangle', 'circle'],
    },
  ];

  const [shapeQIndex, setShapeQIndex] = useState(0);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [isShapeCorrect, setIsShapeCorrect] = useState<boolean | null>(null);

  const currentShapeQ = shapeQuestions[shapeQIndex];

  const handleShapeSelect = (shape: string) => {
    setSelectedShape(shape);
    if (shape === currentShapeQ.targetShape) {
      setIsShapeCorrect(true);
      soundManager.playSuccessChime();
      soundManager.speakArabic(`أَحْسَنْتَ يَا عَبْقَرِيّ! هَذَا هُوَ ${currentShapeQ.nameWithTashkeel}!`, speechRate);
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 },
      });
    } else {
      setIsShapeCorrect(false);
      soundManager.playEncouragementChime();
      soundManager.speakArabic('حَاوِلْ مَرَّةً أُخْرَى، تَأَمَّلْ عَدَدَ الْأَضْلَاعِ وَالانْحِنَاءَاتِ!', speechRate);
    }
  };

  const handleNextShape = () => {
    soundManager.playPop();
    setSelectedShape(null);
    setIsShapeCorrect(null);
    setShapeQIndex((prev) => (prev + 1) % shapeQuestions.length);
  };

  // Game 2: Patterns & Sequencing (إكمال النمط الذكي)
  const patternQuestions = [
    {
      pattern: ['circle', 'square', 'circle', 'square'],
      correctNext: 'circle',
      label: 'دَائِرَة - مُرَبَّع - دَائِرَة - مُرَبَّع - ... مَاذَا يَأْتِي بَعْدَهَا؟',
      options: ['circle', 'triangle', 'rectangle'],
    },
    {
      pattern: ['apple', 'star', 'apple', 'star'],
      correctNext: 'apple',
      label: 'تُفَّاحَة - نَجْمَة - تُفَّاحَة - نَجْمَة - ... مَاذَا يَأْتِي بَعْدَهَا؟',
      options: ['star', 'apple', 'ball'],
    },
    {
      pattern: ['triangle', 'triangle', 'circle', 'triangle', 'triangle'],
      correctNext: 'circle',
      label: 'مُثَلَّث - مُثَلَّث - دَائِرَة - مُثَلَّث - مُثَلَّث - ... مَاذَا يَأْتِي بَعْدَهَا؟',
      options: ['circle', 'square', 'triangle'],
    },
    {
      pattern: ['car', 'ball', 'car', 'ball'],
      correctNext: 'car',
      label: 'سَيَّارَة - كُرَة - سَيَّارَة - كُرَة - ... مَاذَا يَأْتِي بَعْدَهَا؟',
      options: ['car', 'ball', 'star'],
    },
    {
      pattern: ['star', 'star', 'apple', 'star', 'star'],
      correctNext: 'apple',
      label: 'نَجْمَة - نَجْمَة - تُفَّاحَة - نَجْمَة - نَجْمَة - ... مَاذَا يَأْتِي بَعْدَهَا؟',
      options: ['apple', 'star', 'triangle'],
    },
    {
      pattern: ['square', 'circle', 'square', 'circle'],
      correctNext: 'square',
      label: 'مُرَبَّع - دَائِرَة - مُرَبَّع - دَائِرَة - ... مَاذَا يَأْتِي بَعْدَهَا؟',
      options: ['square', 'circle', 'rectangle'],
    },
    {
      pattern: ['ball', 'ball', 'car', 'ball', 'ball'],
      correctNext: 'car',
      label: 'كُرَة - كُرَة - سَيَّارَة - كُرَة - كُرَة - ... مَاذَا يَأْتِي بَعْدَهَا؟',
      options: ['car', 'ball', 'apple'],
    },
  ];

  const [patternIndex, setPatternIndex] = useState(0);
  const [selectedPatternChoice, setSelectedPatternChoice] = useState<string | null>(null);
  const [isPatternCorrect, setIsPatternCorrect] = useState<boolean | null>(null);

  const currentPatternQ = patternQuestions[patternIndex];

  const handlePatternChoice = (item: string) => {
    setSelectedPatternChoice(item);
    if (item === currentPatternQ.correctNext) {
      setIsPatternCorrect(true);
      soundManager.playSuccessChime();
      soundManager.speakArabic('إِجَابَةٌ ذَكِيَّةٌ جِدًّا! لَقَدِ اكْتَشَفْتَ النَّمَطَ الصَّحِيحَ!', speechRate);
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
      });
    } else {
      setIsPatternCorrect(false);
      soundManager.playEncouragementChime();
      soundManager.speakArabic('انْظُرْ لِلتَّسَلْسُلِ مَرَّةً أُخْرَى، مَا هُوَ الشَّكْلُ الَّذِي يَتَكَرَّرُ؟', speechRate);
    }
  };

  const handleNextPattern = () => {
    soundManager.playPop();
    setSelectedPatternChoice(null);
    setIsPatternCorrect(null);
    setPatternIndex((prev) => (prev + 1) % patternQuestions.length);
  };

  // Game 3: Match Picture to Word
  const [matchQuestionIndex, setMatchQuestionIndex] = useState(0);
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [isMatchCorrect, setIsMatchCorrect] = useState<boolean | null>(null);

  const targetWord = words[matchQuestionIndex % words.length] || words[0];
  const otherWords = words.filter((w) => w.id !== targetWord.id);
  const matchChoices = [
    targetWord,
    otherWords[0] || words[1],
    otherWords[1] || words[2],
  ].sort(() => 0.5 - Math.random());

  const handleMatchSelect = (word: WordItem) => {
    setSelectedWordId(word.id);
    if (word.id === targetWord.id) {
      setIsMatchCorrect(true);
      soundManager.playSuccessChime();
      soundManager.speakArabic(`صَحِيح! هَذِهِ كَلِمَةُ ${word.word}! أَنْتَ ذَكِيٌّ جِدًّا!`, speechRate);
      confetti({
        particleCount: 40,
        spread: 60,
      });
    } else {
      setIsMatchCorrect(false);
      soundManager.playEncouragementChime();
      soundManager.speakArabic('حَاوِلْ مَرَّةً أُخْرَى، انْظُرْ لِلصُّورَةِ جَيِّدًا!', speechRate);
    }
  };

  const handleNextMatchQuestion = () => {
    soundManager.playPop();
    setSelectedWordId(null);
    setIsMatchCorrect(null);
    setMatchQuestionIndex((prev) => (prev + 1) % words.length);
  };

  // Game 4: Memory Cards
  interface MemoryCard {
    id: number;
    symbol: string;
    label: string;
    isFlipped: boolean;
    isMatched: boolean;
  }

  const [memoryCards, setMemoryCards] = useState<MemoryCard[]>([
    { id: 1, symbol: 'star', label: 'نجمة', isFlipped: false, isMatched: false },
    { id: 2, symbol: 'star', label: 'نجمة', isFlipped: false, isMatched: false },
    { id: 3, symbol: 'apple', label: 'تفاحة', isFlipped: false, isMatched: false },
    { id: 4, symbol: 'apple', label: 'تفاحة', isFlipped: false, isMatched: false },
    { id: 5, symbol: 'car', label: 'سيارة', isFlipped: false, isMatched: false },
    { id: 6, symbol: 'car', label: 'سيارة', isFlipped: false, isMatched: false },
  ].sort(() => 0.5 - Math.random()));

  const [flippedCards, setFlippedCards] = useState<number[]>([]);

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2) return;
    const card = memoryCards.find((c) => c.id === id);
    if (!card || card.isFlipped || card.isMatched) return;

    soundManager.playPop();
    const newCards = memoryCards.map((c) => (c.id === id ? { ...c, isFlipped: true } : c));
    setMemoryCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      const card1 = newCards.find((c) => c.id === newFlipped[0])!;
      const card2 = newCards.find((c) => c.id === newFlipped[1])!;

      if (card1.symbol === card2.symbol) {
        soundManager.playSuccessChime();
        soundManager.speakArabic(`أَحْسَنْت! تَطَابَقَ ${card1.label}!`, speechRate);
        setTimeout(() => {
          setMemoryCards((prev) =>
            prev.map((c) =>
              c.id === card1.id || c.id === card2.id ? { ...c, isMatched: true } : c
            )
          );
          setFlippedCards([]);
        }, 600);
      } else {
        soundManager.playEncouragementChime();
        setTimeout(() => {
          setMemoryCards((prev) =>
            prev.map((c) =>
              c.id === card1.id || c.id === card2.id ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedCards([]);
        }, 1200);
      }
    }
  };

  const resetMemoryGame = () => {
    soundManager.playPop();
    setMemoryCards([
      { id: 1, symbol: 'star', label: 'نجمة', isFlipped: false, isMatched: false },
      { id: 2, symbol: 'star', label: 'نجمة', isFlipped: false, isMatched: false },
      { id: 3, symbol: 'apple', label: 'تفاحة', isFlipped: false, isMatched: false },
      { id: 4, symbol: 'apple', label: 'تفاحة', isFlipped: false, isMatched: false },
      { id: 5, symbol: 'car', label: 'سيارة', isFlipped: false, isMatched: false },
      { id: 6, symbol: 'car', label: 'سيارة', isFlipped: false, isMatched: false },
    ].sort(() => 0.5 - Math.random()));
    setFlippedCards([]);
  };

  return (
    <div className="space-y-6">
      {/* Game Selector Tabs */}
      <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-amber-200">
        <div className="flex items-center justify-center gap-2 md:gap-3 flex-wrap">
          <button
            onClick={() => {
              setActiveGame('shapes');
              soundManager.playPop();
            }}
            className={`px-4 py-2.5 rounded-2xl font-black text-sm md:text-base flex items-center gap-2 transition-all cursor-pointer ${
              activeGame === 'shapes'
                ? 'bg-amber-500 text-white shadow-md scale-105'
                : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Shapes className="w-5 h-5" />
            <span>تَمْيِيزُ الْأَشْكَالِ الْهَنْدَسِيَّةِ</span>
          </button>

          <button
            onClick={() => {
              setActiveGame('pattern');
              soundManager.playPop();
            }}
            className={`px-4 py-2.5 rounded-2xl font-black text-sm md:text-base flex items-center gap-2 transition-all cursor-pointer ${
              activeGame === 'pattern'
                ? 'bg-purple-500 text-white shadow-md scale-105'
                : 'bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-200'
            }`}
          >
            <ListOrdered className="w-5 h-5" />
            <span>إِكْمَالُ النَّمَطِ الذَّكِيِّ</span>
          </button>

          <button
            onClick={() => {
              setActiveGame('match');
              soundManager.playPop();
            }}
            className={`px-4 py-2.5 rounded-2xl font-black text-sm md:text-base flex items-center gap-2 transition-all cursor-pointer ${
              activeGame === 'match'
                ? 'bg-emerald-500 text-white shadow-md scale-105'
                : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <Brain className="w-5 h-5" />
            <span>مُطَابَقَةُ الْكَلِمَةِ بِالصُّورَةِ</span>
          </button>

          <button
            onClick={() => {
              setActiveGame('memory');
              soundManager.playPop();
            }}
            className={`px-4 py-2.5 rounded-2xl font-black text-sm md:text-base flex items-center gap-2 transition-all cursor-pointer ${
              activeGame === 'memory'
                ? 'bg-indigo-500 text-white shadow-md scale-105'
                : 'bg-indigo-50 text-indigo-900 hover:bg-indigo-100 border border-indigo-200'
            }`}
          >
            <RotateCcw className="w-5 h-5" />
            <span>بَطَاقَاتُ الذَّاكِرَةِ</span>
          </button>
        </div>
      </div>

      {/* Game 1: Shape Recognition */}
      {activeGame === 'shapes' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border-2 border-amber-200 space-y-6">
          <div className="text-center">
            <h3 className="text-2xl md:text-3xl font-black text-amber-950 mb-2">
              {currentShapeQ.audioPrompt}
            </h3>
            <p className="text-base text-amber-800 font-bold">
              ابْحَثْ عَنْ: <span className="underline decoration-amber-500 decoration-3">{currentShapeQ.nameWithTashkeel}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl mx-auto py-4">
            {currentShapeQ.options.map((shapeKey, idx) => (
              <button
                key={idx}
                onClick={() => handleShapeSelect(shapeKey)}
                className={`p-6 rounded-3xl transition-all cursor-pointer flex flex-col items-center justify-center min-h-[140px] shadow-sm hover:scale-105 ${
                  selectedShape === shapeKey
                    ? shapeKey === currentShapeQ.targetShape
                      ? 'bg-emerald-100 border-4 border-emerald-500 ring-4 ring-emerald-300'
                      : 'bg-rose-100 border-4 border-rose-500 ring-4 ring-rose-300'
                    : 'bg-amber-50 hover:bg-amber-100 border-2 border-amber-300'
                }`}
              >
                <Illustration name={shapeKey} className="w-16 h-16" />
              </button>
            ))}
          </div>

          {isShapeCorrect === true && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-center flex items-center justify-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <span className="text-xl font-black text-emerald-900">
                أَحْسَنْتَ يَا بَطَل! هَذَا هُوَ الشَّكْلُ الصَّحِيحُ!
              </span>
              <button
                onClick={handleNextShape}
                className="mr-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
              >
                الشَّكْلُ التَّالِي ❯
              </button>
            </div>
          )}

          {isShapeCorrect === false && (
            <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl text-center">
              <span className="text-lg font-black text-amber-900">
                حَاوِلْ مَرَّةً أُخْرَى، تَأَمَّلْ عَدَدَ أَضْلَاعِ الشَّكْلِ!
              </span>
            </div>
          )}
        </div>
      )}

      {/* Game 2: Patterns & Sequences */}
      {activeGame === 'pattern' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border-2 border-purple-200 space-y-6">
          <div className="text-center">
            <h3 className="text-2xl md:text-3xl font-black text-purple-950 mb-2">
              لُعْبَةُ إِكْمَالِ النَّمَطِ وَالتَّسَلْسُلِ
            </h3>
            <p className="text-base text-purple-800 font-bold">
              {currentPatternQ.label}
            </p>
          </div>

          {/* Sequence Display Box */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-3xl border-2 border-purple-200 flex items-center justify-center gap-3 md:gap-4 flex-wrap max-w-2xl mx-auto">
            {currentPatternQ.pattern.map((item, idx) => (
              <div key={idx} className="p-3 bg-white rounded-2xl border-2 border-purple-300 shadow-2xs">
                <Illustration name={item} className="w-12 h-12" />
              </div>
            ))}

            <div className="p-3 bg-purple-200 border-2 border-dashed border-purple-500 rounded-2xl flex items-center justify-center min-w-[70px] min-h-[70px]">
              <span className="text-3xl font-black text-purple-900">
                {isPatternCorrect ? <Illustration name={currentPatternQ.correctNext} className="w-12 h-12" /> : '؟'}
              </span>
            </div>
          </div>

          {/* Choices */}
          <div className="space-y-3">
            <span className="text-base font-black text-purple-950 block text-center">
              اخْتَرِ الشَّكْلَ الَّذِي يُكْمِلُ النَّمَطَ:
            </span>

            <div className="flex items-center justify-center gap-4">
              {currentPatternQ.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePatternChoice(option)}
                  className={`p-4 rounded-3xl transition-all cursor-pointer flex flex-col items-center justify-center shadow-sm hover:scale-105 ${
                    selectedPatternChoice === option
                      ? option === currentPatternQ.correctNext
                        ? 'bg-emerald-100 border-4 border-emerald-500 ring-4 ring-emerald-300'
                        : 'bg-rose-100 border-4 border-rose-500 ring-4 ring-rose-300'
                      : 'bg-purple-50 hover:bg-purple-100 border-2 border-purple-300'
                  }`}
                >
                  <Illustration name={option} className="w-14 h-14" />
                </button>
              ))}
            </div>
          </div>

          {isPatternCorrect === true && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-center flex items-center justify-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <span className="text-xl font-black text-emerald-900">
                عَبْقَرِيٌّ جِدًّا! لَقَدْ حَلَلْتَ النَّمَطَ بِنَجَاحٍ!
              </span>
              <button
                onClick={handleNextPattern}
                className="mr-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
              >
                النَّمَطُ التَّالِي ❯
              </button>
            </div>
          )}

          {isPatternCorrect === false && (
            <div className="p-4 bg-purple-50 border-2 border-purple-300 rounded-2xl text-center">
              <span className="text-lg font-black text-purple-900">
                حَاوِلْ مَرَّةً أُخْرَى، تَتَبَّعِ التَّرْتِيبَ مِنْ أَوَّلِ الشَّرِيطِ!
              </span>
            </div>
          )}
        </div>
      )}

      {/* Game 3: Match Picture to Word */}
      {activeGame === 'match' && targetWord && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border-2 border-amber-200 space-y-6">
          <div className="text-center">
            <h3 className="text-2xl md:text-3xl font-black text-amber-950 mb-2">
              أَيُّ كَلِمَةٍ تَدُلُّ عَلَى هَذِهِ الصُّورَةِ؟
            </h3>
            <p className="text-base text-amber-800 font-bold">
              انْظُرْ إِلَى الصُّورَةِ جَيِّدًا، ثُمَّ اخْتَرِ الْكَلِمَةَ الْمُنَاسِبَةَ:
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-60 h-60 rounded-3xl overflow-hidden border-4 border-amber-400 shadow-md bg-amber-50">
              <Illustration name={targetWord.image} className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {matchChoices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => handleMatchSelect(choice)}
                className={`py-5 px-4 rounded-2xl font-black text-2xl md:text-3xl transition-all cursor-pointer shadow-sm tashkeel-word ${
                  selectedWordId === choice.id
                    ? choice.id === targetWord.id
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-300 scale-105'
                      : 'bg-rose-500 text-white ring-4 ring-rose-300 scale-105'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-2 border-amber-300'
                }`}
              >
                {choice.word}
              </button>
            ))}
          </div>

          {isMatchCorrect === true && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-center flex items-center justify-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <span className="text-xl font-black text-emerald-900">
                إِجَابَةٌ صَحِيحَةٌ يَا بَطَل! هَذِهِ كَلِمَةُ «{targetWord.word}»
              </span>
              <button
                onClick={handleNextMatchQuestion}
                className="mr-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
              >
                السُّؤَالُ التَّالِي ❯
              </button>
            </div>
          )}

          {isMatchCorrect === false && (
            <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl text-center">
              <span className="text-lg font-black text-amber-900">
                حَاوِلْ مَرَّةً أُخْرَى، اسْتَمِعْ لِصَوْتِ الْحُرُوفِ!
              </span>
            </div>
          )}
        </div>
      )}

      {/* Game 4: Memory Cards */}
      {activeGame === 'memory' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border-2 border-indigo-200 space-y-6">
          <div className="text-center">
            <h3 className="text-2xl md:text-3xl font-black text-indigo-950 mb-2">
              لُعْبَةُ بَطَاقَاتِ الذَّاكِرَةِ وَالتَّطَابُقِ
            </h3>
            <p className="text-base text-indigo-800 font-bold">
              اقْلِبِ الْبَطَاقَاتِ وَابْحَثْ عَنِ الشَّكْلَيْنِ الْمُتَطَابِقَيْنِ!
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto py-2">
            {memoryCards.map((card) => (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                disabled={card.isFlipped || card.isMatched}
                className={`aspect-square rounded-3xl transition-all cursor-pointer flex flex-col items-center justify-center shadow-md p-4 text-3xl font-black ${
                  card.isMatched
                    ? 'bg-emerald-100 border-3 border-emerald-400 opacity-90'
                    : card.isFlipped
                    ? 'bg-white border-3 border-amber-400 scale-102'
                    : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white hover:scale-105'
                }`}
              >
                {card.isFlipped || card.isMatched ? (
                  <Illustration name={card.symbol} className="w-16 h-16" />
                ) : (
                  <span>❓</span>
                )}
              </button>
            ))}
          </div>

          <div className="text-center pt-2">
            <button
              onClick={resetMemoryGame}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl inline-flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>إِعَادَةُ تَرْتِيبِ الْبَطَاقَاتِ</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
