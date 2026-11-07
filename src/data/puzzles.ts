import { Athlete, Category, DailyPuzzle } from '@/types';
import { ATHLETES } from './athletes';
import { CATEGORIES } from './categories';

export const SAMPLE_PUZZLE: DailyPuzzle = {
  id: 'puzzle_daily_01',
  date: '2026-11-07',
  title: 'All-Sports 4×4 Inaugural Grid',
  rowCategories: [
    CATEGORIES.SPORT_NFL,
    CATEGORIES.SPORT_NBA,
    CATEGORIES.METRO_CHICAGO,
    CATEGORIES.NUMBER_23_OR_24,
  ],
  colCategories: [
    CATEGORIES.ACCOLADE_CHAMPION,
    CATEGORIES.ACCOLADE_MVP,
    CATEGORIES.DRAFT_FIRST_OVERALL,
    CATEGORIES.COLLEGE_SEC,
  ],
};

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
