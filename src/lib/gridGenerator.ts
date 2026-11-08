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
  redundantCells: { row: number; col: number; rowName: string; colName: string; reason: string }[];
}

const CATEGORY_MATCH_COUNT_CACHE = new Map<string, number>();

export function getCategoryMatchCount(cat: Category, athletes: Athlete[] = ATHLETES): number {
  let count = CATEGORY_MATCH_COUNT_CACHE.get(cat.id);
  if (count === undefined) {
    count = athletes.filter((a) => cat.matches(a)).length;
    CATEGORY_MATCH_COUNT_CACHE.set(cat.id, count);
  }
  return count;
}

/**
 * Detects whether two categories trivially complete/subsume each other,
 * or belong to incompatible identical semantic families.
 *
 * Rules:
 * 1. Identical categories are forbidden (catA.id === catB.id).
 * 2. Franchise milestones (career_*_teams, career_one_franchise) cannot intersect (e.g. 6+ x 2+).
 * 3. Championship milestones (accolade_champion, accolade_multi_champ_*) cannot intersect (e.g. 4+ x Won Champ).
 * 4. Same stat metrics (points x points, assists x assists, steals x steals, etc.) cannot intersect.
 * 5. Longevity/season counts (era_*_seasons) cannot intersect (e.g. 15+ Seasons x 8+ Seasons).
 * 6. Jersey number ranges (number_*) cannot intersect on opposite axes.
 * 7. Decade eras (era_active_2020s, era_2010s, etc.) cannot intersect.
 * 8. Sport leagues (sport_nfl, sport_nba, etc.) cannot intersect.
 * 9. Empirical Subsumption: If >= 95% of the smaller category's valid athletes satisfy
 *    the intersection, one category trivially completes/subsumes the other.
 */
export function areCategoriesTriviallyRedundant(
  catA: Category,
  catB: Category,
  athletes: Athlete[] = ATHLETES,
  knownCellCount?: number
): { isRedundant: boolean; reason?: string } {
  const idA = catA.id.toLowerCase();
  const idB = catB.id.toLowerCase();

  // 1. Identical category check
  if (idA === idB) {
    return { isRedundant: true, reason: `Identical category: ${catA.name}` };
  }

  // 2. Franchise milestones conflict (e.g. 6+ franchises x 2+ franchises, or 1 franchise x 3+ franchises)
  const isFranchise = (id: string) =>
    id.startsWith('career_') && (id.includes('teams') || id.includes('franchise'));
  if (isFranchise(idA) && isFranchise(idB)) {
    return {
      isRedundant: true,
      reason: `Franchise milestone conflict: ${catA.shortName} x ${catB.shortName}`,
    };
  }

  // 3. Championship milestones conflict (e.g. Won 4+ Championships x Won a Championship)
  const isChamp = (id: string) =>
    id === 'accolade_champion' || id.startsWith('accolade_multi_champ');
  if (isChamp(idA) && isChamp(idB)) {
    return {
      isRedundant: true,
      reason: `Championship milestone conflict: ${catA.shortName} x ${catB.shortName}`,
    };
  }

  // 4. Same stat metrics conflict (points x points, assists x assists, etc.)
  const statPrefixes = [
    'stat_points',
    'stat_assists',
    'stat_steals',
    'stat_turnovers',
    'stat_hits',
    'stat_saves',
  ];
  for (const prefix of statPrefixes) {
    if (idA.startsWith(prefix) && idB.startsWith(prefix)) {
      return {
        isRedundant: true,
        reason: `Stat domain conflict: ${catA.shortName} x ${catB.shortName}`,
      };
    }
  }

  // 5. Longevity / season counts conflict (e.g. 15+ Seasons x 8+ Seasons)
  const isSeasonCount = (id: string) => id.startsWith('era_') && id.endsWith('_seasons');
  if (isSeasonCount(idA) && isSeasonCount(idB)) {
    return {
      isRedundant: true,
      reason: `Season count conflict: ${catA.shortName} x ${catB.shortName}`,
    };
  }

  // 6. Jersey number ranges conflict (e.g. #0-9 x #10-19)
  const isJersey = (id: string) => id.startsWith('number_');
  if (isJersey(idA) && isJersey(idB)) {
    return {
      isRedundant: true,
      reason: `Jersey number conflict: ${catA.shortName} x ${catB.shortName}`,
    };
  }

  // 7. Decade eras conflict (e.g. 2010s x 2000s)
  const isDecade = (id: string) => id.startsWith('era_') && !id.endsWith('_seasons');
  if (isDecade(idA) && isDecade(idB)) {
    return {
      isRedundant: true,
      reason: `Decade era conflict: ${catA.shortName} x ${catB.shortName}`,
    };
  }

  // 8. Sports / Leagues conflict
  const isSport = (id: string) => id.startsWith('sport_');
  if (isSport(idA) && isSport(idB)) {
    return {
      isRedundant: true,
      reason: `Sport league conflict: ${catA.shortName} x ${catB.shortName}`,
    };
  }

  // 9. Empirical Subsumption Check (Mathematical subset test)
  const cellCount =
    knownCellCount !== undefined
      ? knownCellCount
      : getValidAthletesForCell(catA, catB, athletes).length;

  if (cellCount > 0) {
    const matchesA = getCategoryMatchCount(catA, athletes);
    const matchesB = getCategoryMatchCount(catB, athletes);
    const minBase = Math.min(matchesA, matchesB);

    if (minBase > 0) {
      const overlapRatio = cellCount / minBase;
      if (overlapRatio >= 0.95) {
        return {
          isRedundant: true,
          reason: `Trivial subsumption (${Math.round(overlapRatio * 100)}% overlap): ${catA.shortName} x ${catB.shortName}`,
        };
      }
    }
  }

  return { isRedundant: false };
}

