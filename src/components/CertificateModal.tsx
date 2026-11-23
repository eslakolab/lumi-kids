import React, { useRef } from 'react';
import { X, Award, Printer, Download, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { CertificateData } from '../services/rewards';
import { resolveAssetUrl } from '../utils/assetResolver';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: CertificateData | null;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  certificate,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs text-right">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border-4 border-amber-300 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 p-4 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-yellow-300" />
            <div>
              <h3 className="text-lg font-black">شَهَادَةُ التَّفَوُّقِ وَالْإِتْمَامِ الرَّسْمِيَّةُ</h3>
              <p className="text-xs text-amber-100">شَهَادَةُ إِتْمَامٍ قَابِلَةٌ لِلطِّبَاعَةِ وَالْمُشَارَكَةِ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Printable Area */}
        <div className="p-4 sm:p-8 overflow-y-auto bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30">
          <div
            ref={printAreaRef}
            className="relative p-6 sm:p-10 rounded-3xl border-8 border-double border-amber-400 bg-white shadow-md text-center space-y-4"
          >
            {/* Top Emblem & Brand */}
            <div className="flex items-center justify-between border-b-2 border-amber-100 pb-3">
              <div className="text-right">
                <span className="text-[10px] sm:text-xs text-slate-400 font-bold block">مِنَصَّةُ لُومِي التَّعْلِيمِيَّةُ</span>
                <span className="text-xs sm:text-sm font-black text-amber-950">Lumi Kids Academy</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="text-left font-mono text-[10px] text-slate-400">
                <span>{certificate.certificateNumber}</span>
              </div>
            </div>

            {/* Certificate Header */}
            <div>
              <span className="text-xs sm:text-sm font-black text-amber-600 uppercase tracking-widest block mb-1">
                ★ شَهَادَةُ تَقْدِيرٍ وَتَفَوُّقٍ ★
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-amber-950 tracking-tight">
                وَسَامُ التَّمَيُّزِ التَّأْسِيسِيِّ
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              تَشْهَدُ إِدَارَةُ مِنَصَّةِ «لُومِي» التَّعْلِيمِيَّةِ بِأَنَّ الطِّفْلَ / الطِّفْلَةَ الْمُتَمَيِّزَ:
            </p>

            {/* Child Name & Avatar Highlight */}
            <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-300 rounded-full shadow-2xs my-1">
              <img
                src={resolveAssetUrl(certificate.avatarUrl)}
                alt={certificate.childName}
                className="w-10 h-10 rounded-full object-cover border-2 border-amber-400"
              />
              <span className="text-xl sm:text-2xl font-black text-amber-950">
                {certificate.childName}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-bold max-w-md mx-auto">
              قَدْ أَتَمَّ بِنَجَاحٍ بَاهِرٍ وَتَفَوُّقٍ مَسَارَ «تَعَلُّمِ الْحُرُوفِ الْعَرَبِيَّةِ بِالْحَرَكَاتِ وَالسُّكُونِ» وَحَصَلَ عَلَى رَصِيدِ <span className="text-amber-600 font-black">{certificate.totalStars} نَجْمَةً</span> بَعْدَ إِتْقَانِ كَافَّةِ التَّمَارِينِ.
            </p>

            {/* Certificate Seals & Signatures */}
            <div className="pt-6 border-t border-amber-100 flex items-center justify-between text-xs">
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">تَارِيخُ الْإِتْمَامِ:</span>
                <span className="font-bold text-slate-700">{certificate.completionDate}</span>
              </div>

              {/* Official Stamp */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-dashed border-amber-500 flex flex-col items-center justify-center text-amber-700 shadow-2xs rotate-12 bg-amber-50/50">
                <ShieldCheck className="w-6 h-6 text-amber-600" />
                <span className="text-[9px] font-black uppercase">مُعْتَمَدٌ 2026</span>
              </div>

              <div className="text-left">
                <span className="text-slate-400 block text-[10px]">خَتْمُ لُومِي:</span>
                <span className="font-black text-amber-900 font-serif">Lumi Verified ✓</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 print:hidden">
          <p className="text-xs text-slate-500 font-bold">
            يُمْكِنُكَ حِفْظُ الشَّهَادَةِ كَمَلَفٍّ أَوْ طِبَاعَتُهَا لِتَعْلِيقِهَا فِي غُرْفَةِ الطِّفْلِ!
          </p>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>طِبَاعَةُ الشَّهَادَةِ</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
            >
              إِغْلَاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
