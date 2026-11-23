// Google AdMob Service for Children's Educational Apps
// Compliant with Google Play Families Policy, COPPA, and Apple App Store Kids Category guidelines

export interface AdMobConfig {
  appIdAndroid: string;
  appIdIos: string;
  bannerAdUnitIdAndroid: string;
  bannerAdUnitIdIos: string;
  interstitialAdUnitIdAndroid: string;
  interstitialAdUnitIdIos: string;
  rewardedAdUnitIdAndroid: string;
  rewardedAdUnitIdIos: string;
  // Mandatory Child Safety COPPA flags
  isTesting: boolean;
  maxAdContentRating: 'G'; // Strictly G-rated family safe
  tagForChildDirectedTreatment: true; // Mandatory COPPA compliance
  tagForUnderAgeOfConsent: true;
}

const isProd = import.meta.env.PROD;

// Official Google AdMob Test IDs (used ONLY as a local fallback in development environment)
const DEV_ONLY_TEST_IDS = {
  appIdAndroid: 'ca-app-pub-3940256099942544~3347511713',
  appIdIos: 'ca-app-pub-3940256099942544~1458602516',
  bannerAndroid: 'ca-app-pub-3940256099942544/6300978111',
  bannerIos: 'ca-app-pub-3940256099942544/2934735716',
  interstitialAndroid: 'ca-app-pub-3940256099942544/1033173712',
  interstitialIos: 'ca-app-pub-3940256099942544/4411468910',
  rewardedAndroid: 'ca-app-pub-3940256099942544/5224354917',
  rewardedIos: 'ca-app-pub-3940256099942544/1712485313',
};

/**
 * Resolves an AdMob ID:
 * - If the environment variable is provided, uses it.
 * - In DEVELOPMENT: falls back to Google's official test ID if missing.
 * - In PRODUCTION: strictly requires the environment variable and returns empty string if missing.
 */
const resolveAdMobId = (envKey: string, devFallback: string): string => {
  const envVal = (import.meta.env[envKey] as string | undefined)?.trim();
  if (envVal) return envVal;
  // In development only, automatically fall back to official Google test IDs
  if (!isProd) {
    return devFallback;
  }
  // In production, NEVER use test IDs as fallback
  return '';
};

/**
 * Validates whether an ID is a legitimate, real production AdMob ID:
 * - Must start with 'ca-app-pub-'
 * - Must not be a test publisher ID (prefix 'ca-app-pub-3940256099942544')
 * - Must not be a dummy placeholder ('xxxxxxxxxxxx')
 */
export const isRealProductionId = (id?: string): boolean => {
  if (!id) return false;
  const clean = id.trim();
  if (clean.length < 20) return false;
  if (!clean.startsWith('ca-app-pub-')) return false;
  if (clean.includes('xxxxxxxx') || clean.includes('XXXXXXXX')) return false;
  // Google test publisher ID prefix check
  if (clean.startsWith('ca-app-pub-3940256099942544')) return false;
  return true;
};

export const ADMOB_DEFAULT_CONFIG: AdMobConfig = {
  appIdAndroid: resolveAdMobId('VITE_ADMOB_APP_ID_ANDROID', DEV_ONLY_TEST_IDS.appIdAndroid),
  appIdIos: resolveAdMobId('VITE_ADMOB_APP_ID_IOS', DEV_ONLY_TEST_IDS.appIdIos),
  bannerAdUnitIdAndroid: resolveAdMobId('VITE_ADMOB_BANNER_ID_ANDROID', DEV_ONLY_TEST_IDS.bannerAndroid),
  bannerAdUnitIdIos: resolveAdMobId('VITE_ADMOB_BANNER_ID_IOS', DEV_ONLY_TEST_IDS.bannerIos),
  interstitialAdUnitIdAndroid: resolveAdMobId('VITE_ADMOB_INTERSTITIAL_ID_ANDROID', DEV_ONLY_TEST_IDS.interstitialAndroid),
  interstitialAdUnitIdIos: resolveAdMobId('VITE_ADMOB_INTERSTITIAL_ID_IOS', DEV_ONLY_TEST_IDS.interstitialIos),
  rewardedAdUnitIdAndroid: resolveAdMobId('VITE_ADMOB_REWARDED_ID_ANDROID', DEV_ONLY_TEST_IDS.rewardedAndroid),
  rewardedAdUnitIdIos: resolveAdMobId('VITE_ADMOB_REWARDED_ID_IOS', DEV_ONLY_TEST_IDS.rewardedIos),
  // In production, test mode is disabled
  isTesting: !isProd,
  maxAdContentRating: 'G', // Mandatory COPPA G-rating
  tagForChildDirectedTreatment: true, // Mandatory COPPA tag
  tagForUnderAgeOfConsent: true,
};

