import { Athlete, Category, DailyPuzzle } from '@/types';
import { ATHLETES } from './athletes';
import { CATEGORIES } from './categories';

// Canonical daily puzzle for active development
export const DAILY_PUZZLE: DailyPuzzle = {
  id: 'puzzle_daily_today',
  date: new Date().toISOString().split('T')[0],
  title: 'SportsGrid Daily',
  rowCategories: [
    CATEGORIES.METRO_NY,
    CATEGORIES.ACCOLADE_MVP,
    CATEGORIES.CAREER_3_TEAMS,
    CATEGORIES.ERA_ACTIVE_2020S,
  ],
  colCategories: [
    CATEGORIES.ACCOLADE_CHAMPION,
    CATEGORIES.METRO_BOSTON,
    CATEGORIES.CAREER_4_TEAMS,
    CATEGORIES.STAT_STEALS_100,
  ],
};

export const SAMPLE_PUZZLE: DailyPuzzle = DAILY_PUZZLE;

export function getDailyPuzzle(dateInput?: string | Date): DailyPuzzle {
  const targetDate = dateInput
    ? typeof dateInput === 'string'
      ? dateInput
      : dateInput.toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  return {
    ...DAILY_PUZZLE,
    id: `puzzle_${targetDate}`,
    date: targetDate,
  };
}

export function getPuzzleByNumber(puzzleNumber: number): DailyPuzzle {
  return DAILY_PUZZLE;
}

export function getAllPastPuzzles(currentDate?: string | Date): { puzzle: DailyPuzzle; puzzleNumber: number }[] {
  return [{ puzzle: DAILY_PUZZLE, puzzleNumber: 1 }];
}

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
