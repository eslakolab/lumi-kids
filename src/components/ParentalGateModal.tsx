import React, { useState, useEffect } from 'react';
import { ShieldAlert, X, Check, Lock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { soundManager } from '../utils/audio';

interface ParentalGateModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onClose: () => void;
}

export const ParentalGateModal: React.FC<ParentalGateModalProps> = ({
  isOpen,
  onSuccess,
  onClose,
}) => {
  const { language, t } = useLanguage();
  const [num1, setNum1] = useState(7);
  const [num2, setNum2] = useState(8);
  const [operator, setOperator] = useState<'×' | '+'>('×');
  const [answerInput, setAnswerInput] = useState('');
  const [hasError, setHasError] = useState(false);

  // Generate a random adult-level challenge when opened
  const generateNewChallenge = () => {
    const isMult = Math.random() > 0.3;
    if (isMult) {
      const a = Math.floor(Math.random() * 5) + 6; // 6 to 10
      const b = Math.floor(Math.random() * 6) + 5; // 5 to 10
      setNum1(a);
      setNum2(b);
      setOperator('×');
    } else {
      const a = Math.floor(Math.random() * 40) + 25;
      const b = Math.floor(Math.random() * 40) + 25;
      setNum1(a);
      setNum2(b);
      setOperator('+');
    }
    setAnswerInput('');
    setHasError(false);
  };

  useEffect(() => {
    if (isOpen) {
      generateNewChallenge();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const correctAnswer = operator === '×' ? num1 * num2 : num1 + num2;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const parsed = parseInt(answerInput.trim(), 10);
    if (parsed === correctAnswer) {
      soundManager.playSuccessChime();
      onSuccess();
    } else {
      soundManager.playEncouragementChime();
      setHasError(true);
      generateNewChallenge();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border-4 border-amber-300 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label={t('close')}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="text-center space-y-2 mt-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-amber-700 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-800">
            {t('parentalGateTitle')}
          </h2>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>Google Play & App Store Safe</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
            {t('parentalGateNotice')}
          </p>
        </div>

        {/* Challenge Box */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center">
            <p className="text-xs font-bold text-slate-500 mb-2">
              {t('parentalGateQuestionPrompt')}
            </p>
            <div className="text-3xl font-black text-amber-600 tracking-wider font-mono">
              {num1} {operator} {num2} = ?
            </div>
          </div>

          <div>
            <input
              type="number"
              pattern="[0-9]*"
              inputMode="numeric"
              autoFocus
              value={answerInput}
              onChange={(e) => {
                setAnswerInput(e.target.value);
                setHasError(false);
              }}
              placeholder={language === 'ar' ? 'اكتب الناتج هنا...' : 'Type answer here...'}
              className="w-full text-center text-2xl font-bold py-3 px-4 rounded-xl border-2 border-amber-300 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-200 bg-amber-50/30 text-slate-900"
            />
            {hasError && (
              <p className="mt-2 text-xs font-bold text-red-500 text-center animate-bounce">
                {t('parentalGateError')}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              {t('parentalGateCancel')}
            </button>
            <button
              type="submit"
              disabled={!answerInput.trim()}
              className="flex-1 py-3 px-4 rounded-xl font-black text-sm text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{t('parentalGateSubmit')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
