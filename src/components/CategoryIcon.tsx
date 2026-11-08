import React from 'react';
import {
  Trophy,
  Timer,
  Award,
  Flame,
  Target,
  Hash,
  Sparkles,
  Shuffle,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { Category } from '@/types';

interface CategoryIconProps {
  category: Category;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ category, className = 'w-5 h-5' }) => {
  const catId = category.id.toLowerCase();
  const catName = category.name.toLowerCase();
  const catType = category.type;

  // 1. Championships / Rings / Accolades / MVP / HOF / Multi-Champ
  if (
    catId.includes('champion') ||
    catName.includes('champion') ||
    catId.includes('mvp') ||
    catId.includes('ring') ||
    catId.includes('title')
  ) {
    return <Trophy className={`${className} text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.5)]`} />;
  }

  // 2. Metro / Skyline
  if (
    catType === 'METRO' ||
    catId.includes('metro') ||
    catName.includes('metro') ||
    catId.includes('skyline') ||
    catName.includes('skyline')
  ) {
    return (
      <svg
        viewBox="0 0 32 32"
        className={`${className} text-cyan-300 drop-shadow-[0_0_8px_rgba(103,232,249,0.5)]`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 26H29" />
        <path d="M5 26V15H10V26" />
        <path d="M7 18H8M7 21H8" />
        <path d="M10 26V9H17V26" />
        <line x1="13.5" y1="4" x2="13.5" y2="9" strokeWidth="1.5" />
        <circle cx="13.5" cy="3.5" r="1" fill="currentColor" />
        <path d="M12 12H15M12 15H15M12 18H15M12 21H15" />
        <path d="M17 26V13H22V26" />
        <path d="M19 16H20M19 19H20M19 22H20" />
        <path d="M22 26V18H27V26" />
        <path d="M24 20H25M24 23H25" />
      </svg>
    );
  }

  // 3. Career Franchises (Journeyman vs 1-Franchise)
  if (catId.includes('teams') || catId.includes('franchise')) {
    if (catId.includes('one_franchise')) {
      return <ShieldCheck className={`${className} text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.5)]`} />;
    }
    return <Shuffle className={`${className} text-indigo-300 drop-shadow-[0_0_8px_rgba(165,180,252,0.5)]`} />;
  }

  // 4. Longevity / 10+ or 15+ Seasons / Decades & Eras
  if (
    catId.includes('2020s') ||
    catId.includes('2010s') ||
    catId.includes('2000s') ||
    catId.includes('1990s') ||
    catId.includes('1980s')
  ) {
    return <Calendar className={`${className} text-sky-300 drop-shadow-[0_0_8px_rgba(125,211,252,0.5)]`} />;
  }
  if (
    catId.includes('season') ||
    catId.includes('era') ||
    catName.includes('season') ||
    catName.includes('year')
  ) {
    return <Timer className={`${className} text-teal-300 drop-shadow-[0_0_8px_rgba(94,234,212,0.5)]`} />;
  }

  // 6. Jersey Numbers
  if (catId.includes('number')) {
    return <Hash className={`${className} text-pink-400 drop-shadow-[0_0_8px_rgba(244,114,182,0.5)]`} />;
  }

  // 7. Cross-Sport Stats
  if (catId.includes('points') || catId.includes('score')) {
    return <Flame className={`${className} text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]`} />;
  }
  if (
    catId.includes('assists') ||
    catId.includes('steals') ||
    catId.includes('hits') ||
    catId.includes('saves') ||
    catId.includes('turnovers')
  ) {
    return <Target className={`${className} text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]`} />;
  }
  if (catId.includes('hof') || catId.includes('rookie')) {
    return <Award className={`${className} text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]`} />;
  }

  // Fallback
  return <Sparkles className={`${className} text-cyan-300`} />;
};
