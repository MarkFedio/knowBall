import { Athlete, Category, DailyPuzzle } from '@/types';
import { isAthleteInMarket } from '@/lib/marketResolver';
import { ATHLETES } from './athletes';
import { CATEGORIES } from './categories';

// Canonical daily puzzle for active development
export const DAILY_PUZZLE: DailyPuzzle = {
  id: 'puzzle_daily_today',
  date: new Date().toISOString().split('T')[0],
  title: 'Daily',
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

// Metropolitan markets code mapping
const METRO_MARKET_CODES: Record<string, { codes: string[]; label: string }> = {
  metro_ny: { codes: ['NY'], label: 'NY / NJ' },
  metro_boston: { codes: ['BOS'], label: 'Boston' },
  metro_chicago: { codes: ['CHI'], label: 'Chicago' },
  metro_la: { codes: ['LA'], label: 'Los Angeles' },
  metro_bay_area: { codes: ['BAY'], label: 'Bay Area' },
  metro_philly: { codes: ['PHI'], label: 'Philadelphia' },
  metro_detroit: { codes: ['DET'], label: 'Detroit' },
  metro_florida: { codes: ['FLA', 'MIA', 'TB'], label: 'Florida' },
  metro_texas: { codes: ['DAL', 'HOU', 'SA'], label: 'Texas' },
  metro_ohio: { codes: ['CLE', 'CIN'], label: 'Ohio' },
  metro_dc_baltimore: { codes: ['WAS', 'BAL'], label: 'DC / Baltimore' },
  metro_canada: { codes: ['TOR', 'MTL', 'VAN', 'CAL', 'CGY', 'EDM', 'OTT', 'WPG', 'CAN'], label: 'Canadian' },
};

// Single-event honors that require achieving the milestone WHILE with that team/market:
// - A Championship ('accolade_champion')
// - An MVP Award ('accolade_mvp')
// Note: Career-wide cumulative categories (e.g. 'Won 2+ Championships', 'Won 4+ Championships', 'Hall of Fame')
// do NOT enforce one team.
export type SingleEventAccoladeType = 'CHAMPION' | 'MVP';

export interface MetroSingleEventIntersection {
  metroId: string;
  metroLabel: string;
  accoladeType: SingleEventAccoladeType;
  accoladeLabel: string;
}

const SINGLE_EVENT_ACCOLADES: Record<string, { type: SingleEventAccoladeType; label: string }> = {
  accolade_champion: { type: 'CHAMPION', label: 'World Championship / Ring' },
  accolade_mvp: { type: 'MVP', label: 'League MVP Award' },
};

/**
 * Returns metadata if a row/col pair intersects a Metro market with a single-event accolade
 * (a Championship, an MVP, etc.).
 * Career-cumulative categories (e.g. 2+, 3+, 4+ championships) return null.
 */
export function getMetroSingleEventIntersection(
  rowCat: Category,
  colCat: Category
): MetroSingleEventIntersection | null {
  const isMetroRow = rowCat.type === 'METRO';
  const isMetroCol = colCat.type === 'METRO';
  const rowAccolade = SINGLE_EVENT_ACCOLADES[rowCat.id.toLowerCase()];
  const colAccolade = SINGLE_EVENT_ACCOLADES[colCat.id.toLowerCase()];

  if (isMetroRow && colAccolade) {
    const meta = METRO_MARKET_CODES[rowCat.id.toLowerCase()];
    return {
      metroId: rowCat.id.toLowerCase(),
      metroLabel: meta?.label || rowCat.shortName,
      accoladeType: colAccolade.type,
      accoladeLabel: colAccolade.label,
    };
  }

  if (isMetroCol && rowAccolade) {
    const meta = METRO_MARKET_CODES[colCat.id.toLowerCase()];
    return {
      metroId: colCat.id.toLowerCase(),
      metroLabel: meta?.label || colCat.shortName,
      accoladeType: rowAccolade.type,
      accoladeLabel: rowAccolade.label,
    };
  }

  return null;
}

// Alias for backwards compatibility
export const getMetroChampIntersection = getMetroSingleEventIntersection;

/**
 * Validates an athlete against cell criteria, enforcing Immaculate Grid rules:
 * Only single-event awards (a Championship, an MVP, etc.) enforce achieving the milestone
 * while playing for that specific team/market. Career-wide cumulative categories like
 * "Won 2+ Championships", "Won 4+ Championships", or "Hall of Fame" do NOT enforce one team.
 */
export function doesAthleteMatchCell(
  rowCat: Category,
  colCat: Category,
  athlete: Athlete
): { isMatch: boolean; failureReason?: string } {
  if (!rowCat.matches(athlete) || !colCat.matches(athlete)) {
    return { isMatch: false, failureReason: 'Player does not meet one or both categories.' };
  }

  // Immaculate Grid Rule:
  // Only single-event awards enforce one team!
  const intersection = getMetroSingleEventIntersection(rowCat, colCat);
  if (intersection) {
    const meta = METRO_MARKET_CODES[intersection.metroId];
    if (meta) {
      if (intersection.accoladeType === 'CHAMPION') {
        const champMarkets = athlete.championshipMarkets || [];
        const wonInMarket =
          champMarkets.some((m) => meta.codes.includes(m)) ||
          (athlete.championships > 0 &&
            champMarkets.length === 0 &&
            isAthleteInMarket(athlete, meta.codes));
        if (!wonInMarket) {
          return {
            isMatch: false,
            failureReason: `${athlete.name} won a championship, but not while playing for a ${meta.label} team.`,
          };
        }
      } else if (intersection.accoladeType === 'MVP') {
        const mvpMarkets = athlete.mvpMarkets || [];
        const wonInMarket =
          mvpMarkets.some((m) => meta.codes.includes(m)) ||
          (athlete.mvps > 0 &&
            mvpMarkets.length === 0 &&
            isAthleteInMarket(athlete, meta.codes));
        if (!wonInMarket) {
          return {
            isMatch: false,
            failureReason: `${athlete.name} won an MVP award, but not while playing for a ${meta.label} team.`,
          };
        }
      }
    }
  }

  return { isMatch: true };
}

/**
 * Returns all athletes matching both the row and column categories,
 * enforcing Immaculate Grid rules for Team/Metro × Accolade intersections.
 */
export function getValidAthletesForCell(
  rowCat: Category,
  colCat: Category,
  athletes: Athlete[] = ATHLETES
): Athlete[] {
  return athletes.filter((a) => doesAthleteMatchCell(rowCat, colCat, a).isMatch);
}

/**
 * Validates a single guess against a cell.
 */
export function validateGuess(
  rowCat: Category,
  colCat: Category,
  athlete: Athlete
): { isCorrect: boolean; validAnswersCount: number; rarityPercentage: number; failureReason?: string } {
  const matchResult = doesAthleteMatchCell(rowCat, colCat, athlete);
  const isCorrect = matchResult.isMatch;

  const validPool = getValidAthletesForCell(rowCat, colCat);
  const validAnswersCount = validPool.length;

  if (!isCorrect) {
    return {
      isCorrect: false,
      validAnswersCount,
      rarityPercentage: 0,
      failureReason: matchResult.failureReason,
    };
  }

  // Calculate simulated rarity score based on popularity score relative to the valid pool
  const totalPopularity = validPool.reduce((sum, a) => sum + (a.popularityScore || 50), 0);
  const athletePopularity = athlete.popularityScore || 50;

  // More popular athletes have higher rarity % (common guess), obscure athletes have low % (rare guess)
  const rawRarity = (athletePopularity / totalPopularity) * 100;
  const rarityPercentage = Math.max(0.1, Math.round(rawRarity * 10) / 10);

  return { isCorrect: true, validAnswersCount, rarityPercentage };
}
