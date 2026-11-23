import React, { useState } from 'react';
import { soundManager } from '../utils/audio';
import { Palette, RotateCcw, CheckCircle2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ColoringModuleProps {
  speechRate: number;
}

const PALETTE = [
  { name: 'أَحْمَر', hex: '#EF4444' },
  { name: 'أَصْفَر', hex: '#FACC15' },
  { name: 'أَزْرَق', hex: '#3B82F6' },
  { name: 'أَخْضَر', hex: '#22C55E' },
  { name: 'بُرْتُقَالِي', hex: '#F97316' },
  { name: 'بَنَفْسَجِي', hex: '#A855F7' },
  { name: 'وَرْدِي', hex: '#EC4899' },
  { name: 'بُنِّي', hex: '#854D0E' },
  { name: 'سَمَاوِي', hex: '#38BDF8' },
  { name: 'أَبْيَض', hex: '#FFFFFF' },
];

export const ColoringModule: React.FC<ColoringModuleProps> = ({ speechRate }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<'star' | 'tree' | 'house' | 'apple'>('star');
  const [selectedColor, setSelectedColor] = useState<string>('#FACC15');

  // SVG region colors mapping
  const [colorMap, setColorMap] = useState<Record<string, string>>({});

  const handleSelectColor = (color: { name: string; hex: string }) => {
    setSelectedColor(color.hex);
    soundManager.playPop();
    soundManager.speakArabic(`لَوْنُ ${color.name}`, speechRate);
  };

  const handleRegionClick = (regionId: string) => {
    soundManager.playPop();
    setColorMap((prev) => ({
      ...prev,
      [regionId]: selectedColor,
    }));
  };

  const handleClear = () => {
    soundManager.playPop();
    setColorMap({});
  };

  const handleFinished = () => {
    soundManager.playSuccessChime();
    soundManager.speakArabic('لَوْحَةٌ فَنِّيَّةٌ رَائِعَةٌ يَا فَنَّانِي الصَّغِير! أَنْتَ مَوْهُوبٌ جِدًّا!', speechRate);
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-rose-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-900 rounded-full text-xs font-black mb-1">
            <Palette className="w-4 h-4 text-rose-600" />
            <span>اسْتُودْيُو الرَّسَّامِ الصَّغِيرِ</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-rose-950">
            تَفَاعَلْ مَعَ الرُّسُومِ وَلَوِّنْهَا بِمَرَحٍ!
          </h2>
          <p className="text-sm font-bold text-slate-600">
            اخْتَرْ لَوْنًا مِنْ لَوْحَةِ الْأَلْوَانِ، ثُمَّ انْقُرْ عَلَى أَيِّ جُزْءٍ لِتَلْوِينِهِ!
          </p>
        </div>

        {/* Template Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { id: 'star', label: '⭐ النَّجْمَةُ' },
            { id: 'tree', label: '🌳 الشَّجَرَةُ' },
            { id: 'apple', label: '🍎 التُّفَّاحَةُ' },
            { id: 'house', label: '🏠 الْبَيْتُ' },
          ].map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => {
                setSelectedTemplate(tmpl.id as 'star' | 'tree' | 'house' | 'apple');
                setColorMap({});
                soundManager.playPop();
              }}
              className={`px-4 py-2.5 rounded-2xl font-black text-sm cursor-pointer transition-all border-2 ${
                selectedTemplate === tmpl.id
                  ? 'bg-rose-500 text-white border-rose-600 shadow-sm scale-105'
                  : 'bg-rose-50 text-rose-950 border-rose-200 hover:bg-rose-100'
              }`}
            >
              {tmpl.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio Canvas & Palette Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Palette Bar */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-sm border-2 border-rose-200 flex flex-col justify-between">
          <div>
            <h4 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-500" />
              <span>اخْتَرِ اللَّوْنَ الْمُفَضَّلَ:</span>
            </h4>

            <div className="grid grid-cols-5 gap-3">
              {PALETTE.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => handleSelectColor(c)}
                  className={`w-12 h-12 rounded-2xl cursor-pointer border-3 transition-transform ${
                    selectedColor === c.hex
                      ? 'border-slate-900 scale-110 shadow-md ring-2 ring-rose-400'
                      : 'border-slate-200 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-rose-50/70 border border-rose-200 text-center">
              <span className="text-xs font-bold text-slate-600 block mb-1">اللَّوْنُ النَّشِطُ حَالِيًّا:</span>
              <div
                className="w-16 h-10 mx-auto rounded-xl shadow-xs border-2 border-white"
                style={{ backgroundColor: selectedColor }}
              />
            </div>
          </div>

          <div className="space-y-3 mt-6">
            <button
              onClick={handleClear}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>إِعَادَةُ التَّلْوِينِ مِنْ جَدِيدٍ</span>
            </button>

            <button
              onClick={handleFinished}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-base rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>أَنْهَيْتُ لَوْحَتِي الْجَمِيلَةَ! 🌟</span>
            </button>
          </div>
        </div>

        {/* Right: Interactive Coloring Canvas with SVGs */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 md:p-10 shadow-md border-2 border-rose-200 flex flex-col items-center justify-center min-h-[420px] relative bg-gradient-to-br from-rose-50/30 to-amber-50/30">
          {/* Star Template */}
          {selectedTemplate === 'star' && (
            <svg viewBox="0 0 300 300" className="w-72 h-72 md:w-84 md:h-84 drop-shadow-md">
              {/* Outer Star Body */}
              <polygon
                points="150,20 185,110 280,115 205,175 235,270 150,215 65,270 95,175 20,115 115,110"
                fill={colorMap['star-body'] || '#FEF08A'}
                stroke="#1E293B"
                strokeWidth="6"
                strokeLinejoin="round"
                className="cursor-pointer hover:opacity-90 transition-colors"
                onClick={() => handleRegionClick('star-body')}
              />
              {/* Cheeks */}
              <circle
                cx="110"
                cy="165"
                r="14"
                fill={colorMap['star-cheek-l'] || '#FDA4AF'}
                stroke="#1E293B"
                strokeWidth="3"
                className="cursor-pointer hover:opacity-90"
                onClick={() => handleRegionClick('star-cheek-l')}
              />
              <circle
                cx="190"
                cy="165"
                r="14"
                fill={colorMap['star-cheek-r'] || '#FDA4AF'}
                stroke="#1E293B"
                strokeWidth="3"
                className="cursor-pointer hover:opacity-90"
                onClick={() => handleRegionClick('star-cheek-r')}
              />
              {/* Eyes */}
              <circle cx="120" cy="140" r="10" fill="#1E293B" />
              <circle cx="123" cy="137" r="3" fill="#FFFFFF" />
              <circle cx="180" cy="140" r="10" fill="#1E293B" />
              <circle cx="183" cy="137" r="3" fill="#FFFFFF" />
              {/* Smile */}
              <path d="M130 175 Q150 195 170 175" stroke="#1E293B" strokeWidth="6" strokeLinecap="round" fill="none" />
            </svg>
          )}

          {/* Tree Template */}
          {selectedTemplate === 'tree' && (
            <svg viewBox="0 0 300 300" className="w-72 h-72 md:w-84 md:h-84 drop-shadow-md">
              {/* Trunk */}
              <rect
                x="125"
                y="170"
                width="50"
                height="110"
                rx="6"
                fill={colorMap['tree-trunk'] || '#78350F'}
                stroke="#1E293B"
                strokeWidth="6"
                className="cursor-pointer hover:opacity-90"
                onClick={() => handleRegionClick('tree-trunk')}
              />
              {/* Foliage Canopy */}
              <circle
                cx="150"
                cy="110"
                r="70"
                fill={colorMap['tree-leaves'] || '#86EFAC'}
                stroke="#1E293B"
                strokeWidth="6"
                className="cursor-pointer hover:opacity-90"
                onClick={() => handleRegionClick('tree-leaves')}
              />
              <circle
                cx="110"
                cy="130"
                r="50"
                fill={colorMap['tree-leaves-l'] || '#86EFAC'}
                stroke="#1E293B"
                strokeWidth="6"
                className="cursor-pointer hover:opacity-90"
                onClick={() => handleRegionClick('tree-leaves-l')}
              />
              <circle
                cx="190"
                cy="130"
                r="50"
                fill={colorMap['tree-leaves-r'] || '#86EFAC'}
                stroke="#1E293B"
                strokeWidth="6"
                className="cursor-pointer hover:opacity-90"
                onClick={() => handleRegionClick('tree-leaves-r')}
              />
              {/* Apples */}
              <circle
                cx="130"
                cy="90"
                r="12"
                fill={colorMap['apple-1'] || '#EF4444'}
                stroke="#1E293B"
                strokeWidth="4"
                className="cursor-pointer hover:opacity-90"
                onClick={() => handleRegionClick('apple-1')}
              />
              <circle
                cx="170"
                cy="110"
                r="12"
                fill={colorMap['apple-2'] || '#EF4444'}
                stroke="#1E293B"
                strokeWidth="4"
                className="cursor-pointer hover:opacity-90"
                onClick={() => handleRegionClick('apple-2')}
              />
              <circle
                cx="120"
                cy="140"
                r="12"
                fill={colorMap['apple-3'] || '#EF4444'}
                stroke="#1E293B"
                strokeWidth="4"
                className="cursor-pointer hover:opacity-90"
                onClick={() => handleRegionClick('apple-3')}
              />
            </svg>
          )}

          {/* House Template */}
          {selectedTemplate === 'house' && (
            <svg viewBox="0 0 300 300" className="w-72 h-72 md:w-84 md:h-84 drop-shadow-md">
              {/* Roof */}
              <polygon
                points="150,30 40,120 260,120"
                fill={colorMap['house-roof'] || '#F43F5E'}
                stroke="#1E293B"
                strokeWidth="6"
                className="cursor-pointer hover:opacity-90"
                onClick={() => handleRegionClick('house-roof')}
              />
              {/* Walls */}
              <rect
                x="60"
                y="120"
                width="180"
                height="140"
                rx="6"
                fill={colorMap['house-walls'] || '#FEF08A'}
                stroke="#1E293B"
                strokeWidth="6"
                className="cursor-pointer hover:opacity-90"
                onClick={() => handleRegionClick('house-walls')}
              />
              {/* Door */}
              <rect
                x="125"
                y="180"
                width="50"
                height="80"
                rx="4"
                fill={colorMap['house-door'] || '#B45309'}
                stroke="#1E293B"
                strokeWidth="5"
                className="cursor-pointer hover:opacity-90"
                onClick={() => handleRegionClick('house-door')}
              />
              {/* Windows */}
              <rect
                x="75"
                y="140"
                width="35"
                height="35"
                rx="4"
                fill={colorMap['house-win-l'] || '#7DD3FC'}
                stroke="#1E293B"
                strokeWidth="4"
                className="cursor-pointer hover:opacity-90"
                onClick={() => handleRegionClick('house-win-l')}
              />
              <rect
                x="190"
                y="140"
                width="35"
                height="35"
                rx="4"
                fill={colorMap['house-win-r'] || '#7DD3FC'}
                stroke="#1E293B"
                strokeWidth="4"
                className="cursor-pointer hover:opacity-90"
                onClick={() => handleRegionClick('house-win-r')}
              />
            </svg>
          )}

          {/* Big Apple Template */}
          {selectedTemplate === 'apple' && (
            <svg viewBox="0 0 300 300" className="w-72 h-72 md:w-84 md:h-84 drop-shadow-md">
              {/* Apple Body */}
              <path
                d="M150 70 C100 20, 30 70, 40 160 C50 240, 110 270, 150 250 C190 270, 250 240, 260 160 C270 70, 200 20, 150 70 Z"
                fill={colorMap['apple-body'] || '#FCA5A5'}
                stroke="#1E293B"
                strokeWidth="6"
                className="cursor-pointer hover:opacity-90"
                onClick={() => handleRegionClick('apple-body')}
              />
              {/* Leaf */}
              <path
                d="M150 65 Q180 30 220 50 Q190 85 150 65 Z"
                fill={colorMap['apple-leaf'] || '#86EFAC'}
                stroke="#1E293B"
                strokeWidth="5"
                className="cursor-pointer hover:opacity-90"
                onClick={() => handleRegionClick('apple-leaf')}
              />
              {/* Stem */}
              <path d="M150 65 Q145 20 135 15" stroke="#78350F" strokeWidth="6" strokeLinecap="round" fill="none" />
            </svg>
          )}

          <div className="mt-4 text-xs font-bold text-slate-500">
            انْقُرْ عَلَى أَيِّ قِسْمٍ فِي الرَّسْمَةِ لِتَعْبِئَتِهِ بِاللَّوْنِ الْمُخْتَارِ
          </div>
        </div>
      </div>
    </div>
  );
};
