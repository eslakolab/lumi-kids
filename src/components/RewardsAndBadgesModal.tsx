import React, { useState } from 'react';
import { X, Award, Star, Lock, CheckCircle2, Sparkles, Printer } from 'lucide-react';
import { rewardsService, BadgeItem, CertificateData } from '../services/rewards';
import { resolveAssetUrl } from '../utils/assetResolver';

interface RewardsAndBadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  childName: string;
  avatarUrl: string;
  totalStars: number;
  onOpenCertificate: (cert: CertificateData) => void;
}

export const RewardsAndBadgesModal: React.FC<RewardsAndBadgesModalProps> = ({
  isOpen,
  onClose,
  childName,
  avatarUrl,
  totalStars,
  onOpenCertificate,
}) => {
  const [badges] = useState<BadgeItem[]>(() => rewardsService.getAllBadges());

  if (!isOpen) return null;

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  const handleGenerateCertificate = () => {
    const cert = rewardsService.generateCertificate(childName, resolveAssetUrl(avatarUrl), totalStars);
    onOpenCertificate(cert);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs text-right">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border-2 border-amber-200 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black">الشَّارَاتُ وَالْأَوْسِمَةُ التَّعْلِيمِيَّةُ</h3>
              <p className="text-xs text-amber-100">
                إِنْجَازَاتُ {childName || 'الْبَطَلِ الصَّغِيرِ'} فِي رِحْلَةِ التَّعَلُّمِ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Child Score Banner */}
        <div className="bg-amber-50/70 p-4 border-b border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full border-2 border-amber-300 overflow-hidden bg-white shadow-2xs">
              <img src={resolveAssetUrl(avatarUrl)} alt={childName} className="w-full h-full object-cover" />
            </div>
            <div>
              <h4 className="text-sm font-black text-amber-950">{childName || 'شَخْصِيَّتِي'}</h4>
              <span className="text-xs font-bold text-slate-500">
                الشَّارَاتُ الْمُكْتَسَبَةُ: {unlockedCount} مِنْ {badges.length}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-200/60 text-amber-950 rounded-xl font-black text-sm">
              <Star className="w-4 h-4 fill-amber-500 text-amber-600" />
              <span>{totalStars}</span>
            </div>
            <button
              onClick={handleGenerateCertificate}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1 active:scale-95 transition-all"
            >
              <Award className="w-3.5 h-3.5 text-yellow-200" />
              <span>شَهَادَةُ التَّفَوُّقِ</span>
            </button>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                  badge.unlocked
                    ? 'bg-gradient-to-br from-amber-50/80 to-orange-50/50 border-amber-300 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-2xs border ${
                    badge.unlocked
                      ? 'bg-white border-amber-300'
                      : 'bg-slate-200 border-slate-300'
                  }`}
                >
                  {badge.unlocked ? badge.icon : <Lock className="w-5 h-5 text-slate-400" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs sm:text-sm font-black text-amber-950">{badge.title}</h5>
                    {badge.unlocked && (
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        مُكْتَمَل ✓
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                    {badge.description}
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-amber-700">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-600" />
                    <span>مُكَافَأَةٌ: +{badge.starReward} نَجْمَةً</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
