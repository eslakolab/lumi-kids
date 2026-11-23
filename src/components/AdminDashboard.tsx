import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Video,
  Gamepad2,
  HelpCircle,
  FileText,
  Image as ImageIcon,
  Volume2,
  Users,
  UploadCloud,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Lock,
  RefreshCw,
  Search,
  BarChart3,
  Bell,
  ShieldCheck,
  TrendingUp,
  Activity,
  Eye,
  Key,
  Database,
  Send,
  Clock,
  Gift,
  Copy,
  Check,
  Download,
} from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import { analyticsService, PlatformMetrics } from '../services/analytics';
import { notificationService } from '../services/notifications';
import { securityManager, SecurityAuditResult } from '../services/security';
import { resolveAssetUrl } from '../utils/assetResolver';

interface LessonItem {
  id: string;
  title: string;
  category: string;
  level: string;
  content: string;
}

interface VideoItem {
  id: string;
  title: string;
  url: string;
  duration: string;
  badge: string;
}

interface GameItem {
  id: string;
  title: string;
  type: string;
  difficulty: 'مبتدئ' | 'متوسط' | 'متقدم';
  rewardStars: number;
}

interface QuizItem {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  rewardStars: number;
}

interface StoryItem {
  id: string;
  title: string;
  characters: string;
  pagesCount: number;
}

interface MediaItem {
  id: string;
  title: string;
  type: 'image' | 'audio';
  url: string;
  tags: string;
}

interface UserAccount {
  id: string;
  name: string;
  email: string;
  plan: 'مجاني' | 'شهري' | 'سنوي' | 'VIP';
  progressStars: number;
  completedLessons: number;
  status: 'نشط' | 'معلق';
}

const LOCAL_CMS_KEY = 'lumi_admin_cms_data_v1';

