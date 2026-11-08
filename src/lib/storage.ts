import { CareerStats, SavedGameState } from '@/types';

const STORAGE_KEYS = {
  GAME_PREFIX: 'knowball_game_',
  CAREER_STATS: 'knowball_career_stats',
  LEGACY_GAME_PREFIX: 'sportsgrid_game_',
  LEGACY_CAREER_STATS: 'sportsgrid_career_stats',
};

export const DEFAULT_CAREER_STATS: CareerStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  immaculateCompletions: 0,
  currentStreak: 0,
  maxStreak: 0,
  bestRarityScore: null,
  averageRarityScore: 0,
  totalCorrectCells: 0,
  grandSlamsAchieved: 0,
  completedPuzzleIds: [],
};

function isClient(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/**
 * Saves current in-progress or completed puzzle state to localStorage.
 */
export function saveGameState(state: SavedGameState): void {
  if (!isClient()) return;
  try {
    const key = `${STORAGE_KEYS.GAME_PREFIX}${state.puzzleId}`;
    window.localStorage.setItem(key, JSON.stringify(state));
  } catch (err) {
    console.warn('Failed to save game state to localStorage:', err);
  }
}

/**
 * Loads saved state for a specific puzzle ID if it exists.
 */
export function loadGameState(puzzleId: string): SavedGameState | null {
  if (!isClient()) return null;
  try {
    const key = `${STORAGE_KEYS.GAME_PREFIX}${puzzleId}`;
    const legacyKey = `${STORAGE_KEYS.LEGACY_GAME_PREFIX}${puzzleId}`;
    const raw = window.localStorage.getItem(key) || window.localStorage.getItem(legacyKey);
    if (!raw) return null;
    return JSON.parse(raw) as SavedGameState;
  } catch (err) {
    console.warn('Failed to load game state from localStorage:', err);
    return null;
  }
}

/**
 * Deletes saved puzzle state from localStorage (e.g. on Reset Game).
 */
export function clearGameState(puzzleId: string): void {
  if (!isClient()) return;
  try {
    const key = `${STORAGE_KEYS.GAME_PREFIX}${puzzleId}`;
    window.localStorage.removeItem(key);
  } catch (err) {
    console.warn('Failed to clear game state from localStorage:', err);
  }
}

/**
 * Loads cumulative lifetime player career stats.
 */
export function loadCareerStats(): CareerStats {
  if (!isClient()) return DEFAULT_CAREER_STATS;
  try {
    const raw =
      window.localStorage.getItem(STORAGE_KEYS.CAREER_STATS) ||
      window.localStorage.getItem(STORAGE_KEYS.LEGACY_CAREER_STATS);
    if (!raw) return DEFAULT_CAREER_STATS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_CAREER_STATS,
      ...parsed,
    };
  } catch (err) {
    console.warn('Failed to load career stats from localStorage:', err);
    return DEFAULT_CAREER_STATS;
  }
}

/**
 * Helper to check if two ISO date strings (YYYY-MM-DD) are consecutive calendar days.
 */
function areConsecutiveDays(prevDateStr: string, currDateStr: string): boolean {
  try {
    const dPrev = new Date(prevDateStr + 'T00:00:00');
    const dCurr = new Date(currDateStr + 'T00:00:00');
    const diffMs = dCurr.getTime() - dPrev.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    return diffDays === 1;
  } catch {
    return false;
  }
}

/**
 * Records the outcome of a completed puzzle in lifetime career stats.
 * Avoids double-counting if the puzzle was already recorded.
 */
export function recordGameFinished(params: {
  puzzleId: string;
  date: string;
  isWon: boolean;
  isImmaculate: boolean;
  correctCount: number;
  rarityScore: number;
  hasGrandSlam: boolean;
}): CareerStats {
  const current = loadCareerStats();

  // If this puzzle was already recorded, return current stats without modifying
  if (current.completedPuzzleIds.includes(params.puzzleId)) {
    return current;
  }

  const updated: CareerStats = {
    ...current,
    gamesPlayed: current.gamesPlayed + 1,
    totalCorrectCells: current.totalCorrectCells + params.correctCount,
    completedPuzzleIds: [...current.completedPuzzleIds, params.puzzleId],
    lastPlayedDate: params.date,
  };

  if (params.hasGrandSlam) {
    updated.grandSlamsAchieved = (current.grandSlamsAchieved || 0) + 1;
  }

  if (params.isWon) {
    updated.gamesWon = current.gamesWon + 1;

    if (params.isImmaculate) {
      updated.immaculateCompletions = (current.immaculateCompletions || 0) + 1;
    }

    // Best rarity score (lower is better)
    if (current.bestRarityScore === null || params.rarityScore < current.bestRarityScore) {
      updated.bestRarityScore = Math.round(params.rarityScore * 10) / 10;
    }

    // Running average rarity calculation
    const prevTotalRarity = current.averageRarityScore * current.gamesWon;
    const newTotalRarity = prevTotalRarity + params.rarityScore;
    updated.averageRarityScore = Math.round((newTotalRarity / updated.gamesWon) * 10) / 10;

    // Daily streak logic
    if (!current.lastWonDate) {
      updated.currentStreak = 1;
    } else if (current.lastWonDate === params.date) {
      // Same day, streak remains
      updated.currentStreak = Math.max(1, current.currentStreak);
    } else if (areConsecutiveDays(current.lastWonDate, params.date)) {
      updated.currentStreak = current.currentStreak + 1;
    } else {
      updated.currentStreak = 1;
    }

    updated.lastWonDate = params.date;
    updated.maxStreak = Math.max(updated.maxStreak, updated.currentStreak);
  } else {
    // Loss: resets current streak
    updated.currentStreak = 0;
  }

  if (isClient()) {
    try {
      window.localStorage.setItem(STORAGE_KEYS.CAREER_STATS, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to save career stats to localStorage:', err);
    }
  }

  return updated;
}
