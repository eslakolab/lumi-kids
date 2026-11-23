// Push & In-App Notifications Manager
// Handles: New lessons, Daily learning streak reminders, Subscription promos, and Welcome messages

export type NotificationCategory = 'new_lesson' | 'learning_reminder' | 'promo_offer' | 'welcome';

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  icon?: string;
  actionUrl?: string;
  timestamp: string;
  isRead: boolean;
}

const LOCAL_NOTIFICATIONS_KEY = 'lumi_notifications_inbox_v1';
const LOCAL_NOTIF_SETTINGS_KEY = 'lumi_notif_settings_v1';

export interface NotificationSettings {
  enabled: boolean;
  newLessons: boolean;
  learningReminders: boolean;
  subscriptionOffers: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  newLessons: true,
  learningReminders: true,
  subscriptionOffers: true,
};

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_welcome',
    category: 'welcome',
    title: 'أَهْلًا بِكَ فِي عَالَمِ لُومِي! 🌟',
    body: 'نَحْنُ سُعَدَاءُ جِدًّا بِانْضِمَامِكَ إِلَيْنَا! ابْدَأْ رِحْلَتَكَ الْيَوْمَ فِي تَعَلُّمِ الْحُرُوفِ الْعَرَبِيَّةِ الْمُمْتِعَةِ.',
    icon: '👋',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    isRead: false,
  },
  {
    id: 'notif_reminder',
    category: 'learning_reminder',
    title: 'حَانَ وَقْتُ التَّحَدِّي الْيَوْمِيِّ! ⏰',
    body: 'خَمْسُ دَقَائِقَ فَقَطْ تَصْنَعُ الْفَرْقَ. تَدَرَّبْ عَلَى كِتَابَةِ حَرْفِ الْيَوْمِ وَاكْتَسِبْ ٥ نُجُومٍ جَدِيدَةٍ!',
    icon: '⭐',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    isRead: false,
  },
  {
    id: 'notif_promo',
    category: 'promo_offer',
    title: 'عَرْضٌ خَاصٌّ: خَصْمُ ٥٠٪ عَلَى الِاشْتِرَاكِ السَّنَوِيِّ! 🎁',
    body: 'افْتَحْ كَافَّةَ الْحُرُوفِ، الْقِصَصِ، وَالْأَلْعَابِ لِطِفْلِكَ مَعَ تَجْرِبَةٍ خَالِيَةٍ تَمَامًا مِنَ الْإِعْلَانَاتِ.',
    icon: '🎉',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    isRead: false,
  },
];

class NotificationService {
  private notifications: AppNotification[] = [];
  private settings: NotificationSettings = DEFAULT_SETTINGS;
  private listeners: Array<() => void> = [];

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const savedNotifs = localStorage.getItem(LOCAL_NOTIFICATIONS_KEY);
      this.notifications = savedNotifs ? JSON.parse(savedNotifs) : INITIAL_NOTIFICATIONS;

      const savedSettings = localStorage.getItem(LOCAL_NOTIF_SETTINGS_KEY);
      if (savedSettings) {
        this.settings = JSON.parse(savedSettings);
      }
    } catch {
      this.notifications = INITIAL_NOTIFICATIONS;
      this.settings = DEFAULT_SETTINGS;
    }
  }

  private saveState() {
    try {
      localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(this.notifications));
      localStorage.setItem(LOCAL_NOTIF_SETTINGS_KEY, JSON.stringify(this.settings));
      this.notifyListeners();
    } catch (e) {
      console.error(e);
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((l) => l());
  }

  public getNotifications(): AppNotification[] {
    return this.notifications;
  }

  public getUnreadCount(): number {
    return this.notifications.filter((n) => !n.isRead).length;
  }

  public getSettings(): NotificationSettings {
    return this.settings;
  }

  public updateSettings(newSettings: Partial<NotificationSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveState();
  }

  public markAsRead(id: string) {
    this.notifications = this.notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
    this.saveState();
  }

  public markAllAsRead() {
    this.notifications = this.notifications.map((n) => ({ ...n, isRead: true }));
    this.saveState();
  }

  public clearAll() {
    this.notifications = [];
    this.saveState();
  }

  public async requestSystemPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    try {
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    } catch {
      return false;
    }
  }

  // 1. إرسال إشعار عند إضافة دروس جديدة
  public notifyNewLesson(lessonTitle: string, category: string) {
    if (!this.settings.enabled || !this.settings.newLessons) return;
    this.addNotification({
      category: 'new_lesson',
      title: 'دَرْسٌ جَدِيدٌ أُضِيفَ لِطِفْلِكَ! 📚',
      body: `تَمَّتْ إِضَافَةُ «${lessonTitle}» فِي قِسْمِ «${category}». تَعَالَ لِنَسْتَكْشِفَهُ مَعًا!`,
      icon: '📖',
    });
  }

  // 2. تذكير بالاستمرار في التعلم
  public notifyLearningStreakReminder(childName: string) {
    if (!this.settings.enabled || !this.settings.learningReminders) return;
    this.addNotification({
      category: 'learning_reminder',
      title: `هَيَّا بِنَا يَا ${childName || 'بَطَلَ لُومِي'}! 🚀`,
      body: 'سِلْسِلَةُ تَعَلُّمِكَ فِي انْتِظَارِكَ! أَكْمِلْ تَمْرِينًا صَغِيرًا لِتَحْصُلَ عَلَى كَأْسِ التَّفَوُّقِ.',
      icon: '🏆',
    });
  }

  // 3. إرسال عروض الاشتراك للمستخدمين المجانيين
  public notifySubscriptionOffer(isSubscribed: boolean) {
    if (isSubscribed || !this.settings.enabled || !this.settings.subscriptionOffers) return;
    this.addNotification({
      category: 'promo_offer',
      title: 'عَرْضُ لُومِي الْعَائِلِيِّ الْحَصْرِيِّ! 🌟',
      body: 'اشْتَرِكِ الْآنَ وَاحْصُلْ عَلَى شَهْرٍ مَجَّانِيٍّ مَعَ خَاصِّيَّةِ التَّحْمِيلِ لِلِاسْتِخْدَامِ دُونَ إِنْتَرْنِتْ.',
      icon: '🎁',
    });
  }

  // 4. رسالة ترحيبية للمستخدم الجديد
  public notifyWelcomeNewUser(name: string) {
    this.addNotification({
      category: 'welcome',
      title: `مَرْحَبًا بِكَ يَا ${name || 'صَدِيقَنَا'} فِي لُومِي! 🎈`,
      body: 'نَحْنُ فَخُورُونَ بِكَ! اسْتَمْتِعْ بِأَلْعَابِ الْحُرُوفِ وَالْقِرَاءَةِ التَّفَاعُلِيَّةِ.',
      icon: '✨',
    });
  }

  private addNotification(data: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) {
    const newNotif: AppNotification = {
      ...data,
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    this.notifications = [newNotif, ...this.notifications];
    this.saveState();

    // Trigger Native Web Notification if permitted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(newNotif.title, {
          body: newNotif.body,
          icon: '/favicon.ico',
        });
      } catch (e) {
        console.error(e);
      }
    }
  }
}

export const notificationService = new NotificationService();
