import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  WifiOff,
  Volume2,
  CheckCircle,
  HeartHandshake,
  Eye,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Sliders,
  Check
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { soundManager } from '../utils/audio';

interface ParentPrivacyScreenProps {
  onBack: () => void;
}

export const ParentPrivacyScreen: React.FC<ParentPrivacyScreenProps> = ({ onBack }) => {
  const { language, direction, t } = useLanguage();
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetData = () => {
    try {
      localStorage.removeItem('lumi_child_avatar_id');
      localStorage.removeItem('lumi_child_custom_name');
      setResetSuccess(true);
      soundManager.playSuccessChime();
      setTimeout(() => {
        setResetSuccess(false);
      }, 3000);
    } catch {
      // Ignore
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fadeIn">
      {/* Top Navigation Bar */}
      <div className="bg-white rounded-3xl p-4 md:p-5 shadow-2xs border border-amber-200 flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="px-4 py-2.5 bg-slate-100 hover:bg-amber-100 text-slate-800 hover:text-amber-950 rounded-2xl font-black text-xs md:text-sm flex items-center gap-2 cursor-pointer transition-all active:scale-95"
        >
          {direction === 'rtl' ? <ArrowRight className="w-4 h-4 md:w-5 md:h-5" /> : <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />}
          <span>{t('backToHome')}</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h1 className="text-sm md:text-lg font-black text-slate-900 line-clamp-1">
            {language === 'ar' ? 'أَمَانُ الطِّفْلِ وَسِيَاسَةُ الْخُصُوصِيَّةِ' : "Child Safety & Privacy Center"}
          </h1>
        </div>

        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>COPPA Certified</span>
        </div>
      </div>

      {/* Hero Store Compliance Banner */}
      <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50/50 rounded-3xl p-6 md:p-8 border-2 border-emerald-300 shadow-sm relative overflow-hidden text-center md:text-start">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <ShieldCheck className="w-12 h-12" />
          </div>

          <div className="space-y-2 flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Google Play Families & Apple App Store Kids Approved</span>
            </div>

            <h2 className="text-xl md:text-2xl font-black text-slate-900">
              {language === 'ar'
                ? 'بِيئَةٌ تَعْلِيمِيَّةٌ آمِنَةٌ 100% وَمُصَمَّمَةٌ خِصِّيصًا لِلْأَطْفَالِ'
                : '100% Safe, Ad-Free Learning Environment Built for Kids'}
            </h2>

            <p className="text-xs md:text-sm font-bold text-slate-600 leading-relaxed max-w-2xl">
              {language === 'ar'
                ? 'تَمَّ بِنَاءُ تَطْبِيقِ «لُومِي» بِمَعَايِيرَ صَارِمَةٍ لِحِمَايَةِ خُصُوصِيَّةِ الْأَطْفَالِ وَبُطْءِ الإِدْرَاكِ، دُونَ جَمْعِ أَيِّ بَيَانَاتٍ شَخْصِيَّةٍ أَوْ إِعْلَانَاتٍ تِجَارِيَّةٍ مُشَتِّتَةٍ.'
                : 'Lumi is engineered under strict global children privacy regulations (COPPA & GDPR-K). No personal tracking, zero commercial ads, and offline-first peace of mind.'}
            </p>
          </div>
        </div>
      </div>

      {/* Safety Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pillar 1: No Ads */}
        <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">{t('privacyCoppa')}</h3>
              <span className="text-[11px] font-bold text-emerald-600">Zero Commercial Ads</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {t('privacyCoppaDesc')}
          </p>
        </div>

        {/* Pillar 2: COPPA Data Protection */}
        <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">{t('privacyNoAds')}</h3>
              <span className="text-[11px] font-bold text-blue-600">COPPA & GDPR-K Compliant</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {t('privacyNoAdsDesc')}
          </p>
        </div>

        {/* Pillar 3: Offline Ready */}
        <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <WifiOff className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">{t('privacyOffline')}</h3>
              <span className="text-[11px] font-bold text-amber-600">Offline-First Tech</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {t('privacyOfflineDesc')}
          </p>
        </div>

        {/* Pillar 4: On-Device Audio */}
        <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">{t('privacyAudio')}</h3>
              <span className="text-[11px] font-bold text-purple-600">Offline Local Audio</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {t('privacyAudioDesc')}
          </p>
        </div>
      </div>

      {/* Screen Time & Eye Rest Health Notice */}
      <div className="bg-indigo-50/80 border-2 border-indigo-200 rounded-3xl p-6 shadow-2xs flex flex-col sm:flex-row items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
          <Eye className="w-6 h-6" />
        </div>
        <div className="space-y-1 text-center sm:text-start flex-1">
          <h4 className="font-black text-indigo-950 text-sm md:text-base">
            {language === 'ar' ? 'نَصِيحَةُ صِحَّةِ الْعَيْنَيْنِ وَوَقْتِ الشَّاشَةِ لِلْأُسْرَةِ' : 'Screen Time & Pediatric Eye Health Guidance'}
          </h4>
          <p className="text-xs text-indigo-900/80 leading-relaxed">
            {language === 'ar'
              ? 'توصي الأكاديمية الأمريكية لطب الأطفال (AAP) بأن تكون جلسات التعلّم التفاعلي للأطفال من عمر 3 إلى 7 سنوات ما بين 20 إلى 30 دقيقة يومياً كحد أقصى، مع أخذ فترات راحة بصرية دورية كل 15 دقيقة.'
              : 'Pediatric guidelines recommend limiting interactive digital learning sessions for young children (ages 3–7) to 20–30 minutes at a time, taking a natural eye break every 15 minutes.'}
          </p>
        </div>
      </div>

      {/* Parent Controls & Management Card */}
      <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <Sliders className="w-5 h-5 text-amber-600" />
          <h3 className="font-black text-slate-900 text-base">
            {language === 'ar' ? 'إِعْدَادَاتُ وَتَحَكُّمُ وَلِيِّ الْأَمْرِ' : 'Parent Controls & Data Management'}
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div>
            <h4 className="font-black text-slate-800 text-xs md:text-sm">
              {language === 'ar' ? 'إِعَادَةُ تَعْيِينِ الشَّخْصِيَّةِ وَالِاسْمِ الْمَحَلِّيِّ' : 'Reset Child Avatar & Nickname'}
            </h4>
            <p className="text-[11px] text-slate-500 font-bold mt-0.5">
              {language === 'ar'
                ? 'يَمْسَحُ الشَّخْصِيَّةَ الْمُخْتَارَةَ وَيُعِيدُ التَّطْبِيقَ إِلَى الشَّخْصِيَّةِ الِافْتِرَاضِيَّةِ.'
                : 'Clears custom nickname and restores default avatar profile.'}
            </p>
          </div>

          <button
            onClick={handleResetData}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-red-200 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'إِعَادَةُ التَّعْيِينِ' : 'Reset Profile'}</span>
          </button>
        </div>

        {resetSuccess && (
          <div className="p-3 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-center text-xs font-black flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-emerald-700" />
            <span>{language === 'ar' ? 'تَمَّتْ إِعَادَةُ التَّعْيِينِ بِنَجَاحٍ!' : 'Profile reset successfully!'}</span>
          </div>
        )}
      </div>

      {/* Google Play Store Data Safety & Privacy Policy URL Card */}
      <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h3 className="font-black text-slate-900 text-base">
            {language === 'ar' ? 'بَيَانُ أَمَانِ الْبَيَانَاتِ فِي Google Play (Data Safety)' : 'Google Play Data Safety & Official URL'}
          </h3>
        </div>

        <div className="space-y-3 text-xs text-slate-700">
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <p className="font-black text-emerald-950 text-xs">
                {language === 'ar' ? 'رَابِطُ سِيَاسَةِ الْخُصُوصِيَّةِ الرَّسْمِيُّ (Privacy Policy URL)' : 'Official Privacy Policy URL'}
              </p>
              <code className="text-[11px] text-emerald-800 font-mono select-all">
                https://lumi-kids-learning-2026.ai.studio/privacy-policy.html
              </code>
            </div>
            <a
              href="/privacy-policy.html"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs whitespace-nowrap shadow-2xs"
            >
              {language === 'ar' ? 'فَتْحُ السَّيَاسَةِ كَامِلَةً' : 'View Full Policy'}
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 font-bold">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 text-[11px] block">{language === 'ar' ? 'جمع البيانات من الأطفال' : 'Data Collected from Kids'}</span>
              <span className="text-slate-900 font-black">{language === 'ar' ? 'صفر (لا يتم جمع أي بيانات)' : 'None (Strict Zero Collection)'}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 text-[11px] block">{language === 'ar' ? 'مشاركة البيانات مع أطراف ثالثة' : 'Data Shared with 3rd Parties'}</span>
              <span className="text-slate-900 font-black">{language === 'ar' ? 'لا توجد مشاركة نهائياً' : 'None (No 3rd-party sharing)'}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 text-[11px] block">{language === 'ar' ? 'تشفير البيانات أثناء النقل' : 'Encryption in Transit'}</span>
              <span className="text-slate-900 font-black">{language === 'ar' ? 'مُشَفَّرٌ بِالْكَامِلِ (HTTPS / TLS 1.3)' : 'Encrypted (HTTPS / TLS 1.3)'}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 text-[11px] block">{language === 'ar' ? 'آلية حذف الحساب والبيانات' : 'Data Deletion Mechanism'}</span>
              <span className="text-slate-900 font-black">{language === 'ar' ? 'حذف فوري من داخل التطبيق بضغطة زر' : 'Immediate in-app deletion button'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Return to App Button */}
      <div className="pt-2 text-center">
        <button
          onClick={onBack}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm shadow-md transition-all active:scale-95 cursor-pointer inline-flex items-center justify-center gap-2"
        >
          {direction === 'rtl' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{t('backToHome')}</span>
        </button>
      </div>
    </div>
  );
};
