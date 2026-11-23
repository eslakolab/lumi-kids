import React, { useState, useEffect } from 'react';
import { useSubscription } from '../context/SubscriptionContext';
import { adMobManager, SafeChildAd } from '../services/admob';
import { Sparkles, ShieldCheck } from 'lucide-react';

interface AdMobBannerProps {
  onUpgradeClick?: () => void;
  position?: 'bottom' | 'inline';
}

export const AdMobBanner: React.FC<AdMobBannerProps> = ({
  onUpgradeClick,
  position = 'bottom',
}) => {
  const { isSubscribed } = useSubscription();
  const [currentAd, setCurrentAd] = useState<SafeChildAd | null>(null);
  const [adInteracted, setAdInteracted] = useState<boolean>(false);

  useEffect(() => {
    adMobManager.updateSubscriptionStatus(isSubscribed);
    if (!isSubscribed && adMobManager.canShowAds()) {
      setCurrentAd(adMobManager.getRandomSafeAd());
    } else {
      setCurrentAd(null);
    }
  }, [isSubscribed]);

  // NEVER show ads to subscribed users OR when ads are disabled (e.g. unconfigured in production)
  if (isSubscribed || !adMobManager.canShowAds() || !currentAd) {
    return null;
  }

  return (
    <aside
      aria-label="إعلان موجه للأطفال متوافق مع سياسات حماية الطفل"
      className={`w-full max-w-4xl mx-auto my-2 px-3 py-2 bg-gradient-to-r from-amber-50 via-white to-orange-50 border border-amber-200 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 ${
        position === 'bottom' ? 'sticky bottom-1 z-30' : ''
      }`}
    >
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-xl shrink-0 shadow-2xs">
          {currentAd.icon}
        </div>
        <div className="text-right flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md border border-slate-200">
              AdMob
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              {currentAd.badgeText}
            </span>
          </div>
          <p className="text-xs font-black text-amber-950 mt-0.5">
            {currentAd.title}
          </p>
          <p className="text-[11px] text-slate-600 line-clamp-1">
            {currentAd.description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        {onUpgradeClick && (
          <button
            onClick={onUpgradeClick}
            className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline px-2 py-1 cursor-pointer"
          >
            إِزَالَةُ الْإِعْلَانَاتِ
          </button>
        )}
        <button
          onClick={() => {
            // Child-safe interaction simulation without window.alert
            setAdInteracted(true);
            setTimeout(() => setAdInteracted(false), 2500);
          }}
          className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-black shadow-2xs cursor-pointer flex items-center gap-1 active:scale-95 transition-all"
        >
          <Sparkles className="w-3 h-3" />
          <span>{adInteracted ? 'شُكْرًا لَكَ! 🌟' : currentAd.callToAction}</span>
        </button>
      </div>
    </aside>
  );
};