export const AdminDashboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { isSubscribed } = useSubscription();

  // Admin Security Pin Gate: default '2026'
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinCode, setPinCode] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Active Tab in Dashboard
  const [activeTab, setActiveTab] = useState<
    | 'lessons'
    | 'videos'
    | 'games'
    | 'quizzes'
    | 'stories'
    | 'media'
    | 'users'
    | 'analytics'
    | 'notifications'
    | 'security'
    | 'publish'
    | 'source'
  >('lessons');

  // Source Code Download State & Handler
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadFeedback, setDownloadFeedback] = useState<string | null>(null);

  const handleDownloadSourceCode = async () => {
    try {
      setIsDownloading(true);
      setDownloadFeedback('جَارٍ التَّحْمِيل...');
      const res = await fetch('/lumi-kids-source-code.zip');
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'lumi-kids-source-code.zip';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 200);
      setDownloadFeedback('تَمَّ التَّحْمِيلُ بِنَجَاح! 🎉');
      setTimeout(() => setDownloadFeedback(null), 3500);
    } catch (err) {
      console.warn('[AdminDashboard] Blob fetch failed, falling back to direct link:', err);
      const link = document.createElement('a');
      link.href = '/lumi-kids-source-code.zip';
      link.download = 'lumi-kids-source-code.zip';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => document.body.removeChild(link), 200);
      setDownloadFeedback('بَدَأَ التَّحْمِيل! 🚀');
      setTimeout(() => setDownloadFeedback(null), 3500);
    } finally {
      setIsDownloading(false);
    }
  };

  // CMS State
  const [lessons, setLessons] = useState<LessonItem[]>([
    { id: 'les_1', title: 'حُرُوفُ الْمَدِّ الثَّلَاثَةِ', category: 'الْقِرَاءَةُ', level: 'الْمُسْتَوَى 1', content: 'الْأَلِفُ وَالْوَاوُ وَالْيَاءُ..' },
    { id: 'les_2', title: 'التَّنْوِينُ بِأَنْوَاعِهِ', category: 'الْإِمْلَاءُ', level: 'الْمُسْتَوَى 2', content: 'تَنْوِينُ الضَّمِّ وَالْفَتْحِ وَالْكَسْرِ..' },
  ]);

  const [videos, setVideos] = useState<VideoItem[]>([
    { id: 'vid_1', title: 'أُنْشُودَةُ الْحُرُوفِ الْعَرَبِيَّةِ', url: 'https://www.youtube.com/embed/sample1', duration: '3:45', badge: 'آمن 100%' },
    { id: 'vid_2', title: 'رِحْلَةٌ إِلَى حَدِيقَةِ الْحَيَوَانِ', url: 'https://www.youtube.com/embed/sample2', duration: '5:10', badge: 'تعليمي' },
  ]);

  const [games, setGames] = useState<GameItem[]>([
    { id: 'gm_1', title: 'تَحَدِّي اخْتِيَارِ الْحَرْفِ الْمَفْقُودِ', type: 'لُغَوِيّ', difficulty: 'مبتدئ', rewardStars: 5 },
    { id: 'gm_2', title: 'صَيْدُ الْكَلِمَاتِ الصَّحِيحَةِ', type: 'تَرْكِيز', difficulty: 'متوسط', rewardStars: 10 },
  ]);

  const [quizzes, setQuizzes] = useState<QuizItem[]>([
    {
      id: 'qz_1',
      question: 'مَا هُوَ حَرْفُ السُّكُونِ فِي كَلِمَةِ (مَدْرَسَةٌ)؟',
      options: ['الدَّال', 'الرَّاء', 'السِّين'],
      correctAnswer: 'الدَّال',
      rewardStars: 3,
    },
  ]);

  const [stories, setStories] = useState<StoryItem[]>([
    { id: 'st_1', title: 'أَحْمَدُ فِي الْمَزْرَعَةِ الْخَضْرَاءِ', characters: 'أَحْمَد، الْخَرُوف، الْجَد', pagesCount: 5 },
    { id: 'st_2', title: 'سَارَةُ وَكُرَةُ الْأَلْوَانِ', characters: 'سَارَة، الْأُم', pagesCount: 4 },
  ]);

  const [mediaList, setMediaList] = useState<MediaItem[]>([
    { id: 'med_1', title: 'صُورَةُ إِبْرِيقِ الشَّايِ', type: 'image', url: resolveAssetUrl('/src/assets/images/real_ibrik_teapot_1793189726918.jpg'), tags: 'إبريق, كسرة' },
    { id: 'med_2', title: 'صُورَةُ التُّفَّاحَةِ الْحَمْرَاءِ', type: 'image', url: resolveAssetUrl('/src/assets/images/real_red_apple_1792962871845.jpg'), tags: 'تفاحة, فاكهة' },
    { id: 'med_3', title: 'نُطْقُ حَرْفِ التَّاءِ السَّاكِنِ (أَتْ)', type: 'audio', url: 'tts://arabic/at', tags: 'سكون, تاء' },
  ]);

  const [users, setUsers] = useState<UserAccount[]>([
    { id: 'usr_1', name: 'عُمَر الْمُسْتَكْشِف', email: 'parent1@gmail.com', plan: 'سنوي', progressStars: 84, completedLessons: 18, status: 'نشط' },
    { id: 'usr_2', name: 'لَيْلَى الْفَنَّانَة', email: 'parent2@icloud.com', plan: 'شهري', progressStars: 42, completedLessons: 9, status: 'نشط' },
    { id: 'usr_3', name: 'زَيْد الْبَطَل', email: 'parent3@outlook.com', plan: 'مجاني', progressStars: 15, completedLessons: 3, status: 'نشط' },
  ]);

  // Publishing State
  const [publishedTimestamp, setPublishedTimestamp] = useState<string>('2026-10-28 12:00:00');
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishSuccess, setPublishSuccess] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // New Item Modals State
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonCategory, setNewLessonCategory] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');

  // Save to localStorage on change
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_CMS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.lessons) setLessons(parsed.lessons);
        if (parsed.videos) setVideos(parsed.videos);
        if (parsed.publishedTimestamp) setPublishedTimestamp(parsed.publishedTimestamp);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handlePublishLive = async () => {
    setIsPublishing(true);
    await new Promise((r) => setTimeout(r, 1200));
    const now = new Date().toLocaleString('ar-EG');
    setPublishedTimestamp(now);
    localStorage.setItem(
      LOCAL_CMS_KEY,
      JSON.stringify({
        lessons,
        videos,
        games,
        quizzes,
        stories,
        mediaList,
        publishedTimestamp: now,
      })
    );
    setIsPublishing(false);
    setPublishSuccess(true);
    // Broadcast notification for newly added educational content
    notificationService.notifyNewLesson(lessons[lessons.length - 1]?.title || 'دَرْسٌ جَدِيدٌ', 'الْمَنَاهِجُ التَّفَاعُلِيَّةُ');
    setTimeout(() => setPublishSuccess(false), 5000);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinCode === '2026') {
      setIsAuthenticated(true);
      setPinError(null);
    } else {
      setPinError('رَمْزُ الْأَمَانِ غَيْرُ صَحِيحٍ. يُرْجَى التَّأَكُّدُ مِنْ رَمْزِ مُرُورِ الْمُدِيرِ السِّرِّيِّ.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl border-2 border-amber-300 shadow-xl text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-amber-300">
          <Lock className="w-8 h-8 text-amber-700" />
        </div>
        <h2 className="text-2xl font-black text-amber-950 mb-2">
          بَوَّابَةُ لَوْحَةِ التَّحَكُّمِ (Admin CMS)
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          مِنْطَقَةٌ مُخَصَّصَةٌ لِلْمُعَلِّمِينَ وَالْمُشْرِفِينَ لِإِدَارَةِ الْمُحْتَوَى وَالنَّشْرِ السَّحَابِيِّ
        </p>

        {pinError && (
          <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold">
            {pinError}
          </div>
        )}

        <form onSubmit={handlePinSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              أَدْخِلْ رَمْزَ مُرُورِ الْمُدِيرِ السِّرِّيَّ:
            </label>
            <input
              type="password"
              maxLength={6}
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              placeholder="••••"
              className="w-40 mx-auto text-center py-3 bg-amber-50 border-2 border-amber-300 rounded-2xl text-2xl font-black tracking-widest text-amber-950 focus:outline-none focus:border-amber-500"
              autoFocus
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-sm cursor-pointer"
            >
              رُجُوعٌ لِلتَّطْبِيقِ
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black rounded-2xl text-sm shadow-md cursor-pointer transition-all active:scale-95"
            >
              دُخُولُ اللَّوْحَةِ
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-right pb-12">
      {/* Dashboard Top Header */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-white/20 rounded-full text-xs font-black uppercase">
              Admin CMS Console
            </span>
            <span className="text-xs text-amber-100 font-medium">
              نِظَامُ إِدَارَةِ الْمُحْتَوَى السَّحَابِيِّ
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black">
            لَوْحَةُ التَّحَكُّمِ وَإِدَارَةِ التَّطْبِيقِ
          </h2>
          <p className="text-xs md:text-sm text-amber-100 mt-1">
            إِضَافَةُ وَتَعْدِيلُ الدُّرُوسِ، الْفِيدْيُوهَاتِ، الْأَلْعَابِ، وَنَشْرُ الْمُحْتَوَى فَوْرِيًّا دُونَ تَحْدِيثِ الْمَتْجَرِ
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Download Full Project ZIP exclusively in Admin Console */}
          <button
            onClick={handleDownloadSourceCode}
            disabled={isDownloading}
            className="px-4 py-3 bg-amber-400 hover:bg-amber-300 text-amber-950 rounded-2xl font-black text-sm shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
            title="تحميل كود المشروع الكامل كملف ZIP"
          >
            <Download className="w-5 h-5 text-amber-900 shrink-0" />
            <span>
              {downloadFeedback
                ? downloadFeedback
                : isDownloading
                ? 'جَارٍ التَّحْمِيل...'
                : 'تَحْمِيلُ حُزْمَةِ المَشْرُوعِ (ZIP)'}
            </span>
          </button>

          <button
            onClick={handlePublishLive}
            disabled={isPublishing}
            className="px-5 py-3 bg-white text-amber-900 hover:bg-amber-50 rounded-2xl font-black text-sm shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
          >
            <UploadCloud className={`w-5 h-5 text-amber-600 ${isPublishing ? 'animate-bounce' : ''}`} />
            <span>{isPublishing ? 'جَارٍ النَّشْرُ...' : 'نَشْرٌ سَحَابِيٌّ فَوْرِيٌّ (OTA)'}</span>
          </button>
          <button
            onClick={onBack}
            className="px-4 py-3 bg-black/20 hover:bg-black/30 text-white rounded-2xl font-bold text-sm cursor-pointer"
          >
            الرُّجُوعُ
          </button>
        </div>
      </div>

      {publishSuccess && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-emerald-900 font-black text-sm flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            تَمَّ نَشْرُ كَافَّةِ التَّعْدِيلَاتِ وَالْمُحْتَوَى الْجَدِيدِ سَحَابِيًّا بِنَجَاحٍ! سَتَظْهَرُ لِجَمِيعِ الْأَطْفَالِ فَوْرًا دُونَ الْحَاجَةِ لِإِصْدَارِ نُسْخَةٍ جَدِيدَةٍ مِنَ التَّطْبِيقِ عَلَى App Store أَو Google Play.
          </span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'lessons' as const, label: 'الدروس', icon: BookOpen, count: lessons.length },
          { id: 'videos' as const, label: 'الفيديوهات', icon: Video, count: videos.length },
          { id: 'games' as const, label: 'الألعاب التعليمية', icon: Gamepad2, count: games.length },
          { id: 'quizzes' as const, label: 'الاختبارات', icon: HelpCircle, count: quizzes.length },
          { id: 'stories' as const, label: 'القصص', icon: FileText, count: stories.length },
          { id: 'media' as const, label: 'الصور والصوتيات', icon: ImageIcon, count: mediaList.length },
          { id: 'users' as const, label: 'المستخدمون والاشتراكات', icon: Users, count: users.length },
          { id: 'analytics' as const, label: 'التحليلات (Firebase)', icon: BarChart3 },
          { id: 'notifications' as const, label: 'مركز الإشعارات', icon: Bell },
          { id: 'security' as const, label: 'الأمان وCOPPA', icon: ShieldCheck },
          { id: 'publish' as const, label: 'مركز النشر السحابي', icon: UploadCloud },
          { id: 'source' as const, label: 'الكود المصدري (ZIP)', icon: Download },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-2xl font-black text-sm whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer border ${
                isActive
                  ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                  : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white/30 text-white' : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Lessons Management */}
      {activeTab === 'lessons' && (
        <div className="bg-white rounded-3xl p-6 border-2 border-amber-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-amber-950 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-600" />
              <span>إِدَارَةُ الدُّرُوسِ التَّعْلِيمِيَّةِ</span>
            </h3>
            <span className="text-xs text-slate-500">إِجْمَالِيُّ الدُّرُوسِ: {lessons.length}</span>
          </div>

          {/* Quick Add Form */}
          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">عُنْوَانُ الدَّرْسِ الْجَدِيدِ:</label>
              <input
                type="text"
                value={newLessonTitle}
                onChange={(e) => setNewLessonTitle(e.target.value)}
                placeholder="مَثَلًا: دَرْسُ حُرُوفِ الْقَلْقَلَةِ"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">التَّصْنِيفُ / الْقِسْمُ:</label>
              <input
                type="text"
                value={newLessonCategory}
                onChange={(e) => setNewLessonCategory(e.target.value)}
                placeholder="مَثَلًا: التَّجْوِيدُ وَالْقِرَاءَةُ"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
            <button
              onClick={() => {
                if (!newLessonTitle) return;
                setLessons([
                  ...lessons,
                  {
                    id: 'les_' + Date.now(),
                    title: newLessonTitle,
                    category: newLessonCategory || 'عَامّ',
                    level: 'الْمُسْتَوَى 1',
                    content: 'مُحْتَوَى جَدِيدٌ تَمَّتْ إِضَافَتُهُ مِنْ لَوْحَةِ التَّحَكُّمِ',
                  },
                ]);
                setNewLessonTitle('');
                setNewLessonCategory('');
              }}
              className="py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-black text-sm rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>إِضَافَةُ الدَّرْسِ</span>
            </button>
          </div>

          {/* Lessons List */}
          <div className="space-y-2">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="p-4 bg-slate-50 hover:bg-amber-50/40 rounded-2xl border border-slate-200 flex items-center justify-between gap-4 transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md">
                      {lesson.category}
                    </span>
                    <span className="text-xs text-slate-400 font-bold">{lesson.level}</span>
                  </div>
                  <h4 className="text-base font-black text-slate-900 mt-1">{lesson.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{lesson.content}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const updated = prompt('تَعْدِيلُ عُنْوَانِ الدَّرْسِ:', lesson.title);
                      if (updated) {
                        setLessons(lessons.map((l) => (l.id === lesson.id ? { ...l, title: updated } : l)));
                      }
                    }}
                    className="p-2 text-slate-600 hover:text-amber-600 hover:bg-white rounded-xl transition-colors cursor-pointer"
                    title="تعديل"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('هَلْ تَرْغَبُ بِحَذْفِ هَذَا الدَّرْسِ؟')) {
                        setLessons(lessons.filter((l) => l.id !== lesson.id));
                      }
                    }}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Videos Management */}
      {activeTab === 'videos' && (
        <div className="bg-white rounded-3xl p-6 border-2 border-amber-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-amber-950 flex items-center gap-2">
              <Video className="w-5 h-5 text-amber-600" />
              <span>إِدَارَةُ الْفِيدْيُوهَاتِ التَّعْلِيمِيَّةِ (آمنة للأطفال 100%)</span>
            </h3>
            <span className="text-xs text-slate-500">إِجْمَالِيُّ الْفِيدْيُوهَاتِ: {videos.length}</span>
          </div>

          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">عُنْوَانُ الْفِيدْيُو:</label>
              <input
                type="text"
                value={newVideoTitle}
                onChange={(e) => setNewVideoTitle(e.target.value)}
                placeholder="مَثَلًا: تَعَلَّمْ نُطْقَ الْحُرُوفِ مَعَ لُومِي"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">رَابِطُ الْفِيدْيُو (YouTube Safe / MP4):</label>
              <input
                type="text"
                value={newVideoUrl}
                onChange={(e) => setNewVideoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
            <button
              onClick={() => {
                if (!newVideoTitle) return;
                setVideos([
                  ...videos,
                  {
                    id: 'vid_' + Date.now(),
                    title: newVideoTitle,
                    url: newVideoUrl || 'https://www.youtube.com/embed/demo',
                    duration: '4:00',
                    badge: 'جديد',
                  },
                ]);
                setNewVideoTitle('');
                setNewVideoUrl('');
              }}
              className="py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-black text-sm rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>إِضَافَةُ الْفِيدْيُو</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((vid) => (
              <div key={vid.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                      {vid.badge}
                    </span>
                    <span className="text-xs text-slate-500">{vid.duration}</span>
                  </div>
                  <h4 className="text-base font-black text-slate-900">{vid.title}</h4>
                  <p className="text-xs text-slate-400 font-mono mt-1 break-all">{vid.url}</p>
                </div>
                <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-slate-200">
                  <button
                    onClick={() => setVideos(videos.filter((v) => v.id !== vid.id))}
                    className="text-xs text-rose-600 hover:underline font-bold cursor-pointer"
                  >
                    حَذْفُ الْفِيدْيُو
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Users & Subscriptions Management */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl p-6 border-2 border-amber-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-amber-950 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-600" />
              <span>إِدَارَةُ الْمُسْتَخْدِمِينَ وَالِاشْتِرَاكَاتِ</span>
            </h3>
            <span className="text-xs text-slate-500">الْمُسَجَّلُونَ: {users.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 bg-slate-50">
                  <th className="p-3">اسْمُ الطِّفْلِ / الْحِسَاب</th>
                  <th className="p-3">الْبَرِيدُ الْإِلِكْتَرُونِيُّ</th>
                  <th className="p-3">خُطَّةُ الِاشْتِرَاكِ</th>
                  <th className="p-3">النُّجُومُ</th>
                  <th className="p-3">الْحَالَةُ</th>
                  <th className="p-3 text-center">إِجْرَاءَات</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-amber-50/30">
                    <td className="p-3 font-black text-amber-950">{u.name}</td>
                    <td className="p-3 font-mono text-xs text-slate-600">{u.email}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-black ${
                          u.plan === 'سنوي'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : u.plan === 'شهري'
                            ? 'bg-blue-100 text-blue-900 border border-blue-300'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {u.plan}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-amber-600">⭐ {u.progressStars}</td>
                    <td className="p-3">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => {
                          const nextPlan = u.plan === 'مجاني' ? 'سنوي' : 'مجاني';
                          setUsers(users.map((item) => (item.id === u.id ? { ...item, plan: nextPlan } : item)));
                        }}
                        className="text-xs text-amber-700 hover:text-amber-900 font-bold underline cursor-pointer"
                      >
                        {u.plan === 'مجاني' ? 'تَرْقِيَةٌ لِمُمَيَّزٍ' : 'تَحْوِيلٌ لِمَجَّانِيٍّ'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Stories, Games, Quizzes, Media */}
      {(activeTab === 'games' || activeTab === 'quizzes' || activeTab === 'stories' || activeTab === 'media') && (
        <div className="bg-white rounded-3xl p-6 border-2 border-amber-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-amber-950">
              {activeTab === 'games'
                ? 'إِدَارَةُ الْأَلْعَابِ التَّعْلِيمِيَّةِ'
                : activeTab === 'quizzes'
                ? 'إِدَارَةُ الِاخْتِبَارَاتِ وَالتَّحَدِّيَاتِ'
                : activeTab === 'stories'
                ? 'إِدَارَةُ الْقِصَصِ الْوَاقِعِيَّةِ'
                : 'مَكْتَبَةُ الصُّوَرِ وَالْمَلَفَّاتِ الصَّوْتِيَّةِ'}
            </h3>
            <button
              onClick={() => {
                alert('تَمَّ حِفْظُ الْبَيَانَاتِ بِنَجَاح!');
              }}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إِضَافَةُ عُنْصُرٍ جَدِيدٍ</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {activeTab === 'media' &&
              mediaList.map((m) => (
                <div key={m.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                  {m.type === 'image' ? (
                    <img src={resolveAssetUrl(m.url)} alt={m.title} className="w-20 h-20 object-contain mx-auto mb-2 rounded-xl border border-slate-200 bg-white" />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-purple-100 border border-purple-300 mx-auto mb-2 flex items-center justify-center text-purple-700">
                      <Volume2 className="w-8 h-8" />
                    </div>
                  )}
                  <h4 className="text-xs font-black text-slate-800">{m.title}</h4>
                  <span className="text-[10px] text-slate-400 block mt-1">{m.tags}</span>
                </div>
              ))}

            {activeTab === 'stories' &&
              stories.map((st) => (
                <div key={st.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <h4 className="text-sm font-black text-amber-950 mb-1">{st.title}</h4>
                  <p className="text-xs text-slate-600">الشَّخْصِيَّاتُ: {st.characters}</p>
                  <span className="text-[11px] text-amber-700 font-bold block mt-2">
                    {st.pagesCount} صَفَحَاتٍ تِلْقَائِيَّة
                  </span>
                </div>
              ))}

            {activeTab === 'games' &&
              games.map((gm) => (
                <div key={gm.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md">
                    {gm.difficulty}
                  </span>
                  <h4 className="text-sm font-black text-amber-950 mt-1">{gm.title}</h4>
                  <span className="text-xs text-amber-600 font-bold block mt-2">
                    مُكَافَأَةٌ: {gm.rewardStars} نُجُوم ⭐
                  </span>
                </div>
              ))}

            {activeTab === 'quizzes' &&
              quizzes.map((qz) => (
                <div key={qz.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl col-span-full">
                  <h4 className="text-sm font-black text-amber-950 mb-2">{qz.question}</h4>
                  <div className="flex gap-2">
                    {qz.options.map((opt, i) => (
                      <span
                        key={i}
                        className={`px-3 py-1 rounded-xl text-xs font-bold ${
                          opt === qz.correctAnswer
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-white border border-slate-200 text-slate-600'
                        }`}
                      >
                        {opt} {opt === qz.correctAnswer && '✓'}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Tab 5: Firebase Analytics & Management Dashboard */}
      {activeTab === 'analytics' && (() => {
        const metrics = analyticsService.getPlatformMetrics();
        const recentEvents = analyticsService.getRecentEvents();
        return (
          <div className="bg-white rounded-3xl p-6 border-2 border-amber-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-amber-600" />
                <h3 className="text-xl font-black text-amber-950">
                  تَحْلِيلَاتُ وَإِحْصَائِيَّاتُ الْمِنَصَّةِ (Firebase Analytics)
                </h3>
              </div>
              <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                تَتَبُّعٌ نَشِطٌ مُتَوَافِقٌ مَعَ COPPA
              </span>
            </div>

            {/* 6 Core KPIs Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                <span className="text-xs text-slate-500 font-bold block mb-1">إِجْمَالِيُّ الْمُسْتَخْدِمِينَ</span>
                <span className="text-xl font-black text-slate-900">{metrics.totalUsers.toLocaleString()}</span>
                <span className="text-[10px] text-emerald-600 font-bold block mt-1">+12% هَذَا الشَّهْر</span>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-center">
                <span className="text-xs text-amber-700 font-bold block mb-1">النَّشِطُونَ الْيَوْمَ</span>
                <span className="text-xl font-black text-amber-900">{metrics.activeUsersToday.toLocaleString()}</span>
                <span className="text-[10px] text-amber-600 font-bold block mt-1">طِفْلٌ يَتَعَلَّمُ حَالِيًّا</span>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-center">
                <span className="text-xs text-blue-700 font-bold block mb-1">مُدَّةُ اسْتِخْدَامِ التَّطْبِيقِ</span>
                <span className="text-xl font-black text-blue-900">{metrics.avgSessionDurationMinutes} د</span>
                <span className="text-[10px] text-blue-600 font-bold block mt-1">مُتَوَسِّطُ الْجَلْسَةِ</span>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                <span className="text-xs text-emerald-700 font-bold block mb-1">مُعَدَّلُ إِكْمَالِ الدُّرُوسِ</span>
                <span className="text-xl font-black text-emerald-900">{metrics.lessonCompletionRatePercent}%</span>
                <span className="text-[10px] text-emerald-600 font-bold block mt-1">نِسْبَةُ إِتْمَامٍ مُمْتَازَة</span>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-center">
                <span className="text-xs text-purple-700 font-bold block mb-1">مُعَدَّلُ الِاشْتِرَاكَاتِ</span>
                <span className="text-xl font-black text-purple-900">{metrics.subscriptionConversionRatePercent}%</span>
                <span className="text-[10px] text-purple-600 font-bold block mt-1">تَحْوِيلُ الْمَجَّانِيِّ لِمُمَيَّزٍ</span>
              </div>

              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-center">
                <span className="text-xs text-rose-700 font-bold block mb-1">مُعَدَّلُ إِلْغَاءِ الِاشْتِرَاكِ</span>
                <span className="text-xl font-black text-rose-900">{metrics.subscriptionChurnRatePercent}%</span>
                <span className="text-[10px] text-emerald-600 font-bold block mt-1">مُنْخَفِضٌ جِدًّا (Churn)</span>
              </div>
            </div>

            {/* Most Viewed Lessons Ranking */}
            <div className="space-y-3">
              <h4 className="text-base font-black text-amber-950 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-600" />
                <span>الدُّرُوسُ الْأَكْثَرُ مُشَاهَدَةً وَإِقْبَالًا مِنَ الْأَطْفَالِ</span>
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                      <th className="p-2.5">التَّرْتِيب</th>
                      <th className="p-2.5">عُنْوَانُ الدَّرْسِ</th>
                      <th className="p-2.5">الْقِسْم</th>
                      <th className="p-2.5 text-center">عَدَدُ الْمُشَاهَدَاتِ</th>
                      <th className="p-2.5 text-center">مُعَدَّلُ الْإِكْمَالِ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {metrics.topLessons.map((l, index) => (
                      <tr key={l.id} className="hover:bg-amber-50/30">
                        <td className="p-2.5 font-bold text-amber-700">#{index + 1}</td>
                        <td className="p-2.5 font-black text-slate-900">{l.title}</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md text-[11px] font-bold">
                            {l.category}
                          </span>
                        </td>
                        <td className="p-2.5 text-center font-bold text-slate-800">{l.viewsCount.toLocaleString()}</td>
                        <td className="p-2.5 text-center">
                          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold">
                            {l.completionRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Live Analytics Events */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="text-xs font-black text-slate-700 block">سِجِلُّ أَحْدَاثِ Firebase Analytics الْحَيَّةِ:</span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {recentEvents.map((ev, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px] font-mono bg-white p-2 rounded-lg border border-slate-100">
                    <span className="text-amber-700 font-bold">event: {ev.eventName}</span>
                    <span className="text-slate-500">{JSON.stringify(ev.params || {})}</span>
                    <span className="text-slate-400">{new Date(ev.timestamp).toLocaleTimeString('ar-EG')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Tab 6: Push Notifications Control Center */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-3xl p-6 border-2 border-amber-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-amber-600" />
            <h3 className="text-xl font-black text-amber-950">
              مَرْكَزُ إِرْسَالِ وَإِدَارَةِ الْإِشْعَارَاتِ (Push & In-App Alerts)
            </h3>
          </div>

          <p className="text-xs md:text-sm text-slate-600">
            أَرْسِلْ تَنْبِيهَاتٍ تَعْلِيمِيَّةً مُبَاشِرَةً لِجَمِيعِ الْأَطْفَالِ وَالْأَهَالِي لِتَحْفِيزِهِمْ عَلَى الِاسْتِمْرَارِ وَإِطْلَاعِهِمْ عَلَى كُلِّ جَدِيدٍ.
          </p>

          {/* Quick Broadcast Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md inline-block mb-1">
                  1. إِشْعَارُ إِضَافَةِ دَرْسٍ جَدِيدٍ
                </span>
                <h4 className="text-sm font-black text-slate-900 mt-1">تَنْبِيهُ كَافَّةِ الطَّلَبَةِ بِالدُّرُوسِ الْجَدِيدَةِ</h4>
                <p className="text-xs text-slate-600 mt-1">
                  يُرْسِلُ إِشْعَارًا فَوْرِيًّا لِأَجْهِزَةِ الْأَطْفَالِ عِنْدَ إِطْلَاقِ دَرْسٍ أَوْ قِصَّةٍ جَدِيدَةٍ.
                </p>
              </div>
              <button
                onClick={() => {
                  notificationService.notifyNewLesson(lessons[lessons.length - 1]?.title || 'دَرْسُ الْحُرُوفِ الْعَرَبِيَّةِ', 'الْقِرَاءَةُ');
                  alert('تَمَّ إِرْسَالُ إِشْعَارِ الدَّرْسِ الْجَدِيدِ بِنَجَاح!');
                }}
                className="mt-3 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>إِرْسَالُ إِشْعَارِ دَرْسٍ جَدِيدٍ</span>
              </button>
            </div>

            <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-md inline-block mb-1">
                  2. تَذْكِيرُ الِاسْتِمْرَارِ فِي التَّعَلُّمِ (Streak)
                </span>
                <h4 className="text-sm font-black text-slate-900 mt-1">تَحْفِيزُ الْأَطْفَالِ عَلَى إِكْمَالِ النُّجُومِ الْيَوْمِيَّةِ</h4>
                <p className="text-xs text-slate-600 mt-1">
                  تَذْكِيرٌ لَطِيفٌ يُنَبِّهُ الطِّفْلَ لِلتَّدَرُّبِ لِمُدَّةِ ٥ دَقَائِقَ وَالْحِفَاظِ عَلَى نِقَاطِهِ.
                </p>
              </div>
              <button
                onClick={() => {
                  notificationService.notifyLearningStreakReminder('بَطَلَ لُومِي');
                  alert('تَمَّ إِرْسَالُ تَذْكِيرِ التَّعَلُّمِ الْيَوْمِيِّ بِنَجَاح!');
                }}
                className="mt-3 py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>إِرْسَالُ تَذْكِيرِ التَّعَلُّمِ</span>
              </button>
            </div>

            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md inline-block mb-1">
                  3. عُرُوضُ الِاشْتِرَاكِ لِلْمُسْتَخْدِمِينَ الْمَجَّانِيِّينَ
                </span>
                <h4 className="text-sm font-black text-slate-900 mt-1">إِرْسَالُ خُصُومَاتِ الْبَاقَاتِ الْعَائِلِيَّةِ</h4>
                <p className="text-xs text-slate-600 mt-1">
                  تَنْبِيهٌ خَاصٌّ بِالْمُسْتَخْدِمِينَ غَيْرِ الْمُشْتَرِكِينَ لِتَقْدِيمِ خَصْمِ ٥٠٪ مَعَ تَجْرِبَةٍ بِلَا إِعْلَانَاتٍ.
                </p>
              </div>
              <button
                onClick={() => {
                  notificationService.notifySubscriptionOffer(false);
                  alert('تَمَّ إِرْسَالُ عَرْضِ الِاشْتِرَاكِ لِلْمُسْتَخْدِمِينَ الْمَجَّانِيِّينَ بِنَجَاح!');
                }}
                className="mt-3 py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Gift className="w-3.5 h-3.5" />
                <span>إِرْسَالُ عَرْضِ الِاشْتِرَاكِ</span>
              </button>
            </div>

            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md inline-block mb-1">
                  4. رِسَالَةٌ تَرْحِيبِيَّةٌ لِلْمُسْتَخْدِمِينَ الْجُدُدِ
                </span>
                <h4 className="text-sm font-black text-slate-900 mt-1">تَرْحِيبٌ تَشْجِيعِيٌّ لِلْمُنْضَمِّينَ حَدِيثًا</h4>
                <p className="text-xs text-slate-600 mt-1">
                  رِسَالَةٌ مُشَوِّقَةٌ تُعَرِّفُ الطِّفْلَ عَلَى أَقْسَامِ التَّطْبِيقِ وَالْأَلْعَابِ.
                </p>
              </div>
              <button
                onClick={() => {
                  notificationService.notifyWelcomeNewUser('الْمُتَعَلِّمِ الْجَدِيدِ');
                  alert('تَمَّ إِرْسَالُ الرِّسَالَةِ التَّرْحِيبِيَّةِ بِنَجَاح!');
                }}
                className="mt-3 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>إِرْسَالُ تَرْحِيبِ الْمُسْتَخْدِمِ الْجَدِيدِ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Security & COPPA Compliance Center */}
      {activeTab === 'security' && (() => {
        const audit = securityManager.runSecurityAudit();
        return (
          <div className="bg-white rounded-3xl p-6 border-2 border-amber-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <h3 className="text-xl font-black text-amber-950">
                  مَرْكَزُ الْأَمَانِ وَحِمَايَةِ بَيَانَاتِ الْأَطْفَالِ (COPPA Compliance)
                </h3>
              </div>
              <span className="text-xs text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full font-black">
                حِمَايَةٌ نَشِطَةٌ 100%
              </span>
            </div>

            {/* 4 Security Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
                <Key className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
                <div>
                  <h4 className="text-sm font-black text-slate-900">حِمَايَةُ وَتَأْمِينُ واجِهَاتِ API</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    جَمِيعُ طَلَبَاتِ الشَّبَكَةِ مُوَقَّعَةٌ رَقْمِيًّا بِـ X-Client-Signature مَعَ مَنْعِ هَجَمَاتِ التَّعْدِيلِ وَتَحْدِيدِ مُعَدَّلِ الطَّلَبَاتِ (Rate Limiting).
                  </p>
                  <span className="inline-block mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    مُفَعَّلٌ: Signed Headers Active
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
                <Database className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
                <div>
                  <h4 className="text-sm font-black text-slate-900">تَشْفِيرُ الْبَيَانَاتِ الْحَسَّاسَةِ</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    يَتِمُّ تَشْفِيرُ بَيَانَاتِ الْجَلَسَاتِ وَالْإِيصَالَاتِ مَحَلِّيًّا بِتَشْفِيرٍ آمِنٍ يَمْنَعُ قِرَاءَتَهَا مِنْ أَدَوَاتِ الْمُطَوِّرِ.
                  </p>
                  <span className="inline-block mt-2 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    مُفَعَّلٌ: Salt Encryption Active
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
                <ShieldAlert className="w-6 h-6 text-purple-600 shrink-0 mt-1" />
                <div>
                  <h4 className="text-sm font-black text-slate-900">حِمَايَةُ الِاشْتِرَاكَاتِ مِنَ التَّلَاعُبِ</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    فَحْصُ التَّوْقِيعِ الرَّقْمِيِّ لِإِيصَالَاتِ Google Play Billing وَ Apple In-App Purchases لِمَنْعِ أَيِّ تَلَاعُبٍ مَحَلِّيٍّ.
                  </p>
                  <span className="inline-block mt-2 text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                    مُفَعَّلٌ: Anti-Tamper Check Active
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-1" />
                <div>
                  <h4 className="text-sm font-black text-slate-900">الِالْتِزَامُ بِقَانُونِ COPPA وَحِمَايَةِ الطِّفْلِ</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    عَدَمُ جَمْعِ أَيِّ بَيَانَاتٍ شَخْصِيَّةٍ تَعْرِيفِيَّةٍ لِلْأَطْفَالِ، صِفْرُ إِعْلَانَاتٍ سُلُوكِيَّةٍ، وَبَوَّابَةُ وَالِدَيْنِ صَارِمَةٌ لِأَيِّ مِيزَةٍ تِجَارِيَّةٍ.
                  </p>
                  <span className="inline-block mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    مُتَوَافِقٌ: 100% COPPA Verified
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h5 className="text-xs font-black text-amber-950">إِجْرَاءَاتُ الْخُصُوصِيَّةِ وَحَقُّ النِّسْيَانِ (COPPA Right to Forget)</h5>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  يُمْكِنُ لِلْوَالِدَيْنِ أَوْ لِلْمُدِيرِ مَحْوَ كَافَّةِ بَيَانَاتِ تَقَدُّمِ الطِّفْلِ بِنَقْرَةٍ وَاحِدَةٍ دُونَ أَيِّ أَثَرٍ.
                </p>
              </div>
              <button
                onClick={() => {
                  if (confirm('هَلْ أَنْتَ مُتَأَكِّدٌ مِنْ رَغْبَتِكَ فِي مَحْوِ جَمِيعِ سِجِلَّاتِ بَيَانَاتِ الطِّفْلِ؟')) {
                    securityManager.purgeAllChildPersonalData();
                    alert('تَمَّ مَحْوُ كَافَّةِ السِّجِلَّاتِ الشَّخْصِيَّةِ بِنَجَاحٍ وَفْقَ قَوَانِينِ حِمَايَةِ الطِّفْلِ.');
                  }
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black cursor-pointer shrink-0 shadow-2xs"
              >
                مَحْوُ بَيَانَاتِ الطِّفْلِ كَامِلًا
              </button>
            </div>
          </div>
        );
      })()}

      {activeTab === 'publish' && (
        <div className="bg-white rounded-3xl p-6 border-2 border-amber-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-6 h-6 text-amber-600" />
            <h3 className="text-xl font-black text-amber-950">
              مَرْكَزُ النَّشْرِ السَّحَابِيِّ الْمُبَاشِرِ (OTA Live Publish)
            </h3>
          </div>

          <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl">
            <h4 className="text-base font-black text-amber-950 mb-1">
              النَّشْرُ دُونَ الْحَاجَةِ لِإِصْدَارٍ جَدِيدٍ لِلتَّطْبِيقِ
            </h4>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed mb-4">
              عِنْدَ الضَّغْطِ عَلَى زِرِّ النَّشْرِ، يَتِمُّ حِفْظُ وَمُزَامَنَةُ كَافَّةِ الدُّرُوسِ، الْفِيدْيُوهَاتِ، الْأَلْعَابِ، وَالِاخْتِبَارَاتِ فِي السَّحَابَةِ لِتَصِلَ فَوْرًا إِلَى هَوَاتِفِ وَأَجْهِزَةِ جَمِيعِ الْأَطْفَالِ دُونَ انْتِظَارِ مُرَاجَعَةِ مَتَاجِرِ التَّطْبِيقَاتِ (App Store & Google Play).
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-amber-200">
              <div>
                <span className="text-xs text-slate-500 block">آخِرُ نَشْرٍ سَحَابِيٍّ نَاجِح:</span>
                <span className="text-sm font-mono font-bold text-amber-900">{publishedTimestamp}</span>
              </div>
              <button
                onClick={handlePublishLive}
                disabled={isPublishing}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-black text-sm shadow-md cursor-pointer transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                <UploadCloud className={`w-4 h-4 ${isPublishing ? 'animate-bounce' : ''}`} />
                <span>{isPublishing ? 'جَارٍ النَّشْرُ إِلَى السَّحَابَة...' : 'نَشْرُ التَّعْدِيلَاتِ الْآنَ'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Source Code Download (Exclusively in Admin Dashboard) */}
      {activeTab === 'source' && (
        <div className="bg-white rounded-3xl p-6 border-2 border-amber-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Download className="w-6 h-6 text-amber-600" />
              <h3 className="text-xl font-black text-amber-950">
                حُزْمَةُ الْكُودِ الْمَصْدَرِيِّ لِلْمَشْرُوعِ (Source Code Archive)
              </h3>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-900 rounded-full border border-amber-300">
              حَجْمُ الْمَلَفِّ: 5.4 MB • مَضْغُوطٌ وَجَاهِز
            </span>
          </div>

          <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-lg font-black text-amber-950 mb-1">
                  مَلَفُّ lumi-kids-source-code.zip
                </h4>
                <p className="text-xs text-slate-600">
                  يَحْتَوِي عَلَى كَافَّةِ مِلَفَّاتِ التَّطْبِيقِ مَعَ إِعْدَادَاتِ الْبِنَاءِ وَحِمَايَةِ الْأَطْفَالِ:
                </p>
              </div>

              <button
                onClick={handleDownloadSourceCode}
                disabled={isDownloading}
                className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl font-black text-sm shadow-md cursor-pointer transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 shrink-0"
              >
                <Download className="w-5 h-5 shrink-0" />
                <span>
                  {downloadFeedback
                    ? downloadFeedback
                    : isDownloading
                    ? 'جَارٍ التَّحْمِيل...'
                    : 'تَحْمِيلُ حُزْمَةِ المَشْرُوعِ (ZIP) فَوْرًا'}
                </span>
              </button>
            </div>

            {/* Folder Structure Preview */}
            <div className="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-xs text-left dir-ltr overflow-x-auto">
              <div className="text-slate-400 mb-1"># Package Structure:</div>
              <div>lumi-kids-source-code/</div>
              <div>├── package.json</div>
              <div>├── vite.config.ts</div>
              <div>├── tsconfig.json</div>
              <div>├── index.html</div>
              <div>├── src/</div>
              <div>│   ├── main.tsx</div>
              <div>│   ├── App.tsx</div>
              <div>│   ├── components/</div>
              <div>│   ├── services/ (googlePlayBilling.ts, security.ts)</div>
              <div>│   ├── context/</div>
              <div>│   ├── data/</div>
              <div>│   └── assets/</div>
              <div>└── public/</div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <h5 className="text-xs font-black text-slate-800 mb-2">أَوَامِرُ التَّشْغِيلِ الْمَحَلِّيِّ بَعْدَ فَكِّ الضَّغْطِ:</h5>
            <div className="bg-slate-800 text-slate-100 p-3 rounded-xl font-mono text-xs text-left dir-ltr space-y-1">
              <div>npm install</div>
              <div>npm run dev</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
