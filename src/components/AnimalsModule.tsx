import React, { useState } from 'react';
import { INITIAL_ANIMALS, AnimalItem } from '../data/initialData';
import { Illustration } from './Illustrations';
import { soundManager } from '../utils/audio';
import { Volume2, Sparkles, ChevronRight, ChevronLeft, CheckCircle2, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AnimalsModuleProps {
  speechRate: number;
}

interface AnimalQuizQuestion {
  id: string;
  question: string;
  correctAnimalId: string;
  hint: string;
}

const ANIMAL_QUIZ_QUESTIONS: AnimalQuizQuestion[] = [
  {
    id: 'q1',
    question: 'مَنْ هُوَ الْحَيَوَانُ الْأَلِيفُ الَّذِي يَقُولُ مِيَاوْ مِيَاوْ؟',
    correctAnimalId: 'cat',
    hint: 'يُحِبُّ شُرْبَ الْحَلِيبِ وَاللَّعِبَ بِكُرَةِ الصُّوفِ',
  },
  {
    id: 'q2',
    question: 'مَنْ لَهُ أُذُنَانِ طَوِيلَتَانِ وَيَقْفِزُ بِرَشَاقَةٍ وَيَأْكُلُ الْجَزَرَ؟',
    correctAnimalId: 'rabbit',
    hint: 'فَرْوُهُ أَبْيَضُ وَلَطِيفٌ وَيَعِيشُ فِي جُحُورٍ دَافِئَةٍ',
  },
  {
    id: 'q3',
    question: 'مَنْ يَسْبَحُ فِي الْمَاءِ بِحُرِّيَّةٍ بِاسْتِخْدَامِ زَعَانِفِهِ الْمُلَوَّنَةِ؟',
    correctAnimalId: 'fish',
    hint: 'تَتَنَفَّسُ فِي الْمَاءِ وَتُحْدِثُ فَقَاقِيعَ لَطِيفَةً',
  },
  {
    id: 'q4',
    question: 'مَنْ يُلَقَّبُ بِمَلِكِ الْغَابَةِ الشُّجَاعِ ذِي الزَّئِيرِ الْقَوِيِّ؟',
    correctAnimalId: 'lion',
    hint: 'لَهُ فَرْوٌ ذَهَبِيٌّ وَيَعِيشُ فِي السَّافَانَا',
  },
  {
    id: 'q5',
    question: 'مَنْ هُوَ الْحَيَوَانُ السَّرِيعُ الْأَصِيلُ الَّذِي صَوْتُهُ الصَّهِيلُ؟',
    correctAnimalId: 'horse',
    hint: 'لَهُ عُرْفٌ جَمِيلٌ وَيَرْكُضُ فِي الْمَرَاعِي الْخَضْرَاءِ',
  },
  {
    id: 'q6',
    question: 'مَنْ يُسَمَّى سَفِينَةَ الصَّحْرَاءِ وَيَتَحَمَّلُ الْحَرَّ وَالْعَطَشَ؟',
    correctAnimalId: 'camel',
    hint: 'حَيَوَانٌ صَبُورٌ جِدًّا يَعِيشُ فِي الصَّحْرَاءِ الذَّهَبِيَّةِ',
  },
  {
    id: 'q7',
    question: 'مَنْ يَعِيشُ فِي الْبُيُوتِ مَعَ الْإِنْسَانِ وَيَمْسَحُ فَرْوَهُ بِنَظَافَةٍ؟',
    correctAnimalId: 'cat',
    hint: 'صَوْتُهَا الْمُوَاءُ اللَّطِيفُ',
  },
  {
    id: 'q8',
    question: 'مَنْ يَعْشَقُ أَكْلَ الْخَسِّ وَالْجَزَرِ الطَّازَجِ وَأُذُنَاهُ طَوِيلَتَانِ؟',
    correctAnimalId: 'rabbit',
    hint: 'سَرِيعُ الْقَفْزِ فِي الْحُقُولِ',
  },
  {
    id: 'q9',
    question: 'مَنْ يَعِيشُ فِي الْإِسْطَبْلِ وَيَأْكُلُ الشَّعِيرَ وَالْعُشْبَ الْأَخْضَرَ؟',
    correctAnimalId: 'horse',
    hint: 'صَدِيقُ الْإِنْسَانِ فِي الرُّكُوبِ وَالسِّبَاقِ',
  },
  {
    id: 'q10',
    question: 'مَنْ يَشْرَبُ الْمَاءَ وَيَسِيرُ مَسَافَاتٍ طَوِيلَةً فَوْقَ الرِّمَالِ؟',
    correctAnimalId: 'camel',
    hint: 'صَوْتُهُ الرُّغَاءُ وَهُوَ سَفِينَةُ الصَّحْرَاءِ',
  },
];

export const AnimalsModule: React.FC<AnimalsModuleProps> = ({ speechRate }) => {
  const [selectedAnimalIndex, setSelectedAnimalIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'learn' | 'quiz'>('learn');

  // Quiz state
  const [currentQuizQuestionIndex, setCurrentQuizQuestionIndex] = useState(0);
  const [quizSelected, setQuizSelected] = useState<string | null>(null);
  const [isQuizCorrect, setIsQuizCorrect] = useState<boolean | null>(null);

  const currentAnimal: AnimalItem = INITIAL_ANIMALS[selectedAnimalIndex] || INITIAL_ANIMALS[0];
  const currentQuiz = ANIMAL_QUIZ_QUESTIONS[currentQuizQuestionIndex];

  const handleSelectAnimal = (idx: number) => {
    setSelectedAnimalIndex(idx);
    soundManager.playPop();
    const animal = INITIAL_ANIMALS[idx];
    if (animal) {
      soundManager.speakArabic(animal.titleWithTashkeel, speechRate);
    }
  };

  const handleNextAnimal = () => {
    const nextIdx = selectedAnimalIndex < INITIAL_ANIMALS.length - 1 ? selectedAnimalIndex + 1 : 0;
    handleSelectAnimal(nextIdx);
  };

  const handlePrevAnimal = () => {
    const prevIdx = selectedAnimalIndex > 0 ? selectedAnimalIndex - 1 : INITIAL_ANIMALS.length - 1;
    handleSelectAnimal(prevIdx);
  };

  const handleAnimalVoice = () => {
    soundManager.playPop();
    soundManager.speakArabic(
      `صَوْتُ ${currentAnimal.titleWithTashkeel} هُوَ ${currentAnimal.soundName} .. ${currentAnimal.soundText}`,
      speechRate
    );
  };

  const handleFullExplanation = () => {
    soundManager.playPop();
    soundManager.speakArabic(
      `${currentAnimal.titleWithTashkeel}. ${currentAnimal.description}. طَعَامُهُ: ${currentAnimal.food}. بِيئَتُهُ: ${currentAnimal.home}`,
      speechRate
    );
  };

  // Quiz Answer Handler
  const handleQuizAnswer = (animal: AnimalItem) => {
    setQuizSelected(animal.id);
    if (animal.id === currentQuiz.correctAnimalId) {
      setIsQuizCorrect(true);
      soundManager.playSuccessChime();
      soundManager.speakArabic(
        `أَحْسَنْتَ يَا بَطَلُ! إِجَابَةٌ صَحِيحَةٌ! هَذَا هُوَ ${animal.titleWithTashkeel}`,
        speechRate
      );
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.6 },
      });
    } else {
      setIsQuizCorrect(false);
      soundManager.playEncouragementChime();
      soundManager.speakArabic('حَاوِلْ مَرَّةً أُخْرَى، اسْتَمِعْ لِلسُّؤَالِ جَيِّدًا!', speechRate);
    }
  };

  const handleNextQuizQuestion = () => {
    const nextQ = (currentQuizQuestionIndex + 1) % ANIMAL_QUIZ_QUESTIONS.length;
    setCurrentQuizQuestionIndex(nextQ);
    setQuizSelected(null);
    setIsQuizCorrect(null);
    soundManager.playPop();
    soundManager.speakArabic(ANIMAL_QUIZ_QUESTIONS[nextQ].question, speechRate);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Top Mode Selector: Learning Animal Cards vs Animals Quiz Bank */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => {
            setActiveTab('learn');
            soundManager.playPop();
          }}
          className={`px-5 py-2 rounded-xl font-black text-sm md:text-base cursor-pointer transition-all border ${
            activeTab === 'learn'
              ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
              : 'bg-white text-amber-950 border-amber-200 hover:bg-amber-50'
          }`}
        >
          🐾 تَعَرَّفْ عَلَى الْحَيَوَانَاتِ
        </button>

        <button
          onClick={() => {
            setActiveTab('quiz');
            soundManager.playPop();
            soundManager.speakArabic(currentQuiz.question, speechRate);
          }}
          className={`px-5 py-2 rounded-xl font-black text-sm md:text-base cursor-pointer transition-all border ${
            activeTab === 'quiz'
              ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
              : 'bg-white text-amber-950 border-amber-200 hover:bg-amber-50'
          }`}
        >
          🧩 مُسَابَقَةُ الْحَيَوَانَاتِ (10 أَسْئِلَةٍ)
        </button>
      </div>

      {activeTab === 'learn' && (
        <div className="space-y-4">
          {/* Navigation & Counter Bar */}
          <div className="bg-white rounded-2xl p-2.5 px-4 shadow-2xs border border-amber-200 flex items-center justify-between gap-3">
            <button
              onClick={handleNextAnimal}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-white rounded-xl font-black text-sm md:text-base flex items-center gap-2 cursor-pointer shadow-2xs active:scale-95 transition-all"
            >
              <span>الْحَيَوَانُ التَّالِي</span>
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-xl border border-amber-200">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-black text-amber-950">
                الْحَيَوَانُ {selectedAnimalIndex + 1} مِنْ {INITIAL_ANIMALS.length}
              </span>
            </div>

            <button
              onClick={handlePrevAnimal}
              className="px-4 py-2 bg-slate-100 hover:bg-amber-100 text-slate-800 hover:text-amber-950 rounded-xl font-black text-sm md:text-base flex items-center gap-2 cursor-pointer border border-slate-200 transition-all active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
              <span>الْحَيَوَانُ السَّابِقُ</span>
            </button>
          </div>

          {/* Main Animal Showcase Card */}
          {/* CRITICAL: The animal photo is completely clean - ZERO text overlays, ZERO badges on image! */}
          <div className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border-2 border-amber-300">
            <div className="flex flex-col lg:flex-row items-center gap-6">
              {/* LARGE, CLEAN, UNOBSTRUCTED REALISTIC ANIMAL IMAGE */}
              <div className="shrink-0 flex flex-col items-center">
                <div className="w-64 h-64 md:w-80 md:h-80 rounded-3xl overflow-hidden border-4 border-amber-300 shadow-md bg-amber-50 relative">
                  <Illustration
                    name={currentAnimal.image}
                    className="w-full h-full object-cover"
                    alt={currentAnimal.titleWithTashkeel}
                  />
                  {/* Notice: Absolutely NO text, NO overlay badges, pure unobstructed image for clear viewing! */}
                </div>

                {/* Sound button placed comfortably below the image, NOT ON IT */}
                <button
                  onClick={handleAnimalVoice}
                  className="mt-3.5 px-5 py-2 bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 font-black text-sm rounded-xl flex items-center gap-2 cursor-pointer shadow-2xs transition-all active:scale-95"
                >
                  <Volume2 className="w-4 h-4 text-amber-600 animate-pulse" />
                  <span>صَوْتُهُ: {currentAnimal.soundName} ({currentAnimal.soundText})</span>
                </button>
              </div>

              {/* ANIMAL INFORMATION COMPLETELY DISPLACED AWAY FROM IMAGE */}
              <div className="flex-1 w-full space-y-3.5">
                {/* Animal Name in Large Schoolbook Print Font */}
                <div className="bg-gradient-to-br from-amber-50/80 via-white to-orange-50/60 p-4 md:p-5 rounded-2xl border-2 border-amber-200 text-center">
                  <span className="text-xs font-bold text-slate-500 block mb-1">
                    اِسْمُ الْحَيَوَانِ بِالْحَرَكَاتِ:
                  </span>
                  <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-amber-950 tashkeel-display-word select-none py-1">
                    {currentAnimal.titleWithTashkeel}
                  </h3>
                  <p className="text-sm md:text-base font-bold text-slate-700 mt-1.5 leading-relaxed">
                    {currentAnimal.description}
                  </p>
                </div>

                {/* Fact Cards: Food & Habitat (Completely outside image) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200">
                    <span className="text-xs font-black text-emerald-800 block mb-1">
                      🍎 مَاذَا يَأْكُلُ؟
                    </span>
                    <p className="text-sm font-bold text-emerald-950 leading-relaxed">
                      {currentAnimal.food}
                    </p>
                  </div>

                  <div className="p-3.5 bg-sky-50 rounded-2xl border border-sky-200">
                    <span className="text-xs font-black text-sky-800 block mb-1">
                      🏡 أَيْنَ يَعِيشُ؟
                    </span>
                    <p className="text-sm font-bold text-sky-950 leading-relaxed">
                      {currentAnimal.home}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      soundManager.playPop();
                      soundManager.speakArabic(currentAnimal.titleWithTashkeel, speechRate);
                    }}
                    className="py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-black text-sm rounded-xl shadow-2xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Volume2 className="w-4 h-4 animate-pulse" />
                    <span>انْطِقِ الِاسْمَ</span>
                  </button>

                  <button
                    onClick={handleFullExplanation}
                    className="py-2.5 px-4 bg-white hover:bg-amber-50 border border-amber-300 text-amber-950 font-black text-sm rounded-xl shadow-2xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Volume2 className="w-4 h-4 text-amber-600" />
                    <span>اسْتَمِعْ لِلشَّرْحِ الْكَامِلِ</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sequential Animal Selector Strip */}
          <div className="bg-white rounded-2xl p-2.5 px-3 shadow-2xs border border-amber-200">
            <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-thin pb-1">
              {INITIAL_ANIMALS.map((animal, idx) => (
                <button
                  key={animal.id}
                  onClick={() => handleSelectAnimal(idx)}
                  className={`p-1.5 px-3 rounded-xl border-2 flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                    selectedAnimalIndex === idx
                      ? 'border-amber-500 bg-amber-100 text-amber-950 font-black ring-1 ring-amber-400'
                      : 'border-slate-200 hover:border-amber-300 bg-slate-50/50 text-slate-700'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-white shrink-0">
                    <Illustration name={animal.image} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-sm font-black tashkeel-word">{animal.titleWithTashkeel}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Animal Quiz Bank (10 Questions) */}
      {activeTab === 'quiz' && (
        <div className="bg-white rounded-3xl p-5 md:p-7 shadow-sm border-2 border-amber-300 space-y-4">
          <div className="flex items-center justify-between bg-amber-50 p-3 px-4 rounded-2xl border border-amber-200">
            <div>
              <span className="text-xs font-black text-amber-800 block">
                السُّؤَالُ {currentQuizQuestionIndex + 1} مِنْ {ANIMAL_QUIZ_QUESTIONS.length}
              </span>
              <h4 className="text-base md:text-xl font-black text-amber-950 mt-0.5">
                {currentQuiz.question}
              </h4>
            </div>

            <button
              onClick={() => {
                soundManager.playPop();
                soundManager.speakArabic(currentQuiz.question, speechRate);
              }}
              className="p-2.5 bg-white hover:bg-amber-100 rounded-xl border border-amber-300 text-amber-800 cursor-pointer shadow-2xs active:scale-95"
              title="استمع للسؤال"
            >
              <Volume2 className="w-5 h-5 text-amber-600 animate-pulse" />
            </button>
          </div>

          {/* Hint */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-sky-50 text-sky-900 rounded-xl border border-sky-200 text-xs font-bold">
            <HelpCircle className="w-4 h-4 text-sky-600 shrink-0" />
            <span>تَلْمِيحٌ: {currentQuiz.hint}</span>
          </div>

          {/* Animal Choices with Large Photos and Names */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-2">
            {INITIAL_ANIMALS.map((animal) => {
              const isSelected = quizSelected === animal.id;
              const isCorrectAnswer = animal.id === currentQuiz.correctAnimalId;

              return (
                <button
                  key={animal.id}
                  onClick={() => handleQuizAnswer(animal)}
                  className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-95 ${
                    isSelected
                      ? isCorrectAnswer
                        ? 'bg-emerald-100 border-emerald-500 ring-4 ring-emerald-300'
                        : 'bg-rose-100 border-rose-500 ring-4 ring-rose-300'
                      : 'bg-white hover:bg-amber-50/60 border-slate-200 hover:border-amber-300'
                  }`}
                >
                  {/* Clean animal image in quiz */}
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden border-2 border-amber-200 bg-amber-50">
                    <Illustration name={animal.image} className="w-full h-full object-cover" />
                  </div>
                  <span className="font-black text-base md:text-lg text-slate-900 tashkeel-word">
                    {animal.titleWithTashkeel}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Success or Next Button */}
          {isQuizCorrect === true && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-emerald-900 font-black text-sm md:text-base">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <span>أَحْسَنْتَ يَا عَالِمَ الْحَيَوَانَاتِ الصَّغِيرَ! إِجَابَةٌ رَائِعَةٌ! 🌟</span>
              </div>

              <button
                onClick={handleNextQuizQuestion}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 text-white rounded-xl font-black text-sm flex items-center gap-2 cursor-pointer shadow-xs active:scale-95 transition-all"
              >
                <span>السُّؤَالُ التَّالِي</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}

          {isQuizCorrect === false && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl text-center">
              <span className="text-sm font-black text-amber-950">
                حَاوِلْ مَرَّةً أُخْرَى يَا بَطَلُ، رَكِّزْ فِي التَّلْمِيحِ! ✨
              </span>
            </div>
          )}

          {/* Direct Navigation Between Questions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                const prevQ = (currentQuizQuestionIndex - 1 + ANIMAL_QUIZ_QUESTIONS.length) % ANIMAL_QUIZ_QUESTIONS.length;
                setCurrentQuizQuestionIndex(prevQ);
                setQuizSelected(null);
                setIsQuizCorrect(null);
                soundManager.playPop();
              }}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1"
            >
              <ChevronRight className="w-4 h-4" />
              <span>السَّابِقُ</span>
            </button>

            <span className="text-xs font-bold text-slate-400">
              10 أَسْئِلَةٍ تَفَاعُلِيَّةٍ لِعَالَمِ الْحَيَوَانِ
            </span>

            <button
              onClick={handleNextQuizQuestion}
              className="px-3.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1"
            >
              <span>التَّالِي</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
