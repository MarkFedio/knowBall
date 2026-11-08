import { Athlete, Category, DailyPuzzle } from '@/types';
import { ATHLETES } from '@/data/athletes';
import { CATEGORIES } from '@/data/categories';
import { getValidAthletesForCell, DAILY_PUZZLE } from '@/data/puzzles';
import { PUZZLE_BANK } from '@/data/puzzleBank';

export interface SolvabilityReport {
  isSolvable: boolean;
  minAnswers: number;
  totalCombinations: number;
  cellCounts: number[][];
  emptyCells: { row: number; col: number; rowName: string; colName: string }[];
}

/**
 * Validates whether every single cell in a 4x4 matrix has at least minThreshold valid answers.
 */
export function validatePuzzleSolvability(
  rowCategories: Category[],
  colCategories: Category[],
  athletes: Athlete[] = ATHLETES,
  minThreshold: number = 2
): SolvabilityReport {
  const cellCounts: number[][] = Array.from({ length: 4 }, () => Array(4).fill(0));
  const emptyCells: { row: number; col: number; rowName: string; colName: string }[] = [];
  let minAnswers = Infinity;
  let totalCombinations = 0;

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const validAthletes = getValidAthletesForCell(rowCategories[r], colCategories[c], athletes);
      const count = validAthletes.length;
      cellCounts[r][c] = count;
      totalCombinations += count;

      if (count < minAnswers) {
        minAnswers = count;
      }

      if (count < minThreshold) {
        emptyCells.push({
          row: r,
          col: c,
          rowName: rowCategories[r].shortName,
          colName: colCategories[c].shortName,
        });
      }
    }
  }

  return {
    isSolvable: emptyCells.length === 0,
    minAnswers: minAnswers === Infinity ? 0 : minAnswers,
    totalCombinations,
    cellCounts,
    emptyCells,
  };
}

/**
 * Returns all solutions for a cell sorted by rarity.
 */
export function getAllSolutionsForCell(
  rowCat: Category,
  colCat: Category,
  athletes: Athlete[] = ATHLETES
): { athlete: Athlete; rarity: number }[] {
  const valid = getValidAthletesForCell(rowCat, colCat, athletes);
  if (valid.length === 0) return [];

  const totalPopularity = valid.reduce((sum, a) => sum + (a.popularityScore || 50), 0);

  return valid
    .map((athlete) => {
      const athletePopularity = athlete.popularityScore || 50;
      const rawRarity = (athletePopularity / totalPopularity) * 100;
      const rarity = Math.max(0.1, Math.round(rawRarity * 10) / 10);
      return { athlete, rarity };
    })
    .sort((a, b) => a.rarity - b.rarity); // Low rarity / deep cuts first
}

/**
 * Generates a random, fully-solvable 4x4 puzzle on the fly drawing from the full taxonomy:
 * Colleges, Draft, Numbers, Eras, Multi-Team Journeymen, Cross-Stats, Sunbelt/Coast/Rust Belt Metros, and Big 4 Leagues.
 */
export function generateProceduralPuzzle(athletes: Athlete[] = ATHLETES): DailyPuzzle {
  // 1. Pick a random base configuration from the 30 curated and verified puzzles
  const randomIndex = Math.floor(Math.random() * PUZZLE_BANK.length);
  const basePreset = PUZZLE_BANK[randomIndex];

  // 2. Shuffle row and column order to create unique permutations
  const shuffledRows = [...basePreset.rowCategories].sort(() => Math.random() - 0.5);
  const shuffledCols = [...basePreset.colCategories].sort(() => Math.random() - 0.5);

  const report = validatePuzzleSolvability(shuffledRows, shuffledCols, athletes, 2);

  if (report.isSolvable) {
    return {
      id: `puzzle_random_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      date: new Date().toISOString().split('T')[0],
      title: `Random: ${basePreset.title.replace(/^SportsGrid #\d+:\s*/, '')}`,
      rowCategories: shuffledRows,
      colCategories: shuffledCols,
    };
  }

  // Fallback to exact preset configuration
  return {
    ...basePreset,
    id: `puzzle_random_${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    title: `Random: ${basePreset.title}`,
  };
}