export interface SafeChildAd {
  id: string;
  sponsorName: string;
  title: string;
  description: string;
  callToAction: string;
  badgeText: string;
  icon: string;
}

// Child-safe educational sponsor creatives displayed when native AdMob SDK is not present or for fallback
export const SAFE_CHILD_ADS: SafeChildAd[] = [
  {
    id: 'ad_1',
    sponsorName: 'مُبَادَرَةُ الْقِرَاءَةِ لِلْأَطْفَالِ',
    title: 'تَحَدِّي الْقِرَاءَةِ الْمُمْتِعِ',
    description: 'اقْرَأْ كِتَابًا صَغِيرًا كُلَّ يَوْمٍ وَاكْتَشِفْ عَالَمَ الْمَعْرِفَةِ!',
    callToAction: 'اقْرَأْ مَعَنَا',
    badgeText: 'إِعْلَانٌ تَعْلِيمِيٌّ مُنَاسِبٌ لِلْأَطْفَالِ',
    icon: '📚',
  },
  {
    id: 'ad_2',
    sponsorName: 'عَالَمُ الْعُلُومِ وَالْفَضَاءِ',
    title: 'رِحْلَةٌ نَحْوَ النُّجُومِ وَالْكَوَاكِبِ',
    description: 'شَاهِدْ صُوَرَ الْقَمَرِ وَالشَّمْسِ وَتَعَلَّمْ أَسْرَارَ الْكَوْنِ الْعَجِيبِ!',
    callToAction: 'اكْتَشِفِ الْآنَ',
    badgeText: 'إِعْلَانٌ تَعْلِيمِيٌّ مُنَاسِبٌ لِلْأَطْفَالِ',
    icon: '🚀',
  },
  {
    id: 'ad_3',
    sponsorName: 'نَادِي الْفُنُونِ وَالرَّسْمِ',
    title: 'لَوْنْ حَيَاتَكَ بِأَجْمَلِ الْأَلْوَانِ',
    description: 'اسْتَخْدِمِ الْفُرْشَاةَ وَعَبِّرْ عَنْ إِبْدَاعِكَ فِي مَرْسَمِ الطِّفْلِ.',
    callToAction: 'ارْسُمْ مَعَنَا',
    badgeText: 'إِعْلَانٌ تَعْلِيمِيٌّ مُنَاسِبٌ لِلْأَطْفَالِ',
    icon: '🎨',
  },
];

class AdMobManager {
  private isInitialized = false;
  private isSubscribed = false;

  public initialize(isSubscribed: boolean) {
    this.isSubscribed = isSubscribed;
    this.isInitialized = true;
    if (isProd && !this.isProductionConfigured()) {
      console.warn('[AdMob] Production mode active but real AdMob IDs are not configured. Ads are completely disabled.');
    } else {
      console.log('[AdMob] Initialized (G-rated, COPPA child-directed, safe). Subscribed:', isSubscribed);
    }
  }

  /**
   * Verifies if real AdMob IDs are configured for production:
   * Lumi Kids is an Android-first application targeting Google Play Store.
   * Having a valid Android App ID and Android Banner ID completely satisfies the production requirement.
   */
  public isProductionConfigured(): boolean {
    const hasRealAndroidAppId = isRealProductionId(ADMOB_DEFAULT_CONFIG.appIdAndroid);
    const hasRealAndroidBannerId = isRealProductionId(ADMOB_DEFAULT_CONFIG.bannerAdUnitIdAndroid);
    if (hasRealAndroidAppId && hasRealAndroidBannerId) {
      return true;
    }
    // Fallback if iOS is provided
    const hasRealIosAppId = isRealProductionId(ADMOB_DEFAULT_CONFIG.appIdIos);
    const hasRealIosBannerId = isRealProductionId(ADMOB_DEFAULT_CONFIG.bannerAdUnitIdIos);
    return hasRealIosAppId && hasRealIosBannerId;
  }

  public updateSubscriptionStatus(isSubscribed: boolean) {
    this.isSubscribed = isSubscribed;
    if (isSubscribed) {
      console.log('[AdMob] User subscribed: all ads immediately suppressed.');
    }
  }

  /**
   * Evaluates if ads can be shown:
   * 1. Subscribed users NEVER see ads.
   * 2. In PRODUCTION: Real AdMob IDs are REQUIRED. If not configured, ads are DISABLED.
   * 3. In DEVELOPMENT: Allowed using official Google test IDs.
   */
  public canShowAds(): boolean {
    if (this.isSubscribed) {
      return false;
    }
    if (isProd && !this.isProductionConfigured()) {
      return false;
    }
    return true;
  }

  public getRandomSafeAd(): SafeChildAd {
    const idx = Math.floor(Math.random() * SAFE_CHILD_ADS.length);
    return SAFE_CHILD_ADS[idx];
  }
}

export const adMobManager = new AdMobManager();
