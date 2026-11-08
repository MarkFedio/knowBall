/**
 * Rarity tier classification and badge styling
 */

export interface RarityTierMeta {
  tier: 'LEGENDARY' | 'RARE' | 'UNCOMMON' | 'POPULAR';
  badgeClass: string;
  prefixIcon: string;
  label: string;
}

export function getRarityTier(rarityPercentage: number | undefined): RarityTierMeta {
  const r = rarityPercentage ?? 100;

  if (r < 1.0) {
    return {
      tier: 'LEGENDARY',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-500/20',
      prefixIcon: '⭐',
      label: 'Deep Cut',
    };
  }

  if (r <= 5.0) {
    return {
      tier: 'RARE',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/10',
      prefixIcon: '💎',
      label: 'Rare Cut',
    };
  }

  if (r <= 15.0) {
    return {
      tier: 'UNCOMMON',
      badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      prefixIcon: '',
      label: 'Uncommon',
    };
  }

  return {
    tier: 'POPULAR',
    badgeClass: 'bg-zinc-800/80 text-zinc-300 border-zinc-700/80',
    prefixIcon: '',
    label: 'Popular',
  };
}
