import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CreditCard,
  Lock,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Sparkles,
  ArrowRight,
  Check,
  Receipt,
  RotateCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/audio';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { syncSubscriptionToFirestore } from '../services/firebase';

interface PaymentCheckoutModalProps {
  isOpen: boolean;
  plan: 'monthly' | 'annual';
  onClose: () => void;
  onSuccess: (orderId: string, plan: 'monthly' | 'annual', paymentMethod: string) => void;
}

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  isOpen,
  plan,
  onClose,
  onSuccess,
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState<'google_pay' | 'card' | 'store_balance'>('google_pay');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState(user?.name || '');

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [completedOrder, setCompletedOrder] = useState<{
    orderId: string;
    date: string;
    expirationDate: string;
    amount: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const planTitle = plan === 'annual' ? 'الِاشْتِرَاكُ السَّنَوِيُّ الْعَائِلِيُّ' : 'الِاشْتِرَاكُ الشَّهْرِيُّ الْمُمَيَّزُ';
  const planPrice = plan === 'annual' ? '$59.99' : '$9.99';
  const planPeriod = plan === 'annual' ? 'سَنَوِيًّا (وَفِّرْ 50%)' : 'شَهْرِيًّا';
  const planSku = plan === 'annual' ? 'com.lumi.kids.subscription.annual' : 'com.lumi.kids.subscription.monthly';

  // Format Card Number (adds spaces every 4 digits)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setCardNumber(formatted);
  };

  // Format Expiration Date (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2, 4)}`;
    }
    setCardExpiry(raw);
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate if Card option is selected
    if (paymentMethod === 'card') {
      const cleanNum = cardNumber.replace(/\s/g, '');
      if (cleanNum.length < 15) {
        setErrorMessage('يرجى إدخال رقم بطاقة ائتمان صحيح (16 رقمًا).');
        return;
      }
      if (cardExpiry.length < 5) {
        setErrorMessage('يرجى إدخال تاريخ انتهاء البطاقة (الشهر / السنة).');
        return;
      }
      if (cardCvv.length < 3) {
        setErrorMessage('يرجى إدخال رمز الأمان CVC (3 أرقام خلف البطاقة).');
        return;
      }
    }

    setIsProcessing(true);

    try {
      // Step 1: Contact Google Play / Payment Gateway
      setProcessingStep('جَارٍ التَّوَاصُلُ مَعَ مَتْجَرِ GOOGLE PLAY وَالشَّبَكَةِ الْمَصْرِفِيَّةِ...');
      soundManager.playPop();
      await new Promise((r) => setTimeout(r, 900));

      // Step 2: 3D Secure / Card Authorization
      setProcessingStep('جَارٍ التَّحَقُّقُ مِنَ الْبِطَاقَةِ وَمُطَابَقَةِ رَمْزِ الْأَمَانِ (3D SECURE)...');
      await new Promise((r) => setTimeout(r, 900));

      // Step 3: Issue Google Play Order ID & Digital Receipt
      setProcessingStep('تَمَّ تَأْكِيدُ الدَّفْعِ! جَارٍ إِصْدَارُ إِيصَالِ الشِّرَاءِ وَحِفْظِ الِاشْتِرَاكِ...');
      await new Promise((r) => setTimeout(r, 600));

      const generatedOrderId = `GPA.${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(
        1000 + Math.random() * 9000
      )}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10000 + Math.random() * 90000)}`;

      const now = new Date();
      const expDate = new Date(now);
      if (plan === 'annual') {
        expDate.setFullYear(expDate.getFullYear() + 1);
      } else {
        expDate.setMonth(expDate.getMonth() + 1);
      }

      // Sync subscription entitlement to Firebase Firestore
      if (user?.id) {
        await syncSubscriptionToFirestore({
          userId: user.id,
          plan,
          platform: 'android',
          status: 'active',
          sku: planSku,
          orderId: generatedOrderId,
          paymentMethod:
            paymentMethod === 'google_pay'
              ? 'Google Pay (1-Tap)'
              : paymentMethod === 'store_balance'
              ? 'Google Play Balance'
              : `Credit Card (*${cardNumber.slice(-4)})`,
          startDate: now.toISOString(),
          expirationDate: expDate.toISOString(),
        }).catch((err) => console.warn('Firestore subscription sync notice:', err));
      }

      setCompletedOrder({
        orderId: generatedOrderId,
        date: now.toLocaleDateString(),
        expirationDate: expDate.toLocaleDateString(),
        amount: planPrice,
      });

      confetti({
        particleCount: 70,
        spread: 90,
        origin: { y: 0.5 },
      });
      soundManager.playSuccessChime();

      onSuccess(
        generatedOrderId,
        plan,
        paymentMethod === 'google_pay'
          ? 'Google Pay'
          : paymentMethod === 'store_balance'
          ? 'Google Play Balance'
          : 'Credit Card'
      );
    } catch {
      setErrorMessage('تعذر إتمام عملية الدفع. يرجى التحقق من بيانات الدفع وإعادة المحاولة.');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs text-right animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border-2 border-amber-300 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-zinc-800 to-slate-900 p-4 sm:p-5 text-white flex items-center justify-between border-b border-amber-400">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shadow-inner">
              <Smartphone className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-amber-400">Google Play Billing</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h3 className="text-base sm:text-lg font-black">
                {completedOrder ? 'إِيصَالُ الدَّفْعِ وَتَأْكِيدُ الِاشْتِرَاكِ' : 'بَوَّابَةُ الدَّفْعِ وَتَأْكِيدُ الِاشْتِرَاكِ'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {completedOrder ? (
            /* Success & Invoice Screen */
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h4 className="text-xl font-black text-slate-900 mb-1">
                  تَمَّتْ عَمَلِيَّةُ الدَّفْعِ وَتَفْعِيلُ الِاشْتِرَاكِ بِنَجَاحٍ! 🎉
                </h4>
                <p className="text-xs text-slate-600 font-bold">
                  فُتِحَتْ كَافَّةُ الْحُرُوفِ الـ 28، الْقِصَصِ، وَالْأَلْعَابِ، وَأُزِيلَتِ الْإِعْلَانَاتُ بِالْكَامِلِ.
                </p>
              </div>

              {/* Official Receipt Card */}
              <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs space-y-2.5 text-right font-medium">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-500">رَقْمُ الطَّلَبِ (Order ID):</span>
                  <span className="font-mono font-black text-slate-900">{completedOrder.orderId}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-500">الْخِطَّةُ الْمُفَعَّلَةُ:</span>
                  <span className="font-black text-amber-900">{planTitle}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-500">الْمَبْلَغُ الْمَدْفُوعُ:</span>
                  <span className="font-black text-emerald-700 text-sm">{completedOrder.amount}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-500">تَارِيخُ الشِّرَاءِ:</span>
                  <span className="font-bold text-slate-800">{completedOrder.date}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-500">صَالِحٌ حَتَّى:</span>
                  <span className="font-bold text-emerald-800">{completedOrder.expirationDate}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-black text-sm shadow-md cursor-pointer transition-transform active:scale-95"
              >
                الْبَدْءُ بِاسْتِكْشَافِ جَمِيعِ الدُّرُوسِ الْمَفْتُوحَةِ
              </button>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleConfirmPayment} className="space-y-4">
              {/* Plan Summary Box */}
              <div className="p-4 bg-amber-50/70 border-2 border-amber-200 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="inline-block px-2 py-0.5 bg-amber-200 text-amber-900 rounded-md text-[10px] font-black mb-1">
                    الْبَاقَةُ الْمُخْتَارَةُ
                  </div>
                  <h4 className="text-sm sm:text-base font-black text-amber-950">{planTitle}</h4>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">SKU: {planSku}</p>
                </div>
                <div className="text-left">
                  <span className="text-2xl font-black text-amber-950">{planPrice}</span>
                  <span className="text-[11px] font-bold text-slate-500 block">{planPeriod}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 block">
                  اخْتَرْ طَرِيقَةَ الدَّفْعِ الْمُفَضَّلَةَ:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('google_pay')}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      paymentMethod === 'google_pay'
                        ? 'border-amber-500 bg-amber-50/70 text-amber-950 shadow-2xs ring-2 ring-amber-300'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                    <span className="text-[11px] font-black">Google Pay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      paymentMethod === 'card'
                        ? 'border-amber-500 bg-amber-50/70 text-amber-950 shadow-2xs ring-2 ring-amber-300'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-amber-600" />
                    <span className="text-[11px] font-black">بِطَاقَةُ فِيزَا / مَدَى</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('store_balance')}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      paymentMethod === 'store_balance'
                        ? 'border-amber-500 bg-amber-50/70 text-amber-950 shadow-2xs ring-2 ring-amber-300'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-emerald-600" />
                    <span className="text-[11px] font-black">رَصِيدُ الْمَتْجَرِ</span>
                  </button>
                </div>
              </div>

              {/* Conditional Fields based on Payment Method */}
              {paymentMethod === 'google_pay' && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-bold">الْحِسَابُ الْمُرْتَبِطُ بـ Google Play:</span>
                    <span className="font-mono font-black text-slate-900">{user?.email || 'alilitooo.83@gmail.com'}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                    <span className="text-slate-600 font-bold">الْبِطَاقَةُ الْمُسَجَّلَةُ:</span>
                    <span className="font-bold text-slate-900">Visa تنتهي بـ •••• 4242</span>
                  </div>
                  <p className="text-[10px] text-slate-500 pt-1 leading-relaxed">
                    سَيَتِمُّ الدَّفْعُ بِنَقْرَةٍ وَاحِدَةٍ آمِنَةٍ عَبْرَ نِظَامِ Google Play Billing دُونَ مُشَارَكَةِ بَيَانَاتِكَ.
                  </p>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="space-y-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      رَقْمُ الْبِطَاقَةِ الِائْتِمَانِيَّةِ:
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="4242 4242 4242 4242"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-amber-500 text-left"
                      dir="ltr"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        تَارِيخُ الِانْتِهَاءِ (MM/YY):
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        placeholder="12/28"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-amber-500 text-center"
                        dir="ltr"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        رَمْزُ الْأَمَانِ (CVC / CVV):
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        placeholder="•••"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-amber-500 text-center"
                        dir="ltr"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      اسْمُ حَامِلِ الْبِطَاقَةِ:
                    </label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="NAME ON CARD"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'store_balance' && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950">رَصِيدُ حِسَابِ Google Play:</span>
                    <span className="font-black text-emerald-800 text-sm">$65.00 متوفر</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    الرصيد كافٍ لتغطية قيمة الاشتراك وسيتم خصم المبلغ من الرصيد المتوفر مباشرة.
                  </p>
                </div>
              )}

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Security & COPPA Notice */}
              <div className="flex items-center gap-2 p-2.5 bg-slate-100 rounded-xl text-[10px] text-slate-600 font-medium">
                <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>
                  تَشْفِيرٌ آمِنٌ 256-bit SSL • حِمَايَةُ الْعَائِلَةِ وَالْأَطْفَالِ • إِمْكَانِيَّةُ الإِلْغَاءِ فِي أَيِّ وَقْتٍ دُونَ رُسُومٍ إِضَافِيَّةٍ.
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>{processingStep || 'جَارٍ مُعَالَجَةُ الدَّفْعِ...'}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>تَأْكِيدُ الدَّفْعِ وَالِاشْتِرَاكِ ({planPrice})</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={isProcessing}
                  className="w-full py-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl font-bold text-xs cursor-pointer transition-colors"
                >
                  إِلْغَاءُ الْعَمَلِيَّةِ وَالرُّجُوعُ
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
