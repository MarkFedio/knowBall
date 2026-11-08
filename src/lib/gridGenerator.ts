import { Athlete, Category, DailyPuzzle } from '@/types';
import { ATHLETES } from '@/data/athletes';
import { CATEGORIES } from '@/data/categories';
import { getValidAthletesForCell, DAILY_PUZZLE } from '@/data/puzzles';

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
 * Returns all solutions for a cell sorted by popularity.
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
    .sort((a, b) => a.rarity - b.rarity); // Obscure / low rarity first
}

// =========================================================================
// CURATED PUZZLE PRESETS
// =========================================================================
export const PUZZLE_PRESETS: DailyPuzzle[] = [
  DAILY_PUZZLE,
  {
    id: 'puzzle_cross_stats',
    date: '2026-11-08',
    title: 'Cross-Sport Stats Showdown',
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
  },
  {
    id: 'puzzle_quad_decathlon',
    date: '2026-11-09',
    title: 'The Quad-Sport Decathlon',
    rowCategories: [
      CATEGORIES.SPORT_NFL,
      CATEGORIES.SPORT_NBA,
      CATEGORIES.SPORT_MLB,
      CATEGORIES.SPORT_NHL,
    ],
    colCategories: [
      CATEGORIES.ACCOLADE_CHAMPION,
      CATEGORIES.ACCOLADE_MVP,
      CATEGORIES.ACCOLADE_HOF,
      CATEGORIES.ERA_15_SEASONS,
    ],
  },
  {
    id: 'puzzle_metro_clash',
    date: '2026-11-10',
    title: 'Metro Markets & Accolades',
    rowCategories: [
      CATEGORIES.METRO_BOSTON,
      CATEGORIES.METRO_BAY_AREA,
      CATEGORIES.METRO_NY,
      CATEGORIES.METRO_PHILLY,
    ],
    colCategories: [
      CATEGORIES.ACCOLADE_CHAMPION,
      CATEGORIES.ACCOLADE_ROOKIE_OF_YEAR,
      CATEGORIES.DRAFT_FIRST_OVERALL,
      CATEGORIES.NUMBER_SINGLE_DIGIT,
    ],
  },
];

/**
 * Generates a random, fully-solvable 4x4 puzzle on the fly from the category taxonomy.
 */
export function generateProceduralPuzzle(athletes: Athlete[] = ATHLETES): DailyPuzzle {
  const rowPool = [
    CATEGORIES.SPORT_NFL,
    CATEGORIES.SPORT_NBA,
    CATEGORIES.SPORT_MLB,
    CATEGORIES.SPORT_NHL,
    CATEGORIES.METRO_BOSTON,
    CATEGORIES.METRO_CHICAGO,
    CATEGORIES.METRO_NY,
    CATEGORIES.METRO_LA,
    CATEGORIES.METRO_BAY_AREA,
    CATEGORIES.NUMBER_23_OR_24,
  ];

  const colPool = [
    CATEGORIES.ACCOLADE_CHAMPION,
    CATEGORIES.ACCOLADE_MVP,
    CATEGORIES.ACCOLADE_HOF,
    CATEGORIES.ACCOLADE_ROOKIE_OF_YEAR,
    CATEGORIES.DRAFT_FIRST_OVERALL,
    CATEGORIES.COLLEGE_SEC,
    CATEGORIES.COLLEGE_BIG_TEN,
    CATEGORIES.COLLEGE_ACC,
    CATEGORIES.STAT_STEALS_500,
    CATEGORIES.STAT_ASSISTS_1000,
    CATEGORIES.ERA_ACTIVE_2020S,
    CATEGORIES.ERA_15_SEASONS,
    CATEGORIES.NUMBER_SINGLE_DIGIT,
  ];

  // Try up to 300 random combinations to find a 100% solvable puzzle
  for (let attempt = 0; attempt < 300; attempt++) {
    const shuffledRows = [...rowPool].sort(() => Math.random() - 0.5).slice(0, 4);
    const shuffledCols = [...colPool].sort(() => Math.random() - 0.5).slice(0, 4);

    const report = validatePuzzleSolvability(shuffledRows, shuffledCols, athletes, 2);
    if (report.isSolvable) {
      return {
        id: `puzzle_random_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        title: `Procedural Grid #${Math.floor(1000 + Math.random() * 9000)}`,
        rowCategories: shuffledRows,
        colCategories: shuffledCols,
      };
    }
  }

  // Fallback to random preset if no unique procedural grid solved in 300 attempts
  const fallback = PUZZLE_PRESETS[Math.floor(Math.random() * PUZZLE_PRESETS.length)];
  return {
    ...fallback,
    id: `puzzle_random_${Date.now()}`,
    title: `Procedural ${fallback.title}`,
  };
}
