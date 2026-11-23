import React, { useState, useEffect } from 'react';
import {
  Bell,
  X,
  CheckCircle,
  Settings,
  Trash2,
  Sparkles,
  BookOpen,
  Gift,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import {
  notificationService,
  AppNotification,
  NotificationSettings,
} from '../services/notifications';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    notificationService.getNotifications()
  );
  const [settings, setSettings] = useState<NotificationSettings>(() =>
    notificationService.getSettings()
  );
  const [activeView, setActiveView] = useState<'inbox' | 'settings'>('inbox');
  const [hasWebPermission, setHasWebPermission] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe(() => {
      setNotifications([...notificationService.getNotifications()]);
      setSettings({ ...notificationService.getSettings() });
    });

    if (typeof window !== 'undefined' && 'Notification' in window) {
      setHasWebPermission(Notification.permission === 'granted');
    }

    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const granted = await notificationService.requestSystemPermission();
    setHasWebPermission(granted);
    if (granted) {
      notificationService.notifyWelcomeNewUser('البطل الصغير');
    }
  };

  const getCategoryBadge = (cat: AppNotification['category']) => {
    switch (cat) {
      case 'new_lesson':
        return { label: 'دَرْسٌ جَدِيدٌ', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'learning_reminder':
        return { label: 'تَذْكِيرٌ يَوْمِيٌّ', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'promo_offer':
        return { label: 'عَرْضٌ خَاصٌّ', color: 'bg-amber-100 text-amber-900 border-amber-200' };
      case 'welcome':
      default:
        return { label: 'تَرْحِيبٌ', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs text-right">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border-2 border-amber-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black">مَرْكَزُ التَّنْبِيهَاتِ وَالْإِشْعَارَاتِ</h3>
              <p className="text-xs text-amber-100">
                مُتَابَعَةُ الدُّرُوسِ الْجَدِيدَةِ وَتَذْكِيرَاتِ التَّعَلُّمِ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveView(activeView === 'inbox' ? 'settings' : 'inbox')}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                activeView === 'settings' ? 'bg-white text-amber-900' : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
              title="إعدادات الإشعارات"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* System Permission Prompt Bar */}
        {!hasWebPermission && typeof window !== 'undefined' && 'Notification' in window && (
          <div className="bg-amber-50 border-b border-amber-200 p-3 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-950 font-bold">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>فَعِّلْ إِشْعَارَاتِ الْجِهَازِ لِتَصِلَكَ تَنْبِيهَاتُ الدُّرُوسِ فَوْرًا!</span>
            </div>
            <button
              onClick={handleRequestPermission}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-lg cursor-pointer shrink-0 text-xs shadow-2xs"
            >
              تَفْعِيل
            </button>
          </div>
        )}

        {/* Content Body */}
        {activeView === 'inbox' ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Action Bar */}
            <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-100">
              <span className="font-bold text-slate-500">
                إِجْمَالِيُّ الرَّسَائِلِ: {notifications.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => notificationService.markAllAsRead()}
                  className="text-amber-700 hover:underline font-bold cursor-pointer"
                >
                  تَحْدِيدُ الْكُلِّ كَمَقْرُوءٍ
                </button>
                <span className="text-slate-300">•</span>
                <button
                  onClick={() => notificationService.clearAll()}
                  className="text-rose-600 hover:underline font-bold cursor-pointer"
                >
                  مَسْحُ الْكُلِّ
                </button>
              </div>
            </div>

            {notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Bell className="w-12 h-12 mx-auto mb-2 text-slate-300 opacity-60" />
                <p className="font-bold text-sm">صُنْدُوقُ الْإِشْعَارَاتِ فَارِغٌ حَالِيًّا</p>
                <p className="text-xs text-slate-400 mt-1">سَتَصِلُكَ هُنَا تَنْبِيهَاتُ الدُّرُوسِ وَالْأَلْعَابِ الْجَدِيدَةِ</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const badge = getCategoryBadge(notif.category);
                return (
                  <div
                    key={notif.id}
                    onClick={() => {
                      notificationService.markAsRead(notif.id);
                      if (notif.category === 'new_lesson' && onNavigateToTab) {
                        onNavigateToTab('letters');
                        onClose();
                      } else if (notif.category === 'promo_offer' && onNavigateToTab) {
                        onNavigateToTab('plans');
                        onClose();
                      }
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      notif.isRead
                        ? 'bg-slate-50/80 border-slate-200 opacity-80 hover:bg-slate-50'
                        : 'bg-amber-50/50 border-amber-300 shadow-2xs hover:bg-amber-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{notif.icon || '🔔'}</span>
                        <h4 className="text-sm font-black text-slate-900">{notif.title}</h4>
                      </div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed pr-6">{notif.body}</p>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 pr-6 text-[10px] text-slate-400">
                      <span>{new Date(notif.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                      {!notif.isRead && (
                        <span className="text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded-md">
                          غَيْرُ مَقْرُوءٍ
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* Settings View */
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <h4 className="text-sm font-black text-amber-950 pb-2 border-b border-slate-100">
              تَفْضِيلَاتُ الْإِشْعَارَاتِ وَالتَّنْبِيهَاتِ
            </h4>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                <div>
                  <span className="text-xs font-black text-slate-900 block">تَفْعِيلُ الْإِشْعَارَاتِ عَامَّةً</span>
                  <span className="text-[11px] text-slate-500">اسْتِلَامُ التَّنْبِيهَاتِ التَّعْلِيمِيَّةِ فِي التَّطْبِيقِ</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => notificationService.updateSettings({ enabled: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                <div>
                  <span className="text-xs font-black text-slate-900 block">تَنْبِيهَاتُ الدُّرُوسِ الْجَدِيدَةِ</span>
                  <span className="text-[11px] text-slate-500">إِشْعَارٌ فَوْرِيٌّ عِنْدَ إِضَافَةِ دَرْسٍ أَوْ قِصَّةٍ جَدِيدَةٍ</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.newLessons}
                  disabled={!settings.enabled}
                  onChange={(e) => notificationService.updateSettings({ newLessons: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer disabled:opacity-40"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                <div>
                  <span className="text-xs font-black text-slate-900 block">تَذْكِيرُ الِاسْتِمْرَارِ فِي التَّعَلُّمِ (Streak)</span>
                  <span className="text-[11px] text-slate-500">تَشْجِيعُ الطِّفْلِ يَوْمِيًّا عَلَى إِكْمَالِ تَمْرِينٍ قَصِيرٍ</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.learningReminders}
                  disabled={!settings.enabled}
                  onChange={(e) => notificationService.updateSettings({ learningReminders: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer disabled:opacity-40"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                <div>
                  <span className="text-xs font-black text-slate-900 block">عُرُوضُ الِاشْتِرَاكِ لِلْمُسْتَخْدِمِينَ الْمَجَّانِيِّينَ</span>
                  <span className="text-[11px] text-slate-500">عُرُوضُ الْخُصُومَاتِ الْمَوْسِمِيَّةِ وَالْبَاقَاتِ الْعَائِلِيَّةِ</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.subscriptionOffers}
                  disabled={!settings.enabled}
                  onChange={(e) => notificationService.updateSettings({ subscriptionOffers: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer disabled:opacity-40"
                />
              </label>
            </div>

            <div className="pt-3">
              <button
                onClick={() => setActiveView('inbox')}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer"
              >
                حِفْظٌ وَرُجُوعٌ لِلْإِشْعَارَاتِ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
