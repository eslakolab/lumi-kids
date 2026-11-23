import React, { createContext, useContext, useState, useEffect } from 'react';
import { soundManager } from '../utils/audio';
import {
  googlePlayBillingService,
  BillingResponseCode,
  PurchaseState,
  GooglePlayPurchase,
} from '../services/googlePlayBilling';

export type PlanType = 'none' | 'monthly' | 'annual';
export type StorePlatform = 'android' | 'ios' | 'web';

export interface SubscriptionState {
  isSubscribed: boolean;
  activePlan: PlanType;
  platform: StorePlatform;
  storeName: string; // "Google Play Billing" or "Apple In-App Purchases" or "Lumi Store"
  sku: string | null;
  purchaseDate: string | null;
  expirationDate: string | null;
  isVerifying: boolean;
  freeLimits: {
    lettersCount: number; // 10 free letters
    spellingCount: number; // 3 free spelling lessons
    wordsCount: number; // 4 free words
    sentencesCount: number; // 2 free sentences
    storiesCount: number; // 1 free story
    mathCount: number; // 3 free math lessons
    animalsCount: number; // 2 free animals
    chemistryCount: number; // 1 free chemistry topic
    coloringCount: number; // 2 free coloring canvases
    gamesCount: number; // 2 free brain games
  };
}

export interface SubscriptionContextType extends SubscriptionState {
  subscribe: (plan: 'monthly' | 'annual') => Promise<{ success: boolean; message: string }>;
  activateSubscription: (orderId: string, plan: 'monthly' | 'annual', paymentMethod: string) => void;
  restorePurchases: () => Promise<{ success: boolean; message: string }>;
  cancelSubscription: () => void;
  isContentUnlocked: (contentType: keyof SubscriptionState['freeLimits'], index: number) => boolean;
}

const LOCAL_STORAGE_SUB_KEY = 'lumi_subscription_receipt_v2';

const FREE_LIMITS = {
  lettersCount: 10, // First 10 alphabet letters free (Level 1)
  spellingCount: 3, // First 3 spelling words free
  wordsCount: 4, // First 4 vocabulary words free
  sentencesCount: 2, // First 2 sentence reading cards free
  storiesCount: 1, // First complete story free
  mathCount: 3, // First 3 math & counting problems free
  animalsCount: 2, // First 2 animal science topics free
  chemistryCount: 1, // First lab experiment free
  coloringCount: 2, // First 2 coloring studio sheets free
  gamesCount: 2, // First 2 brain games free
};

