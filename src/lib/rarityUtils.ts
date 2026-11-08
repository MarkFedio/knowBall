/**
 * Rarity tier classification and badge styling
 * Matches the official SportsGrid stadium neon aesthetic:
 * - < 1.0%: MYTHIC (Gold Glow)
 * - 1.0% - 5.0%: RARE (Emerald Glow)
 * - 5.0% - 15.0%: UNCOMMON (Cyan Glow)
 * - > 15.0%: COMMON (Steel / Slate)
 */

export type RarityTierName = 'MYTHIC' | 'RARE' | 'UNCOMMON' | 'COMMON';

export interface RarityTierMeta {
  tier: RarityTierName;
  badgeClass: string;
  pillClass: string;
  prefixIcon: string;
  label: string;
}

export function getRarityTier(rarityPercentage: number | undefined): RarityTierMeta {
  const r = rarityPercentage ?? 100;

  if (r < 1.0) {
    return {
      tier: 'MYTHIC',
      badgeClass:
        'bg-[#281b04]/90 text-amber-300 border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]',
      pillClass:
        'border border-amber-400/90 bg-[#281b04]/90 text-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.4)] font-mono font-black text-[10px] tracking-wide px-2 py-0.5 rounded-md',
      prefixIcon: '⭐',
      label: 'MYTHIC',
    };
  }

  if (r <= 5.0) {
    return {
      tier: 'RARE',
      badgeClass:
        'bg-[#062c19]/90 text-emerald-300 border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]',
      pillClass:
        'border border-emerald-400/90 bg-[#062c19]/90 text-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.4)] font-mono font-black text-[10px] tracking-wide px-2 py-0.5 rounded-md',
      prefixIcon: '💎',
      label: 'RARE',
    };
  }

  if (r <= 15.0) {
    return {
      tier: 'UNCOMMON',
      badgeClass:
        'bg-[#082f49]/90 text-cyan-300 border-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.4)]',
      pillClass:
        'border border-cyan-400/80 bg-[#082f49]/90 text-cyan-300 shadow-[0_0_6px_rgba(56,189,248,0.3)] font-mono font-black text-[10px] tracking-wide px-2 py-0.5 rounded-md',
      prefixIcon: '',
      label: 'UNCOMMON',
    };
  }

  return {
    tier: 'COMMON',
    badgeClass: 'bg-[#18202c]/90 text-slate-300 border-slate-500/80',
    pillClass:
      'border border-slate-600 bg-[#18202c]/90 text-slate-300 font-mono font-bold text-[10px] tracking-wide px-2 py-0.5 rounded-md',
    prefixIcon: '',
    label: 'COMMON',
  };
}
