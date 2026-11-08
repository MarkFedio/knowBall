import { Athlete, Category, DailyPuzzle } from '@/types';
import { ATHLETES } from './athletes';
import { CATEGORIES } from './categories';
import { PUZZLE_BANK } from './puzzleBank';

// Canonical launch epoch for day numbering
export const LAUNCH_EPOCH = new Date('2026-11-01T00:00:00');

export function getDaysSinceEpoch(dateInput?: string | Date): number {
  const d = dateInput
    ? typeof dateInput === 'string'
      ? new Date(dateInput + (dateInput.includes('T') ? '' : 'T00:00:00'))
      : dateInput
    : new Date();

  const diffMs = d.getTime() - LAUNCH_EPOCH.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export function getDailyPuzzle(dateInput?: string | Date): DailyPuzzle {
  const targetDate = dateInput
    ? typeof dateInput === 'string'
      ? dateInput
      : dateInput.toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  const daysElapsed = getDaysSinceEpoch(targetDate);
  const puzzleNumber = daysElapsed + 1;
  const configIndex = daysElapsed % PUZZLE_BANK.length;
  const config = PUZZLE_BANK[configIndex];

  return {
    ...config,
    id: `puzzle_${targetDate}`,
    date: targetDate,
    title: `SportsGrid #${puzzleNumber}`,
  };
}

export function getPuzzleByNumber(puzzleNumber: number): DailyPuzzle {
  const num = Math.max(1, puzzleNumber);
  const configIndex = (num - 1) % PUZZLE_BANK.length;
  const config = PUZZLE_BANK[configIndex];

  // Calculate corresponding date from epoch
  const dateObj = new Date(LAUNCH_EPOCH.getTime() + (num - 1) * 24 * 60 * 60 * 1000);
  const dateStr = dateObj.toISOString().split('T')[0];

  return {
    ...config,
    id: `puzzle_${dateStr}`,
    date: dateStr,
    title: `SportsGrid #${num}`,
  };
}

export function getAllPastPuzzles(currentDate?: string | Date): { puzzle: DailyPuzzle; puzzleNumber: number }[] {
  const daysElapsed = getDaysSinceEpoch(currentDate);
  const totalPuzzles = Math.max(1, daysElapsed + 1);
  const list: { puzzle: DailyPuzzle; puzzleNumber: number }[] = [];

  for (let n = totalPuzzles; n >= 1; n--) {
    list.push({
      puzzle: getPuzzleByNumber(n),
      puzzleNumber: n,
    });
  }

  return list;
}

export const DAILY_PUZZLE: DailyPuzzle = getDailyPuzzle();
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
