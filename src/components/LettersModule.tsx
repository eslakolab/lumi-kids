import React, { useState, useRef, useEffect } from 'react';
import { LetterItem, TashkeelType } from '../types';
import { soundManager } from '../utils/audio';
import { Volume2, RotateCcw, PenTool, CheckCircle, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSubscription } from '../context/SubscriptionContext';

import { getSukoonSound } from '../utils/phonics';
import { getLetterVisualData } from '../utils/letterImages';

interface LettersModuleProps {
  letters: LetterItem[];
  speechRate: number;
  fontSize: 'normal' | 'large' | 'huge';
  onLetterSelect?: (letter: LetterItem) => void;
  onRequireSubscription?: (contentTitle: string) => void;
}

export const LettersModule: React.FC<LettersModuleProps> = ({
  letters,
  speechRate,
  fontSize,
  onRequireSubscription,
}) => {
  const { isContentUnlocked } = useSubscription();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeTashkeel, setActiveTashkeel] = useState<TashkeelType>('fatha');
  const [isTracingMode, setIsTracingMode] = useState(false);
  const [isHarakaBouncing, setIsHarakaBouncing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const currentLetter = letters[selectedIndex] || letters[0];

  // Letter scale based on user settings
  const letterFontSizeClass =
    fontSize === 'huge'
      ? 'text-8xl md:text-9xl'
      : fontSize === 'large'
      ? 'text-7xl md:text-8xl'
      : 'text-6xl md:text-7xl';

  const triggerHarakaAnimation = () => {
    setIsHarakaBouncing(true);
    setTimeout(() => {
      setIsHarakaBouncing(false);
    }, 2400);
  };

  // Sound and speak on Tashkeel change
  const playLetterSound = (tashkeel: TashkeelType = activeTashkeel) => {
    soundManager.playPop();
    triggerHarakaAnimation();
    const variant = currentLetter.variants[tashkeel];
    const letterVoice =
      tashkeel === 'sukoon'
        ? variant.spokenSound || getSukoonSound(currentLetter.char)
        : variant.text;
    const speechText = `${letterVoice} .. ${variant.example}`;
    soundManager.speakArabic(speechText, speechRate);
  };

  const handleSelectLetter = (index: number) => {
    setSelectedIndex(index);
    soundManager.playPop();
    triggerHarakaAnimation();
    const item = letters[index];
    const letterVoice =
      activeTashkeel === 'sukoon'
        ? item.variants.sukoon.spokenSound || getSukoonSound(item.char)
        : item.variants[activeTashkeel].text;
    const speechText = `${item.name} .. ${letterVoice}`;
    soundManager.speakArabic(speechText, speechRate);
    clearCanvas();
  };

  const handleNext = () => {
    const nextIdx = selectedIndex < letters.length - 1 ? selectedIndex + 1 : 0;
    const unlocked = isContentUnlocked('lettersCount', nextIdx);
    if (!unlocked) {
      soundManager.playPop();
      onRequireSubscription?.(`حَرْفُ ${letters[nextIdx].name}`);
    } else {
      handleSelectLetter(nextIdx);
    }
  };

  const handlePrev = () => {
    const prevIdx = selectedIndex > 0 ? selectedIndex - 1 : letters.length - 1;
    const unlocked = isContentUnlocked('lettersCount', prevIdx);
    if (!unlocked) {
      soundManager.playPop();
      onRequireSubscription?.(`حَرْفُ ${letters[prevIdx].name}`);
    } else {
      handleSelectLetter(prevIdx);
    }
  };

  // Canvas drawing / tracing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.beginPath();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#d97706'; // Warm amber

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleCompleteTracing = () => {
    soundManager.playSuccessChime();
    soundManager.speakArabic('أَحْسَنْتَ يَا بَطَل! كِتَابَةٌ رَائِعَةٌ!', speechRate);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  useEffect(() => {
    clearCanvas();
  }, [selectedIndex, activeTashkeel]);

  const variant = currentLetter.variants[activeTashkeel];

  return (
    <div className="space-y-6">
      {/* شريط اختيار الحروف الهجائية */}
      <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-amber-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl md:text-2xl font-black text-amber-950 flex items-center gap-2">
            <span>اخْتَرْ حَرْفًا لِتَتَعَلَّمَهُ:</span>
          </h2>
          <span className="text-sm font-bold text-amber-700">
            حرف {selectedIndex + 1} مِنْ {letters.length}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {letters.map((item, idx) => {
            const isUnlocked = isContentUnlocked('lettersCount', idx);
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (!isUnlocked) {
                    soundManager.playPop();
                    onRequireSubscription?.(`حَرْفُ ${item.name}`);
                  } else {
                    handleSelectLetter(idx);
                  }
                }}
                className={`relative min-w-14 h-14 md:min-w-16 md:h-16 rounded-2xl font-black text-2xl md:text-3xl flex items-center justify-center transition-all cursor-pointer ${
                  selectedIndex === idx
                    ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md scale-105 border-2 border-white'
                    : isUnlocked
                    ? 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 opacity-75'
                }`}
              >
                {!isUnlocked && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-white rounded-full flex items-center justify-center shadow-xs">
                    <Lock className="w-2.5 h-2.5" />
                  </span>
                )}
                <span>{item.char}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* حاوية الحرف الموحدة مع الكلمة والصورة بجانبه دون الحاجة للتمرير */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-md border-2 border-amber-200 overflow-hidden space-y-4">
        {/* أزرار التنقل السريع بين الحروف */}
        <div className="flex items-center justify-between w-full">
          <button
            onClick={handlePrev}
            className="p-2.5 sm:p-3 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-2xl font-black flex items-center gap-1 transition-all cursor-pointer active:scale-95 text-sm sm:text-base"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>السَّابِق</span>
          </button>

          <div className="text-center">
            <span className="text-xs sm:text-sm font-bold text-amber-700 block">حَرْفُ</span>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-amber-950">{currentLetter.name}</h3>
          </div>

          <button
            onClick={handleNext}
            className="p-2.5 sm:p-3 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-2xl font-black flex items-center gap-1 transition-all cursor-pointer active:scale-95 text-sm sm:text-base"
          >
            <span>التَّالِي</span>
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* محدد الحركات (الفتحة، الضمة، الكسرة، السكون) */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5">
          {(
            [
              { type: 'fatha' as const, label: 'الْفَتْحَةُ َ', color: 'border-orange-400 bg-orange-50 text-orange-700' },
              { type: 'damma' as const, label: 'الضَّمَّةُ ُ', color: 'border-blue-400 bg-blue-50 text-blue-700' },
              { type: 'kasra' as const, label: 'الْكَسْرَةُ ِ', color: 'border-emerald-400 bg-emerald-50 text-emerald-700' },
              { type: 'sukoon' as const, label: 'السُّكُونُ ْ', color: 'border-purple-400 bg-purple-50 text-purple-700' },
            ]
          ).map((t) => (
            <button
              key={t.type}
              onClick={() => {
                setActiveTashkeel(t.type);
                playLetterSound(t.type);
              }}
              className={`py-2.5 sm:py-3 px-1.5 sm:px-2 rounded-2xl border-2 font-black text-center transition-all cursor-pointer text-xs sm:text-sm md:text-base ${
                activeTashkeel === t.type
                  ? `${t.color} shadow-xs ring-2 ring-amber-400 scale-102`
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* المسرح التفاعلي الموحد: الحرف على جانب، وصورة الشيء والكلمة تحته على الجانب الآخر */}
        {(() => {
          const visualData = getLetterVisualData(variant.example);
          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 items-center bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-amber-100/40 rounded-2xl border-2 border-dashed border-amber-300 p-3 sm:p-5">
              {/* الجانب الأول: الحرف الكبير مع الحركة والتهجئة والصوت */}
              <div
                onClick={() => {
                  playLetterSound();
                }}
                className="relative flex flex-col items-center justify-center min-h-[170px] sm:min-h-[200px] bg-white/90 rounded-2xl border border-amber-200 p-4 shadow-xs cursor-pointer hover:bg-white transition-all group"
                title="اضغط لسماع نطق الحرف"
              >
                <div
                  className={`select-none font-black text-amber-950 ${letterFontSizeClass} transition-all leading-none relative flex items-center justify-center ${
                    isTracingMode ? 'opacity-30' : 'opacity-100'
                  }`}
                >
                  <span
                    className={`transition-all duration-300 ${
                      isHarakaBouncing
                        ? activeTashkeel === 'kasra'
                          ? 'haraka-animated-down haraka-glow-down text-emerald-600 scale-125'
                          : 'haraka-animated-up haraka-glow-up text-orange-500 scale-125'
                        : 'text-amber-900 group-hover:scale-105'
                    }`}
                  >
                    {variant.text}
                  </span>
                </div>

                {/* إبراز صوت الحرف في حالة السكون للطفل (مثل أَتْ لحرف التاء) */}
                {activeTashkeel === 'sukoon' && (
                  <div className="mt-2 px-3 py-1 bg-purple-100 border border-purple-300 rounded-full flex items-center gap-1.5 shadow-2xs z-20">
                    <span className="text-[11px] sm:text-xs font-black text-purple-900">
                      صَوْتُ السُّكُونِ:
                    </span>
                    <span className="text-sm sm:text-base font-black text-purple-700 font-mono">
                      «{variant.spokenSound || getSukoonSound(currentLetter.char)}»
                    </span>
                  </div>
                )}

                <span className="mt-2 text-[11px] text-amber-600 font-bold flex items-center gap-1 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  <Volume2 className="w-3 h-3 text-amber-500" />
                  <span>انْقُرْ لِسَمَاعِ نُطْقِ الْحَرْفِ</span>
                </span>

                {/* لوحة الرسم وتتبع الحرف */}
                {isTracingMode && (
                  <canvas
                    ref={canvasRef}
                    width={260}
                    height={180}
                    onMouseDown={startDrawing}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onMouseMove={draw}
                    onTouchStart={startDrawing}
                    onTouchEnd={stopDrawing}
                    onTouchMove={draw}
                    className="absolute inset-0 m-auto w-[260px] h-[180px] cursor-crosshair touch-none z-10"
                  />
                )}
              </div>

              {/* الجانب الثاني: صورة الشيء الذي يمثله الحرف وتحته الكلمة بالحركات مباشرة */}
              <div
                onClick={() => {
                  soundManager.playPop();
                  triggerHarakaAnimation();
                  soundManager.speakArabic(variant.example, speechRate);
                }}
                className="flex flex-col items-center justify-center min-h-[170px] sm:min-h-[200px] bg-white/90 rounded-2xl border border-amber-200 p-4 shadow-xs text-center cursor-pointer hover:bg-white hover:border-amber-400 transition-all group"
                title="اضغط لسماع نطق الكلمة"
              >
                {/* صورة الشيء الممثل للحرف (مثل صورة الإبريق لحرف الألف بالكسرة) */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-center justify-center overflow-hidden mb-2 p-1.5 shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                  {visualData.isImage && visualData.src ? (
                    <img
                      src={visualData.src}
                      alt={variant.example}
                      className="w-full h-full object-contain drop-shadow-xs"
                      loading="eager"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-5xl sm:text-6xl drop-shadow-xs select-none">
                      {visualData.emoji || '✨'}
                    </span>
                  )}
                </div>

                {/* كلمة المثال بالحركات التامة مباشرة تحت الصورة */}
                <h4
                  className={`text-2xl sm:text-3xl font-black text-amber-950 mb-0.5 tracking-wide tashkeel-word transition-all ${
                    isHarakaBouncing ? 'scale-105 text-orange-600' : 'group-hover:text-amber-800'
                  }`}
                >
                  «{variant.example}»
                </h4>

                {/* المعنى أو الجملة التوضيحية القصيرة */}
                <p className="text-xs sm:text-sm font-bold text-amber-800 line-clamp-1 mb-1">
                  {variant.exampleMeaning}
                </p>

                <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <Volume2 className="w-3 h-3 text-emerald-600" />
                  <span>اسْتَمِعْ لِلْكَلِمَةِ</span>
                </span>
              </div>
            </div>
          );
        })()}

        {/* شريط الإجراءات والتحكم السريع في سطر واحد دون تمديد الصفحة */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <button
            onClick={() => {
              playLetterSound();
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-black text-sm shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Volume2 className="w-4 h-4" />
            <span>
              {activeTashkeel === 'sukoon'
                ? `انْطِقْ: «${variant.spokenSound || getSukoonSound(currentLetter.char)}»`
                : 'انْطِقِ الْحَرْفَ'}
            </span>
          </button>

          <button
            onClick={() => {
              soundManager.playPop();
              triggerHarakaAnimation();
              soundManager.speakArabic(variant.example, speechRate);
            }}
            className="px-4 py-2.5 bg-white hover:bg-amber-50 border border-amber-300 text-amber-900 rounded-xl font-black text-sm shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Volume2 className="w-4 h-4 text-amber-600" />
            <span>انْطِقِ الْكَلِمَةَ «{variant.example}»</span>
          </button>

          <button
            onClick={() => {
              setIsTracingMode(!isTracingMode);
              soundManager.playPop();
            }}
            className={`px-4 py-2.5 rounded-xl font-black text-sm border transition-all flex items-center gap-1.5 cursor-pointer ${
              isTracingMode
                ? 'bg-amber-100 border-amber-400 text-amber-950'
                : 'bg-white border-amber-200 text-amber-800 hover:bg-amber-50'
            }`}
          >
            <PenTool className="w-4 h-4 text-amber-600" />
            <span>{isTracingMode ? 'إِغْلَاقُ الرَّسْمِ' : 'تَمْرِينُ الْكِتَابَةِ'}</span>
          </button>

          {isTracingMode && (
            <>
              <button
                onClick={clearCanvas}
                className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm flex items-center gap-1 cursor-pointer"
                title="مسح الرسم"
              >
                <RotateCcw className="w-4 h-4" />
                <span>مَسْح</span>
              </button>
              <button
                onClick={handleCompleteTracing}
                className="px-3 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-sm flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>أَتْمَمْت!</span>
              </button>
            </>
          )}
        </div>
      </div>

    </div>
  );
};