/**
 * Validates whether every single cell in a 4x4 matrix:
 * 1. Has at least minThreshold valid answers.
 * 2. Has ZERO trivial redundancy or subsumption between intersecting categories.
 */
export function validatePuzzleSolvability(
  rowCategories: Category[],
  colCategories: Category[],
  athletes: Athlete[] = ATHLETES,
  minThreshold: number = 2
): SolvabilityReport {
  const cellCounts: number[][] = Array.from({ length: 4 }, () => Array(4).fill(0));
  const emptyCells: { row: number; col: number; rowName: string; colName: string }[] = [];
  const redundantCells: {
    row: number;
    col: number;
    rowName: string;
    colName: string;
    reason: string;
  }[] = [];
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

      // Check for trivial subsumption / redundancy using known count
      const redundancyCheck = areCategoriesTriviallyRedundant(
        rowCategories[r],
        colCategories[c],
        athletes,
        count
      );
      if (redundancyCheck.isRedundant) {
        redundantCells.push({
          row: r,
          col: c,
          rowName: rowCategories[r].shortName,
          colName: colCategories[c].shortName,
          reason: redundancyCheck.reason || 'Trivially redundant category pairing',
        });
      }
    }
  }

  return {
    isSolvable: emptyCells.length === 0 && redundantCells.length === 0,
    minAnswers: minAnswers === Infinity ? 0 : minAnswers,
    totalCombinations,
    cellCounts,
    emptyCells,
    redundantCells,
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
  CATEGORIES.NUMBER_0_TO_9,
  CATEGORIES.NUMBER_10_TO_19,
  CATEGORIES.NUMBER_20_TO_29,
  CATEGORIES.NUMBER_30_TO_39,
  CATEGORIES.NUMBER_40_TO_49,
  CATEGORIES.NUMBER_50_TO_59,
  CATEGORIES.NUMBER_60_TO_69,
  CATEGORIES.NUMBER_70_TO_79,
  CATEGORIES.NUMBER_80_TO_89,
  CATEGORIES.NUMBER_90_TO_99,
];

const STATS = [
  CATEGORIES.STAT_POINTS_500,
  CATEGORIES.STAT_POINTS_750,
  CATEGORIES.STAT_POINTS_1K,
  CATEGORIES.STAT_POINTS_1200,
  CATEGORIES.STAT_POINTS_1500,
  CATEGORIES.STAT_ASSISTS_100,
  CATEGORIES.STAT_ASSISTS_250,
  CATEGORIES.STAT_ASSISTS_500,
  CATEGORIES.STAT_ASSISTS_750,
  CATEGORIES.STAT_ASSISTS_1000,
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
 * - At least ONE stat requirement per board (points, assists, steals, turnovers, hits, saves)
 * - Zero college categories
 * - Zero draft pick categories
 * - Broad diversity: Accolades, Metros, Franchises, Jersey Numbers, Stats, and Eras.
 */
export function generateProceduralPuzzle(athletes: Athlete[] = ATHLETES): DailyPuzzle {
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
      const cStat = shuffle(STATS)[0]; // Guaranteed stat requirement
      cols = shuffle([cAcc, cMet, cFra, cStat]);
    } else {
      // Complementary orthogonal axes:
      // Put Franchise strictly on Rows OR Cols (never both!)
      const franchiseOnRows = Math.random() < 0.5;
      const statOnRows = Math.random() < 0.5;

      const rAcc = shuffle(ACCOLADES)[0];
      const rMet = shuffle(METROS)[0];
      const rFraOrJersey = franchiseOnRows ? shuffle(FRANCHISES)[0] : shuffle(JERSEYS)[0];
      const rStatOrEra = statOnRows ? shuffle(STATS)[0] : shuffle(ERAS_LONGEVITY)[0];
      rows = shuffle([rAcc, rMet, rFraOrJersey, rStatOrEra]);

      // Columns must not duplicate the franchise pool if rows have franchise!
      // Nor duplicate championship milestone if rows have one!
      const isRChamp = rAcc.id === 'accolade_champion' || rAcc.id.startsWith('accolade_multi_champ');
      const filteredAccs = isRChamp
        ? ACCOLADES.filter(
            (a) =>
              a.id === 'accolade_mvp' ||
              a.id === 'accolade_hof' ||
              a.id === 'accolade_rookie_of_year'
          )
        : ACCOLADES.filter((a) => a.id !== rAcc.id);
      const cAcc = shuffle(filteredAccs)[0] || CATEGORIES.ACCOLADE_HOF;

      const cMet = shuffle(METROS.filter((m) => m.id !== rMet.id))[0];
      const cFraOrJersey = !franchiseOnRows ? shuffle(FRANCHISES)[0] : shuffle(JERSEYS)[0];
      const cStatOrEra = !statOnRows ? shuffle(STATS)[0] : shuffle(ERAS_LONGEVITY)[0];
      cols = shuffle([cAcc, cMet, cFraOrJersey, cStatOrEra]);
    }

    // Ensure at least one stat requirement is present on the board
    const hasStat = [...rows, ...cols].some((c) => c.type === 'CROSS_STAT');
    if (!hasStat) continue;

    // Verify every single cell has at least 4 valid athletes and ZERO trivial redundancies
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
