import React, { useState } from 'react';
import { Sparkles, Home, CreditCard, ShieldCheck, UserCheck, Settings, Bell, Award, Users } from 'lucide-react';
import { ChildAvatar } from '../data/avatarData';
import { useLanguage } from '../context/LanguageContext';
import { useSubscription } from '../context/SubscriptionContext';
import { resolveAssetUrl } from '../utils/assetResolver';
import { useAuth } from '../context/AuthContext';
import { ParentalGateModal } from './ParentalGateModal';
import { PWAInstallButton } from './PWAInstallButton';

export type AppNavTab =
  | 'home'
  | 'stories'
  | 'words'
  | 'sentences'
  | 'letters'
  | 'spelling'
  | 'math'
  | 'animals'
  | 'chemistry'
  | 'coloring'
  | 'games'
  | 'focus'
  | 'plans'
  | 'avatar'
  | 'privacy'
  | 'admin'
  | 'parent';

interface HeaderNavProps {
  activeTab: AppNavTab;
  setActiveTab: (tab: AppNavTab) => void;
  currentAvatar?: ChildAvatar;
  childName?: string;
  onOpenAuth?: () => void;
  onOpenNotifications?: () => void;
  onOpenRewards?: () => void;
  unreadCount?: number;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeTab,
  setActiveTab,
  currentAvatar,
  childName,
  onOpenAuth,
  onOpenNotifications,
  onOpenRewards,
  unreadCount = 0,
}) => {
  const { language, toggleLanguage, t } = useLanguage();
  const { isSubscribed, activePlan } = useSubscription();
  const { user, isAuthenticated } = useAuth();
  const [isParentalGateOpen, setIsParentalGateOpen] = useState(false);

  // Handle clicking on commercial subscription plans (Guarded by Parental Gate for Google Play Families Policy)
  const handlePlansClick = () => {
    if (isSubscribed) {
      setActiveTab('plans');
    } else {
      setIsParentalGateOpen(true);
    }
  };

  const handleParentalGateSuccess = () => {
    setIsParentalGateOpen(false);
    setActiveTab('plans');
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 px-3 sm:px-4 py-2.5">
          {/* Zone 1: Brand Wordmark "لُومِي" / "Lumi" */}
          <div
            className="flex items-center gap-2 shrink-0 cursor-pointer group"
            onClick={() => setActiveTab('home')}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-2xs group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-2xl font-black text-amber-950 tracking-tight whitespace-nowrap">
              {t('appName')}
            </span>
          </div>

          {/* Zone 2: Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 text-sm font-bold text-slate-700">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'home'
                  ? 'bg-amber-100 text-amber-950 font-black'
                  : 'hover:text-amber-900 hover:bg-amber-50'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>{t('navHome')}</span>
            </button>

            {/* 1. الحروف الهجائية */}
            <button
              onClick={() => setActiveTab('letters')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'letters'
                  ? 'bg-amber-100 text-amber-950 font-black'
                  : 'hover:text-amber-900 hover:bg-amber-50'
              }`}
            >
              {t('navLetters')}
            </button>

            {/* 2. قسم التهجئة */}
            <button
              onClick={() => setActiveTab('spelling')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'spelling'
                  ? 'bg-amber-100 text-amber-950 font-black'
                  : 'hover:text-amber-900 hover:bg-amber-50'
              }`}
            >
              {t('navSpelling')}
            </button>

            {/* 3. الكلمات والجمل */}
            <button
              onClick={() => setActiveTab('words')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'words'
                  ? 'bg-amber-100 text-amber-950 font-black'
                  : 'hover:text-amber-900 hover:bg-amber-50'
              }`}
            >
              {t('navWords')}
            </button>

            <button
              onClick={() => setActiveTab('stories')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'stories'
                  ? 'bg-amber-100 text-amber-950 font-black'
                  : 'hover:text-amber-900 hover:bg-amber-50'
              }`}
            >
              {t('navStories')}
            </button>

            <button
              onClick={() => setActiveTab('math')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'math'
                  ? 'bg-amber-100 text-amber-950 font-black'
                  : 'hover:text-amber-900 hover:bg-amber-50'
              }`}
            >
              {t('navMath')}
            </button>

            <button
              onClick={() => setActiveTab('focus')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'focus'
                  ? 'bg-purple-100 text-purple-950 font-black'
                  : 'hover:text-purple-900 hover:bg-purple-50'
              }`}
            >
              {t('navFocus')}
            </button>

            <button
              onClick={() => setActiveTab('animals')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'animals'
                  ? 'bg-amber-100 text-amber-950 font-black'
                  : 'hover:text-amber-900 hover:bg-amber-50'
              }`}
            >
              {t('navScience')}
            </button>

            <button
              onClick={() => setActiveTab('chemistry')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'chemistry'
                  ? 'bg-amber-100 text-amber-950 font-black'
                  : 'hover:text-amber-900 hover:bg-amber-50'
              }`}
            >
              {t('navChemistry')}
            </button>

            <button
              onClick={() => setActiveTab('coloring')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'coloring'
                  ? 'bg-amber-100 text-amber-950 font-black'
                  : 'hover:text-amber-900 hover:bg-amber-50'
              }`}
            >
              {t('navColoring')}
            </button>

            <button
              onClick={() => setActiveTab('games')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'games'
                  ? 'bg-amber-100 text-amber-950 font-black'
                  : 'hover:text-amber-900 hover:bg-amber-50'
              }`}
            >
              {t('navGames')}
            </button>
          </nav>

          {/* Zone 3: Actions & Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* PWA Install Button */}
            <PWAInstallButton variant="header" />

            {/* Badges & Rewards Button */}
            <button
              onClick={onOpenRewards}
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl border border-amber-300 bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title="الشارات والأوسمة التعليمية"
            >
              <Award className="w-4 h-4 text-amber-600" />
              <span className="hidden xl:inline">الْأَوْسِمَة</span>
            </button>

            {/* Parent Portal Dashboard Button */}
            <button
              onClick={() => setActiveTab('parent')}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'parent'
                  ? 'bg-teal-700 text-white border-teal-800 shadow-2xs'
                  : 'bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-900'
              }`}
              title="لوحة متابعة ولي الأمر"
            >
              <Users className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden lg:inline">وَلِيُّ الْأَمْرِ</span>
            </button>

            {/* Notification Center Bell Button */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 sm:px-2.5 sm:py-1.5 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-amber-900 text-xs font-black transition-all cursor-pointer flex items-center gap-1.5"
              title="مركز الإشعارات والتنبيهات"
            >
              <Bell className="w-4 h-4 text-amber-600" />
              {unreadCount > 0 && (
                <span className="w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] flex items-center justify-center font-black animate-pulse">
                  {unreadCount}
                </span>
              )}
              <span className="hidden xl:inline">التَّنْبِيهَات</span>
            </button>

            {/* Cloud User Account & Sync Modal Button */}
            <button
              onClick={onOpenAuth}
              className="px-2.5 py-1.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-black transition-all cursor-pointer flex items-center gap-1.5"
              title="حساب الطفل والمزامنة السحابية"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">
                {isAuthenticated ? (user?.name?.split(' ')[0] || 'حِسَابِي') : 'تَسْجِيلُ الدُّخُولِ'}
              </span>
            </button>

            {/* Admin CMS Dashboard Button - Only shown to authenticated admins */}
            {user?.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-amber-600 text-white border-amber-700 shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                }`}
                title="لوحة تحكم المشرف وإدارة المحتوى"
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">لَوْحَةُ الْإِدَارَةِ</span>
              </button>
            )}

            {/* Child Safety & Store Compliance Hub - Opens dedicated Full Screen Page */}
            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'privacy'
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                  : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800'
              }`}
              title={t('navPrivacy')}
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden sm:inline">{t('navPrivacy')}</span>
            </button>

            {/* Child Avatar Profile Button */}
            <button
              onClick={() => setActiveTab('avatar')}
              className={`p-1 pl-2.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer border ${
                activeTab === 'avatar'
                  ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-300'
                  : 'bg-amber-50/80 hover:bg-amber-100 border-amber-200 shadow-2xs'
              }`}
              title={t('navAvatar')}
            >
              <div className="w-7 h-7 rounded-full overflow-hidden border border-white shadow-2xs bg-white shrink-0">
                <img
                  src={resolveAssetUrl(currentAvatar?.image || '/src/assets/images/avatar_boy_explorer_1793016699238.jpg')}
                  alt={currentAvatar?.name || 'أفاتار'}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-xs font-black text-amber-950 hidden md:inline">
                {childName || (language === 'ar' ? 'شَخْصِيَّتِي' : 'My Avatar')}
              </span>
            </button>

            {/* Premium Active Subscriber Badge */}
            {isSubscribed && (
              <div className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-black shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
                <span>{language === 'ar' ? 'مُشْتَرِكٌ مُمَيَّزٌ' : 'Premium Member'}</span>
              </div>
            )}

            {/* Subscription Plans Button (Guarded by Parental Gate for Store Compliance) */}
            <button
              onClick={handlePlansClick}
              className={`px-3 py-1.5 rounded-xl text-xs md:text-sm font-black transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'plans'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : isSubscribed
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-950 hover:bg-amber-100 border border-amber-300'
              }`}
            >
              <CreditCard className={`w-3.5 h-3.5 ${isSubscribed ? 'text-emerald-600' : 'text-amber-600'}`} />
              <span className="inline text-xs font-black">
                {isSubscribed
                  ? (language === 'ar' ? 'إِدَارَةُ الِاشْتِرَاكِ' : 'Subscription')
                  : (language === 'ar' ? 'بَاقَاتُ الِاشْتِرَاكِ' : 'Plans')}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Scrollable Horizontal Bar */}
        <div className="xl:hidden border-t border-amber-100 px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none bg-amber-50/40">
          {[
            { key: 'home', label: t('navHome') },
            { key: 'plans', label: '💳 بَاقَاتُ الِاشْتِرَاكِ' },
            { key: 'parent', label: '👨‍👧 وَلِيُّ الأَمْر' },
            ...(user?.role === 'admin' ? [{ key: 'admin' as const, label: '⚙️ لَوْحَةُ الإِدَارَة' }] : []),
            { key: 'privacy', label: t('navPrivacy') },
            { key: 'avatar', label: `🌟 ${t('navAvatar')}` },
            { key: 'letters', label: t('navLetters') },
            { key: 'spelling', label: t('navSpelling') },
            { key: 'words', label: t('navWords') },
            { key: 'stories', label: t('navStories') },
            { key: 'math', label: t('navMath') },
            { key: 'focus', label: t('navFocus') },
            { key: 'animals', label: t('navScience') },
            { key: 'chemistry', label: t('navChemistry') },
            { key: 'coloring', label: t('navColoring') },
            { key: 'games', label: t('navGames') },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => {
                if (item.key === 'plans') {
                  handlePlansClick();
                } else {
                  setActiveTab(item.key as AppNavTab);
                }
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                activeTab === item.key
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'bg-white text-slate-700 border border-amber-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {/* Parental Gate Modal */}
      <ParentalGateModal
        isOpen={isParentalGateOpen}
        onSuccess={handleParentalGateSuccess}
        onClose={() => setIsParentalGateOpen(false)}
      />
    </>
  );
};

