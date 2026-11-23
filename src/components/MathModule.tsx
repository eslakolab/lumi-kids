import React, { useState } from 'react';
import { MathItem } from '../types';
import { INITIAL_COMPARISONS, ComparisonItem } from '../data/initialData';
import { Illustration } from './Illustrations';
import { soundManager } from '../utils/audio';
import { Volume2, Plus, Minus, X, Divide, Hash, CheckCircle2, RefreshCw, Scale } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MathModuleProps {
  mathProblems: MathItem[];
  speechRate: number;
}

export const MathModule: React.FC<MathModuleProps> = ({ mathProblems, speechRate }) => {
  const [activeTab, setActiveTab] = useState<'comparison' | 'counting' | 'addition' | 'subtraction' | 'multiplication' | 'division'>('comparison');
  const [countingCount, setCountingCount] = useState<number>(5);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [countedItems, setCountedItems] = useState<number[]>([]);

  // Comparison State
  const [comparisonIndex, setComparisonIndex] = useState(0);
  const [selectedSign, setSelectedSign] = useState<'>' | '<' | '=' | null>(null);
  const [isComparisonCorrect, setIsComparisonCorrect] = useState<boolean | null>(null);

  const currentComparison: ComparisonItem = INITIAL_COMPARISONS[comparisonIndex] || INITIAL_COMPARISONS[0];

  // Determine correct sign for comparison
  const correctSign: '>' | '<' | '=' =
    currentComparison.countA > currentComparison.countB
      ? '>'
      : currentComparison.countA < currentComparison.countB
      ? '<'
      : '=';

  // Filter problems by active math category
  const filteredProblems = mathProblems.filter((p) => p.type === activeTab);
  const currentProblem = filteredProblems[currentProblemIndex] || filteredProblems[0] || mathProblems[0];

  const handleTabChange = (tab: 'comparison' | 'counting' | 'addition' | 'subtraction' | 'multiplication' | 'division') => {
    setActiveTab(tab);
    setCurrentProblemIndex(0);
    setSelectedAnswer(null);
    setIsAnswerCorrect(null);
    setCountedItems([]);
    setSelectedSign(null);
    setIsComparisonCorrect(null);
    soundManager.playPop();
  };

  const handleAnswerSelect = (val: number) => {
    setSelectedAnswer(val);
    if (val === currentProblem.result) {
      setIsAnswerCorrect(true);
      soundManager.playSuccessChime();
      soundManager.speakArabic('صَحِيحٌ مُمْتَاز! أَنْتَ بَطَلُ الرِّيَاضِيَّاتِ!', speechRate);
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 },
      });
    } else {
      setIsAnswerCorrect(false);
      soundManager.playEncouragementChime();
      soundManager.speakArabic('حَاوِلْ مَرَّةً أُخْرَى، عُدَّ الرُّسُومَ بِهُدُوءٍ!', speechRate);
    }
  };

  const handleNextProblem = () => {
    soundManager.playPop();
    setSelectedAnswer(null);
    setIsAnswerCorrect(null);
    if (currentProblemIndex < filteredProblems.length - 1) {
      setCurrentProblemIndex(currentProblemIndex + 1);
    } else {
      setCurrentProblemIndex(0);
    }
  };

  // Sign Selection Handler (> / < / =)
  const handleSignSelect = (sign: '>' | '<' | '=') => {
    setSelectedSign(sign);
    if (sign === correctSign) {
      setIsComparisonCorrect(true);
      soundManager.playSuccessChime();
      const signWord =
        sign === '>'
          ? `${currentComparison.countA} أَكْبَرُ مِنْ ${currentComparison.countB}`
          : sign === '<'
          ? `${currentComparison.countA} أَصْغَرُ مِنْ ${currentComparison.countB}`
          : `${currentComparison.countA} يُسَاوِي ${currentComparison.countB}`;
      soundManager.speakArabic(`صَحِيح! ${signWord}!`, speechRate);
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
      });
    } else {
      setIsComparisonCorrect(false);
      soundManager.playEncouragementChime();
      soundManager.speakArabic('حَاوِلْ مَرَّةً أُخْرَى، قَارِنْ بَيْنَ الْعَدَدَيْنِ!', speechRate);
    }
  };

  const handleNextComparison = () => {
    soundManager.playPop();
    setSelectedSign(null);
    setIsComparisonCorrect(null);
    setComparisonIndex((prev) => (prev + 1) % INITIAL_COMPARISONS.length);
  };

  // Counting exercise item click
  const handleItemCountClick = (index: number) => {
    if (!countedItems.includes(index)) {
      setCountedItems([...countedItems, index]);
    }
    const currentNumber = index + 1;
    soundManager.playCountTone(currentNumber);
    soundManager.speakArabic(`${currentNumber}`, speechRate * 0.9);
  };

  // Multiple choice answers for operations
  const answerChoices = currentProblem
    ? Array.from(
        new Set([
          currentProblem.result,
          Math.max(1, currentProblem.result - 1),
          currentProblem.result + 1,
          currentProblem.result + 2,
        ])
      ).sort((a, b) => a - b)
    : [];

  return (
    <div className="space-y-6">
      {/* Category selector */}
      <div className="bg-white rounded-3xl p-3 md:p-4 shadow-2xs border border-amber-200">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <button
            onClick={() => handleTabChange('comparison')}
            className={`px-4 py-2 rounded-2xl font-black text-sm md:text-base flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'comparison'
                ? 'bg-amber-500 text-white shadow-2xs scale-102'
                : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>مُقَارَنَةُ الْأَعْدَادِ (&gt; ، &lt; ، =)</span>
          </button>

          <button
            onClick={() => handleTabChange('counting')}
            className={`px-4 py-2 rounded-2xl font-black text-sm md:text-base flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'counting'
                ? 'bg-amber-500 text-white shadow-2xs scale-102'
                : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Hash className="w-4 h-4" />
            <span>الْعَدُّ</span>
          </button>

          <button
            onClick={() => handleTabChange('addition')}
            className={`px-4 py-2 rounded-2xl font-black text-sm md:text-base flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'addition'
                ? 'bg-emerald-500 text-white shadow-2xs scale-102'
                : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>الْجَمْعُ (+)</span>
          </button>

          <button
            onClick={() => handleTabChange('subtraction')}
            className={`px-4 py-2 rounded-2xl font-black text-sm md:text-base flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'subtraction'
                ? 'bg-rose-500 text-white shadow-2xs scale-102'
                : 'bg-rose-50 text-rose-900 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <Minus className="w-4 h-4" />
            <span>الطَّرْحُ (-)</span>
          </button>

          <button
            onClick={() => handleTabChange('multiplication')}
            className={`px-4 py-2 rounded-2xl font-black text-sm md:text-base flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'multiplication'
                ? 'bg-purple-500 text-white shadow-2xs scale-102'
                : 'bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-200'
            }`}
          >
            <X className="w-4 h-4" />
            <span>الضَّرْبُ (×)</span>
          </button>

          <button
            onClick={() => handleTabChange('division')}
            className={`px-4 py-2 rounded-2xl font-black text-sm md:text-base flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'division'
                ? 'bg-indigo-500 text-white shadow-2xs scale-102'
                : 'bg-indigo-50 text-indigo-900 hover:bg-indigo-100 border border-indigo-200'
            }`}
          >
            <Divide className="w-4 h-4" />
            <span>الْقِسْمَةُ (÷)</span>
          </button>
        </div>
      </div>

      {/* SINGLE UNIFIED CONTAINER FOR COMPARISON (السؤال كله في حاوية واحدة منظمة) */}
      {activeTab === 'comparison' && currentComparison && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border-2 border-amber-300 space-y-6">
          {/* Question Title & Audio */}
          <div className="flex items-center justify-between border-b border-amber-100 pb-4">
            <h3 className="text-xl md:text-2xl font-black text-amber-950">
              ضَعْ إِشَارَةَ ( &gt; أَوْ &lt; أَوْ = ) بَيْنَ الْمَجْمُوعَتَيْنِ:
            </h3>

            <button
              onClick={() => {
                soundManager.playPop();
                soundManager.speakArabic(
                  `قَارِنْ بَيْنَ ${currentComparison.countA} وَ ${currentComparison.countB}. ضَعْ إِشَارَةَ أَكْبَر مِنْ، أَصْغَر مِنْ، أَوْ يُسَاوِي!`,
                  speechRate
                );
              }}
              className="p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl border border-amber-200 cursor-pointer"
              title="استمع للسؤال"
            >
              <Volume2 className="w-5 h-5 text-amber-600 animate-pulse" />
            </button>
          </div>

          {/* Unified Comparison Row: Group A - Middle Sign Box - Group B */}
          <div className="bg-gradient-to-br from-amber-50/70 via-white to-orange-50/60 p-6 md:p-8 rounded-2xl border border-amber-200">
            <div className="flex flex-col md:flex-row items-center justify-around gap-6">
              {/* Group A (e.g. 5 apples) */}
              <div className="flex-1 flex flex-col items-center justify-center p-4 bg-white rounded-2xl border-2 border-amber-200 shadow-2xs w-full max-w-xs min-h-[170px]">
                <div className="flex gap-2 flex-wrap justify-center items-center py-2 min-h-[80px]">
                  {Array.from({ length: currentComparison.countA }).map((_, i) => (
                    <Illustration key={i} name={currentComparison.itemType} className="w-11 h-11" />
                  ))}
                </div>
                <div className="mt-2 text-3xl font-black text-amber-950">
                  {currentComparison.countA}
                </div>
              </div>

              {/* Middle Comparison Sign Slot (إشارة الأكبر أو الأصغر أو يساوي في الوسط) */}
              <div className="flex flex-col items-center justify-center gap-3 shrink-0">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-amber-100 border-3 border-dashed border-amber-400 flex items-center justify-center shadow-inner">
                  <span className="text-5xl font-black text-amber-950">
                    {selectedSign ? selectedSign : '؟'}
                  </span>
                </div>

                {/* Sign Buttons: >  =  < */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSignSelect('>')}
                    className={`w-12 h-12 rounded-xl font-black text-2xl transition-all cursor-pointer flex items-center justify-center shadow-xs ${
                      selectedSign === '>'
                        ? correctSign === '>'
                          ? 'bg-emerald-500 text-white ring-4 ring-emerald-300'
                          : 'bg-rose-500 text-white ring-4 ring-rose-300'
                        : 'bg-white hover:bg-amber-100 text-amber-950 border-2 border-amber-300'
                    }`}
                    title="أكبر من"
                  >
                    &gt;
                  </button>

                  <button
                    onClick={() => handleSignSelect('=')}
                    className={`w-12 h-12 rounded-xl font-black text-2xl transition-all cursor-pointer flex items-center justify-center shadow-xs ${
                      selectedSign === '='
                        ? correctSign === '='
                          ? 'bg-emerald-500 text-white ring-4 ring-emerald-300'
                          : 'bg-rose-500 text-white ring-4 ring-rose-300'
                        : 'bg-white hover:bg-amber-100 text-amber-950 border-2 border-amber-300'
                    }`}
                    title="يساوي"
                  >
                    =
                  </button>

                  <button
                    onClick={() => handleSignSelect('<')}
                    className={`w-12 h-12 rounded-xl font-black text-2xl transition-all cursor-pointer flex items-center justify-center shadow-xs ${
                      selectedSign === '<'
                        ? correctSign === '<'
                          ? 'bg-emerald-500 text-white ring-4 ring-emerald-300'
                          : 'bg-rose-500 text-white ring-4 ring-rose-300'
                        : 'bg-white hover:bg-amber-100 text-amber-950 border-2 border-amber-300'
                    }`}
                    title="أصغر من"
                  >
                    &lt;
                  </button>
                </div>
              </div>

              {/* Group B (e.g. 3 apples) */}
              <div className="flex-1 flex flex-col items-center justify-center p-4 bg-white rounded-2xl border-2 border-amber-200 shadow-2xs w-full max-w-xs min-h-[170px]">
                <div className="flex gap-2 flex-wrap justify-center items-center py-2 min-h-[80px]">
                  {Array.from({ length: currentComparison.countB }).map((_, i) => (
                    <Illustration key={i} name={currentComparison.itemType} className="w-11 h-11" />
                  ))}
                </div>
                <div className="mt-2 text-3xl font-black text-amber-950">
                  {currentComparison.countB}
                </div>
              </div>
            </div>
          </div>

          {/* Feedback & Next Problem inside the same container */}
          {isComparisonCorrect === true && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-center flex items-center justify-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <span className="text-lg md:text-xl font-black text-emerald-900">
                إِجَابَةٌ صَحِيحَةٌ يَا بَطَل!
              </span>
              <button
                onClick={handleNextComparison}
                className="mr-3 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
              >
                الْمُقَارَنَةُ التَّالِيَةُ ❯
              </button>
            </div>
          )}

          {isComparisonCorrect === false && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-center text-amber-900 font-bold">
              حَاوِلْ مَرَّةً أُخْرَى، عُدَّ الْعَنَاصِرَ فِي كُلِّ طَرَفٍ بِهُدُوءٍ!
            </div>
          )}
        </div>
      )}

      {/* SINGLE UNIFIED CONTAINER FOR COUNTING */}
      {activeTab === 'counting' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border-2 border-amber-300 space-y-6">
          <div className="text-center">
            <h3 className="text-xl md:text-2xl font-black text-amber-950">
              اخْتَرْ رَقْمًا ثُمَّ انْقُرْ عَلَى الرُّسُومِ لِعَدِّهَا:
            </h3>
          </div>

          {/* Number Selectors 1 to 10 */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <button
                key={num}
                onClick={() => {
                  setCountingCount(num);
                  setCountedItems([]);
                  soundManager.playPop();
                  soundManager.speakArabic(`${num}`, speechRate);
                }}
                className={`w-11 h-11 md:w-14 md:h-14 rounded-2xl font-black text-xl md:text-2xl transition-all cursor-pointer flex items-center justify-center ${
                  countingCount === num
                    ? 'bg-amber-500 text-white shadow-2xs scale-105'
                    : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          <div className="bg-gradient-to-br from-amber-50/70 to-orange-50/50 p-6 rounded-2xl border border-amber-200 text-center">
            <div className="flex items-center justify-center gap-3 md:gap-4 flex-wrap min-h-[140px]">
              {Array.from({ length: countingCount }).map((_, i) => {
                const isCounted = countedItems.includes(i);
                return (
                  <button
                    key={i}
                    onClick={() => handleItemCountClick(i)}
                    className={`p-3 rounded-2xl transition-all cursor-pointer transform ${
                      isCounted
                        ? 'bg-amber-200 ring-4 ring-amber-400 scale-105 shadow-xs'
                        : 'bg-white hover:scale-105 border-2 border-amber-200 shadow-2xs'
                    }`}
                  >
                    <Illustration name="apple" className="w-12 h-12" />
                    <span className="block mt-1 font-black text-base text-amber-900">
                      {isCounted ? i + 1 : '؟'}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex items-center justify-center gap-4">
              <span className="text-xl font-black text-amber-950 bg-white px-5 py-1.5 rounded-xl border border-amber-300">
                الْمَجْمُوعُ: {countingCount}
              </span>

              <button
                onClick={() => {
                  setCountedItems([]);
                  soundManager.playPop();
                }}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-1 cursor-pointer text-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>إِعَادَةٌ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SINGLE UNIFIED CONTAINER FOR ARITHMETIC (جمع، طرح، ضرب، قسمة في حاوية واحدة منظمة) */}
      {activeTab !== 'comparison' && activeTab !== 'counting' && currentProblem && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border-2 border-amber-300 space-y-6">
          {/* Header row with audio */}
          <div className="flex items-center justify-between border-b border-amber-100 pb-3">
            <p className="text-lg md:text-xl font-black text-amber-950">
              {currentProblem.story}
            </p>
            <button
              onClick={() => {
                soundManager.playPop();
                soundManager.speakArabic(currentProblem.story, speechRate);
              }}
              className="p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl border border-amber-200 cursor-pointer"
              title="استمع للمسألة"
            >
              <Volume2 className="w-5 h-5 text-amber-600 animate-pulse" />
            </button>
          </div>

          {/* Unified Equation Row with Visuals */}
          <div className="bg-gradient-to-br from-amber-50/70 via-white to-orange-50/60 p-6 md:p-8 rounded-2xl border border-amber-200">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
              {/* Group 1 */}
              <div className="p-4 bg-white rounded-2xl border-2 border-amber-200 shadow-2xs flex flex-col items-center min-w-[120px]">
                <div className="flex gap-1.5 flex-wrap justify-center items-center min-h-[50px] max-w-[160px]">
                  {Array.from({ length: currentProblem.num1 }).map((_, i) => (
                    <Illustration key={i} name={currentProblem.itemType} className="w-9 h-9" />
                  ))}
                </div>
                <span className="text-2xl font-black text-amber-900 mt-2">{currentProblem.num1}</span>
              </div>

              {/* Operator Symbol (+ / - / × / ÷) */}
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-900 text-3xl font-black flex items-center justify-center shadow-2xs border border-amber-300 shrink-0">
                {currentProblem.operator}
              </div>

              {/* Group 2 */}
              <div className="p-4 bg-white rounded-2xl border-2 border-amber-200 shadow-2xs flex flex-col items-center min-w-[120px]">
                <div className="flex gap-1.5 flex-wrap justify-center items-center min-h-[50px] max-w-[160px]">
                  {Array.from({ length: currentProblem.num2 }).map((_, i) => (
                    <Illustration key={i} name={currentProblem.itemType} className="w-9 h-9" />
                  ))}
                </div>
                <span className="text-2xl font-black text-amber-900 mt-2">{currentProblem.num2}</span>
              </div>

              {/* Equals Symbol */}
              <div className="text-3xl font-black text-amber-800">=</div>

              {/* Result Box */}
              <div className="p-4 bg-white rounded-2xl border-3 border-dashed border-amber-400 min-w-[110px] min-h-[80px] flex items-center justify-center shadow-2xs">
                <span className="text-4xl font-black text-amber-950">
                  {isAnswerCorrect ? currentProblem.result : '؟'}
                </span>
              </div>
            </div>
          </div>

          {/* Multiple Choice Answers Inside the Same Container */}
          <div className="space-y-3 pt-2">
            <span className="text-sm font-black text-amber-950 block text-center">
              اخْتَرِ الإِجَابَةَ الصَّحِيحَةَ:
            </span>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              {answerChoices.map((choice) => (
                <button
                  key={choice}
                  onClick={() => handleAnswerSelect(choice)}
                  className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl font-black text-2xl md:text-3xl transition-all cursor-pointer flex items-center justify-center shadow-2xs ${
                    selectedAnswer === choice
                      ? choice === currentProblem.result
                        ? 'bg-emerald-500 text-white ring-4 ring-emerald-300 scale-105'
                        : 'bg-rose-500 text-white ring-4 ring-rose-300 scale-105'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-2 border-amber-300'
                  }`}
                >
                  {choice}
                </button>
              ))}
            </div>

            {/* In-Container Feedback */}
            {isAnswerCorrect === true && (
              <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-center flex items-center justify-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <span className="text-lg font-black text-emerald-900">
                  إِجَابَةٌ صَحِيحَةٌ يَا بَطَل!
                </span>
                <button
                  onClick={handleNextProblem}
                  className="mr-3 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  الْمَسْأَلَةُ التَّالِيَةُ ❯
                </button>
              </div>
            )}

            {isAnswerCorrect === false && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-center text-amber-900 font-bold">
                حَاوِلْ مَرَّةً أُخْرَى، عُدَّ الرُّسُومَ بِهُدُوءٍ أَنْتَ تَسْتَطِيع!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
