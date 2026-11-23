import React, { useState } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Brain,
  Award,
  Clock,
  BookOpen,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Calendar,
  Layers,
  Printer,
  RotateCcw,
  CreditCard,
  Lock,
} from 'lucide-react';
import { learningPathsManager, LearningTrack, AIRecommendation } from '../services/learningPaths';
import { rewardsService, CertificateData } from '../services/rewards';

interface ParentDashboardProps {
  onBack: () => void;
  onOpenPlans?: () => void;
  onOpenAdmin?: () => void;
  childName: string;
  avatarUrl: string;
  totalStars: number;
  completedLettersCount: number;
  spellingScore: number;
  onOpenCertificate: (cert: CertificateData) => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  onBack,
  onOpenPlans,
  onOpenAdmin,
  childName,
  avatarUrl,
  totalStars,
  completedLettersCount,
  spellingScore,
  onOpenCertificate,
}) => {
  const [tracks] = useState<LearningTrack[]>(() => learningPathsManager.getTracks());
  const [activeTrack, setActiveTrack] = useState<LearningTrack>(() => learningPathsManager.getActiveTrack());

  // AI Adaptive Recommendation
  const [aiRecommendation] = useState<AIRecommendation>(() =>
    learningPathsManager.getAIRecommendation({
      completedLettersCount,
      spellingScore,
      starsCount: totalStars,
    })
  );

  const handleSelectTrack = (trackId: string) => {
    learningPathsManager.setActiveTrack(trackId);
    setActiveTrack(learningPathsManager.getActiveTrack());
  };

  const handleViewCertificate = () => {
    const cert = rewardsService.generateCertificate(childName, avatarUrl, totalStars);
    onOpenCertificate(cert);
  };

  return (
    <div className="space-y-6 text-right pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-white/20 rounded-full text-xs font-black uppercase">
              Parent Portal
            </span>
            <span className="text-xs text-teal-100 font-medium">
              بَوَّابَةُ وَلِيِّ الْأَمْرِ لِمُتَابَعَةِ التَّقَدُّمِ وَالتَّعَلُّمِ التَّكَيُّفِيِّ
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black">
            تَقْرِيرُ تَقَدُّمِ {childName || 'الطِّفْلِ'}
          </h2>
          <p className="text-xs md:text-sm text-teal-100 mt-1">
            مُتَابَعَةُ الْوَقْتِ الْمُنْقَضِي، مَسَارَاتِ التَّعَلُّمِ، وَتَوْصِيَاتِ الذَّكَاءِ الِاصْطِنَاعِيِّ التَّكَيُّفِيِّ
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {onOpenPlans && (
            <button
              onClick={onOpenPlans}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-orange-400 text-amber-950 hover:from-amber-300 hover:to-orange-300 rounded-2xl font-black text-xs sm:text-sm shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <CreditCard className="w-4 h-4 text-amber-950" />
              <span>بَاقَاتُ الِاشْتِرَاكِ 💳</span>
            </button>
          )}
          <button
            onClick={handleViewCertificate}
            className="px-4 py-2.5 bg-white text-teal-900 hover:bg-teal-50 rounded-2xl font-black text-xs sm:text-sm shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            <Award className="w-4 h-4 text-amber-500" />
            <span>شَهَادَةُ التَّفَوُّقِ</span>
          </button>
          <button
            onClick={onBack}
            className="px-4 py-2.5 bg-black/20 hover:bg-black/30 text-white rounded-2xl font-bold text-xs sm:text-sm cursor-pointer"
          >
            الرُّجُوعُ
          </button>
        </div>
      </div>

      {/* Subscription & Family Premium Banner Card */}
      {onOpenPlans && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-5 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 border-2 border-amber-300">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-inner">
              <Sparkles className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-black text-white mb-1">
                <span>عُضْوِيَّةُ لُومِي الْمُمَيَّزَة (Google Play & App Store)</span>
              </div>
              <h3 className="text-lg font-black">
                فَتْحُ كَافَّةِ الْحُرُوفِ، الْقِصَصِ التَّفَاعُلِيَّةِ، وَإِزَالَةُ الْإِعْلَانَاتِ
              </h3>
              <p className="text-xs text-amber-100 font-medium">
                بَاقَةٌ عَائِلِيَّةٌ آمِنَةٌ 100% مَعَ مِيزَاتِ التَّعَلُّمِ الذَّكِيِّ وَالشَّهَادَاتِ الْمُعْتَمَدَة
              </p>
            </div>
          </div>
          <button
            onClick={onOpenPlans}
            className="w-full sm:w-auto px-5 py-3 bg-white text-amber-950 hover:bg-amber-50 rounded-2xl font-black text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 shrink-0"
          >
            <CreditCard className="w-4 h-4 text-amber-600" />
            <span>الِانْتِقَالُ إِلَى بَاقَاتِ الِاشْتِرَاكِ</span>
          </button>
        </div>
      )}

      {/* 4 Core Progress Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-3xl border-2 border-emerald-200 shadow-2xs text-center">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-xs text-slate-500 font-bold block mb-1">وَقْتُ التَّعَلُّمِ الْيَوْم</span>
          <span className="text-2xl font-black text-slate-900">١٨ دَقِيقَةً</span>
          <span className="text-[10px] text-emerald-600 font-bold block mt-1">سَاعَتَانِ وَ ١٥ د هَذَا الْأُسْبُوع</span>
        </div>

        <div className="p-4 bg-white rounded-3xl border-2 border-amber-200 shadow-2xs text-center">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-2">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-xs text-slate-500 font-bold block mb-1">الْحُرُوفُ الْمُتْقَنَةُ</span>
          <span className="text-2xl font-black text-amber-950">{completedLettersCount} مِنْ ٢٨</span>
          <span className="text-[10px] text-amber-600 font-bold block mt-1">بِالْفَتْحِ وَالضَّمِّ وَالسُّكُونِ</span>
        </div>

        <div className="p-4 bg-white rounded-3xl border-2 border-blue-200 shadow-2xs text-center">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="text-xs text-slate-500 font-bold block mb-1">دِقَّةُ التَّهْجِئَةِ</span>
          <span className="text-2xl font-black text-blue-950">{spellingScore * 4}%</span>
          <span className="text-[10px] text-blue-600 font-bold block mt-1">تَقَدُّمٌ مُسْتَمِرٌّ فِي الْكَلِمَاتِ</span>
        </div>

        <div className="p-4 bg-white rounded-3xl border-2 border-purple-200 shadow-2xs text-center">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-2">
            <Award className="w-5 h-5" />
          </div>
          <span className="text-xs text-slate-500 font-bold block mb-1">الْأَوْسِمَةُ الْمُكْتَسَبَةُ</span>
          <span className="text-2xl font-black text-purple-950">٤ شَارَاتٍ</span>
          <span className="text-[10px] text-purple-600 font-bold block mt-1">رَصِيدُ النُّجُومِ: {totalStars} ⭐</span>
        </div>
      </div>

      {/* Section 1: AI Adaptive Learning Recommendation */}
      <div className="bg-gradient-to-r from-amber-50 via-white to-orange-50 rounded-3xl p-6 border-2 border-amber-300 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-2xs">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-amber-950">
                تَوْصِيَةُ الذَّكَاءِ الِاصْطِنَاعِيِّ التَّكَيُّفِيِّ لِلطِّفْلِ (AI Tutor)
              </h3>
              <p className="text-xs text-slate-500">
                تَحْلِيلٌ ذَكِيٌّ لِأَدَاءِ الطِّفْلِ مَعَ تَعْدِيلِ الصُّعُوبَةِ تِلْقَائِيًّا
              </p>
            </div>
          </div>

          <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-black">
            دِقَّةُ التَّحْلِيلِ: {aiRecommendation.confidenceScore}%
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-amber-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
              الْمَهَارَةُ الْمُسْتَهْدَفَةُ: {aiRecommendation.targetSkill}
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              مُسْتَوَى الصُّعُوبَةِ: {aiRecommendation.difficultyAdjustment === 'optimal' ? 'مِثَالِيٌّ لِسِنِّ الطِّفْلِ' : 'تَحَدٍّ إِضَافِيٌّ'}
            </span>
          </div>

          <h4 className="text-base font-black text-slate-900">
            الْخُطْوَةُ التَّالِيَةُ الْمُقْتَرَحَةُ: «{aiRecommendation.recommendedLessonTitle}»
          </h4>

          <p className="text-xs text-slate-600 leading-relaxed">
            {aiRecommendation.reason}
          </p>
        </div>
      </div>

      {/* Section 2: Multi-Track Curricula Selector */}
      <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-teal-600" />
            <h3 className="text-lg font-black text-slate-900">
              الْمَسَارَاتُ التَّعْلِيمِيَّةُ الْمُتَعَدِّدَةُ (Multi-track Curricula)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-bold">
            اخْتَرْ مَسَارَ طِفْلِكَ الْمُنَاسِبَ لِعُمْرِهِ
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tracks.map((track) => {
            const isSelected = activeTrack.id === track.id;
            return (
              <div
                key={track.id}
                onClick={() => handleSelectTrack(track.id)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-teal-500 bg-teal-50/50 shadow-xs ring-2 ring-teal-300'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{track.icon}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {track.ageGroup}
                    </span>
                  </div>

                  <h4 className="text-base font-black text-slate-900 mb-1">{track.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">{track.description}</p>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {track.targetSkills.map((skill, i) => (
                      <span key={i} className="text-[10px] font-bold px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded-md">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs font-bold">
                  <span className="text-slate-500">
                    أَنْجَزَ {track.completedModules} مِنْ {track.totalModules} وَحْدَةً
                  </span>
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-black ${
                    isSelected ? 'bg-teal-600 text-white' : 'bg-white border border-slate-300 text-slate-700'
                  }`}>
                    {isSelected ? 'الْمَسَارُ النَّشِطُ حَالِيًّا ✓' : 'اخْتِيَارُ هَذَا الْمَسَارِ'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Discreet Admin Entry for App Owner */}
      {onOpenAdmin && (
        <div className="pt-4 border-t border-slate-200 text-center">
          <button
            onClick={onOpenAdmin}
            className="text-[11px] text-slate-400 hover:text-slate-600 font-bold flex items-center justify-center gap-1.5 mx-auto cursor-pointer transition-colors"
          >
            <Lock className="w-3 h-3 text-slate-400" />
            <span>لَوْحَةُ تَحَكُّمِ الْمُشْرِفِ (Admin CMS)</span>
          </button>
        </div>
      )}
    </div>
  );
};
