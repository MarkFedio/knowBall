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
    .sort((a, b) => a.rarity - b.rarity);
}

// Category Pools for Dynamic Balanced Grid Generation
// Strictly NO colleges and NO draft picks!
const ACCOLADES = [
  CATEGORIES.ACCOLADE_CHAMPION,
  CATEGORIES.ACCOLADE_MULTI_CHAMP_2,
  CATEGORIES.ACCOLADE_MULTI_CHAMP,
  CATEGORIES.ACCOLADE_MULTI_CHAMP_4,
  CATEGORIES.ACCOLADE_MVP,
  CATEGORIES.ACCOLADE_HOF,
  CATEGORIES.ACCOLADE_ROOKIE_OF_YEAR,
];

const METROS = [
  CATEGORIES.METRO_NY,
  CATEGORIES.METRO_BOSTON,
  CATEGORIES.METRO_CHICAGO,
  CATEGORIES.METRO_LA,
  CATEGORIES.METRO_TEXAS,
  CATEGORIES.METRO_FLORIDA,
  CATEGORIES.METRO_BAY_AREA,
  CATEGORIES.METRO_PHILLY,
  CATEGORIES.METRO_DETROIT,
  CATEGORIES.METRO_OHIO,
  CATEGORIES.METRO_DC_BALTIMORE,
  CATEGORIES.METRO_CANADA,
];

const FRANCHISES = [
  CATEGORIES.CAREER_2_TEAMS,
  CATEGORIES.CAREER_3_TEAMS,
  CATEGORIES.CAREER_4_TEAMS,
  CATEGORIES.CAREER_5_TEAMS,
  CATEGORIES.CAREER_6_TEAMS,
  CATEGORIES.CAREER_ONE_FRANCHISE,
];

const JERSEYS = [
  CATEGORIES.NUMBER_SINGLE_DIGIT,
  CATEGORIES.NUMBER_TEENS,
  CATEGORIES.NUMBER_TWENTIES,
  CATEGORIES.NUMBER_THIRTIES,
  CATEGORIES.NUMBER_FORTIES,
  CATEGORIES.NUMBER_FIFTIES,
  CATEGORIES.NUMBER_SIXTY_PLUS,
  CATEGORIES.NUMBER_EIGHTY_PLUS,
  CATEGORIES.NUMBER_23_OR_24,
  CATEGORIES.NUMBER_33_OR_34,
  CATEGORIES.NUMBER_0_OR_99,
];

const STATS = [
  CATEGORIES.STAT_POINTS_1K,
  CATEGORIES.STAT_POINTS_5K,
  CATEGORIES.STAT_POINTS_10K,
  CATEGORIES.STAT_POINTS_15K,
  CATEGORIES.STAT_ASSISTS_250,
  CATEGORIES.STAT_ASSISTS_500,
  CATEGORIES.STAT_ASSISTS_1000,
  CATEGORIES.STAT_ASSISTS_2500,
  CATEGORIES.STAT_STEALS_100,
  CATEGORIES.STAT_STEALS_250,
  CATEGORIES.STAT_STEALS_500,
  CATEGORIES.STAT_TURNOVERS_100,
  CATEGORIES.STAT_TURNOVERS_150,
  CATEGORIES.STAT_TURNOVERS_250,
  CATEGORIES.STAT_HITS_1000,
  CATEGORIES.STAT_HITS_2000,
  CATEGORIES.STAT_HITS_3000,
  CATEGORIES.STAT_SAVES_100,
  CATEGORIES.STAT_SAVES_200,
  CATEGORIES.STAT_SAVES_300,
];

const ERAS_LONGEVITY = [
  CATEGORIES.ERA_ACTIVE_2020S,
  CATEGORIES.ERA_2010S,
  CATEGORIES.ERA_2000S,
  CATEGORIES.ERA_1990S,
  CATEGORIES.ERA_1980S,
  CATEGORIES.ERA_8_SEASONS,
  CATEGORIES.ERA_10_SEASONS,
  CATEGORIES.ERA_12_SEASONS,
  CATEGORIES.ERA_15_SEASONS,
  CATEGORIES.ERA_18_SEASONS,
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

/**
 * Generates a completely new, 100% solvable random board on the fly.
 * Enforces:
 * - At most ONE city per axis (no 4-city lines!)
 * - Zero college categories
 * - Zero draft pick categories
 * - Broad diversity: Accolades, Metros, Franchises, Jersey Numbers, Stats, and Eras.
 */
export function generateProceduralPuzzle(athletes: Athlete[] = ATHLETES): DailyPuzzle {
  const dynamicOthers = [...JERSEYS, ...STATS, ...ERAS_LONGEVITY];

  // Try dynamic combinations
  for (let attempt = 1; attempt <= 150; attempt++) {
    // 15% chance to feature the iconic Quad-Sport leagues on the rows
    const isQuadSport = Math.random() < 0.15;

    let rows: Category[];
    let cols: Category[];

    if (isQuadSport) {
      rows = [CATEGORIES.SPORT_NFL, CATEGORIES.SPORT_NBA, CATEGORIES.SPORT_MLB, CATEGORIES.SPORT_NHL];
      const cAcc = shuffle(ACCOLADES)[0];
      const cMet = shuffle(METROS)[0];
      const cFra = shuffle(FRANCHISES)[0];
      const cOth = shuffle(dynamicOthers)[0];
      cols = shuffle([cAcc, cMet, cFra, cOth]);
    } else {
      const rAcc = shuffle(ACCOLADES)[0];
      const rMet = shuffle(METROS)[0];
      const rFra = shuffle(FRANCHISES)[0];
      const rOth = shuffle(dynamicOthers)[0];
      rows = shuffle([rAcc, rMet, rFra, rOth]);

      const cAcc = shuffle(ACCOLADES.filter((a) => a.id !== rAcc.id))[0];
      const cMet = shuffle(METROS.filter((m) => m.id !== rMet.id))[0];
      const cFra = shuffle(FRANCHISES.filter((f) => f.id !== rFra.id))[0];
      const cOth = shuffle(dynamicOthers.filter((o) => o.id !== rOth.id))[0];
      cols = shuffle([cAcc, cMet, cFra, cOth]);
    }

    // Verify every single cell has at least 4 valid athletes
    const report = validatePuzzleSolvability(rows, cols, athletes, 4);
    if (report.isSolvable) {
      const randomId = Math.floor(1000 + Math.random() * 9000);
      return {
        id: `puzzle_random_${Date.now()}_${randomId}`,
        date: new Date().toISOString().split('T')[0],
        title: `SportsGrid: Random Board #${randomId}`,
        rowCategories: rows,
        colCategories: cols,
      };
    }
  }

  // Fallback to today's verified daily puzzle
  return {
    ...DAILY_PUZZLE,
    id: `puzzle_random_${Date.now()}`,
    title: `SportsGrid: Random Board #${Math.floor(1000 + Math.random() * 9000)}`,
  };
}
