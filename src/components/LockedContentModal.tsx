import React from 'react';
import { Lock, Sparkles, X, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSubscription } from '../context/SubscriptionContext';

interface LockedContentModalProps {
  isOpen: boolean;
  contentTitle?: string;
  onClose: () => void;
  onOpenParentalGate: () => void;
}

export const LockedContentModal: React.FC<LockedContentModalProps> = ({
  isOpen,
  contentTitle,
  onClose,
  onOpenParentalGate,
}) => {
  const { language, direction, t } = useLanguage();
  const { storeName } = useSubscription();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border-4 border-amber-300 relative text-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label={t('close')}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Lock Icon */}
        <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-amber-700 shadow-inner mb-3">
          <Lock className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-black border border-amber-200 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>{language === 'ar' ? 'مُحْتَوَى مُمَيَّزٌ لِلْمُشْتَرِكِينَ' : 'Premium Content'}</span>
        </div>

        <h3 className="text-xl font-black text-slate-900 mb-1">
          {contentTitle
            ? (language === 'ar' ? `فَتْحُ: ${contentTitle}` : `Unlock: ${contentTitle}`)
            : (language === 'ar' ? 'فَتْحُ كَافَّةِ الدُّرُوسِ' : 'Unlock All Lessons')}
        </h3>

        <p className="text-xs md:text-sm font-bold text-slate-600 leading-relaxed max-w-xs mx-auto mb-5">
          {language === 'ar'
            ? 'الْمُسْتَوَى الْأَوَّلُ وَأَوَّلُ الدُّرُوسِ مَجَّانِيَّةٌ بِالْكَامِلِ! لِفَتْحِ جَمِيعِ الدُّرُوسِ، يُرْجَى اسْتِئْذَانُ وَلِيِّ الْأَمْرِ.'
            : 'Level 1 and starter lessons are 100% free! To unlock all advanced lessons, please ask a parent.'}
        </p>

        {/* Store trust indicator */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 mb-5 flex items-center justify-center gap-2 text-xs font-bold text-slate-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{storeName} • {language === 'ar' ? 'مَحْمِيٌّ بِبَوَّابَةِ الْوَالِدَيْنِ' : 'Protected by Parental Gate'}</span>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => {
              onClose();
              onOpenParentalGate();
            }}
            className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{language === 'ar' ? 'فَتْحُ الِاشْتِرَاكِ (لِلْكِبَارِ فَقَطْ)' : 'Unlock Premium (Parents Only)'}</span>
            {direction === 'rtl' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
          >
            {language === 'ar' ? 'الْمُتَابَعَةُ بِالْمُحْتَوَى الْمَجَّانِيِّ' : 'Continue with Free Lessons'}
          </button>
        </div>
      </div>
    </div>
  );
};
