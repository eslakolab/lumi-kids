import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { resolveAssetUrl } from '../utils/assetResolver';
import {
  X,
  Mail,
  Lock,
  User,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  LogOut,
  Award,
  Star,
  Trash2,
  ArrowRight,
  Key,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'register' | 'recover' | 'google' | 'apple';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    user,
    isAuthenticated,
    isLoading,
    progress,
    isSyncing,
    lastSyncMessage,
    registeredAccounts,
    loginWithGoogle,
    loginWithApple,
    loginWithEmail,
    registerWithEmail,
    recoverPassword,
    logout,
    deleteAccountAndData,
    syncProgressNow,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');

  // Google / Apple interactive fields
  const [socialEmail, setSocialEmail] = useState('');
  const [socialName, setSocialName] = useState('');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  if (!isOpen) return null;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (mode === 'login') {
      const res = await loginWithEmail(email, password);
      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    } else if (mode === 'register') {
      if (password !== confirmPassword) {
        setFeedback({ type: 'error', message: 'كلمتا المرور غير متطابقتين. يُرجى إعادة كتابتها بدقة.' });
        return;
      }
      if (password.length < 6) {
        setFeedback({ type: 'error', message: 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.' });
        return;
      }
      const res = await registerWithEmail(email, password, name);
      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    } else if (mode === 'recover') {
      const res = await recoverPassword(email);
      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    }
  };

  const handleGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!socialEmail.trim() || !socialEmail.includes('@')) {
      setFeedback({ type: 'error', message: 'يرجى إدخال عنوان بريد Google (Gmail) صحيح.' });
      return;
    }
    const res = await loginWithGoogle(socialEmail, socialName);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setMode('login');
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleAppleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!socialEmail.trim() || !socialEmail.includes('@')) {
      setFeedback({ type: 'error', message: 'يرجى إدخال بريد Apple ID صحيح.' });
      return;
    }
    const res = await loginWithApple(socialEmail, socialName);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setMode('login');
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const existingGoogleAccounts = registeredAccounts.filter((a) => a.provider === 'google');
  const existingAppleAccounts = registeredAccounts.filter((a) => a.provider === 'apple');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border-2 border-amber-200 overflow-hidden text-right animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black">
                {isAuthenticated ? 'حِسَابُ الطِّفْلِ وَالْعَائِلَةِ' : 'تَسْجِيلُ الدُّخُولِ وَالْمُزَامَنَةُ'}
              </h3>
              <p className="text-xs text-amber-100">
                حِفْظُ التَّقَدُّمِ وَمُزَامَنَتُهُ بَيْنَ جَمِيعِ الْأَجْهِزَةِ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          {feedback && (
            <div
              className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {lastSyncMessage && (
            <div className="p-3 bg-amber-50 text-amber-900 border border-amber-200 rounded-2xl text-xs font-bold flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 text-amber-600 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{lastSyncMessage}</span>
            </div>
          )}

          {isAuthenticated && user ? (
            /* Logged in state */
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-amber-50/60 rounded-2xl border border-amber-200">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-amber-200 border-2 border-white shadow-2xs shrink-0 flex items-center justify-center text-xl font-black text-amber-800">
                  {user.avatarUrl ? (
                    <img src={resolveAssetUrl(user.avatarUrl)} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0)
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-black text-amber-950">{user.name}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                      مُفَعَّلٌ ✓
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">{user.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md">
                    مُرْتَبِطٌ بـ: {user.provider === 'google' ? 'Google Account' : user.provider === 'apple' ? 'Apple ID' : 'البريد الإلكتروني'}
                  </span>
                </div>
              </div>

              {/* Progress Summary */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-xs text-slate-500 block mb-1">النُّجُومُ الْمُكْتَسَبَة</span>
                  <div className="flex items-center justify-center gap-1 text-amber-600 font-black text-xl">
                    <Star className="w-5 h-5 fill-amber-400" />
                    <span>{progress.starsCount}</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-xs text-slate-500 block mb-1">الْحُرُوفُ الْمُتْقَنَة</span>
                  <div className="flex items-center justify-center gap-1 text-emerald-600 font-black text-xl">
                    <Award className="w-5 h-5" />
                    <span>{progress.completedLetters.length}</span>
                  </div>
                </div>
              </div>

              {/* Sync Button */}
              <button
                onClick={syncProgressNow}
                disabled={isSyncing}
                className="w-full py-3 bg-amber-100 hover:bg-amber-200 text-amber-950 font-black rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 text-amber-700 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'جَارٍ الْمُزَامَنَةُ...' : 'مُزَامَنَةُ التَّقَدُّمِ الْآنَ مَعَ السَّحَابَة'}</span>
              </button>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                {/* Sign out */}
                <button
                  onClick={logout}
                  className="flex-1 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>تَسْجِيلُ الْخُرُوجِ</span>
                </button>

                {/* Google Play Mandatory Account & Data Deletion */}
                <button
                  onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                  className="flex-1 py-2.5 text-rose-600 hover:bg-rose-50 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-rose-500" />
                  <span>حَذْفُ الْحِسَابِ نِهَائِيًّا</span>
                </button>
              </div>

              {showDeleteConfirm && (
                <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl text-xs space-y-2.5">
                  <p className="font-black text-rose-950 text-sm">
                    هَلْ أَنْتَ مُتَأَكِّدٌ مِنْ حَذْفِ الْحِسَابِ كُلِّيًّا؟
                  </p>
                  <p className="text-xs text-rose-800 leading-relaxed">
                    سَيَتِمُّ حَذْفُ حِسَابِكَ («{user.email}») وَجَمِيعِ سِجِلَّاتِ النُّجُومِ وَالْحُرُوفِ مِنْ قَاعِدَةِ الْبَيَانَاتِ نِهَائِيًّا وَلَنْ تَتَمَكَّنَ مِنَ الدُّخُولِ بِهِ مُجَدَّدًا إِلَّا بِإِنْشَاءِ حِسَابٍ جَدِيد.
                  </p>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={async () => {
                        const res = await deleteAccountAndData();
                        setFeedback({ type: res.success ? 'success' : 'error', message: res.message });
                        setShowDeleteConfirm(false);
                      }}
                      className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-xs cursor-pointer shadow-xs active:scale-95 transition-transform"
                    >
                      تَأْكِيدُ الْحَذْفِ النِّهَائِيِّ
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-xs cursor-pointer"
                    >
                      إِلْغَاء
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : mode === 'google' ? (
            /* Interactive Google Sign-In Form */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>الرُّجُوعُ</span>
                </button>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-slate-700">تَسْجِيلُ الدُّخُولِ بِحِسَابِ Google</span>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                </div>
              </div>

              {existingGoogleAccounts.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 block">
                    الْحِسَابَاتُ الْمُسَجَّلَةُ سَابِقًا عَلَى هَذَا الْجِهَازِ:
                  </span>
                  {existingGoogleAccounts.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => loginWithGoogle(acc.email, acc.name)}
                      className="w-full p-2.5 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-xl flex items-center justify-between text-xs font-bold transition-colors cursor-pointer"
                    >
                      <span className="text-amber-800 font-black">مُتَابَعَةٌ كَـ {acc.name}</span>
                      <span className="text-slate-500 font-mono text-[11px]">{acc.email}</span>
                    </button>
                  ))}
                </div>
              )}

              <form onSubmit={handleGoogleSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    عُنْوَانُ بَرِيدِ Google (Gmail):
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={socialEmail}
                      onChange={(e) => setSocialEmail(e.target.value)}
                      placeholder="parent@gmail.com"
                      className="w-full pl-3 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-amber-500"
                      required
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    اسْمُ وَلِيِّ الْأَمْرِ أَوِ الطِّفْلِ:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={socialName}
                      onChange={(e) => setSocialName(e.target.value)}
                      placeholder="مَثَلًا: أَبُو أَحْمَد"
                      className="w-full pl-3 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-amber-500"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-white hover:bg-slate-50 border-2 border-slate-300 text-slate-800 rounded-xl font-black text-sm shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all disabled:opacity-50"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                  <span>{isLoading ? 'جَارٍ الْمُصَادَقَةُ...' : 'مُتَابَعَةٌ وَتَسْجِيلُ الدُّخُولِ بِـ Google'}</span>
                </button>
              </form>
            </div>
          ) : mode === 'apple' ? (
            /* Interactive Apple Sign-In Form */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>الرُّجُوعُ</span>
                </button>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-slate-700">تَسْجِيلُ الدُّخُولِ بِـ Apple ID</span>
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.69-7.85-12-14.42-6-9.13-10.74-19.38-14.23-30.75-3.48-11.37-5.23-22.18-5.23-32.43 0-15.11 3.91-27.42 11.73-36.93 7.82-9.51 17.5-14.34 29.04-14.5 4.35 0 9.38 1.14 15.11 3.42 5.72 2.28 9.53 3.49 11.42 3.63 1.52-.27 5.48-1.54 11.88-3.81 6.4-2.28 11.73-3.23 16-2.86 12.29.98 22.17 5.48 29.62 13.51-10.76 6.52-16.03 15.54-15.82 27.06.22 9.13 3.69 16.73 10.43 22.82 6.74 6.08 14.67 9.67 23.8 10.76-2.17 6.74-4.89 13.26-8.15 19.57zM119.22 33.37c0-7.39 2.66-14.4 7.99-21.03 5.33-6.63 12.01-11.08 20.05-13.34.65 1.52.98 3.15.98 4.89 0 7.39-2.77 14.4-8.31 21.03-5.54 6.63-12.28 10.98-20.21 13.04-.11-1.52-.5-3.04-.5-4.59z" />
                  </svg>
                </div>
              </div>

              {existingAppleAccounts.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 block">
                    حِسَابَاتُ Apple الْمُسَجَّلَةُ سَابِقًا:
                  </span>
                  {existingAppleAccounts.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => loginWithApple(acc.email, acc.name)}
                      className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between text-xs font-bold transition-colors cursor-pointer"
                    >
                      <span className="text-zinc-900 font-black">مُتَابَعَةٌ كَـ {acc.name}</span>
                      <span className="text-slate-500 font-mono text-[11px]">{acc.email}</span>
                    </button>
                  ))}
                </div>
              )}

              <form onSubmit={handleAppleSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    بَرِيدُ Apple ID (iCloud):
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={socialEmail}
                      onChange={(e) => setSocialEmail(e.target.value)}
                      placeholder="parent@icloud.com"
                      className="w-full pl-3 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-zinc-800"
                      required
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    الِاسْمُ:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={socialName}
                      onChange={(e) => setSocialName(e.target.value)}
                      placeholder="مَثَلًا: أُمُّ سَارَة"
                      className="w-full pl-3 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-zinc-800"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-black hover:bg-zinc-800 text-white rounded-xl font-black text-sm shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all disabled:opacity-50"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.69-7.85-12-14.42-6-9.13-10.74-19.38-14.23-30.75-3.48-11.37-5.23-22.18-5.23-32.43 0-15.11 3.91-27.42 11.73-36.93 7.82-9.51 17.5-14.34 29.04-14.5 4.35 0 9.38 1.14 15.11 3.42 5.72 2.28 9.53 3.49 11.42 3.63 1.52-.27 5.48-1.54 11.88-3.81 6.4-2.28 11.73-3.23 16-2.86 12.29.98 22.17 5.48 29.62 13.51-10.76 6.52-16.03 15.54-15.82 27.06.22 9.13 3.69 16.73 10.43 22.82 6.74 6.08 14.67 9.67 23.8 10.76-2.17 6.74-4.89 13.26-8.15 19.57zM119.22 33.37c0-7.39 2.66-14.4 7.99-21.03 5.33-6.63 12.01-11.08 20.05-13.34.65 1.52.98 3.15.98 4.89 0 7.39-2.77 14.4-8.31 21.03-5.54 6.63-12.28 10.98-20.21 13.04-.11-1.52-.5-3.04-.5-4.59z" />
                  </svg>
                  <span>{isLoading ? 'جَارٍ الْمُصَادَقَةُ...' : 'مُتَابَعَةٌ وَتَسْجِيلُ الدُّخُولِ بِـ Apple'}</span>
                </button>
              </form>
            </div>
          ) : (
            /* Unauthenticated Standard Form (Login, Register, Social Buttons) */
            <div className="space-y-4">
              {/* Tab Selector: Login vs Register */}
              <div className="flex bg-slate-100 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setFeedback(null);
                  }}
                  className={`flex-1 py-2 text-xs font-black rounded-xl cursor-pointer transition-all ${
                    mode === 'login'
                      ? 'bg-white text-amber-950 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  تَسْجِيلُ الدُّخُولِ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setFeedback(null);
                  }}
                  className={`flex-1 py-2 text-xs font-black rounded-xl cursor-pointer transition-all ${
                    mode === 'register'
                      ? 'bg-white text-amber-950 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  إِنْشَاءُ حِسَابٍ جَدِيدٍ
                </button>
              </div>

              {/* 1-Click Social Sign-in Buttons */}
              <div className="space-y-2">
                {/* Google Sign-in Trigger */}
                <button
                  type="button"
                  onClick={() => {
                    setSocialEmail('');
                    setSocialName('');
                    setMode('google');
                    setFeedback(null);
                  }}
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 text-slate-800 rounded-2xl font-black text-sm flex items-center justify-center gap-3 cursor-pointer shadow-2xs transition-all active:scale-98 disabled:opacity-50"
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
                  <span>مُتَابَعَةٌ بِاسْتِخْدَامِ Google</span>
                </button>

                {/* Apple Sign-in Trigger */}
                <button
                  type="button"
                  onClick={() => {
                    setSocialEmail('');
                    setSocialName('');
                    setMode('apple');
                    setFeedback(null);
                  }}
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-black hover:bg-zinc-800 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 cursor-pointer shadow-2xs transition-all active:scale-98 disabled:opacity-50"
                >
                  <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.69-7.85-12-14.42-6-9.13-10.74-19.38-14.23-30.75-3.48-11.37-5.23-22.18-5.23-32.43 0-15.11 3.91-27.42 11.73-36.93 7.82-9.51 17.5-14.34 29.04-14.5 4.35 0 9.38 1.14 15.11 3.42 5.72 2.28 9.53 3.49 11.42 3.63 1.52-.27 5.48-1.54 11.88-3.81 6.4-2.28 11.73-3.23 16-2.86 12.29.98 22.17 5.48 29.62 13.51-10.76 6.52-16.03 15.54-15.82 27.06.22 9.13 3.69 16.73 10.43 22.82 6.74 6.08 14.67 9.67 23.8 10.76-2.17 6.74-4.89 13.26-8.15 19.57zM119.22 33.37c0-7.39 2.66-14.4 7.99-21.03 5.33-6.63 12.01-11.08 20.05-13.34.65 1.52.98 3.15.98 4.89 0 7.39-2.77 14.4-8.31 21.03-5.54 6.63-12.28 10.98-20.21 13.04-.11-1.52-.5-3.04-.5-4.59z" />
                  </svg>
                  <span>مُتَابَعَةٌ بِاسْتِخْدَامِ Apple ID</span>
                </button>
              </div>

              <div className="flex items-center my-3">
                <div className="flex-1 border-t border-slate-200" />
                <span className="px-3 text-xs text-slate-400 font-bold">أَوْ بِالْبَرِيدِ وَكَلِمَةِ الْمُرُورِ</span>
                <div className="flex-1 border-t border-slate-200" />
              </div>

              {/* Email Form */}
              <form onSubmit={handleEmailSubmit} className="space-y-3">
                {mode === 'register' && (
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      اسْمُ وَلِيِّ الْأَمْرِ أَوِ الطِّفْلِ:
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="مَثَلًا: أَحْمَد عَبْدُ الله"
                        className="w-full pl-3 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-amber-500"
                        required
                      />
                      <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    الْبَرِيدُ الْإِلِكْتَرُونِيُّ:
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="parent@example.com"
                      className="w-full pl-3 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-amber-500"
                      required
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  </div>
                </div>

                {mode !== 'recover' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">كَلِمَةُ الْمُرُورِ:</label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => {
                            setMode('recover');
                            setFeedback(null);
                          }}
                          className="text-[11px] font-bold text-amber-600 hover:text-amber-700 cursor-pointer"
                        >
                          نَسِيتَ كَلِمَةَ الْمُرُورِ؟
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-3 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-amber-500"
                        required
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    </div>
                  </div>
                )}

                {mode === 'register' && (
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      تَأْكِيدُ كَلِمَةِ الْمُرُورِ:
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-3 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-amber-500"
                        required
                      />
                      <Key className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-black text-sm shadow-xs cursor-pointer active:scale-98 transition-all disabled:opacity-50"
                >
                  {isLoading
                    ? 'جَارٍ الْمُعَالَجَةُ...'
                    : mode === 'login'
                    ? 'تَسْجِيلُ الدُّخُولِ'
                    : mode === 'register'
                    ? 'إِنْشَاءُ الْحِسَابِ وَالْبَدْءُ'
                    : 'إِرْسَالُ رَابِطِ الِاسْتِعَادَةِ'}
                </button>
              </form>

              {/* Mode switch */}
              <div className="text-center pt-2">
                {mode === 'login' ? (
                  <p className="text-xs text-slate-600">
                    لَيْسَ لَدَيْكَ حِسَابٌ؟{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('register');
                        setFeedback(null);
                      }}
                      className="text-amber-600 font-bold hover:underline cursor-pointer"
                    >
                      إِنْشَاءُ حِسَابٍ جَدِيدٍ
                    </button>
                  </p>
                ) : mode === 'register' ? (
                  <p className="text-xs text-slate-600">
                    لَدَيْكَ حِسَابٌ بِالْفِعْلِ؟{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setFeedback(null);
                      }}
                      className="text-amber-600 font-bold hover:underline cursor-pointer"
                    >
                      تَسْجِيلُ الدُّخُولِ
                    </button>
                  </p>
                ) : (
                  <p className="text-xs text-slate-600">
                    تَذَكَّرْتَ كَلِمَةَ الْمُرُورِ؟{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setFeedback(null);
                      }}
                      className="text-amber-600 font-bold hover:underline cursor-pointer"
                    >
                      الرُّجُوعُ لِتَسْجِيلِ الدُّخُولِ
                    </button>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
