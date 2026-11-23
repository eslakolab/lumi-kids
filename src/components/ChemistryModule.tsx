import React, { useState } from 'react';
import { INITIAL_CHEMISTRY_TOPICS, ChemistryTopic, CHEMISTRY_LAB_IMAGE } from '../data/initialData';
import { soundManager } from '../utils/audio';
import { Volume2, Sparkles, Flame, Snowflake, SunMedium, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ChemistryModuleProps {
  speechRate: number;
}

export const ChemistryModule: React.FC<ChemistryModuleProps> = ({ speechRate }) => {
  const [selectedTopicIndex, setSelectedTopicIndex] = useState(0);

  // Experiment 1: States of Matter (Water)
  const [waterTemp, setWaterTemp] = useState<'cold' | 'room' | 'hot'>('room');

  // Experiment 2: Color Mixing
  const [colorA, setColorA] = useState<'red' | 'yellow' | 'blue'>('red');
  const [colorB, setColorB] = useState<'red' | 'yellow' | 'blue'>('yellow');
  const [mixedColor, setMixedColor] = useState<string | null>('orange');

  // Experiment 3: Sink or Float
  const [tankItems, setTankItems] = useState<Array<{ name: string; type: 'apple' | 'wood' | 'stone' | 'key'; floats: boolean }>>([]);

  const currentTopic: ChemistryTopic = INITIAL_CHEMISTRY_TOPICS[selectedTopicIndex] || INITIAL_CHEMISTRY_TOPICS[0];

  const handleSelectTopic = (idx: number) => {
    setSelectedTopicIndex(idx);
    soundManager.playPop();
    const topic = INITIAL_CHEMISTRY_TOPICS[idx];
    soundManager.speakArabic(`${topic.title} .. ${topic.concept}`, speechRate);
  };

  // Color mixing logic
  const handleMixColors = () => {
    soundManager.playStarSparkle();
    let result = '';
    let resultName = '';
    if ((colorA === 'red' && colorB === 'yellow') || (colorA === 'yellow' && colorB === 'red')) {
      result = 'orange';
      resultName = 'الْبُرْتُقَالِيَّ';
    } else if ((colorA === 'blue' && colorB === 'yellow') || (colorA === 'yellow' && colorB === 'blue')) {
      result = 'green';
      resultName = 'الْأَخْضَرَ';
    } else if ((colorA === 'red' && colorB === 'blue') || (colorA === 'blue' && colorB === 'red')) {
      result = 'purple';
      resultName = 'الْبَنَفْسَجِيَّ';
    } else {
      result = colorA;
      resultName = colorA === 'red' ? 'الْأَحْمَرَ' : colorA === 'yellow' ? 'الْأَصْفَرَ' : 'الْأَزْرَقَ';
    }
    setMixedColor(result);
    soundManager.speakArabic(`عِنْدَمَا مَزَجْنَا اللَّوْنَيْنِ، تَكَوَّنَ اللَّوْنُ ${resultName}! سِحْرُ الْكِيمْيَاءِ!`, speechRate);
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.6 },
    });
  };

  // Sink or Float drop
  const handleDropItem = (type: 'apple' | 'wood' | 'stone' | 'key') => {
    soundManager.playPop();
    const floats = type === 'apple' || type === 'wood';
    const names = {
      apple: 'تُفَّاحَةٌ لَذِيذَةٌ',
      wood: 'قِطْعَةُ خَشَبٍ',
      stone: 'حَجَرٌ صَغِيرٌ',
      key: 'مِفْتَاحٌ مَعْدِنِيٌّ',
    };
    setTankItems((prev) => [...prev, { name: names[type], type, floats }]);

    const message = floats
      ? `${names[type]} تَطْفُو فَوْقَ الْمَاءِ لِأَنَّهَا خَفِيفَةٌ!`
      : `${names[type]} غَرِقَتْ فِي قَاعِ الْمَاءِ لِأَنَّهَا ثَقِيلَةٌ!`;
    soundManager.speakArabic(message, speechRate);
  };

  return (
    <div className="space-y-6">
      {/* Header and Lab Welcome */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-purple-200 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-purple-300 shrink-0">
            <img
              src={CHEMISTRY_LAB_IMAGE}
              alt="مختبر الكيمياء البسيطة"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-900 rounded-full text-xs font-black mb-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>مُخْتَبَرُ الْعُلُومِ وَالْكِيمْيَاءِ لِلْأَبْطَالِ</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-purple-950">
              تَجَارِبُ بَسِيطَةٌ وَبَدِيهِيَّةٌ مُدْهِشَةٌ
            </h2>
            <p className="text-sm font-bold text-slate-600">
              تَعَلَّمْ كَيْفَ تَعْمَلُ الْأَشْيَاءُ مِنْ حَوْلِنَا بِالْمُشَاهَدَةِ وَالتَّجْرِبَةِ!
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            soundManager.playStarSparkle();
            soundManager.speakArabic(
              'أَهْلًا بِكَ فِي مُخْتَبَرِ الْكِيمْيَاءِ الْبَسِيطَةِ! هَيَّا نَكْتَشِفْ سِرَّ الْمَاءِ وَالْأَلْوَانِ مَعًا!',
              speechRate
            );
          }}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-2xl flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 shrink-0"
        >
          <Volume2 className="w-5 h-5 animate-pulse" />
          <span>اسْتَمِعْ لِتَعْلِيمَاتِ الْمُخْتَبَرِ</span>
        </button>
      </div>

      {/* Topics Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {INITIAL_CHEMISTRY_TOPICS.map((topic, idx) => (
          <button
            key={topic.id}
            onClick={() => handleSelectTopic(idx)}
            className={`px-5 py-3 rounded-2xl font-black text-base whitespace-nowrap cursor-pointer transition-all border-2 ${
              selectedTopicIndex === idx
                ? 'bg-purple-600 text-white border-purple-700 shadow-md scale-102'
                : 'bg-white text-purple-950 border-purple-200 hover:bg-purple-50'
            }`}
          >
            {topic.title}
          </button>
        ))}
      </div>

      {/* Main Interactive Experiment Area */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border-2 border-purple-200 space-y-6">
        {/* Topic Title & Concept */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50/50 p-6 rounded-3xl border border-purple-200">
          <div className="flex items-center justify-between gap-3 mb-2">
            <h3 className="text-2xl md:text-3xl font-black text-purple-950">
              {currentTopic.title}
            </h3>
            <button
              onClick={() => {
                soundManager.playPop();
                soundManager.speakArabic(`${currentTopic.concept}. مَعْلُومَةٌ مُمْتِعَةٌ: ${currentTopic.funFact}`, speechRate);
              }}
              className="p-2.5 bg-white text-purple-800 hover:bg-purple-100 rounded-2xl border border-purple-300 cursor-pointer shadow-xs"
              title="استمع للشرح"
            >
              <Volume2 className="w-5 h-5 text-purple-700 animate-pulse" />
            </button>
          </div>
          <p className="text-base md:text-lg font-bold text-purple-900 leading-relaxed mb-3">
            {currentTopic.concept}
          </p>
          <div className="inline-flex items-center gap-2 bg-purple-200/80 text-purple-950 px-4 py-1.5 rounded-full text-xs font-black">
            <span>💡 مَعْلُومَةٌ ذَكِيَّةٌ:</span>
            <span>{currentTopic.funFact}</span>
          </div>
        </div>

        {/* Experiment 1: States of Matter (Water) */}
        {currentTopic.experimentType === 'states' && (
          <div className="bg-slate-50 p-6 md:p-8 rounded-3xl border-2 border-slate-200 space-y-6 text-center">
            <h4 className="text-xl font-black text-slate-800">
              اخْتَرْ دَرَجَةَ الْحَرَارَةِ لِتَرَى مَاذَا يَحْدُثُ لِلْمَاءِ:
            </h4>

            {/* Interactive Temperature Buttons */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button
                onClick={() => {
                  setWaterTemp('cold');
                  soundManager.playPop();
                  soundManager.speakArabic('عِنْدَ التَّبْرِيدِ الشَّدِيدِ يَتَحَوَّلُ الْمَاءُ إِلَى ثَلْجٍ صَلْبٍ يُمْكِنُ إِمْسَاكُهُ!', speechRate);
                }}
                className={`px-5 py-3 rounded-2xl font-black text-base flex items-center gap-2 cursor-pointer transition-all ${
                  waterTemp === 'cold'
                    ? 'bg-sky-500 text-white shadow-md ring-4 ring-sky-300 scale-105'
                    : 'bg-white text-sky-800 border-2 border-sky-300 hover:bg-sky-50'
                }`}
              >
                <Snowflake className="w-5 h-5" />
                <span>تَبْرِيدٌ فِي الثَّلَّاجَةِ (0° مِئَوِيَّة)</span>
              </button>

              <button
                onClick={() => {
                  setWaterTemp('room');
                  soundManager.playPop();
                  soundManager.speakArabic('فِي حَرَارَةِ الْغُرْفَةِ يَكُونُ الْمَاءُ سَائِلًا عَذْبًا نَشْرَبُهُ وَنَسْبَحُ فِيهِ!', speechRate);
                }}
                className={`px-5 py-3 rounded-2xl font-black text-base flex items-center gap-2 cursor-pointer transition-all ${
                  waterTemp === 'room'
                    ? 'bg-blue-500 text-white shadow-md ring-4 ring-blue-300 scale-105'
                    : 'bg-white text-blue-800 border-2 border-blue-300 hover:bg-blue-50'
                }`}
              >
                <SunMedium className="w-5 h-5" />
                <span>حَرَارَةُ الْغُرْفَةِ الْعَادِيَّةُ (25° مِئَوِيَّة)</span>
              </button>

              <button
                onClick={() => {
                  setWaterTemp('hot');
                  soundManager.playPop();
                  soundManager.speakArabic('عِنْدَ التَّسْخِينِ عَلَى النَّارِ يَتَصَاعَدُ الْمَاءُ فِي الْهَوَاءِ عَلَى شَكْلِ بُخَارٍ!', speechRate);
                }}
                className={`px-5 py-3 rounded-2xl font-black text-base flex items-center gap-2 cursor-pointer transition-all ${
                  waterTemp === 'hot'
                    ? 'bg-rose-500 text-white shadow-md ring-4 ring-rose-300 scale-105'
                    : 'bg-white text-rose-800 border-2 border-rose-300 hover:bg-rose-50'
                }`}
              >
                <Flame className="w-5 h-5" />
                <span>تَسْخِينٌ وَغَلَيَانٌ (100° مِئَوِيَّة)</span>
              </button>
            </div>

            {/* Flask Visual Stage */}
            <div className="w-64 h-64 mx-auto rounded-3xl bg-white border-4 border-slate-300 shadow-md p-6 flex flex-col items-center justify-center relative overflow-hidden">
              {waterTemp === 'cold' && (
                <div className="space-y-2 animate-bounce">
                  <span className="text-6xl">🧊</span>
                  <div className="font-black text-xl text-sky-900">ثَلْجٌ صَلْبٌ!</div>
                  <span className="text-xs text-slate-500 font-bold">بَارِدٌ جِدًّا وَمُتَمَاسِكٌ</span>
                </div>
              )}

              {waterTemp === 'room' && (
                <div className="space-y-2">
                  <span className="text-6xl animate-pulse">💧</span>
                  <div className="font-black text-xl text-blue-900">مَاءٌ سَائِلٌ!</div>
                  <span className="text-xs text-slate-500 font-bold">يَسِيلُ وَنَشْرَبُهُ بِهُدُوءٍ</span>
                </div>
              )}

              {waterTemp === 'hot' && (
                <div className="space-y-2">
                  <span className="text-6xl animate-pulse">♨️</span>
                  <div className="font-black text-xl text-rose-900">بُخَارُ مَاءٍ (غَاز)!</div>
                  <span className="text-xs text-slate-500 font-bold">يَطِيرُ فِي الْهَوَاءِ كَالسَّحَابِ</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Experiment 2: Color Mixing Chemistry */}
        {currentTopic.experimentType === 'colors' && (
          <div className="bg-slate-50 p-6 md:p-8 rounded-3xl border-2 border-slate-200 space-y-6 text-center">
            <h4 className="text-xl font-black text-slate-800">
              اخْتَرْ لَوْنَيْنِ وَامْزِجْهُمَا لِاكْتِشَافِ لَوْنٍ جَدِيدٍ:
            </h4>

            <div className="flex items-center justify-center gap-6 flex-wrap">
              {/* Color A Selector */}
              <div className="bg-white p-4 rounded-2xl border-2 border-slate-200">
                <span className="text-xs font-black text-slate-600 block mb-2">اللَّوْنُ الْأَوَّلُ:</span>
                <div className="flex gap-2">
                  {[
                    { key: 'red', bg: 'bg-red-500', name: 'أحمر' },
                    { key: 'yellow', bg: 'bg-yellow-400', name: 'أصفر' },
                    { key: 'blue', bg: 'bg-blue-500', name: 'أزرق' },
                  ].map((c) => (
                    <button
                      key={c.key}
                      onClick={() => setColorA(c.key as 'red' | 'yellow' | 'blue')}
                      className={`w-12 h-12 rounded-xl cursor-pointer ${c.bg} ${
                        colorA === c.key ? 'ring-4 ring-purple-500 scale-110 shadow-md' : 'opacity-80'
                      }`}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <div className="text-3xl font-black text-purple-700">+</div>

              {/* Color B Selector */}
              <div className="bg-white p-4 rounded-2xl border-2 border-slate-200">
                <span className="text-xs font-black text-slate-600 block mb-2">اللَّوْنُ الثَّانِي:</span>
                <div className="flex gap-2">
                  {[
                    { key: 'red', bg: 'bg-red-500', name: 'أحمر' },
                    { key: 'yellow', bg: 'bg-yellow-400', name: 'أصفر' },
                    { key: 'blue', bg: 'bg-blue-500', name: 'أزرق' },
                  ].map((c) => (
                    <button
                      key={c.key}
                      onClick={() => setColorB(c.key as 'red' | 'yellow' | 'blue')}
                      className={`w-12 h-12 rounded-xl cursor-pointer ${c.bg} ${
                        colorB === c.key ? 'ring-4 ring-purple-500 scale-110 shadow-md' : 'opacity-80'
                      }`}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={handleMixColors}
                className="px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white font-black text-lg rounded-2xl shadow-md cursor-pointer active:scale-95 flex items-center gap-2"
              >
                <span>🧪 امْزِجِ السَّائِلَيْنِ!</span>
              </button>
            </div>

            {/* Mixing result flask */}
            {mixedColor && (
              <div className="mt-4 p-6 bg-white rounded-2xl border-2 border-purple-300 max-w-sm mx-auto space-y-2">
                <div
                  className="w-24 h-24 mx-auto rounded-full shadow-lg border-4 border-white transition-all transform scale-110"
                  style={{
                    backgroundColor:
                      mixedColor === 'orange'
                        ? '#F97316'
                        : mixedColor === 'green'
                        ? '#22C55E'
                        : mixedColor === 'purple'
                        ? '#A855F7'
                        : mixedColor === 'red'
                        ? '#EF4444'
                        : mixedColor === 'yellow'
                        ? '#FACC15'
                        : '#3B82F6',
                  }}
                />
                <h5 className="font-black text-xl text-purple-950">
                  نَاتِجُ الْمَزْجِ: اللَّوْنُ{' '}
                  {mixedColor === 'orange'
                    ? 'الْبُرْتُقَالِيُّ 🍊'
                    : mixedColor === 'green'
                    ? 'الْأَخْضَرُ 🌿'
                    : mixedColor === 'purple'
                    ? 'الْبَنَفْسَجِيُّ 🍇'
                    : mixedColor}
                </h5>
              </div>
            )}
          </div>
        )}

        {/* Experiment 3: Sink or Float */}
        {currentTopic.experimentType === 'floating' && (
          <div className="bg-slate-50 p-6 md:p-8 rounded-3xl border-2 border-slate-200 space-y-6 text-center">
            <h4 className="text-xl font-black text-slate-800">
              أَلْقِ أَشْيَاءَ فِي حَوْضِ الْمَاءِ لِتَرَى مَنْ يَطْفُو وَمَنْ يَغْرَقُ:
            </h4>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button
                onClick={() => handleDropItem('apple')}
                className="px-4 py-2.5 bg-white hover:bg-amber-50 border-2 border-amber-300 rounded-xl font-bold text-amber-950 cursor-pointer shadow-xs"
              >
                🍎 أَلْقِ تُفَّاحَةً
              </button>

              <button
                onClick={() => handleDropItem('wood')}
                className="px-4 py-2.5 bg-white hover:bg-amber-50 border-2 border-amber-300 rounded-xl font-bold text-amber-950 cursor-pointer shadow-xs"
              >
                🪵 أَلْقِ خَشَبًا
              </button>

              <button
                onClick={() => handleDropItem('stone')}
                className="px-4 py-2.5 bg-white hover:bg-amber-50 border-2 border-amber-300 rounded-xl font-bold text-amber-950 cursor-pointer shadow-xs"
              >
                🪨 أَلْقِ حَجَرًا
              </button>

              <button
                onClick={() => handleDropItem('key')}
                className="px-4 py-2.5 bg-white hover:bg-amber-50 border-2 border-amber-300 rounded-xl font-bold text-amber-950 cursor-pointer shadow-xs"
              >
                🔑 أَلْقِ مِفْتَاحًا مَعْدِنِيًّا
              </button>

              {tankItems.length > 0 && (
                <button
                  onClick={() => setTankItems([])}
                  className="px-3 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>تَفْرِيغُ الْحَوْضِ</span>
                </button>
              )}
            </div>

            {/* Visual Water Tank */}
            <div className="w-full max-w-md mx-auto h-56 bg-gradient-to-b from-sky-100 via-sky-200 to-sky-400 rounded-3xl border-4 border-sky-500 shadow-inner relative overflow-hidden flex flex-col justify-between p-4">
              {/* Floating Layer (Top surface of water) */}
              <div className="flex gap-3 justify-center items-center min-h-[50px] border-b-2 border-sky-400/50 pb-2">
                <span className="text-xs font-black text-sky-800 absolute top-2 right-3">
                  تَطْفُو فِي الْأَعْلَى (خَفِيفَةٌ):
                </span>
                {tankItems
                  .filter((item) => item.floats)
                  .map((item, i) => (
                    <span key={i} className="text-3xl animate-bounce" title={item.name}>
                      {item.type === 'apple' ? '🍎' : '🪵'}
                    </span>
                  ))}
              </div>

              {/* Sinking Layer (Bottom of tank) */}
              <div className="flex gap-3 justify-center items-center min-h-[50px] bg-sky-600/30 rounded-xl pt-2">
                <span className="text-xs font-black text-sky-950 absolute bottom-2 right-3">
                  تَغْرَقُ فِي الْقَاعِ (ثَقِيلَةٌ):
                </span>
                {tankItems
                  .filter((item) => !item.floats)
                  .map((item, i) => (
                    <span key={i} className="text-3xl" title={item.name}>
                      {item.type === 'stone' ? '🪨' : '🔑'}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Experiment 4: Dissolving */}
        {currentTopic.experimentType === 'dissolve' && (
          <div className="bg-slate-50 p-6 md:p-8 rounded-3xl border-2 border-slate-200 space-y-6 text-center">
            <h4 className="text-xl font-black text-slate-800">
              مَاذَا يَحْدُثُ عِنْدَمَا نَضَعُ مِلْعَقَةَ سُكَّرٍ فِي الْمَاءِ وَنُحَرِّكُهَا؟
            </h4>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => {
                  soundManager.playStarSparkle();
                  soundManager.speakArabic(
                    'عِنْدَ تَحْرِيكِ السُّكَّرِ فِي الْمَاءِ يَذُوبُ تَمَامًا وَيَخْتَفِي، وَيُصْبِحُ الْمَاءُ كُلُّهُ حُلْوَ الْمَذَاقِ!',
                    speechRate
                  );
                }}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-base rounded-2xl shadow-sm cursor-pointer"
              >
                🥄 حَرِّكِ السُّكَّرَ فِي الْمَاءِ
              </button>

              <button
                onClick={() => {
                  soundManager.playPop();
                  soundManager.speakArabic(
                    'الرَّمْلُ لَا يَذُوبُ فِي الْمَاءِ، بَلْ يَبْقَى فِي الْأَسْفَلِ لِأَنَّ حَبَّاتِهِ لَا تَذُوبُ!',
                    speechRate
                  );
                }}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-black text-base rounded-2xl shadow-sm cursor-pointer"
              >
                🏖️ جَرِّبْ وَضْعَ الرَّمْلِ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
