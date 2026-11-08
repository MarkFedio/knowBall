import { Athlete, Category, DailyPuzzle } from '@/types';
import { ATHLETES } from './athletes';
import { CATEGORIES } from './categories';

export const DAILY_PUZZLE: DailyPuzzle = {
  id: 'daily_grid_01',
  date: '2026-11-08',
  title: 'All-Sports Daily 4×4 Grid',
  rowCategories: [
    CATEGORIES.METRO_BOSTON,
    CATEGORIES.METRO_NY,
    CATEGORIES.METRO_CHICAGO,
    CATEGORIES.METRO_LA,
  ],
  colCategories: [
    CATEGORIES.STAT_STEALS_500,
    CATEGORIES.STAT_ASSISTS_1000,
    CATEGORIES.ACCOLADE_CHAMPION,
    CATEGORIES.ACCOLADE_MVP,
  ],
};

export const SAMPLE_PUZZLE: DailyPuzzle = DAILY_PUZZLE;

/**
 * Returns all athletes matching both the row and column categories.
 */
export function getValidAthletesForCell(
  rowCat: Category,
  colCat: Category,
  athletes: Athlete[] = ATHLETES
): Athlete[] {
  return athletes.filter((a) => rowCat.matches(a) && colCat.matches(a));
}

/**
 * Validates a single guess against a cell.
 */
export function validateGuess(
  rowCat: Category,
  colCat: Category,
  athlete: Athlete
): { isCorrect: boolean; validAnswersCount: number; rarityPercentage: number } {
  const matchesRow = rowCat.matches(athlete);
  const matchesCol = colCat.matches(athlete);
  const isCorrect = matchesRow && matchesCol;

  const validPool = getValidAthletesForCell(rowCat, colCat);
  const validAnswersCount = validPool.length;

  if (!isCorrect) {
    return { isCorrect: false, validAnswersCount, rarityPercentage: 0 };
  }

  // Calculate simulated rarity score based on popularity score relative to the valid pool
  const totalPopularity = validPool.reduce((sum, a) => sum + (a.popularityScore || 50), 0);
  const athletePopularity = athlete.popularityScore || 50;

  // More popular athletes have higher rarity % (common guess), obscure athletes have low % (rare guess)
  const rawRarity = (athletePopularity / totalPopularity) * 100;
  const rarityPercentage = Math.max(0.1, Math.round(rawRarity * 10) / 10);

  return { isCorrect: true, validAnswersCount, rarityPercentage };
}
