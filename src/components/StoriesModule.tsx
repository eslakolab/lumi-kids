import React, { useState, useEffect, useRef } from 'react';
import {
  REALISTIC_STORIES,
  Story,
  StoryPage,
  StoryHotspot,
} from '../data/storiesData';
import { soundManager } from '../utils/audio';
import { resolveAssetUrl } from '../utils/assetResolver';
import {
  Volume2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Eye,
  RefreshCw,
  X,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSubscription } from '../context/SubscriptionContext';

interface StoriesModuleProps {
  speechRate: number;
  onRequireSubscription?: (contentTitle: string) => void;
}

export const StoriesModule: React.FC<StoriesModuleProps> = ({ speechRate, onRequireSubscription }) => {
  const { isContentUnlocked } = useSubscription();
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedHotspot, setSelectedHotspot] = useState<StoryHotspot | null>(null);
  const [discoveredIds, setDiscoveredIds] = useState<Record<string, string[]>>({});
  const [showItemHints, setShowItemHints] = useState(true);
  const [isReadingSentence, setIsReadingSentence] = useState(false);

  const currentStory: Story = REALISTIC_STORIES[selectedStoryIndex] || REALISTIC_STORIES[0];
  const currentPage: StoryPage = currentStory.pages[currentPageIndex] || currentStory.pages[0];

  const pageDiscoveredList = discoveredIds[currentPage.id] || [];
  const isPageFullyDiscovered =
    currentPage.hotspots.length > 0 &&
    currentPage.hotspots.every((h) => pageDiscoveredList.includes(h.id));

  const hotspotTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const praiseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPendingAudioTimers = () => {
    if (pageTimerRef.current) {
      clearTimeout(pageTimerRef.current);
      pageTimerRef.current = null;
    }
    if (praiseTimerRef.current) {
      clearTimeout(praiseTimerRef.current);
      praiseTimerRef.current = null;
    }
  };

  // Clear any pending timers and stop speech when unmounting
  useEffect(() => {
    return () => {
      if (hotspotTimerRef.current) {
        clearTimeout(hotspotTimerRef.current);
      }
      clearPendingAudioTimers();
      soundManager.stopSpeech();
    };
  }, []);

  // Dismiss hotspot identification card
  const dismissHotspot = () => {
    if (hotspotTimerRef.current) {
      clearTimeout(hotspotTimerRef.current);
      hotspotTimerRef.current = null;
    }
    setSelectedHotspot(null);
  };

  // Switch story handler
  const handleSelectStory = (idx: number) => {
    if (!isContentUnlocked('storiesCount', idx)) {
      soundManager.playPop();
      onRequireSubscription?.(`قِصَّةُ «${REALISTIC_STORIES[idx].title}»`);
      return;
    }

    clearPendingAudioTimers();
    soundManager.stopSpeech();
    setIsReadingSentence(false);
    dismissHotspot();
    setSelectedStoryIndex(idx);
    setCurrentPageIndex(0);
    soundManager.playPop();
  };

  // Switch page handler
  const handlePageChange = (newIdx: number) => {
    if (newIdx < 0 || newIdx >= currentStory.pages.length) return;
    clearPendingAudioTimers();
    soundManager.stopSpeech();
    setIsReadingSentence(false);
    dismissHotspot();
    setCurrentPageIndex(newIdx);
    soundManager.playPop();

    // Read the single sentence of the new page
    const nextPage = currentStory.pages[newIdx];
    if (nextPage) {
      pageTimerRef.current = setTimeout(() => {
        pageTimerRef.current = null;
        soundManager.speakArabic(nextPage.sentenceAudioText, speechRate);
      }, 250);
    }
  };

  // Handle clicking on an element/hotspot in the photo
  const handleTapHotspot = (hotspot: StoryHotspot) => {
    if (hotspotTimerRef.current) {
      clearTimeout(hotspotTimerRef.current);
    }
    if (praiseTimerRef.current) {
      clearTimeout(praiseTimerRef.current);
      praiseTimerRef.current = null;
    }

    setSelectedHotspot(hotspot);
    soundManager.playPop();

    // Auto-dismiss the identification card after 3 seconds so it doesn't obstruct the story
    hotspotTimerRef.current = setTimeout(() => {
      setSelectedHotspot(null);
      hotspotTimerRef.current = null;
    }, 3000);

    // Track discovery
    const currentDiscovered = discoveredIds[currentPage.id] || [];
    let isNewlyCompleted = false;
    if (!currentDiscovered.includes(hotspot.id)) {
      const updated = [...currentDiscovered, hotspot.id];
      const newMap = { ...discoveredIds, [currentPage.id]: updated };
      setDiscoveredIds(newMap);
      isNewlyCompleted = updated.length === currentPage.hotspots.length;
    }

    soundManager.speakArabic(hotspot.name, speechRate, () => {
      if (isNewlyCompleted) {
        praiseTimerRef.current = setTimeout(() => {
          praiseTimerRef.current = null;
          soundManager.playSuccessChime();
          soundManager.speakArabic(`مُمْتَازٌ! لَقَدْ تَعَرَّفْتَ عَلَى جَمِيعِ الْأَشْيَاءِ!`, speechRate);
          confetti({
            particleCount: 35,
            spread: 60,
            origin: { y: 0.6 },
          });
        }, 250);
      }
    });
  };

  // Speak the single story sentence
  const handleReadSentence = () => {
    clearPendingAudioTimers();
    setIsReadingSentence(true);
    soundManager.playPop();
    soundManager.speakArabic(currentPage.sentenceAudioText, speechRate, () => {
      setIsReadingSentence(false);
    });
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-6">
      {/* Top Story Selection Bar */}
      <div className="bg-white rounded-2xl p-2.5 px-3.5 shadow-2xs border border-amber-200">
        <div className="flex items-center justify-between gap-2 mb-2 px-1">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-600" />
            <span className="font-black text-amber-950 text-sm md:text-base">
              اخْتَرِ الْقِصَّةَ الْمُصَوَّرَةَ:
            </span>
          </div>
          <span className="text-xs font-bold text-slate-500">
            حِكَايَاتٌ وَاقِعِيَّةٌ مَعَ تَسْمِيَةِ الْأَشْيَاءِ
          </span>
        </div>

        {/* Stories Horizontal Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {REALISTIC_STORIES.map((story, idx) => {
            const isSelected = selectedStoryIndex === idx;
            const isUnlocked = isContentUnlocked('storiesCount', idx);

            return (
              <button
                key={story.id}
                onClick={() => handleSelectStory(idx)}
                className={`relative px-3.5 py-2 rounded-xl border flex items-center gap-2 transition-all cursor-pointer shrink-0 text-sm font-bold ${
                  isSelected
                    ? 'bg-amber-100 border-amber-500 text-amber-950 font-black ring-1 ring-amber-400'
                    : isUnlocked
                    ? 'bg-slate-50 hover:bg-amber-50/60 border-slate-200 text-slate-700'
                    : 'bg-slate-100 border-slate-200 text-slate-400 hover:border-amber-300'
                }`}
              >
                {!isUnlocked && (
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] shadow-2xs shrink-0">
                    <Lock className="w-2.5 h-2.5" />
                  </span>
                )}
                <div className="w-6 h-6 rounded-lg overflow-hidden shrink-0 border border-amber-200">
                  <img
                    src={resolveAssetUrl(story.coverImage)}
                    alt={story.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span>{story.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Single-Sentence Story Book Container */}
      <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border-2 border-amber-300 space-y-4">
        {/* Story Title & Page Stepper Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-100 pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg md:text-xl font-black text-amber-950">
              {currentStory.title}
            </h2>
            <span className="text-xs font-bold text-slate-500 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              {currentStory.badge}
            </span>
          </div>

          {/* Page Counter and Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPageIndex - 1)}
              disabled={currentPageIndex === 0}
              className="p-2 px-3 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-800 disabled:opacity-40 disabled:pointer-events-none font-bold text-xs md:text-sm flex items-center gap-1 cursor-pointer transition-all border border-slate-200"
              title="الصفحة السابقة"
            >
              <ChevronRight className="w-4 h-4" />
              <span>السَّابِقَةُ</span>
            </button>

            <div className="px-3 py-1 bg-amber-50 rounded-xl border border-amber-200 text-xs md:text-sm font-black text-amber-950">
              صَفْحَةُ {currentPageIndex + 1} مِنْ {currentStory.pages.length}
            </div>

            <button
              onClick={() => handlePageChange(currentPageIndex + 1)}
              disabled={currentPageIndex === currentStory.pages.length - 1}
              className="p-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-40 disabled:pointer-events-none font-bold text-xs md:text-sm flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
              title="الصفحة التالية"
            >
              <span>التَّالِيَةُ</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SINGLE SENTENCE BOX (جُمْلَةٌ وَاحِدَةٌ فَقَطْ فِي كُلِّ صَفْحَةٍ) */}
        <div className="bg-gradient-to-r from-amber-50 via-white to-orange-50 rounded-2xl p-4 md:p-5 border-2 border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right">
          <div className="space-y-1">
            <span className="text-xs font-bold text-amber-800 block">
              جُمْلَةُ الصَّفْحَةِ ({currentPageIndex + 1}):
            </span>
            <p
              className={`text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tashkeel-word leading-relaxed transition-all ${
                isReadingSentence ? 'text-amber-600 scale-101' : ''
              }`}
            >
              «{currentPage.sentence}»
            </p>
          </div>

          <button
            onClick={handleReadSentence}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black text-sm flex items-center gap-2 cursor-pointer transition-all shadow-2xs shrink-0 active:scale-95"
            title="استمع إلى الجملة بصوت واضح"
          >
            <Volume2 className="w-5 h-5 animate-pulse" />
            <span>اسْتَمِعْ لِلْجُمْلَةِ</span>
          </button>
        </div>

        {/* REALISTIC PHOTO WITH INTERACTIVE HOTSPOTS */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1 text-xs md:text-sm font-bold text-slate-700">
            <div className="flex items-center gap-1.5 text-amber-900 font-black">
              <Eye className="w-4 h-4 text-amber-600" />
              <span>اضْغَطْ عَلَى النِّقَاطِ الْمُضِيئَةِ فِي الصُّورَةِ لِتَسْمِيَةِ الْأَشْيَاءِ:</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">
                (اكْتَشَفْتَ {pageDiscoveredList.length} مِنْ {currentPage.hotspots.length})
              </span>
              <button
                onClick={() => setShowItemHints(!showItemHints)}
                className="text-xs font-bold text-amber-800 hover:underline cursor-pointer"
              >
                {showItemHints ? 'إِخْفَاءُ النِّقَاطِ' : 'إِظْهَارُ النِّقَاطِ'}
              </button>
            </div>
          </div>

          {/* Interactive Image Frame */}
          <div
            onClick={dismissHotspot}
            className="relative rounded-2xl overflow-hidden border-2 border-amber-200 bg-slate-900 shadow-inner max-h-[440px] flex items-center justify-center cursor-default"
          >
            <img
              src={resolveAssetUrl(currentPage.image)}
              alt={currentPage.sentence}
              className="w-full h-auto max-h-[440px] object-cover select-none"
              referrerPolicy="no-referrer"
            />

            {/* Clickable Hotspots overlay on realistic photograph */}
            {showItemHints &&
              currentPage.hotspots.map((hotspot) => {
                const isDiscovered = pageDiscoveredList.includes(hotspot.id);
                const isSelected = selectedHotspot?.id === hotspot.id;

                return (
                  <div
                    key={hotspot.id}
                    style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTapHotspot(hotspot);
                      }}
                      className={`relative group cursor-pointer flex items-center justify-center rounded-full transition-transform active:scale-90 ${
                        isSelected
                          ? 'ring-4 ring-amber-300 scale-125'
                          : 'hover:scale-115'
                      }`}
                      aria-label={`عنصر ${hotspot.simpleName}`}
                    >
                      {/* Pulsing Target Ring */}
                      <span
                        className={`absolute w-9 h-9 md:w-11 md:h-11 rounded-full animate-ping opacity-75 ${
                          isDiscovered ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}
                      />

                      {/* Touch Button */}
                      <span
                        className={`w-7 h-7 md:w-9 md:h-9 rounded-full flex items-center justify-center text-xs md:text-sm shadow-md border-2 border-white transition-colors ${
                          isDiscovered
                            ? 'bg-emerald-500 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        {hotspot.icon || '✨'}
                      </span>
                    </button>

                    {/* Small always-readable caption label below spot if active */}
                    {isSelected && (
                      <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap z-30 bg-white/95 text-slate-950 font-black text-xs md:text-sm px-2.5 py-1 rounded-xl shadow-lg border border-amber-300 animate-in fade-in zoom-in-95 pointer-events-none">
                        {hotspot.name}
                      </div>
                    )}
                  </div>
                );
              })}

            {/* Floating Banner when an item is selected - Auto-hides after 3 seconds */}
            {selectedHotspot && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 sm:max-w-xs z-30 bg-white/95 backdrop-blur-md rounded-2xl p-3 border-2 border-amber-300 shadow-xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2 fade-in duration-200"
              >
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl shrink-0">{selectedHotspot.icon || '✨'}</span>
                    <span className="text-base font-black text-amber-950 tashkeel-word truncate">
                      {selectedHotspot.name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {selectedHotspot.description}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      soundManager.playPop();
                      soundManager.speakArabic(selectedHotspot.name, speechRate);
                      // Reset 3s timer on replay
                      if (hotspotTimerRef.current) clearTimeout(hotspotTimerRef.current);
                      hotspotTimerRef.current = setTimeout(() => {
                        setSelectedHotspot(null);
                        hotspotTimerRef.current = null;
                      }, 3000);
                    }}
                    className="p-2 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-xl cursor-pointer shrink-0 transition-all active:scale-95"
                    title="إعادة نطق الاسم"
                  >
                    <Volume2 className="w-4 h-4 text-amber-700" />
                  </button>

                  <button
                    onClick={dismissHotspot}
                    className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer transition-all"
                    title="إغلاق"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* DISCOVERABLE OBJECTS TRAY (قائمة العناصر المكتشفة في الصورة) */}
        <div className="bg-amber-50/60 rounded-2xl p-3 border border-amber-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-sm font-black text-amber-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>عَنَاصِرُ الصُّورَةِ لِلتَّعَرُّفِ وَالتَّسْمِيَةِ:</span>
            </span>

            {isPageFullyDiscovered && (
              <span className="text-xs font-black text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>أَحْسَنْتَ! اكْتَشَفْتَ كُلَّ الْأَشْيَاءِ!</span>
              </span>
            )}
          </div>

          {/* Items Horizontal clickable badges */}
          <div className="flex flex-wrap items-center gap-2">
            {currentPage.hotspots.map((item) => {
              const isFound = pageDiscoveredList.includes(item.id);
              const isSelected = selectedHotspot?.id === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleTapHotspot(item)}
                  className={`px-3 py-1.5 rounded-xl border text-xs md:text-sm font-black flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-amber-500 text-white border-amber-600 shadow-2xs scale-102 ring-2 ring-amber-300'
                      : isFound
                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'bg-white hover:bg-amber-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span>{item.icon || '🔍'}</span>
                  <span className="tashkeel-word">{item.name}</span>
                  {isFound ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Page Switcher Dots Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-amber-100 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            {currentStory.pages.map((_, pIdx) => (
              <button
                key={pIdx}
                onClick={() => handlePageChange(pIdx)}
                className={`w-6 h-2 rounded-full transition-all cursor-pointer ${
                  currentPageIndex === pIdx
                    ? 'w-9 bg-amber-500'
                    : 'bg-amber-200 hover:bg-amber-300'
                }`}
                aria-label={`انتقل إلى صفحة ${pIdx + 1}`}
              />
            ))}
          </div>

          <span className="font-bold text-amber-900">
            لُومِي — قِصَصٌ قَصِيرَةٌ مُصَوَّرَةٌ بِوَاقِعِيَّةٍ
          </span>
        </div>
      </div>
    </div>
  );
};
