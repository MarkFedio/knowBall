import { DailyPuzzle } from '@/types';
import { ATHLETES } from './athletes';
import { generateProceduralPuzzle } from '@/lib/gridGenerator';

// Re-export cell validation utilities for backward compatibility and clean modular DAG
export {
  METRO_MARKET_CODES,
  getMetroSingleEventIntersection,
  getMetroChampIntersection,
  doesAthleteMatchCell,
  getValidAthletesForCell,
  validateGuess,
} from '@/lib/cellValidator';
export type { SingleEventAccoladeType, MetroSingleEventIntersection } from '@/lib/cellValidator';

/**
 * KnowBall inaugural epoch date (Day 1).
 */
export const KNOWBALL_EPOCH = '2026-01-01';

/**
 * Returns the 1-based puzzle number for a given YYYY-MM-DD date string.
 * Puzzle #1 is on KNOWBALL_EPOCH (2026-01-01).
 */
export function getPuzzleNumberForDate(dateStr: string): number {
  const epoch = new Date(`${KNOWBALL_EPOCH}T00:00:00Z`).getTime();
  const target = new Date(`${dateStr}T00:00:00Z`).getTime();
  const diffDays = Math.floor((target - epoch) / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays + 1);
}

/**
 * Returns the YYYY-MM-DD date string for a given 1-based puzzle number.
 */
export function getDateForPuzzleNumber(puzzleNumber: number): string {
  const epoch = new Date(`${KNOWBALL_EPOCH}T00:00:00Z`).getTime();
  const targetTime = epoch + (Math.max(1, puzzleNumber) - 1) * 86400000;
  return new Date(targetTime).toISOString().split('T')[0];
}

// In-memory cache for daily procedural puzzles
const PUZZLE_CACHE = new Map<string, DailyPuzzle>();

/**
 * Returns the deterministic daily puzzle for any date.
 * If no date is provided, today's date is used.
 * Every call with the same calendar date returns the exact same 100% solvable board.
 */
export function getDailyPuzzle(dateInput?: string | Date): DailyPuzzle {
  let targetDate: string;
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput.trim())) {
    targetDate = dateInput.trim();
  } else if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
    targetDate = dateInput.toISOString().split('T')[0];
  } else if (typeof dateInput === 'string' && !isNaN(new Date(dateInput).getTime())) {
    targetDate = new Date(dateInput).toISOString().split('T')[0];
  } else {
    // Local / UTC date
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    targetDate = `${year}-${month}-${day}`;
  }

  const cached = PUZZLE_CACHE.get(targetDate);
  if (cached) {
    return cached;
  }

  const puzzle = generateProceduralPuzzle(ATHLETES, targetDate);
  PUZZLE_CACHE.set(targetDate, puzzle);
  return puzzle;
}

// Canonical daily puzzle export for default imports
export const DAILY_PUZZLE: DailyPuzzle = getDailyPuzzle();

// Alias for backwards compatibility
export const SAMPLE_PUZZLE: DailyPuzzle = DAILY_PUZZLE;

/**
 * Returns the daily puzzle for a specific puzzle number.
 */
export function getPuzzleByNumber(puzzleNumber: number): DailyPuzzle {
  const dateStr = getDateForPuzzleNumber(puzzleNumber);
  return getDailyPuzzle(dateStr);
}

/**
 * Returns all past daily puzzles for the archive up to today.
 * Default returns up to the last 30 puzzles, ordered newest first.
 */
export function getAllPastPuzzles(
  currentDate?: string | Date,
  maxDays: number = 30
): { puzzle: DailyPuzzle; puzzleNumber: number }[] {
  const today = getDailyPuzzle(currentDate).date;
  const todayNum = getPuzzleNumberForDate(today);

  const past: { puzzle: DailyPuzzle; puzzleNumber: number }[] = [];
  const count = Math.min(maxDays, todayNum);

  for (let i = 0; i < count; i++) {
    const num = todayNum - i;
    const dateStr = getDateForPuzzleNumber(num);
    const puzzle = getDailyPuzzle(dateStr);
    past.push({ puzzle, puzzleNumber: num });
  }

  return past;
}
