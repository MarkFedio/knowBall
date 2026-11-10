import { Athlete, Category, DailyPuzzle } from '@/types';
import { ATHLETES } from '@/data/athletes';
import { CATEGORIES } from '@/data/categories';
import { getValidAthletesForCell, doesAthleteMatchCell } from '@/lib/cellValidator';

export interface SolvabilityReport {
  isSolvable: boolean;
  minAnswers: number;
  totalCombinations: number;
  cellCounts: number[][];
  emptyCells: { row: number; col: number; rowName: string; colName: string }[];
  redundantCells: { row: number; col: number; rowName: string; colName: string; reason: string }[];
}

const CATEGORY_MATCH_COUNT_CACHE = new Map<string, number>();
const CATEGORY_ATHLETES_CACHE = new Map<string, Athlete[]>();

export function getAthletesForCategory(cat: Category, athletes: Athlete[] = ATHLETES): Athlete[] {
  let pool = CATEGORY_ATHLETES_CACHE.get(cat.id);
  if (!pool) {
    pool = athletes.filter((a) => cat.matches(a));
    CATEGORY_ATHLETES_CACHE.set(cat.id, pool);
  }
  return pool;
}

export function getCategoryMatchCount(cat: Category, athletes: Athlete[] = ATHLETES): number {
  let count = CATEGORY_MATCH_COUNT_CACHE.get(cat.id);
  if (count === undefined) {
    count = getAthletesForCategory(cat, athletes).length;
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
    const poolR = getAthletesForCategory(rowCategories[r], athletes);
    for (let c = 0; c < 4; c++) {
      const poolC = getAthletesForCategory(colCategories[c], athletes);
      const searchPool = poolR.length <= poolC.length ? poolR : poolC;
      const validAthletes = searchPool.filter(
        (a) => doesAthleteMatchCell(rowCategories[r], colCategories[c], a).isMatch
      );
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
 * Fast-path candidate solvability validator that breaks out immediately
 * at the first cell failing the minimum threshold or redundancy check.
 */
export function isPuzzleCandidateSolvable(
  rowCategories: Category[],
  colCategories: Category[],
  athletes: Athlete[] = ATHLETES,
  minThreshold: number = 5
): boolean {
  for (let r = 0; r < 4; r++) {
    const poolR = getAthletesForCategory(rowCategories[r], athletes);
    for (let c = 0; c < 4; c++) {
      const poolC = getAthletesForCategory(colCategories[c], athletes);
      const searchPool = poolR.length <= poolC.length ? poolR : poolC;
      const validAthletes = searchPool.filter(
        (a) => doesAthleteMatchCell(rowCategories[r], colCategories[c], a).isMatch
      );
      if (validAthletes.length < minThreshold) {
        return false;
      }
      const redundancyCheck = areCategoriesTriviallyRedundant(
        rowCategories[r],
        colCategories[c],
        athletes,
        validAthletes.length
      );
      if (redundancyCheck.isRedundant) {
        return false;
      }
    }
  }
  return true;
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
  CATEGORIES.STAT_BLOCKS_500,
  CATEGORIES.STAT_BLOCKS_1000,
  CATEGORIES.STAT_BLOCKS_1500,
  CATEGORIES.STAT_BLOCKS_2000,
  CATEGORIES.STAT_WINS_50,
  CATEGORIES.STAT_WINS_100,
  CATEGORIES.STAT_WINS_150,
  CATEGORIES.STAT_WINS_200,
  CATEGORIES.STAT_WINS_300,
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

/**
 * Hashes a date string (e.g. '2026-11-10') to a 32-bit unsigned integer seed using FNV-1a.
 */
export function hashDateStringToSeed(dateStr: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < dateStr.length; i++) {
    h = Math.imul(h ^ dateStr.charCodeAt(i), 16777619) >>> 0;
  }
  return h;
}

/**
 * Creates a high-quality, deterministic pseudo-random number generator (Mulberry32).
 */
export function createSeededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministic Fisher-Yates shuffle using a random generator function.
 */
export function seededShuffle<T>(arr: readonly T[], rng: () => number = Math.random): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generates a completely new, 100% solvable board.
 * Can be seeded with a date string (e.g. '2026-11-10') or a numeric seed for deterministic generation.
 * If no seed is provided, Math.random is used.
 *
 * Enforces:
 * - At most ONE city per axis (no 4-city lines!)
 * - At least ONE stat requirement per board (points, assists, steals, turnovers, hits, saves, blocks, wins)
 * - Zero college categories
 * - Zero draft pick categories
 * - Broad diversity: Accolades, Metros, Franchises, Jersey Numbers, Stats, and Eras.
 */
export function generateProceduralPuzzle(
  athletes: Athlete[] = ATHLETES,
  seedOrDate?: string | number
): DailyPuzzle {
  let rng: () => number;
  let isDaily = false;
  let targetDate = new Date().toISOString().split('T')[0];

  if (typeof seedOrDate === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(seedOrDate.trim())) {
      targetDate = seedOrDate.trim();
      isDaily = true;
    }
    const seed = hashDateStringToSeed(seedOrDate);
    rng = createSeededRandom(seed);
  } else if (typeof seedOrDate === 'number') {
    rng = createSeededRandom(seedOrDate);
  } else {
    rng = Math.random;
  }

  // Try dynamic combinations
  for (let attempt = 1; attempt <= 150; attempt++) {
    // 15% chance to feature the iconic Quad-Sport leagues on the rows
    const isQuadSport = rng() < 0.15;

    let rows: Category[];
    let cols: Category[];

    if (isQuadSport) {
      rows = [CATEGORIES.SPORT_NFL, CATEGORIES.SPORT_NBA, CATEGORIES.SPORT_MLB, CATEGORIES.SPORT_NHL];
      const cAcc = seededShuffle(ACCOLADES, rng)[0];
      const cMet = seededShuffle(METROS, rng)[0];
      const cFra = seededShuffle(FRANCHISES, rng)[0];
      const cStat = seededShuffle(STATS, rng)[0]; // Guaranteed stat requirement
      cols = seededShuffle([cAcc, cMet, cFra, cStat], rng);
    } else {
      // Complementary orthogonal axes:
      // Put Franchise strictly on Rows OR Cols (never both!)
      const franchiseOnRows = rng() < 0.5;
      const statOnRows = rng() < 0.5;

      const rAcc = seededShuffle(ACCOLADES, rng)[0];
      const rMet = seededShuffle(METROS, rng)[0];
      const rFraOrJersey = franchiseOnRows ? seededShuffle(FRANCHISES, rng)[0] : seededShuffle(JERSEYS, rng)[0];
      const rStatOrEra = statOnRows ? seededShuffle(STATS, rng)[0] : seededShuffle(ERAS_LONGEVITY, rng)[0];
      rows = seededShuffle([rAcc, rMet, rFraOrJersey, rStatOrEra], rng);

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
      const cAcc = seededShuffle(filteredAccs, rng)[0] || CATEGORIES.ACCOLADE_HOF;

      const cMet = seededShuffle(METROS.filter((m) => m.id !== rMet.id), rng)[0];
      const cFraOrJersey = !franchiseOnRows ? seededShuffle(FRANCHISES, rng)[0] : seededShuffle(JERSEYS, rng)[0];
      const cStatOrEra = !statOnRows ? seededShuffle(STATS, rng)[0] : seededShuffle(ERAS_LONGEVITY, rng)[0];
      cols = seededShuffle([cAcc, cMet, cFraOrJersey, cStatOrEra], rng);
    }

    // Ensure at least one stat requirement is present on the board
    const hasStat = [...rows, ...cols].some((c) => c.type === 'CROSS_STAT');
    if (!hasStat) continue;

    // Verify every single cell has at least 5 valid athletes and ZERO trivial redundancies
    if (isPuzzleCandidateSolvable(rows, cols, athletes, 5)) {
      if (isDaily) {
        return {
          id: `puzzle_${targetDate}`,
          date: targetDate,
          title: 'Daily',
          rowCategories: rows,
          colCategories: cols,
        };
      }
      const randomId = Math.floor(1000 + rng() * 9000);
      return {
        id: `puzzle_random_${Date.now()}_${randomId}`,
        date: targetDate,
        title: 'Random',
        rowCategories: rows,
        colCategories: cols,
      };
    }
  }

  // Fallback to verified canonical puzzle
  return {
    id: isDaily ? `puzzle_${targetDate}` : `puzzle_random_${Date.now()}`,
    date: targetDate,
    title: isDaily ? 'Daily' : 'Random',
    rowCategories: [
      CATEGORIES.METRO_NY,
      CATEGORIES.ACCOLADE_MVP,
      CATEGORIES.CAREER_3_TEAMS,
      CATEGORIES.ERA_ACTIVE_2020S,
    ],
    colCategories: [
      CATEGORIES.ACCOLADE_CHAMPION,
      CATEGORIES.METRO_BOSTON,
      CATEGORIES.NUMBER_10_TO_19,
      CATEGORIES.STAT_STEALS_100,
    ],
  };
}
