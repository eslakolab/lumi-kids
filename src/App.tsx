import { useState, useEffect } from 'react';
import {
  INITIAL_LETTERS,
  INITIAL_WORDS,
  INITIAL_SENTENCES,
  INITIAL_MATH_PROBLEMS,
} from './data/initialData';
import { HeaderNav, AppNavTab } from './components/HeaderNav';
import { HomeScreen } from './components/HomeScreen';
import { LettersModule } from './components/LettersModule';
import { WordsModule } from './components/WordsModule';
import { SentencesModule } from './components/SentencesModule';
import { MathModule } from './components/MathModule';
import { AnimalsModule } from './components/AnimalsModule';
import { ChemistryModule } from './components/ChemistryModule';
import { ColoringModule } from './components/ColoringModule';
import { BrainGamesModule } from './components/BrainGamesModule';
import { FocusModule } from './components/FocusModule';
import { SpellingModule } from './components/SpellingModule';
import { StoriesModule } from './components/StoriesModule';
import { SubscriptionPlans } from './components/SubscriptionPlans';
import { AvatarSelectScreen } from './components/AvatarSelectScreen';
import { ParentPrivacyScreen } from './components/ParentPrivacyScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { ParentDashboard } from './components/ParentDashboard';
import { RewardsAndBadgesModal } from './components/RewardsAndBadgesModal';
import { CertificateModal } from './components/CertificateModal';
import { AuthModal } from './components/AuthModal';
import { AdMobBanner } from './components/AdMobBanner';
import { NotificationCenter } from './components/NotificationCenter';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LockedContentModal } from './components/LockedContentModal';
import { ParentalGateModal } from './components/ParentalGateModal';
import { ChildAvatar, getSavedAvatar, getSavedChildName } from './data/avatarData';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { SubscriptionProvider, useSubscription } from './context/SubscriptionContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { notificationService } from './services/notifications';
import { analyticsService } from './services/analytics';
import { cacheManager } from './utils/cacheManager';
import { soundManager } from './utils/audio';
import { CertificateData } from './services/rewards';

