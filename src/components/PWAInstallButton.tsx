import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useLanguage } from '../context/LanguageContext';

export const PWAInstallButton: React.FC<{ variant?: 'header' | 'banner' }> = ({
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const { language } = useLanguage();

  // If already running inside installed standalone PWA / TWA wrapper, suppress button
  if (isInstalled) {
    return null;
  }

  const label = language === 'ar' ? 'تَثْبِيتُ التَّطْبِيقِ' : 'Install App';
  const iosLabel = language === 'ar' ? 'تَثْبِيتٌ عَلَى هَاتِفِكَ' : 'Install on Phone';

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'banner') {
      return (
        <button
          onClick={install}
          className="flex items-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-600 px-4 py-2.5 text-xs sm:text-sm font-black text-white shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <Download className="w-4 h-4 animate-bounce" />
          <span>{label}</span>
        </button>
      );
    }

    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 px-3 py-1.5 text-xs font-black text-white shadow-2xs transition-all active:scale-95 cursor-pointer"
        title={label}
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{label}</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        {variant === 'banner' ? (
          <button
            onClick={() => setShowIOSGuide(true)}
            className="flex items-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-600 px-4 py-2.5 text-xs sm:text-sm font-black text-white shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{iosLabel}</span>
          </button>
        ) : (
          <button
            onClick={() => setShowIOSGuide(true)}
            className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 px-2.5 py-1.5 text-xs font-bold text-amber-900 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">{iosLabel}</span>
          </button>
        )}

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border-4 border-amber-300 text-center relative animate-fadeIn">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 left-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                <Download className="w-6 h-6" />
              </div>

              <h3 className="text-base font-black text-slate-800">
                {language === 'ar' ? 'تَثْبِيتُ لُومِي عَلَى iPhone / iPad' : 'Install Lumi on iPhone / iPad'}
              </h3>

              <div className="mt-4 space-y-3 text-start bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-bold">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-2xs font-mono shrink-0">1</span>
                  <span>{language === 'ar' ? 'اضْغَطْ عَلَى زِرِّ الْمُشَارَكَةِ (Share)' : 'Tap the Share button'}</span>
                  <Share2 className="w-4 h-4 text-blue-500 shrink-0" />
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-2xs font-mono shrink-0">2</span>
                  <span>{language === 'ar' ? 'اخْتَرْ "إِضَافَةٌ إِلَى الشَّاشَةِ الرَّئِيسِيَّةِ"' : 'Select "Add to Home Screen"'}</span>
                  <PlusSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-amber-500 text-white text-xs font-black shadow-md hover:bg-amber-600 transition-colors cursor-pointer"
              >
                {language === 'ar' ? 'فَهِمْتُ، شُكْرًا!' : 'Got it, thanks!'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
