import React, { useState, useEffect, useRef } from 'react';
import { soundManager } from '../utils/audio';
import {
  Sparkles,
  Eye,
  RefreshCw,
  CheckCircle,
  HelpCircle,
  Volume2,
  ChevronLeft,
  ChevronRight,
  Star,
  Play,
  Pause,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FocusItem {
  id: string;
  name: string;
  icon: string;
  category: string;
  color: string;
}

const FOCUS_ITEMS: FocusItem[] = [
  { id: 'apple', name: 'تُفَّاحَةٌ', icon: '🍎', category: 'فَاكِهَةٌ', color: 'from-rose-50 to-red-100 border-red-300' },
  { id: 'ball', name: 'كُرَةٌ', icon: '⚽', category: 'لُعْبَةٌ', color: 'from-blue-50 to-sky-100 border-sky-300' },
  { id: 'house', name: 'بَيْتٌ', icon: '🏠', category: 'مَكَانٌ', color: 'from-amber-50 to-yellow-100 border-amber-300' },
  { id: 'sun', name: 'شَمْسٌ', icon: '☀️', category: 'طَبِيعَةٌ', color: 'from-yellow-50 to-amber-100 border-yellow-400' },
  { id: 'car', name: 'سَيَّارَةٌ', icon: '🚗', category: 'مَرْكَبَةٌ', color: 'from-red-50 to-rose-100 border-rose-300' },
  { id: 'tree', name: 'شَجَرَةٌ', icon: '🌳', category: 'طَبِيعَةٌ', color: 'from-emerald-50 to-green-100 border-emerald-300' },
  { id: 'star', name: 'نَجْمَةٌ', icon: '⭐', category: 'سَمَاءٌ', color: 'from-amber-50 to-yellow-100 border-amber-400' },
  { id: 'fish', name: 'سَمَكَةٌ', icon: '🐟', category: 'حَيَوَانٌ', color: 'from-cyan-50 to-teal-100 border-cyan-300' },
  { id: 'cat', name: 'قِطَّةٌ', icon: '🐱', category: 'حَيَوَانٌ', color: 'from-orange-50 to-amber-100 border-orange-300' },
  { id: 'book', name: 'كِتَابٌ', icon: '📖', category: 'أَدَوَاتٌ', color: 'from-sky-50 to-indigo-100 border-indigo-300' },
  { id: 'pencil', name: 'قَلَمٌ', icon: '✏️', category: 'أَدَوَاتٌ', color: 'from-indigo-50 to-purple-100 border-indigo-300' },
  { id: 'moon', name: 'قَمَرٌ', icon: '🌙', category: 'سَمَاءٌ', color: 'from-purple-50 to-violet-100 border-purple-300' },
];

type GamePhase = 'memorize' | 'question' | 'solved';
type LevelType = 1 | 2 | 3 | 4;

interface FocusModuleProps {
  speechRate: number;
}

export const FocusModule: React.FC<FocusModuleProps> = ({ speechRate }) => {
  const [level, setLevel] = useState<LevelType>(1);
  const [phase, setPhase] = useState<GamePhase>('memorize');
  const [displayedItems, setDisplayedItems] = useState<FocusItem[]>([]);
  const [hiddenItems, setHiddenItems] = useState<FocusItem[]>([]);
  const [options, setOptions] = useState<FocusItem[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [timerSeconds, setTimerSeconds] = useState(4);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [starsWon, setStarsWon] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Setup a new puzzle round based on current level
  const startNewRound = (lvl: LevelType = level) => {
    if (timerRef.current) clearInterval(timerRef.current);

    setPhase('memorize');
    setSelectedAnswers([]);
    setFeedback(null);
    setIsTimerPaused(false);

    // Shuffle focus items pool
    const pool = [...FOCUS_ITEMS].sort(() => Math.random() - 0.5);

    let itemsCount = 1;
    let hideCount = 1;

    if (lvl === 1) {
      // Level 1: 1 item appears, disappears -> What was it?
      itemsCount = 1;
      hideCount = 1;
      setTimerSeconds(4);
    } else if (lvl === 2) {
      // Level 2: 2 items appear, 1 disappears -> What went missing?
      itemsCount = 2;
      hideCount = 1;
      setTimerSeconds(5);
    } else if (lvl === 3) {
      // Level 3: 3 items appear, 1 disappears -> What went missing?
      itemsCount = 3;
      hideCount = 1;
      setTimerSeconds(6);
    } else {
      // Level 4: 2 or 3 items appear, 2 disappear -> Child remembers both
      itemsCount = 3;
      hideCount = 2;
      setTimerSeconds(7);
    }

    const currentItems = pool.slice(0, itemsCount);
    const toHide = [...currentItems].sort(() => Math.random() - 0.5).slice(0, hideCount);

    setDisplayedItems(currentItems);
    setHiddenItems(toHide);

    // Prepare 3 or 4 answer options (including hidden items + random distractors)
    const distractors = pool
      .filter((item) => !currentItems.some((ci) => ci.id === item.id))
      .slice(0, lvl === 4 ? 2 : 2);

    const allOptions = [...toHide, ...distractors].sort(() => Math.random() - 0.5);
    setOptions(allOptions);

    // Announce instruction
    soundManager.playPop();
    if (lvl === 1) {
      soundManager.speakArabic(
        `انْظُرْ جَيِّدًا إِلَى هَذَا الشَّكْلِ: ${currentItems[0].name}`,
        speechRate
      );
    } else if (lvl === 2) {
      soundManager.speakSequential(
        ['رَكِّزْ فِي هَذَيْنِ الشَّكْلَيْنِ', ...currentItems.map((i) => i.name)],
        'ar',
        speechRate
      );
    } else {
      soundManager.speakArabic('رَكِّزْ جَيِّدًا فِي هَذِهِ الْأَشْكَالِ', speechRate);
    }
  };

  // Trigger round when component mounts or level changes
  useEffect(() => {
    startNewRound(level);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      soundManager.stopSpeech();
    };
  }, [level]);

  // Handle countdown during 'memorize' phase
  useEffect(() => {
    if (phase !== 'memorize' || isTimerPaused) return;

    if (timerSeconds <= 0) {
      transitionToQuestion();
      return;
    }

    timerRef.current = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          transitionToQuestion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, timerSeconds, isTimerPaused]);

  const transitionToQuestion = () => {
    setPhase('question');
    soundManager.playEncouragementChime();

    const questionText =
      level === 1
        ? 'مَا هُوَ الشَّكْلُ الَّذِي كَانَ مَوْجُودًا؟'
        : level === 4
        ? 'مَا هُمَا الشَّيْئَانِ اللَّذَانِ اخْتَفَيَا؟'
        : 'مَا هُوَ الشَّكْلُ الَّذِي اخْتَفَى؟';

    soundManager.speakArabic(questionText, speechRate);
  };

  // Immediate "I am ready" button
  const handleReadyNow = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    transitionToQuestion();
  };

  // "Show me again" - replay observation phase without penalty
  const handleShowAgain = () => {
    setPhase('memorize');
    setSelectedAnswers([]);
    setFeedback(null);
    setTimerSeconds(level === 1 ? 4 : level === 2 ? 5 : 6);
    soundManager.playPop();
    const promptText = `شَاهِدِ الْأَشْكَالَ مَرَّةً أُخْرَى بِهُدُوءٍ`;
    soundManager.speakArabic(promptText, speechRate);
  };

  // Check child's answer
  const handleSelectOption = (item: FocusItem) => {
    soundManager.playPop();

    if (level === 4) {
      // Multi-select for level 4 (2 items)
      let newSelected: string[];
      if (selectedAnswers.includes(item.id)) {
        newSelected = selectedAnswers.filter((id) => id !== item.id);
      } else {
        newSelected = [...selectedAnswers, item.id];
      }
      setSelectedAnswers(newSelected);

      if (newSelected.length === hiddenItems.length) {
        const isAllCorrect = hiddenItems.every((hi) => newSelected.includes(hi.id));
        if (isAllCorrect) {
          handleSuccess();
          return;
        } else {
          soundManager.playEncouragementChime();
          soundManager.speakArabic(item.name, speechRate);
          setFeedback('حَاوِلْ مَرَّةً أُخْرَى يَا بَطَلُ، أَنْتَ تَسْتَطِيعُ!');
          return;
        }
      }
      soundManager.speakArabic(item.name, speechRate);
    } else {
      // Single select for level 1, 2, 3
      const targetHidden = hiddenItems[0];
      if (targetHidden && item.id === targetHidden.id) {
        setSelectedAnswers([item.id]);
        handleSuccess();
      } else {
        soundManager.playEncouragementChime();
        soundManager.speakArabic(item.name, speechRate);
        setFeedback('لَيْسَ هَذَا الشَّكْلَ، حَاوِلْ مَرَّةً أُخْرَى!');
        setTimeout(() => setFeedback(null), 2500);
      }
    }
  };

  const handleSuccess = () => {
    setPhase('solved');
    setStarsWon((prev) => prev + 1);
    setFeedback('أَحْسَنْتَ يَا بَطَلُ! ذَاكِرَتُكَ قَوِيَّةٌ جِدًّا! 🌟');
    soundManager.playSuccessChime();

    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.6 },
    });

    if (level === 1 && hiddenItems[0]) {
      soundManager.speakArabic(`مُمْتَازٌ! كَانَتْ ${hiddenItems[0].name}`, speechRate);
    } else {
      soundManager.speakSequential(
        ['أَحْسَنْتَ! الشَّكْلُ الَّذِي اخْتَفَى هُوَ', ...hiddenItems.map((h) => h.name)],
        'ar',
        speechRate
      );
    }
  };

  return (
    <div className="space-y-3 max-w-4xl mx-auto">
      {/* Top Header & Level Bar */}
      <div className="bg-white rounded-2xl p-3 px-4 shadow-2xs border border-amber-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-2xs">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 leading-tight">
              قِسْمُ التَّرْكِيزِ وَالذَّاكِرَةِ الْبَصَرِيَّةِ
            </h2>
            <p className="text-xs text-slate-500 font-bold">
              تَذَكَّرِ الْأَشْكَالَ قَبْلَ اخْتِفَائِهَا
            </p>
          </div>
        </div>

        {/* Level Switcher (4 Levels with Clear Labels) */}
        <div className="flex items-center gap-1.5 bg-amber-50/70 p-1 rounded-xl border border-amber-200">
          <span className="text-xs font-black text-amber-900 px-1">الْمُسْتَوَى:</span>
          {([1, 2, 3, 4] as LevelType[]).map((lvl) => (
            <button
              key={lvl}
              onClick={() => {
                setLevel(lvl);
                soundManager.playPop();
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                level === lvl
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'bg-white text-slate-700 hover:bg-purple-50 border border-slate-200'
              }`}
            >
              {lvl === 1 ? '1️⃣ شَكْلٌ' : lvl === 2 ? '2️⃣ شَكْلَانِ' : lvl === 3 ? '3️⃣ ثَلَاثَةٌ' : '4️⃣ تَحَدٍّ'}
            </button>
          ))}
        </div>

        {/* Stars Counter */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 rounded-xl border border-amber-300">
          <Star className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
          <span className="text-xs font-black text-amber-950">
            {starsWon} نُجُومٌ
          </span>
        </div>
      </div>

      {/* Main Focus Stage (Fits in single viewport) */}
      <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border-2 border-purple-300 relative overflow-hidden">
        {/* Stage Status & Voice Guidance Banner */}
        <div className="flex items-center justify-between gap-3 mb-4 bg-purple-50/70 rounded-2xl p-2.5 px-4 border border-purple-200">
          <div className="flex items-center gap-2">
            <Volume2
              className="w-5 h-5 text-purple-700 cursor-pointer animate-gentle-wiggle"
              onClick={() => {
                const text =
                  phase === 'memorize'
                    ? 'انْظُرْ جَيِّدًا وَتَذَكَّرْ هَذِهِ الْأَشْكَالَ'
                    : level === 1
                    ? 'مَا هُوَ الشَّكْلُ الَّذِي كَانَ مَوْجُودًا؟'
                    : 'مَا هُوَ الشَّكْلُ الَّذِي اخْتَفَى؟';
                soundManager.speakArabic(text, speechRate);
              }}
            />
            <span className="text-sm md:text-base font-black text-purple-950">
              {phase === 'memorize' && '👀 انْظُرْ جَيِّدًا وَاحْفَظِ الشَّكْلَ فِي ذَاكِرَتِكَ!'}
              {phase === 'question' &&
                (level === 1
                  ? '❓ مَا هُوَ الشَّيْءُ الَّذِي كَانَ مَوْجُودًا؟'
                  : level === 4
                  ? '❓ مَا هُمَا الشَّيْئَانِ اللَّذَانِ اخْتَفَيَا؟'
                  : '❓ مَا هُوَ الشَّكْلُ الَّذِي كَانَ هُنَا وَاخْتَفَى؟')}
              {phase === 'solved' && '🎉 مُمْتَازٌ يَا بَطَلُ! إِجَابَةٌ رَائِعَةٌ!'}
            </span>
          </div>

          {/* Memorize Countdown / Ready Buttons */}
          {phase === 'memorize' && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-3 py-1 bg-white rounded-xl border border-purple-300 text-xs font-black text-purple-800 shadow-2xs">
                <span>⏱️ {timerSeconds} ث</span>
                <button
                  onClick={() => setIsTimerPaused(!isTimerPaused)}
                  className="p-1 hover:bg-purple-100 rounded cursor-pointer"
                  title={isTimerPaused ? 'مُتَابَعَة' : 'إِيقَافٌ مُؤَقَّتٌ'}
                >
                  {isTimerPaused ? <Play className="w-3.5 h-3.5 text-emerald-600" /> : <Pause className="w-3.5 h-3.5 text-slate-500" />}
                </button>
              </div>

              <button
                onClick={handleReadyNow}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black shadow-2xs cursor-pointer active:scale-95 transition-all"
              >
                أَنَا جَاهِزٌ!
              </button>
            </div>
          )}

          {/* Show Again button during question */}
          {phase === 'question' && (
            <button
              onClick={handleShowAgain}
              className="px-3 py-1.5 bg-white hover:bg-purple-100 text-purple-950 border border-purple-300 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5 text-purple-600" />
              <span>أَعِدِ الْمُشَاهَدَةَ 👁️</span>
            </button>
          )}
        </div>

        {/* Central Visual Focus Display Area */}
        <div className="flex items-center justify-center gap-4 py-4 min-h-[160px]">
          {displayedItems.map((item, idx) => {
            const isItemHidden = hiddenItems.some((hi) => hi.id === item.id);
            const isRevealed = phase === 'solved' || phase === 'memorize';

            return (
              <div
                key={item.id + idx}
                className="flex flex-col items-center"
              >
                {isRevealed || !isItemHidden ? (
                  /* Item Visible */
                  <div
                    onClick={() => soundManager.speakArabic(item.name, speechRate)}
                    className={`w-28 h-28 md:w-36 md:h-36 rounded-3xl bg-gradient-to-br ${item.color} border-2 flex flex-col items-center justify-center p-2 shadow-2xs cursor-pointer transition-all transform hover:scale-102 ${
                      phase === 'solved' && isItemHidden ? 'ring-4 ring-emerald-400 scale-105 animate-soft-float' : ''
                    }`}
                  >
                    <span className="text-4xl md:text-5xl select-none mb-1">{item.icon}</span>
                    <span className="text-sm md:text-base font-black text-slate-900 tashkeel-word text-center">
                      {item.name}
                    </span>
                  </div>
                ) : (
                  /* Item Disappeared Mystery Slot */
                  <div
                    className="w-28 h-28 md:w-36 md:h-36 rounded-3xl border-3 border-dashed border-purple-400 bg-purple-50/50 flex flex-col items-center justify-center p-2 animate-pulse shadow-inner"
                  >
                    <HelpCircle className="w-12 h-12 text-purple-400 mb-1" />
                    <span className="text-xs md:text-sm font-black text-purple-700">
                      مَاذَا كَانَ هُنَا؟
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Question Choices (Visible during question phase) */}
        {phase === 'question' && (
          <div className="mt-4 pt-3 border-t border-purple-100">
            <p className="text-xs font-bold text-slate-600 text-center mb-2.5">
              {level === 4
                ? 'اخْتَرْ الشَّكْلَيْنِ اللَّذَيْنِ اخْتَفَيَا:'
                : 'اضْغَطْ عَلَى الشَّكْلِ الصَّحِيحِ:'}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
              {options.map((opt) => {
                const isSelected = selectedAnswers.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt)}
                    className={`p-3 rounded-2xl border-2 flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-95 shadow-2xs ${
                      isSelected
                        ? 'border-purple-600 bg-purple-100 text-purple-950 font-black ring-2 ring-purple-400'
                        : 'border-slate-200 hover:border-purple-300 bg-white hover:bg-purple-50/50 text-slate-800'
                    }`}
                  >
                    <span className="text-2xl md:text-3xl">{opt.icon}</span>
                    <span className="text-sm md:text-base font-black tashkeel-word">
                      {opt.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Solved Celebration and Next Button */}
        {phase === 'solved' && (
          <div className="mt-4 pt-3 border-t border-emerald-100 text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-900 rounded-2xl border border-emerald-300 font-black text-sm">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span>{feedback}</span>
            </div>

            <div>
              <button
                onClick={() => startNewRound(level)}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl font-black text-sm md:text-base inline-flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 transition-all"
              >
                <span>السُّؤَالُ التَّالِي</span>
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Friendly Error Feedback */}
        {feedback && phase === 'question' && (
          <div className="mt-3 text-center">
            <span className="inline-block px-3 py-1 bg-amber-50 text-amber-900 rounded-xl border border-amber-200 text-xs font-bold">
              {feedback}
            </span>
          </div>
        )}
      </div>

      {/* Quick Navigation Between Questions */}
      <div className="bg-white rounded-2xl p-2.5 px-4 shadow-2xs border border-amber-200 flex items-center justify-between">
        <button
          onClick={() => {
            soundManager.playPop();
            startNewRound(level);
          }}
          className="px-4 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-950 rounded-xl font-black text-xs md:text-sm flex items-center gap-1.5 cursor-pointer border border-amber-200 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>سُؤَالٌ جَدِيدٌ</span>
        </button>

        <span className="text-xs font-bold text-slate-500">
          تَدْرِيبٌ لِتَقْوِيَةِ الذَّاكِرَةِ وَالِانْتِبَاهِ
        </span>

        <button
          onClick={() => {
            soundManager.playPop();
            const nextLvl = level < 4 ? ((level + 1) as LevelType) : 1;
            setLevel(nextLvl);
          }}
          className="px-4 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-950 rounded-xl font-black text-xs md:text-sm flex items-center gap-1.5 cursor-pointer border border-purple-200 transition-all"
        >
          <span>الْمُسْتَوَى التَّالِي</span>
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
