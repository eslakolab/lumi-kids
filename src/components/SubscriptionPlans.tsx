import React, { useState } from 'react';
import { soundManager } from '../utils/audio';
import {
  Check,
  Sparkles,
  ShieldCheck,
  Award,
  ArrowLeft,
  ArrowRight,
  Lock,
  RotateCcw,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../context/LanguageContext';
import { useSubscription, STORE_SKUS } from '../context/SubscriptionContext';
import { PaymentCheckoutModal } from './PaymentCheckoutModal';
import { ParentalGateModal } from './ParentalGateModal';

interface SubscriptionPlansProps {
  speechRate: number;
  onBackToApp?: () => void;
}

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ speechRate, onBackToApp }) => {
  const { language, direction } = useLanguage();
  const {
    isSubscribed,
    activePlan,
    platform,
    storeName,
    sku,
    expirationDate,
    isVerifying,
    subscribe,
    activateSubscription,
    restorePurchases,
    cancelSubscription,
  } = useSubscription();

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCheckoutPlan, setSelectedCheckoutPlan] = useState<'monthly' | 'annual' | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isParentalGateOpen, setIsParentalGateOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const requireParentGate = (action: () => void) => {
    setPendingAction(() => action);
    setIsParentalGateOpen(true);
  };

  const handleParentalGateSuccess = () => {
    setIsParentalGateOpen(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleSubscribe = async (plan: 'monthly' | 'annual') => {
    setIsProcessing(true);
    const result = await subscribe(plan);
    setIsProcessing(false);

    if (result.success) {
      setNotification({ type: 'success', message: result.message });
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.55 },
      });
      soundManager.speak(result.message, language, speechRate);
    } else {
      setNotification({ type: 'error', message: result.message });
      soundManager.speak(result.message, language, speechRate);
    }

    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const handleRestore = async () => {
    setIsProcessing(true);
    const result = await restorePurchases();
    setIsProcessing(false);

    if (result.success) {
      setNotification({ type: 'success', message: result.message });
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
      });
      soundManager.speak(result.message, language, speechRate);
    } else {
      setNotification({ type: 'error', message: result.message });
      soundManager.speak(result.message, language, speechRate);
    }

    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const currentPlatformSkuMonthly =
    platform === 'android' ? STORE_SKUS.android.monthly : STORE_SKUS.ios.monthly;
  const currentPlatformSkuAnnual =
    platform === 'android' ? STORE_SKUS.android.annual : STORE_SKUS.ios.annual;

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-3 animate-fadeIn">
      {/* Top Header */}
      <div className="text-center space-y-2">
        {/* Active Store Identifier Banner */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-bold shadow-2xs">
          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          <span>
            {platform === 'android'
              ? 'متجر Google Play Billing (Android)'
              : platform === 'ios'
              ? 'متجر Apple In-App Purchases (iOS)'
              : 'متجر لومي السحابي (Web & PWA)'}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        <h1 className="text-2xl md:text-4xl font-black text-amber-950">
          {language === 'ar' ? 'خِطَطُ الِاشْتِرَاكِ وَفَتْحُ الْمُحْتَوَى' : 'Subscription Plans & Full Access'}
        </h1>

        <p className="text-xs md:text-sm text-slate-600 font-bold max-w-xl mx-auto leading-relaxed">
          {language === 'ar'
            ? 'تطبيق لومي مجاني للتنزيل مع أول ١٠ دروس مجاناً. اشترك لفتح كافة الدروس المتقدمة والقصص بدون إعلانات.'
            : 'Lumi is free to download with Level 1 lessons free forever. Subscribe to unlock all lessons ad-free.'}
        </p>

        {/* Parental Protection Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200">
          <Lock className="w-3.5 h-3.5 text-amber-600" />
          <span>
            {language === 'ar'
              ? 'مَحْمِيٌّ بِبَوَّابَةِ الْوَالِدَيْنِ • آمِنٌ 100% لِلْأَطْفَالِ'
              : 'Protected by Parental Gate • 100% COPPA Safe'}
          </span>
        </div>
      </div>

      {/* Active Subscriber Status Card */}
      {isSubscribed && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-5 md:p-6 text-white shadow-md relative overflow-hidden border-2 border-emerald-400">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 text-center sm:text-start">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-black text-white mb-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>{language === 'ar' ? 'اشْتِرَاكٌ مُمَيَّزٌ فَعَّالٌ' : 'Active Premium Subscription'}</span>
                </div>
                <h3 className="text-lg md:text-xl font-black">
                  {activePlan === 'annual'
                    ? (language === 'ar' ? 'الِاشْتِرَاكُ السَّنَوِيُّ (الْخِطَّةُ الْعَائِلِيَّةُ)' : 'Annual Family Pass')
                    : (language === 'ar' ? 'الِاشْتِرَاكُ الشَّهْرِيُّ' : 'Monthly Premium')}
                </h3>
                <p className="text-xs text-emerald-100 font-medium">
                  {language === 'ar'
                    ? `تَمَّ فَتْحُ كَافَّةِ الدُّرُوسِ وَالْأَقْسَامِ • صَالِحٌ حَتَّى: ${expirationDate || 'تَلْقَائِيًّا'}`
                    : `All lessons & modules unlocked • Renews on: ${expirationDate || 'Auto'}`}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowCancelConfirm(!showCancelConfirm)}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 text-white text-xs font-bold cursor-pointer transition-colors whitespace-nowrap"
            >
              {language === 'ar' ? 'إِدَارَةُ الِاشْتِرَاكِ / إِلْغَاء' : 'Manage / Cancel'}
            </button>
          </div>

          {showCancelConfirm && (
            <div className="mt-4 p-4 bg-black/30 backdrop-blur-md rounded-2xl border border-white/20 space-y-3 text-start">
              <p className="text-xs font-bold text-white">
                {language === 'ar'
                  ? 'هَلْ أَنْتَ مُتَأَكِّدٌ مِنْ رَغْبَتِكَ فِي إِلْغَاءِ الِاشْتِرَاكِ؟ سَتَفْقِدُ الْوُصُولَ لِلْمُحْتَوَى الْمُمَيَّزِ بَعْدَ انْتِهَاءِ الْفَتْرَةِ الْحَالِيَّةِ.'
                  : 'Are you sure you want to cancel your active subscription? You will revert to the free starter tier.'}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    cancelSubscription();
                    setShowCancelConfirm(false);
                    setNotification({
                      type: 'success',
                      message: language === 'ar' ? 'تم إلغاء الاشتراك والعودة للنسخة المجانية.' : 'Subscription cancelled.',
                    });
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl cursor-pointer"
                >
                  {language === 'ar' ? 'تَأْكِيدُ الإِلْغَاءِ' : 'Confirm Cancellation'}
                </button>
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="px-3 py-2 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  {language === 'ar' ? 'إِبْقَاءُ الِاشْتِرَاكِ' : 'Keep Active'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border-2 text-center font-black text-sm md:text-base shadow-sm animate-bounce flex items-center justify-center gap-2 ${
            notification.type === 'success'
              ? 'bg-emerald-100 border-emerald-400 text-emerald-950'
              : 'bg-red-100 border-red-400 text-red-950'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
        {/* Tier 1: Free Starter */}
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-black mb-3">
              {language === 'ar' ? 'الْبِدَايَةُ الْمَجَّانِيَّةُ' : 'Free Starter'}
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-1">
              {language === 'ar' ? 'الْمُسْتَوَى الأَوَّلُ' : 'Level 1 Free'}
            </h3>
            <p className="text-xs text-slate-500 font-bold mb-4">
              {language === 'ar' ? 'تَجْرِبَةُ التَّطْبِيقِ مَجَّانًا دَائِمًا' : 'Explore with free starter lessons'}
            </p>

            <div className="py-3 border-y border-slate-100 my-3 text-center">
              <div className="text-3xl font-black text-slate-900">$0</div>
              <div className="text-xs font-bold text-slate-500 mt-0.5">
                {language === 'ar' ? 'مَجَّانًا مَدَى الْحَيَاةِ' : 'Free Forever'}
              </div>
            </div>

            <ul className="space-y-2.5 mb-6 text-xs font-bold text-slate-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{language === 'ar' ? 'أَوَّلُ ١٠ حُرُوفٍ هِجَائِيَّةٍ بِالْحَرَكَاتِ' : 'First 10 alphabet letters'}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{language === 'ar' ? 'المستوى الأول من التهجئة والكلمات' : 'Level 1 spelling & vocabulary'}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{language === 'ar' ? 'القصة الأولى من القصص المصورة' : 'First realistic short story'}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{language === 'ar' ? 'مبادئ الحساب والألوان والحيوانات' : 'Introductory math & coloring'}</span>
              </li>
            </ul>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl text-center text-xs font-bold text-slate-500 border border-slate-200">
            {isSubscribed
              ? (language === 'ar' ? 'تَمَّتِ التَّرْقِيَةُ إِلَى الْمُمَيَّزِ' : 'Upgraded to Premium')
              : (language === 'ar' ? 'الْخِطَّةُ الْمُفَعَّلَةُ حَالِيًّا' : 'Currently Active Plan')}
          </div>
        </div>

        {/* Tier 2: Monthly Subscription */}
        <div className="bg-white rounded-3xl p-6 border-2 border-amber-300 shadow-sm flex flex-col justify-between relative">
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black mb-3">
              {language === 'ar' ? 'مُرُونَةٌ شَهْرِيَّةٌ' : 'Monthly Flexibility'}
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-1">
              {language === 'ar' ? 'الِاشْتِرَاكُ الشَّهْرِيُّ' : 'Monthly Premium'}
            </h3>
            <p className="text-xs text-slate-500 font-bold mb-4">
              {language === 'ar' ? 'فَتْحُ كَافَّةِ الدُّرُوسِ مَعَ إِمْكَانِيَّةِ الإِلْغَاءِ' : 'Cancel anytime in store'}
            </p>

            <div className="py-3 border-y border-slate-100 my-3 text-center">
              <div className="text-3xl font-black text-amber-950">$9.99</div>
              <div className="text-xs font-bold text-slate-500 mt-0.5">
                {language === 'ar' ? 'شَهْرِيًّا' : '/ Month'}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-1">
                SKU: {currentPlatformSkuMonthly}
              </div>
            </div>

            <ul className="space-y-2.5 mb-6 text-xs font-bold text-slate-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{language === 'ar' ? 'فَتْحُ كَافَّةِ الْحُرُوفِ الـ 28 بِالْحَرَكَاتِ' : 'All 28 letters unlocked'}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{language === 'ar' ? 'فَتْحُ جَمِيعِ كَلِمَاتِ وَمَرَاحِلِ التَّهْجِئَةِ' : 'All phonics & spelling levels'}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{language === 'ar' ? 'جَمِيعُ الْقِصَصِ الْمُصَوَّرَةِ وَتَسْمِيَةُ الْأَشْيَاءِ' : 'All interactive illustrated stories'}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{language === 'ar' ? 'خَالٍ تَمَامًا مِنَ الْإِعْلَانَاتِ لِلْمُشْتَرِكِينَ' : 'Zero advertisements guaranteed'}</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => {
              if (isSubscribed && activePlan === 'monthly') return;
              requireParentGate(() => setSelectedCheckoutPlan('monthly'));
            }}
            disabled={isProcessing}
            className={`w-full py-3.5 rounded-2xl font-black text-xs md:text-sm transition-all active:scale-95 cursor-pointer shadow-xs ${
              isSubscribed && activePlan === 'monthly'
                ? 'bg-emerald-600 text-white cursor-default'
                : 'bg-amber-500 hover:bg-amber-600 text-white'
            }`}
          >
            {isSubscribed && activePlan === 'monthly'
              ? (language === 'ar' ? '✓ اشْتِرَاكُكَ الْحَالِيُّ' : '✓ Current Plan')
              : (language === 'ar' ? 'اشْتَرِكْ شَهْرِيًّا ($9.99)' : 'Subscribe Monthly ($9.99)')}
          </button>
        </div>

        {/* Tier 3: Annual Subscription (Best Value) */}
        <div className="bg-white rounded-3xl p-6 border-3 border-amber-500 shadow-md flex flex-col justify-between relative ring-2 ring-amber-300">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-white font-black text-xs px-4 py-1 rounded-full shadow-sm whitespace-nowrap">
            {language === 'ar' ? 'تَوْفِيرٌ 50% • الأَفْضَلُ قِيمَةً ⭐' : 'Save 50% • Best Family Value ⭐'}
          </div>

          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black mb-3 mt-1">
              {language === 'ar' ? 'الْخِطَّةُ السَّنَوِيَّةُ الْعَائِلِيَّةُ' : 'Annual Family Pass'}
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-1">
              {language === 'ar' ? 'الِاشْتِرَاكُ السَّنَوِيُّ' : 'Annual Pass'}
            </h3>
            <p className="text-xs text-slate-500 font-bold mb-4">
              {language === 'ar' ? 'أَقَلُّ مِنْ 5$ شَهْرِيًّا مَعَ كَافَّةِ الْمُمَيِّزَاتِ' : 'Under $5/mo with all perks'}
            </p>

            <div className="py-3 border-y border-slate-100 my-3 text-center">
              <div className="text-3xl font-black text-amber-950">$59.99</div>
              <div className="text-xs font-bold text-emerald-600 mt-0.5">
                {language === 'ar' ? 'سَنَوِيًّا (وَفِّرْ 50% مُقَارَنَةً بِالشَّهْرِيِّ)' : 'Per Year (Save 50% vs Monthly)'}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-1">
                SKU: {currentPlatformSkuAnnual}
              </div>
            </div>

            <ul className="space-y-2.5 mb-6 text-xs font-bold text-slate-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{language === 'ar' ? 'فَتْحُ كَافَّةِ أَقْسَامِ التَّطْبِيقِ بِلَا اسْتِثْنَاءٍ' : '100% unlocked full platform'}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{language === 'ar' ? 'دَعْمُ حَتَّى 3 أَطْفَالٍ لِلْعَائِلَةِ الْوَاحِدَةِ' : 'Family sharing up to 3 children'}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{language === 'ar' ? 'اسْتِعَادَةُ الْمُشْتَرَيَاتِ عِنْدَ تَغْيِيرِ الْهَاتِفِ' : 'Instant restore across all devices'}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{language === 'ar' ? 'تَحْدِيثَاتٌ دَوْرِيَّةٌ لِلْقِصَصِ وَالْمُحْتَوَى' : 'Continuous updates & new stories'}</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => {
              if (isSubscribed && activePlan === 'annual') return;
              requireParentGate(() => setSelectedCheckoutPlan('annual'));
            }}
            disabled={isProcessing}
            className={`w-full py-3.5 rounded-2xl font-black text-xs md:text-sm transition-all active:scale-95 cursor-pointer shadow-md ${
              isSubscribed && activePlan === 'annual'
                ? 'bg-emerald-600 text-white cursor-default'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
            }`}
          >
            {isSubscribed && activePlan === 'annual'
              ? (language === 'ar' ? '✓ اشْتِرَاكُكَ الْحَالِيُّ' : '✓ Current Plan')
              : (language === 'ar' ? 'اشْتَرِكْ وَوَفِّرْ 50% ($59.99)' : 'Subscribe & Save 50% ($59.99)')}
          </button>
        </div>
      </div>

      {/* Google Play / App Store Mandatory Subscription Disclosure & Cancellation Box */}
      <div className="bg-amber-50/70 border-2 border-amber-300 rounded-3xl p-5 md:p-6 space-y-4 text-start shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-black text-slate-900 text-sm md:text-base">
              {language === 'ar'
                ? 'شُرُوطُ الِاشْتِرَاكِ، التَّجْدِيدُ التِّلْقَائِيُّ، وَطَرِيقَةُ الإِلْغَاءِ (Google Play Terms)'
                : 'Subscription Terms, Auto-Renewal & Cancellation Guide'}
            </h4>
            <p className="text-[11px] text-slate-600 font-bold">
              {language === 'ar'
                ? 'مُتَطَابِقٌ كُلِّيًّا مَعَ لَوَائِحِ سِيَاسَاتِ Google Play Billing وَحِمَايَةِ الْمُسْتَهْلِكِ'
                : 'Fully compliant with Google Play Billing & Consumer Transparency Policies'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-bold text-slate-700 pt-2 border-t border-amber-200">
          {/* Item 1: Pricing & Auto-Renewal */}
          <div className="bg-white/80 rounded-2xl p-3.5 border border-amber-200 space-y-1.5">
            <div className="text-amber-950 font-black flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>{language === 'ar' ? 'الْفَوْتَرَةُ وَالتَّجْدِيدُ' : 'Billing & Renewal'}</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {language === 'ar'
                ? 'يُخْصَمُ الْمَبْلَغُ ($9.99 شَهْرِيًّا أَوْ $59.99 سَنَوِيًّا) مِنْ حِسَابِ Google Play الْخَاصِّ بِكَ عِنْدَ تَأْكِيدِ الشِّرَاءِ. يَتَجَدَّدُ الِاشْتِرَاكُ تِلْقَائِيًّا مَا لَمْ يَتِمَّ إِيقَافُهُ قَبْلَ 24 سَاعَةً مِنْ نِهَايَةِ الْفَتْرَةِ الْحَالِيَّةِ.'
                : 'Payment ($9.99/mo or $59.99/yr) is charged to your Google Play account upon confirmation. Subscriptions auto-renew unless cancelled at least 24 hours before the current period ends.'}
            </p>
          </div>

          {/* Item 2: How to Cancel in Google Play */}
          <div className="bg-white/80 rounded-2xl p-3.5 border border-amber-200 space-y-1.5">
            <div className="text-amber-950 font-black flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>{language === 'ar' ? 'كَيْفِيَّةُ الإِلْغَاءِ بَسِيطَةٌ' : 'How to Cancel'}</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {language === 'ar'
                ? 'يُمْكِنُكَ الإِلْغَاءُ فِي أَيِّ وَقْتٍ: افْتَحْ مَتْجَرَ Google Play ← صُورَةُ حِسَابِكَ ← «الدَّفَعَاتُ وَالِاشْتِرَاكَاتُ» ← «الِاشْتِرَاكَاتُ» ← اخْتَرْ «لُومِي» ثُمَّ اضْغَطْ «إِلْغَاءُ الِاشْتِرَاكِ». سَتَحْتَفِظُ بِالْمُمَيِّزَاتِ حَتَّى نِهَايَةِ مُدَّتِكَ الْمَدْفُوعَةِ.'
                : 'Cancel anytime: Open Google Play Store → Profile Icon → Payments & subscriptions → Subscriptions → Select "Lumi" → Tap "Cancel subscription".'}
            </p>
          </div>

          {/* Item 3: Refunds & Security */}
          <div className="bg-white/80 rounded-2xl p-3.5 border border-amber-200 space-y-1.5">
            <div className="text-amber-950 font-black flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{language === 'ar' ? 'سِيَاسَةُ الاسْتِرْدَادِ' : 'Refund Policy'}</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {language === 'ar'
                ? 'تَخْضَعُ كَافَّةُ عَمَلِيَّاتِ الدَّفْعِ وَالِاسْتِرْدَادِ لِسِيَاسَاتِ Google Play الرَّسْمِيَّةِ. لَا نَقُومُ بِجَمْعِ أَيِّ بَيَانَاتٍ بَنْكِيَّةٍ شَخْصِيَّةٍ إِطْلَاقًا، حَيْثُ تَتِمُّ الْمُعَامَلَةُ عَبْرَ نِظَامِ Google الآمِنِ.'
                : 'All payments and refunds are governed by Google Play official policies. Lumi never stores credit card details.'}
            </p>
          </div>
        </div>

        {/* Direct Link to Google Play Subscriptions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <span className="text-[11px] text-slate-500 font-bold">
            {language === 'ar'
              ? 'الْمُعَرِّفَاتُ الرَّسْمِيَّةُ (Google Play SKUs): com.lumi.kids.subscription.monthly | com.lumi.kids.subscription.annual'
              : 'Official SKUs: com.lumi.kids.subscription.monthly | com.lumi.kids.subscription.annual'}
          </span>

          <a
            href="https://play.google.com/store/account/subscriptions"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition-all active:scale-95 shadow-2xs cursor-pointer"
          >
            <span>{language === 'ar' ? 'إِدَارَةُ اشْتِرَاكَاتِ Google Play' : 'Manage Google Play Subscriptions'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Restore Purchases & Store Verification Bar (MANDATORY for Apple & Google Play) */}
      <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-start">
          <div className="w-10 h-10 rounded-2xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-black text-slate-900 text-xs md:text-sm">
              {language === 'ar' ? 'اسْتِعَادَةُ الْمُشْتَرَيَاتِ (Restore Purchases)' : 'Restore Purchases'}
            </h4>
            <p className="text-[11px] text-slate-500 font-bold mt-0.5">
              {language === 'ar'
                ? 'هَلْ غَيَّرْتَ هَاتِفَكَ أَوْ أَعَدْتَ تَثْبِيتَ التَّطْبِيقِ؟ اضْغَطْ لِاسْتِعَادَةِ اشْتِرَاكِكَ السَّابِقِ تِلْقَائِيًّا.'
                : 'Changed devices or reinstalled? Restore your active subscription anytime.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleRestore}
          disabled={isProcessing}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-2xs shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
          <span>{language === 'ar' ? 'اسْتِعَادَةُ الْمُشْتَرَيَاتِ' : 'Restore Purchases'}</span>
        </button>
      </div>

      {/* Trust & Guarantee Strip */}
      <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 flex flex-col sm:flex-row items-center justify-around gap-4 text-center sm:text-start">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
          <div>
            <div className="text-xs md:text-sm font-black text-slate-900">
              {language === 'ar' ? 'نِظَامُ دَفْعٍ رَسْمِيٌّ وَآمِنٌ' : 'Official Secure Billing'}
            </div>
            <div className="text-[11px] text-slate-500">
              {platform === 'android'
                ? 'Google Play Billing API'
                : platform === 'ios'
                ? 'Apple StoreKit In-App Purchases'
                : '100% Family Safe & COPPA Certified'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Award className="w-6 h-6 text-amber-600 shrink-0" />
          <div>
            <div className="text-xs md:text-sm font-black text-slate-900">
              {language === 'ar' ? 'خَالٍ تَمَامًا مِنَ الْإِعْلَانَاتِ' : '100% Ad-Free Guarantee'}
            </div>
            <div className="text-[11px] text-slate-500">
              {language === 'ar' ? 'تَجْرِبَةٌ آمِنَةٌ وَهَادِئَةٌ لِلْأَطْفَالِ' : 'Calm, safe, and distraction-free'}
            </div>
          </div>
        </div>

        {onBackToApp && (
          <button
            onClick={onBackToApp}
            className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl font-bold text-xs md:text-sm cursor-pointer shadow-2xs"
          >
            <span>{language === 'ar' ? 'الْعَوْدَةُ لِلتَّعْلِيمِ' : 'Back to Learning'}</span>
            {direction === 'rtl' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Real Google Play & Card Checkout Flow */}
      {selectedCheckoutPlan && (
        <PaymentCheckoutModal
          isOpen={!!selectedCheckoutPlan}
          plan={selectedCheckoutPlan}
          onClose={() => setSelectedCheckoutPlan(null)}
          onSuccess={(orderId, plan, paymentMethod) => {
            activateSubscription(orderId, plan, paymentMethod);
            setNotification({
              type: 'success',
              message:
                language === 'ar'
                  ? `تم تأكيد الاشتراك عبر ${paymentMethod} بنجاح! رقم الإيصال: ${orderId}`
                  : `Subscription activated via ${paymentMethod}! Order: ${orderId}`,
            });
          }}
        />
      )}

      {/* Parental Gate Modal for Google Play Families Policy */}
      <ParentalGateModal
        isOpen={isParentalGateOpen}
        onSuccess={handleParentalGateSuccess}
        onClose={() => {
          setIsParentalGateOpen(false);
          setPendingAction(null);
        }}
      />
    </div>
  );
};