function AppContent() {
  const [activeTab, setActiveTab] = useState<AppNavTab>('home');
  const [wordsSubTab, setWordsSubTab] = useState<'words' | 'sentences'>('words');
  const [currentAvatar, setCurrentAvatar] = useState<ChildAvatar>(getSavedAvatar);
  const [childName, setChildName] = useState<string>(getSavedChildName);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState<boolean>(false);
  const [isRewardsModalOpen, setIsRewardsModalOpen] = useState<boolean>(false);
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateData | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(() => notificationService.getUnreadCount());
  const [lockedModal, setLockedModal] = useState<{ isOpen: boolean; title: string }>({
    isOpen: false,
    title: '',
  });
  const [isParentalGateFromLockOpen, setIsParentalGateFromLockOpen] = useState(false);

  const { t, language } = useLanguage();
  const { isSubscribed } = useSubscription();
  const { progress } = useAuth();

  // Track screen views in Firebase Analytics & stop previous screen voice on navigation
  useEffect(() => {
    analyticsService.trackScreenView(activeTab);
    soundManager.stopSpeech();
  }, [activeTab, wordsSubTab]);

  // Subscribe to notification updates
  useEffect(() => {
    const unsub = notificationService.subscribe(() => {
      setUnreadCount(notificationService.getUnreadCount());
    });
    return unsub;
  }, []);

  // Speech rate configuration: relaxed and calm for comprehension
  const speechRate = 0.75;
  const fontSize = 'large';

  const handleOpenLocked = (title: string) => {
    setLockedModal({ isOpen: true, title });
  };

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/20 text-slate-900 selection:bg-amber-200">
      {/* Top Bar Navigation with i18n & Store Compliance */}
      <HeaderNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentAvatar={currentAvatar}
        childName={childName}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
        onOpenRewards={() => setIsRewardsModalOpen(true)}
        unreadCount={unreadCount}
      />

      {/* Main Content Area - Responsive, Safe-Area aware for iOS/Android */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-4 py-4 space-y-4">
        {/* Welcome Home Screen */}
        {activeTab === 'home' && (
          <HomeScreen
            onNavigate={(tab) => {
              if (tab === 'sentences') {
                setActiveTab('words');
                setWordsSubTab('sentences');
              } else {
                setActiveTab(tab);
                if (tab === 'words') setWordsSubTab('words');
              }
            }}
            speechRate={speechRate}
            currentAvatar={currentAvatar}
            childName={childName}
          />
        )}

        {/* Child Avatar Selection Screen */}
        {activeTab === 'avatar' && (
          <AvatarSelectScreen
            currentAvatar={currentAvatar}
            childName={childName}
            speechRate={speechRate}
            onSaveAvatar={(avatar, name) => {
              setCurrentAvatar(avatar);
              setChildName(name);
              setActiveTab('home');
            }}
            onBack={() => setActiveTab('home')}
          />
        )}

        {/* Realistic Short Stories Module with Interactive Object Naming */}
        {activeTab === 'stories' && (
          <StoriesModule
            speechRate={speechRate}
            onRequireSubscription={handleOpenLocked}
          />
        )}

        {/* Words and Sentences Module */}
        {activeTab === 'words' && (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setWordsSubTab('words')}
                className={`px-5 py-2 rounded-xl font-black text-sm cursor-pointer transition-all border ${
                  wordsSubTab === 'words'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                    : 'bg-white text-amber-950 border-amber-200 hover:bg-amber-50'
                }`}
              >
                {t('tabWordsWithDiacritics')}
              </button>

              <button
                onClick={() => setWordsSubTab('sentences')}
                className={`px-5 py-2 rounded-xl font-black text-sm cursor-pointer transition-all border ${
                  wordsSubTab === 'sentences'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                    : 'bg-white text-amber-950 border-amber-200 hover:bg-amber-50'
                }`}
              >
                {t('tabSentenceReading')}
              </button>
            </div>

            {wordsSubTab === 'words' ? (
              <WordsModule
                words={INITIAL_WORDS}
                speechRate={speechRate}
                fontSize={fontSize}
                onRequireSubscription={handleOpenLocked}
              />
            ) : (
              <SentencesModule
                sentences={INITIAL_SENTENCES}
                speechRate={speechRate}
                fontSize={fontSize}
                onRequireSubscription={handleOpenLocked}
              />
            )}
          </div>
        )}

        {/* الحروف الهجائية */}
        {activeTab === 'letters' && (
          <LettersModule
            letters={INITIAL_LETTERS}
            speechRate={speechRate}
            fontSize={fontSize}
            onRequireSubscription={handleOpenLocked}
          />
        )}

        {/* Spelling & Phonics Module */}
        {activeTab === 'spelling' && (
          <SpellingModule
            speechRate={speechRate}
            onRequireSubscription={handleOpenLocked}
          />
        )}

        {/* Mathematics Module (Unified Single Container) */}
        {activeTab === 'math' && (
          <MathModule
            mathProblems={INITIAL_MATH_PROBLEMS}
            speechRate={speechRate}
          />
        )}

        {/* Science & Animals Module */}
        {activeTab === 'animals' && (
          <AnimalsModule speechRate={speechRate} />
        )}

        {/* Simple Chemistry Module */}
        {activeTab === 'chemistry' && (
          <ChemistryModule speechRate={speechRate} />
        )}

        {/* Interactive Coloring Studio */}
        {activeTab === 'coloring' && (
          <ColoringModule speechRate={speechRate} />
        )}

        {/* Brain Games & Shapes Module */}
        {activeTab === 'games' && (
          <BrainGamesModule
            words={INITIAL_WORDS}
            speechRate={speechRate}
          />
        )}

        {/* Focus & Memory Module */}
        {activeTab === 'focus' && (
          <FocusModule speechRate={speechRate} />
        )}

        {/* Subscription & Pricing Plans (Protected by Parental Gate) */}
        {activeTab === 'plans' && (
          <SubscriptionPlans
            speechRate={speechRate}
            onBackToApp={() => setActiveTab('home')}
          />
        )}

        {/* Child Safety & Privacy Policy Screen (Full Screen Independent View) */}
        {activeTab === 'privacy' && (
          <ParentPrivacyScreen
            onBack={() => setActiveTab('home')}
          />
        )}

        {/* Admin CMS Dashboard & Cloud Publishing */}
        {activeTab === 'admin' && (
          <AdminDashboard
            onBack={() => setActiveTab('home')}
          />
        )}

        {/* Parent Portal Dashboard (Progress, Time Tracking, AI Recommendations & Multi-tracks) */}
        {activeTab === 'parent' && (
          <ParentDashboard
            onBack={() => setActiveTab('home')}
            onOpenPlans={() => setActiveTab('plans')}
            onOpenAdmin={() => setActiveTab('admin')}
            childName={childName}
            avatarUrl={currentAvatar.image}
            totalStars={progress.starsCount}
            completedLettersCount={progress.completedLetters.length}
            spellingScore={progress.spellingScore}
            onOpenCertificate={(c) => setSelectedCertificate(c)}
          />
        )}

        {/* Google AdMob Child-Safe Banner (Free users only, auto-removed for subscribers) */}
        <AdMobBanner onUpgradeClick={() => setIsParentalGateFromLockOpen(true)} />
      </main>

      {/* Clean Calm Footer with Safe-Area insets */}
      <footer className="mt-auto border-t border-amber-100 bg-white py-3 text-center text-xs text-slate-500 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-1.5">
          <p className="font-bold text-slate-700">
            {t('footerRights')}
          </p>
          <span className="text-slate-400 text-[11px] font-medium">
            {isSubscribed
              ? (language === 'ar' ? '⭐ عُضْوِيَّةٌ مُمَيَّزَةٌ مُفَعَّلَةٌ • خَالٍ مِنَ الْإِعْلَانَاتِ' : '⭐ Premium Active • 100% Ad-Free')
              : t('footerQuality')}
          </span>
        </div>
      </footer>

      {/* User Accounts & Multi-Device Sync Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Notification Center Modal */}
      <NotificationCenter
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        onNavigateToTab={(tab) => setActiveTab(tab as AppNavTab)}
      />

      {/* Child Rewards & Badges Gamification Modal */}
      <RewardsAndBadgesModal
        isOpen={isRewardsModalOpen}
        onClose={() => setIsRewardsModalOpen(false)}
        childName={childName}
        avatarUrl={currentAvatar.image}
        totalStars={progress.starsCount}
        onOpenCertificate={(c) => {
          setIsRewardsModalOpen(false);
          setSelectedCertificate(c);
        }}
      />

      {/* Printable Official Child Achievement Certificate Modal */}
      <CertificateModal
        isOpen={!!selectedCertificate}
        onClose={() => setSelectedCertificate(null)}
        certificate={selectedCertificate}
      />


      {/* Locked Content Modal for Children */}
      <LockedContentModal
        isOpen={lockedModal.isOpen}
        contentTitle={lockedModal.title}
        onClose={() => setLockedModal({ isOpen: false, title: '' })}
        onOpenParentalGate={() => {
          setLockedModal({ isOpen: false, title: '' });
          setIsParentalGateFromLockOpen(true);
        }}
      />

      {/* Parental Gate Modal Triggered when parent attempts to unlock subscription */}
      <ParentalGateModal
        isOpen={isParentalGateFromLockOpen}
        onSuccess={() => {
          setIsParentalGateFromLockOpen(false);
          setActiveTab('plans');
        }}
        onClose={() => setIsParentalGateFromLockOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <SubscriptionProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </SubscriptionProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}