// SKU identifiers matching official Google Play and Apple App Store conventions
export const STORE_SKUS = {
  android: {
    monthly: 'com.lumi.kids.subscription.monthly',
    annual: 'com.lumi.kids.subscription.annual',
  },
  ios: {
    monthly: 'com.lumi.kids.sub.monthly',
    annual: 'com.lumi.kids.sub.annual',
  },
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [platform, setPlatform] = useState<StorePlatform>('android');
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [activePlan, setActivePlan] = useState<PlanType>('none');
  const [sku, setSku] = useState<string | null>(null);
  const [purchaseDate, setPurchaseDate] = useState<string | null>(null);
  const [expirationDate, setExpirationDate] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(true);

  // 1. Detect device platform (Android / iOS / Web)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ua = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua) || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1)) {
      setPlatform('ios');
    } else if (/android/.test(ua)) {
      setPlatform('android');
    } else {
      setPlatform('web');
    }
  }, []);

  const storeName =
    platform === 'android'
      ? 'Google Play Billing'
      : platform === 'ios'
      ? 'Apple In-App Purchases'
      : 'Lumi Cloud Store';

  // 2. Listen to Native Google Play Billing Events & Automatic Verification on App Startup
  useEffect(() => {
    // Register listener for native Google Play Billing events
    const unsubscribe = googlePlayBillingService.onPurchaseUpdated((result, purchases) => {
      if (result.responseCode === BillingResponseCode.OK && purchases.length > 0) {
        const activePurchase =
          purchases.find((p) => p.purchaseState === PurchaseState.PURCHASED) || purchases[0];
        const isAnnual = activePurchase.productId.includes('annual');
        const plan: PlanType = isAnnual ? 'annual' : 'monthly';
        const now = new Date(activePurchase.purchaseTime || Date.now());
        const expDate = new Date(now);
        if (plan === 'annual') {
          expDate.setFullYear(expDate.getFullYear() + 1);
        } else {
          expDate.setMonth(expDate.getMonth() + 1);
        }

        const receipt = {
          plan,
          sku: activePurchase.productId,
          platform: 'android' as const,
          orderId: activePurchase.orderId,
          purchaseToken: activePurchase.purchaseToken,
          purchaseDate: now.toISOString(),
          expirationTimestamp: expDate.getTime(),
          transactionId: activePurchase.orderId,
          verified: true,
        };

        localStorage.setItem(LOCAL_STORAGE_SUB_KEY, JSON.stringify(receipt));

        setIsSubscribed(true);
        setActivePlan(plan);
        setSku(activePurchase.productId);
        setPurchaseDate(now.toISOString());
        setExpirationDate(expDate.toLocaleDateString());
        soundManager.playSuccessChime();
      }
    });

    const verifySubscriptionOnStartup = async () => {
      setIsVerifying(true);
      try {
        const storedReceipt = localStorage.getItem(LOCAL_STORAGE_SUB_KEY);
        if (storedReceipt) {
          const parsed = JSON.parse(storedReceipt);
          const now = new Date().getTime();
          const expTime = parsed.expirationTimestamp || (now + 1000 * 60 * 60 * 24 * 30); // 30 days default

          // Check if subscription has not expired
          if (expTime > now) {
            setIsSubscribed(true);
            setActivePlan(parsed.plan || 'monthly');
            setSku(parsed.sku || null);
            setPurchaseDate(parsed.purchaseDate || new Date().toISOString());
            setExpirationDate(new Date(expTime).toLocaleDateString());
          } else {
            // Subscription expired
            setIsSubscribed(false);
            setActivePlan('none');
            setSku(null);
            localStorage.removeItem(LOCAL_STORAGE_SUB_KEY);
          }
        } else {
          // Query native Google Play purchases on Android startup
          if (platform === 'android' || googlePlayBillingService.isNativeBridgeAvailable()) {
            const remotePurchases = await googlePlayBillingService.queryPurchasesAsync();
            if (remotePurchases.length > 0) {
              const active = remotePurchases.find((p) => p.purchaseState === PurchaseState.PURCHASED) || remotePurchases[0];
              const plan = active.productId.includes('annual') ? 'annual' : 'monthly';
              setIsSubscribed(true);
              setActivePlan(plan);
              setSku(active.productId);
            }
          }
        }
      } catch (err) {
        console.warn('Subscription auto-verification note:', err);
      } finally {
        setIsVerifying(false);
      }
    };

    verifySubscriptionOnStartup();

    return () => {
      unsubscribe();
    };
  }, [platform]);

  // 3. Purchase Subscription via Google Play Billing Flow / Store
  const subscribe = async (plan: 'monthly' | 'annual'): Promise<{ success: boolean; message: string }> => {
    setIsVerifying(true);
    soundManager.playPop();

    try {
      // Initiate Google Play BillingClient launchBillingFlow
      const { billingResult, purchase } = await googlePlayBillingService.launchBillingFlow(plan);

      if (billingResult.responseCode === BillingResponseCode.USER_CANCELED) {
        return {
          success: false,
          message: 'تم إلغاء عملية الاشتراك من قِبل المستخدم.',
        };
      }

      if (billingResult.responseCode !== BillingResponseCode.OK) {
        return {
          success: false,
          message: billingResult.debugMessage || 'تعذر إتمام عملية الاشتراك عبر متجر Google Play.',
        };
      }

      const selectedSku = purchase?.productId || STORE_SKUS.android[plan];
      const now = new Date();
      const expDate = new Date();
      if (plan === 'annual') {
        expDate.setFullYear(expDate.getFullYear() + 1);
      } else {
        expDate.setMonth(expDate.getMonth() + 1);
      }

      const receipt = {
        plan,
        sku: selectedSku,
        platform,
        purchaseDate: now.toISOString(),
        expirationTimestamp: expDate.getTime(),
        transactionId: purchase?.orderId || `LUMI-${platform.toUpperCase()}-${Date.now().toString().slice(-8)}`,
        purchaseToken: purchase?.purchaseToken,
        verified: true,
      };

      localStorage.setItem(LOCAL_STORAGE_SUB_KEY, JSON.stringify(receipt));

      setIsSubscribed(true);
      setActivePlan(plan);
      setSku(selectedSku);
      setPurchaseDate(now.toISOString());
      setExpirationDate(expDate.toLocaleDateString());

      soundManager.playSuccessChime();
      return {
        success: true,
        message:
          platform === 'android'
            ? 'تم تأكيد الاشتراك عبر Google Play Billing بنجاح! فُتحت جميع الدروس.'
            : platform === 'ios'
            ? 'تم تأكيد الاشتراك عبر Apple App Store بنجاح! فُتحت جميع الدروس.'
            : 'تم الاشتراك بنجاح! فُتحت جميع الأقسام والدروس.',
      };
    } catch (err: any) {
      soundManager.playEncouragementChime();
      return {
        success: false,
        message: err?.message || 'تعذر إتمام عملية الدفع. يرجى المحاولة مرة أخرى.',
      };
    } finally {
      setIsVerifying(false);
    }
  };

  // 4. Restore Purchases (استعادة المشتريات) - Apple App Store & Google Play requirement
  const restorePurchases = async (): Promise<{ success: boolean; message: string }> => {
    setIsVerifying(true);
    soundManager.playPop();

    try {
      // 1. First check remote Google Play purchases
      const remotePurchases = await googlePlayBillingService.queryPurchasesAsync();
      if (remotePurchases.length > 0) {
        const activePurchase =
          remotePurchases.find((p) => p.purchaseState === PurchaseState.PURCHASED) || remotePurchases[0];
        const isAnnual = activePurchase.productId.includes('annual');
        const plan: PlanType = isAnnual ? 'annual' : 'monthly';
        const now = new Date();
        const expDate = new Date();
        if (plan === 'annual') {
          expDate.setFullYear(expDate.getFullYear() + 1);
        } else {
          expDate.setMonth(expDate.getMonth() + 1);
        }

        const receipt = {
          plan,
          sku: activePurchase.productId,
          platform: 'android' as const,
          orderId: activePurchase.orderId,
          purchaseToken: activePurchase.purchaseToken,
          purchaseDate: now.toISOString(),
          expirationTimestamp: expDate.getTime(),
          transactionId: activePurchase.orderId,
          verified: true,
        };

        localStorage.setItem(LOCAL_STORAGE_SUB_KEY, JSON.stringify(receipt));
        setIsSubscribed(true);
        setActivePlan(plan);
        setSku(activePurchase.productId);
        setExpirationDate(expDate.toLocaleDateString());
        soundManager.playSuccessChime();
        return {
          success: true,
          message: 'تم استعادة اشتراكك الفعّال بنجاح عبر حساب Google Play!',
        };
      }

      // 2. Check local stored receipt
      const stored = localStorage.getItem(LOCAL_STORAGE_SUB_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const expTime = parsed.expirationTimestamp;
        if (expTime && expTime > Date.now()) {
          setIsSubscribed(true);
          setActivePlan(parsed.plan || 'monthly');
          setSku(parsed.sku);
          setExpirationDate(new Date(expTime).toLocaleDateString());
          soundManager.playSuccessChime();
          return {
            success: true,
            message:
              platform === 'android'
                ? 'تم استعادة اشتراكك الفعّال بنجاح عبر حساب Google Play!'
                : platform === 'ios'
                ? 'تم استعادة اشتراكك الفعّال بنجاح عبر حساب Apple ID!'
                : 'تم استعادة اشتراكك الفعّال بنجاح!',
          };
        }
      }

      // If no active receipt found:
      soundManager.playEncouragementChime();
      return {
        success: false,
        message:
          platform === 'android'
            ? 'لم يتم العثور على اشتراكات فعّالة مسجلة بحساب Google Play الحالي.'
            : platform === 'ios'
            ? 'لم يتم العثور على اشتراكات فعّالة مسجلة بحساب Apple ID الحالي.'
            : 'لم يتم العثور على اشتراك سابق فعال.',
      };
    } finally {
      setIsVerifying(false);
    }
  };

  // 5. Activate subscription manually from verified checkout
  const activateSubscription = (orderId: string, plan: 'monthly' | 'annual', paymentMethod: string) => {
    const selectedSku = platform === 'ios' ? STORE_SKUS.ios[plan] : STORE_SKUS.android[plan];
    const now = new Date();
    const expDate = new Date();
    if (plan === 'annual') {
      expDate.setFullYear(expDate.getFullYear() + 1);
    } else {
      expDate.setMonth(expDate.getMonth() + 1);
    }

    const receipt = {
      plan,
      sku: selectedSku,
      platform,
      purchaseDate: now.toISOString(),
      expirationTimestamp: expDate.getTime(),
      transactionId: orderId,
      paymentMethod,
      verified: true,
    };

    localStorage.setItem(LOCAL_STORAGE_SUB_KEY, JSON.stringify(receipt));

    setIsSubscribed(true);
    setActivePlan(plan);
    setSku(selectedSku);
    setPurchaseDate(now.toISOString());
    setExpirationDate(expDate.toLocaleDateString());
  };

  // 6. Cancel / Reset Subscription
  const cancelSubscription = () => {
    localStorage.removeItem(LOCAL_STORAGE_SUB_KEY);
    setIsSubscribed(false);
    setActivePlan('none');
    setSku(null);
    setPurchaseDate(null);
    setExpirationDate(null);
  };

  // 7. Check if a specific lesson or content piece is unlocked
  const isContentUnlocked = (contentType: keyof SubscriptionState['freeLimits'], index: number): boolean => {
    if (isSubscribed) return true; // Subscribed members get 100% unlocked content
    const limit = FREE_LIMITS[contentType] ?? 2;
    return index < limit; // Free tier access
  };

  return (
    <SubscriptionContext.Provider
      value={{
        isSubscribed,
        activePlan,
        platform,
        storeName,
        sku,
        purchaseDate,
        expirationDate,
        isVerifying,
        freeLimits: FREE_LIMITS,
        subscribe,
        activateSubscription,
        restorePurchases,
        cancelSubscription,
        isContentUnlocked,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export function useSubscription(): SubscriptionContextType {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
