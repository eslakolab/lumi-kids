import React from 'react';
import { resolveAssetUrl } from '../utils/assetResolver';

interface IllustrationProps {
  name: string;
  className?: string;
  alt?: string;
}

export const Illustration: React.FC<IllustrationProps> = ({ name, className = 'w-24 h-24', alt = '' }) => {
  const resolvedSrc = resolveAssetUrl(name);
  // If it's a file path to generated/bundled images
  if (
    resolvedSrc.startsWith('/src/assets/') ||
    resolvedSrc.startsWith('/assets/') ||
    resolvedSrc.startsWith('http') ||
    resolvedSrc.startsWith('data:image')
  ) {
    return (
      <img
        src={resolvedSrc}
        alt={alt || 'صورة توضيحية'}
        referrerPolicy="no-referrer"
        className={`object-cover rounded-2xl shadow-sm border-2 border-amber-100 ${className}`}
        loading="lazy"
        onError={(e) => {
          const target = e.target as HTMLElement;
          target.style.display = 'none';
        }}
      />
    );
  }

  // Render thematic SVG icons for children
  switch (name) {
    case 'car':
      return (
        <svg viewBox="0 0 60 50" className="w-12 h-10 inline-block drop-shadow-sm">
          <path d="M5 28 C5 24, 10 24, 15 24 L20 15 C22 11, 26 10, 32 10 L42 10 C46 10, 50 13, 53 18 L56 25 C58 26, 59 28, 59 31 L59 36 C59 38, 57 40, 55 40 L52 40 C52 35, 47 31, 42 31 C37 31, 32 35, 32 40 L23 40 C23 35, 18 31, 13 31 C8 31, 3 35, 3 40 L2 40 C1 40, 0 38, 0 36 L0 32 C0 29, 2 28, 5 28 Z" fill="#EF4444" />
          <path d="M22 15 L32 15 L32 24 L17 24 Z" fill="#BAE6FD" />
          <path d="M35 15 L45 15 L50 24 L35 24 Z" fill="#BAE6FD" />
          <circle cx="13" cy="39" r="6" fill="#1E293B" />
          <circle cx="13" cy="39" r="2.5" fill="#E2E8F0" />
          <circle cx="42" cy="39" r="6" fill="#1E293B" />
          <circle cx="42" cy="39" r="2.5" fill="#E2E8F0" />
          <circle cx="56" cy="30" r="2" fill="#FDE047" />
        </svg>
      );
    case 'apple':
      return (
        <svg viewBox="0 0 50 50" className="w-10 h-10 inline-block drop-shadow-sm">
          <ellipse cx="25" cy="28" rx="16" ry="15" fill="#EF4444" />
          <path d="M25 14 Q27 8 32 10" stroke="#78350F" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M26 14 Q32 12 34 16 Q30 18 26 14" fill="#22C55E" />
          <circle cx="20" cy="24" r="2.5" fill="#FCA5A5" opacity="0.6" />
        </svg>
      );
    case 'star':
      return (
        <svg viewBox="0 0 50 50" className="w-10 h-10 inline-block drop-shadow-sm animate-gentle-wiggle">
          <polygon points="25,5 31,18 45,19 34,29 38,43 25,35 12,43 16,29 5,19 19,18" fill="#FACC15" stroke="#EAB308" strokeWidth="2" />
        </svg>
      );
    case 'rabbit':
      return (
        <svg viewBox="0 0 50 50" className="w-10 h-10 inline-block drop-shadow-sm">
          <ellipse cx="25" cy="30" rx="14" ry="12" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
          <ellipse cx="20" cy="14" rx="4" ry="10" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
          <ellipse cx="20" cy="14" rx="2" ry="7" fill="#F472B6" />
          <ellipse cx="30" cy="14" rx="4" ry="10" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
          <ellipse cx="30" cy="14" rx="2" ry="7" fill="#F472B6" />
          <circle cx="21" cy="28" r="2" fill="#1E293B" />
          <circle cx="29" cy="28" r="2" fill="#1E293B" />
          <circle cx="25" cy="33" r="1.5" fill="#F472B6" />
        </svg>
      );
    case 'ball':
      return (
        <svg viewBox="0 0 50 50" className="w-10 h-10 inline-block drop-shadow-sm">
          <circle cx="25" cy="25" r="18" fill="#3B82F6" />
          <path d="M12 18 Q25 25 38 18" stroke="#FDE047" strokeWidth="4" fill="none" />
          <path d="M12 32 Q25 25 38 32" stroke="#FDE047" strokeWidth="4" fill="none" />
        </svg>
      );
    case 'cat-small':
    case 'svg:cat':
      return (
        <svg viewBox="0 0 60 55" className="w-12 h-10 inline-block drop-shadow-sm">
          <ellipse cx="30" cy="32" rx="18" ry="16" fill="#F59E0B" />
          <polygon points="16,22 10,8 24,16" fill="#D97706" />
          <polygon points="44,22 50,8 36,16" fill="#D97706" />
          <circle cx="23" cy="30" r="3" fill="#1F2937" />
          <circle cx="37" cy="30" r="3" fill="#1F2937" />
          <ellipse cx="30" cy="36" rx="2.5" ry="1.8" fill="#F43F5E" />
          <path d="M26 38 Q30 42 34 38" stroke="#78350F" strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>
      );
    case 'svg:book':
      return (
        <div className={`flex items-center justify-center bg-sky-100 rounded-2xl p-3 border-2 border-sky-200 ${className}`}>
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
            <path d="M15 25 C30 20, 45 22, 50 30 C55 22, 70 20, 85 25 L85 75 C70 70, 55 72, 50 80 C45 72, 30 70, 15 75 Z" fill="#38BDF8" stroke="#0284C7" strokeWidth="4" />
            <path d="M50 30 L50 80" stroke="#0369A1" strokeWidth="4" strokeLinecap="round" />
            <path d="M22 35 C32 32, 42 33, 46 38" stroke="#E0F2FE" strokeWidth="3" strokeLinecap="round" />
            <path d="M22 45 C32 42, 42 43, 46 48" stroke="#E0F2FE" strokeWidth="3" strokeLinecap="round" />
            <path d="M54 38 C58 33, 68 32, 78 35" stroke="#E0F2FE" strokeWidth="3" strokeLinecap="round" />
            <path d="M54 48 C58 43, 68 42, 78 45" stroke="#E0F2FE" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      );
    case 'svg:house':
      return (
        <div className={`flex items-center justify-center bg-rose-100 rounded-2xl p-3 border-2 border-rose-200 ${className}`}>
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
            <polygon points="50,15 15,45 85,45" fill="#E11D48" stroke="#BE123C" strokeWidth="3" />
            <rect x="22" y="45" width="56" height="42" rx="4" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="3" />
            <rect x="42" y="58" width="16" height="29" rx="2" fill="#92400E" />
            <circle cx="53" cy="72" r="2" fill="#FDE047" />
            <rect x="27" y="52" width="10" height="12" rx="2" fill="#67E8F9" stroke="#0891B2" strokeWidth="2" />
            <rect x="63" y="52" width="10" height="12" rx="2" fill="#67E8F9" stroke="#0891B2" strokeWidth="2" />
          </svg>
        </div>
      );
    case 'svg:flower':
      return (
        <div className={`flex items-center justify-center bg-pink-100 rounded-2xl p-3 border-2 border-pink-200 ${className}`}>
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
            <path d="M50 50 L50 90" stroke="#15803D" strokeWidth="5" strokeLinecap="round" />
            <path d="M50 70 Q30 65 35 75 Q45 75 50 70" fill="#22C55E" />
            <circle cx="50" cy="35" r="13" fill="#F43F5E" />
            <circle cx="64" cy="45" r="13" fill="#FB7185" />
            <circle cx="59" cy="62" r="13" fill="#F43F5E" />
            <circle cx="41" cy="62" r="13" fill="#FB7185" />
            <circle cx="36" cy="45" r="13" fill="#F43F5E" />
            <circle cx="50" cy="49" r="10" fill="#FACC15" stroke="#EAB308" strokeWidth="2" />
          </svg>
        </div>
      );
    case 'svg:sun':
      return (
        <div className={`flex items-center justify-center bg-amber-100 rounded-2xl p-3 border-2 border-amber-200 ${className}`}>
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
            <circle cx="50" cy="50" r="22" fill="#F59E0B" stroke="#D97706" strokeWidth="3" />
            <circle cx="42" cy="47" r="3" fill="#78350F" />
            <circle cx="58" cy="47" r="3" fill="#78350F" />
            <path d="M44 56 Q50 62 56 56" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <line
                key={i}
                x1={50 + 28 * Math.cos((angle * Math.PI) / 180)}
                y1={50 + 28 * Math.sin((angle * Math.PI) / 180)}
                x2={50 + 38 * Math.cos((angle * Math.PI) / 180)}
                y2={50 + 38 * Math.sin((angle * Math.PI) / 180)}
                stroke="#F59E0B"
                strokeWidth="4"
                strokeLinecap="round"
              />
            ))}
          </svg>
        </div>
      );
    case 'fish':
    case 'svg:fish':
      return (
        <div className={`flex items-center justify-center bg-cyan-100 rounded-2xl p-1.5 border border-cyan-200 ${className}`}>
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
            <path d="M20 50 C35 30, 65 30, 80 50 C65 70, 35 70, 20 50 Z" fill="#0EA5E9" stroke="#0284C7" strokeWidth="3" />
            <polygon points="20,50 5,35 5,65" fill="#38BDF8" stroke="#0284C7" strokeWidth="3" />
            <circle cx="65" cy="46" r="3.5" fill="#1E293B" />
            <circle cx="66" cy="45" r="1" fill="#FFFFFF" />
            <path d="M72 52 Q76 55 72 57" stroke="#0284C7" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M45 42 Q50 50 45 58" stroke="#BAE6FD" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      );
    // Geometric Shapes for Brain Games
    case 'circle':
      return (
        <svg viewBox="0 0 50 50" className="w-12 h-12 inline-block">
          <circle cx="25" cy="25" r="20" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="3" />
        </svg>
      );
    case 'square':
      return (
        <svg viewBox="0 0 50 50" className="w-12 h-12 inline-block">
          <rect x="7" y="7" width="36" height="36" rx="6" fill="#10B981" stroke="#047857" strokeWidth="3" />
        </svg>
      );
    case 'triangle':
      return (
        <svg viewBox="0 0 50 50" className="w-12 h-12 inline-block">
          <polygon points="25,6 45,42 5,42" fill="#F59E0B" stroke="#B45309" strokeWidth="3" />
        </svg>
      );
    case 'rectangle':
      return (
        <svg viewBox="0 0 60 40" className="w-14 h-10 inline-block">
          <rect x="4" y="6" width="52" height="28" rx="6" fill="#8B5CF6" stroke="#6D28D9" strokeWidth="3" />
        </svg>
      );
    default:
      return (
        <div className={`flex items-center justify-center bg-amber-100 rounded-2xl text-amber-700 font-bold ${className}`}>
          {name}
        </div>
      );
  }
};
