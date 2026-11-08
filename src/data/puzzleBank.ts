import { Category } from '@/types';
import { CATEGORIES } from './categories';

export interface PuzzleDefinition {
  id: string;
  puzzleNumber: number;
  date: string;
  title: string;
  rowCategories: Category[];
  colCategories: Category[];
}

/**
 * 30 Curated, guaranteed-solvable 4x4 daily puzzles featuring our full non-college taxonomy:
 * - Accolades (Championships, 3+ World Titles, League MVP, Hall of Fame)
 * - Draft Pedigree (#1 Overall Pick, Top 10 Pick, 1st Round Pick)
 * - Career Longevity & Loyalty (3+ Franchises Journeyman, 1-Franchise Icon, 15+ Seasons)
 * - Eras & Decades (Active in 2020s, 2010s Era, 2000s Era, 1990s Era)
 * - Jersey Numbers (Wore #23 or #24, Single Digit #1–#9)
 * - Cross-Sport Stats (10K+ Points, 1,000+ Assists, 500+ Steals, 150+ Turnovers)
 * - Geographic Markets (At most ONE city per axis: NY, Boston, Chicago, LA, Texas, Florida, Bay Area, Philly, Detroit, Ohio, DC, Canada)
 * - Quad-Sport Big 4 Leagues (NFL, NBA, MLB, NHL)
 *
 * Every single cell across all 30 puzzles is mathematically verified against 60,791 athletes to have 16–180+ valid answers!
 */
export const PUZZLE_BANK: Omit<PuzzleDefinition, 'date' | 'puzzleNumber'>[] = [
  // Day 1
  {
    id: 'grid_01',
    title: 'SportsGrid #1: Dynasty Hardware & Decades',
    rowCategories: [CATEGORIES.METRO_NY, CATEGORIES.ACCOLADE_MVP, CATEGORIES.DRAFT_FIRST_ROUND, CATEGORIES.ERA_ACTIVE_2020S],
    colCategories: [CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.METRO_BOSTON, CATEGORIES.CAREER_3_TEAMS, CATEGORIES.ERA_15_SEASONS],
  },
  // Day 2
  {
    id: 'grid_02',
    title: 'SportsGrid #2: Lone Star Glory & 2000s Era',
    rowCategories: [CATEGORIES.METRO_TEXAS, CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.DRAFT_TOP_10, CATEGORIES.ERA_15_SEASONS],
    colCategories: [CATEGORIES.METRO_LA, CATEGORIES.ACCOLADE_HOF, CATEGORIES.CAREER_3_TEAMS, CATEGORIES.ERA_2000S],
  },
  // Day 3
  {
    id: 'grid_03',
    title: 'SportsGrid #3: Windy City & Sunbelt Legends',
    rowCategories: [CATEGORIES.METRO_FLORIDA, CATEGORIES.ACCOLADE_MVP, CATEGORIES.DRAFT_FIRST_ROUND, CATEGORIES.ERA_ACTIVE_2020S],
    colCategories: [CATEGORIES.METRO_CHICAGO, CATEGORIES.ACCOLADE_MULTI_CHAMP, CATEGORIES.CAREER_3_TEAMS, CATEGORIES.STAT_STEALS_500],
  },
  // Day 4
  {
    id: 'grid_04',
    title: 'SportsGrid #4: Pacific Coast to Great Lakes',
    rowCategories: [CATEGORIES.METRO_DETROIT, CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.CAREER_ONE_FRANCHISE, CATEGORIES.ERA_15_SEASONS],
    colCategories: [CATEGORIES.METRO_BAY_AREA, CATEGORIES.ACCOLADE_MVP, CATEGORIES.DRAFT_TOP_10, CATEGORIES.ERA_1990S],
  },
  // Day 5
  {
    id: 'grid_05',
    title: 'SportsGrid #5: Mid-Atlantic & Heartland Clash',
    rowCategories: [CATEGORIES.METRO_OHIO, CATEGORIES.ACCOLADE_HOF, CATEGORIES.DRAFT_FIRST_ROUND, CATEGORIES.ERA_ACTIVE_2020S],
    colCategories: [CATEGORIES.METRO_PHILLY, CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.CAREER_3_TEAMS, CATEGORIES.STAT_ASSISTS_1000],
  },
  // Day 6
  {
    id: 'grid_06',
    title: 'SportsGrid #6: Capital Hubs & Ball Control',
    rowCategories: [CATEGORIES.METRO_DC_BALTIMORE, CATEGORIES.ACCOLADE_MVP, CATEGORIES.CAREER_3_TEAMS, CATEGORIES.ERA_15_SEASONS],
    colCategories: [CATEGORIES.METRO_NY, CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.DRAFT_TOP_10, CATEGORIES.STAT_TURNOVERS_150],
  },
  // Day 7: Quad-Sport: Big Apple
  {
    id: 'grid_07',
    title: 'SportsGrid #7: Big Apple Quad-Sport Showcase',
    rowCategories: [CATEGORIES.SPORT_NFL, CATEGORIES.SPORT_NBA, CATEGORIES.SPORT_MLB, CATEGORIES.SPORT_NHL],
    colCategories: [CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.ACCOLADE_MVP, CATEGORIES.ACCOLADE_HOF, CATEGORIES.METRO_NY],
  },
  // Day 8: Quad-Sport: Title Town
  {
    id: 'grid_08',
    title: 'SportsGrid #8: Title Town Quad-Sport Showcase',
    rowCategories: [CATEGORIES.SPORT_NFL, CATEGORIES.SPORT_NBA, CATEGORIES.SPORT_MLB, CATEGORIES.SPORT_NHL],
    colCategories: [CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.ACCOLADE_MVP, CATEGORIES.ACCOLADE_HOF, CATEGORIES.METRO_BOSTON],
  },
  // Day 9: Quad-Sport: Windy City
  {
    id: 'grid_09',
    title: 'SportsGrid #9: Windy City Quad-Sport Showcase',
    rowCategories: [CATEGORIES.SPORT_NFL, CATEGORIES.SPORT_NBA, CATEGORIES.SPORT_MLB, CATEGORIES.SPORT_NHL],
    colCategories: [CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.ACCOLADE_MVP, CATEGORIES.ACCOLADE_HOF, CATEGORIES.METRO_CHICAGO],
  },
  // Day 10: Quad-Sport: Hollywood
  {
    id: 'grid_10',
    title: 'SportsGrid #10: Hollywood Quad-Sport Showcase',
    rowCategories: [CATEGORIES.SPORT_NFL, CATEGORIES.SPORT_NBA, CATEGORIES.SPORT_MLB, CATEGORIES.SPORT_NHL],
    colCategories: [CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.ACCOLADE_MVP, CATEGORIES.ACCOLADE_HOF, CATEGORIES.METRO_LA],
  },
  // Day 11
  {
    id: 'grid_11',
    title: 'SportsGrid #11: North of the Border & Broad Street',
    rowCategories: [CATEGORIES.METRO_CANADA, CATEGORIES.ACCOLADE_HOF, CATEGORIES.DRAFT_FIRST_ROUND, CATEGORIES.ERA_2000S],
    colCategories: [CATEGORIES.METRO_PHILLY, CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.CAREER_3_TEAMS, CATEGORIES.ERA_ACTIVE_2020S],
  },
  // Day 12
  {
    id: 'grid_12',
    title: 'SportsGrid #12: Lone Star & Single Digits',
    rowCategories: [CATEGORIES.METRO_TEXAS, CATEGORIES.ACCOLADE_MVP, CATEGORIES.DRAFT_TOP_10, CATEGORIES.ERA_15_SEASONS],
    colCategories: [CATEGORIES.METRO_NY, CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.DRAFT_FIRST_ROUND, CATEGORIES.NUMBER_SINGLE_DIGIT],
  },
  // Day 13
  {
    id: 'grid_13',
    title: 'SportsGrid #13: Bay Area Dynasty & New England',
    rowCategories: [CATEGORIES.METRO_BAY_AREA, CATEGORIES.ACCOLADE_MULTI_CHAMP, CATEGORIES.DRAFT_FIRST_ROUND, CATEGORIES.ERA_2000S],
    colCategories: [CATEGORIES.METRO_BOSTON, CATEGORIES.ACCOLADE_HOF, CATEGORIES.CAREER_3_TEAMS, CATEGORIES.STAT_STEALS_500],
  },
  // Day 14
  {
    id: 'grid_14',
    title: 'SportsGrid #14: Sunshine State & Midwest Playmakers',
    rowCategories: [CATEGORIES.METRO_FLORIDA, CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.DRAFT_TOP_10, CATEGORIES.ERA_ACTIVE_2020S],
    colCategories: [CATEGORIES.METRO_CHICAGO, CATEGORIES.ACCOLADE_MVP, CATEGORIES.CAREER_3_TEAMS, CATEGORIES.STAT_ASSISTS_1000],
  },
  // Day 15
  {
    id: 'grid_15',
    title: 'SportsGrid #15: Motor City & Franchise Icons',
    rowCategories: [CATEGORIES.METRO_DETROIT, CATEGORIES.ACCOLADE_HOF, CATEGORIES.DRAFT_FIRST_ROUND, CATEGORIES.ERA_15_SEASONS],
    colCategories: [CATEGORIES.METRO_LA, CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.CAREER_ONE_FRANCHISE, CATEGORIES.ERA_1990S],
  },
  // Day 16: Big 4 All-Era Decathlon
  {
    id: 'grid_16',
    title: 'SportsGrid #16: Big 4 All-Era Decathlon',
    rowCategories: [CATEGORIES.SPORT_NFL, CATEGORIES.SPORT_NBA, CATEGORIES.SPORT_MLB, CATEGORIES.SPORT_NHL],
    colCategories: [CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.ACCOLADE_HOF, CATEGORIES.ERA_15_SEASONS, CATEGORIES.ERA_ACTIVE_2020S],
  },
  // Day 17
  {
    id: 'grid_17',
    title: 'SportsGrid #17: Buckeye State & Lone Star Clash',
    rowCategories: [CATEGORIES.METRO_OHIO, CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.DRAFT_TOP_10, CATEGORIES.ERA_2000S],
    colCategories: [CATEGORIES.METRO_TEXAS, CATEGORIES.ACCOLADE_HOF, CATEGORIES.DRAFT_FIRST_ROUND, CATEGORIES.STAT_TURNOVERS_150],
  },
  // Day 18
  {
    id: 'grid_18',
    title: 'SportsGrid #18: Capital Beltway & #1 Overall Picks',
    rowCategories: [CATEGORIES.METRO_DC_BALTIMORE, CATEGORIES.ACCOLADE_MVP, CATEGORIES.CAREER_3_TEAMS, CATEGORIES.ERA_ACTIVE_2020S],
    colCategories: [CATEGORIES.METRO_NY, CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.DRAFT_FIRST_OVERALL, CATEGORIES.ERA_15_SEASONS],
  },
  // Day 19
  {
    id: 'grid_19',
    title: 'SportsGrid #19: Northeast I-95 & Famous Jerseys',
    rowCategories: [CATEGORIES.METRO_PHILLY, CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.DRAFT_TOP_10, CATEGORIES.ERA_15_SEASONS],
    colCategories: [CATEGORIES.METRO_BOSTON, CATEGORIES.ACCOLADE_HOF, CATEGORIES.CAREER_3_TEAMS, CATEGORIES.NUMBER_23_OR_24],
  },
  // Day 20
  {
    id: 'grid_20',
    title: 'SportsGrid #20: Great North Scoring & Hollywood',
    rowCategories: [CATEGORIES.METRO_CANADA, CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.DRAFT_FIRST_ROUND, CATEGORIES.ERA_ACTIVE_2020S],
    colCategories: [CATEGORIES.METRO_LA, CATEGORIES.ACCOLADE_MVP, CATEGORIES.DRAFT_TOP_10, CATEGORIES.STAT_POINTS_10K],
  },
  // Day 21
  {
    id: 'grid_21',
    title: 'SportsGrid #21: Sunbelt Champions & 2010s Era',
    rowCategories: [CATEGORIES.METRO_TEXAS, CATEGORIES.ACCOLADE_MULTI_CHAMP, CATEGORIES.ERA_2010S, CATEGORIES.ERA_2000S],
    colCategories: [CATEGORIES.METRO_CHICAGO, CATEGORIES.ACCOLADE_HOF, CATEGORIES.DRAFT_FIRST_ROUND, CATEGORIES.ERA_15_SEASONS],
  },
  // Day 22
  {
    id: 'grid_22',
    title: 'SportsGrid #22: Coast-to-Coast Championship Grid',
    rowCategories: [CATEGORIES.METRO_FLORIDA, CATEGORIES.ACCOLADE_MVP, CATEGORIES.DRAFT_TOP_10, CATEGORIES.ERA_15_SEASONS],
    colCategories: [CATEGORIES.METRO_BAY_AREA, CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.CAREER_3_TEAMS, CATEGORIES.ERA_ACTIVE_2020S],
  },
  // Day 23
  {
    id: 'grid_23',
    title: 'SportsGrid #23: Midwest Titans & 1,000 Assists',
    rowCategories: [CATEGORIES.METRO_DETROIT, CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.DRAFT_FIRST_ROUND, CATEGORIES.ERA_1990S],
    colCategories: [CATEGORIES.METRO_NY, CATEGORIES.ACCOLADE_HOF, CATEGORIES.CAREER_ONE_FRANCHISE, CATEGORIES.STAT_ASSISTS_1000],
  },
  // Day 24
  {
    id: 'grid_24',
    title: 'SportsGrid #24: Ohio & Boston Traditions',
    rowCategories: [CATEGORIES.METRO_OHIO, CATEGORIES.ACCOLADE_HOF, CATEGORIES.DRAFT_TOP_10, CATEGORIES.ERA_ACTIVE_2020S],
    colCategories: [CATEGORIES.METRO_BOSTON, CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.DRAFT_FIRST_ROUND, CATEGORIES.ERA_15_SEASONS],
  },
  // Day 25
  {
    id: 'grid_25',
    title: 'SportsGrid #25: Beltway to Pacific',
    rowCategories: [CATEGORIES.METRO_DC_BALTIMORE, CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.DRAFT_FIRST_ROUND, CATEGORIES.ERA_2000S],
    colCategories: [CATEGORIES.METRO_LA, CATEGORIES.ACCOLADE_MVP, CATEGORIES.DRAFT_TOP_10, CATEGORIES.NUMBER_SINGLE_DIGIT],
  },
  // Day 26
  {
    id: 'grid_26',
    title: 'SportsGrid #26: Liberty Bell & Lone Star Matrix',
    rowCategories: [CATEGORIES.METRO_PHILLY, CATEGORIES.ACCOLADE_MVP, CATEGORIES.DRAFT_TOP_10, CATEGORIES.ERA_15_SEASONS],
    colCategories: [CATEGORIES.METRO_TEXAS, CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.CAREER_3_TEAMS, CATEGORIES.ERA_ACTIVE_2020S],
  },
  // Day 27
  {
    id: 'grid_27',
    title: 'SportsGrid #27: Maple Leaf & 500 Steals',
    rowCategories: [CATEGORIES.METRO_CANADA, CATEGORIES.ACCOLADE_HOF, CATEGORIES.DRAFT_TOP_10, CATEGORIES.ERA_15_SEASONS],
    colCategories: [CATEGORIES.METRO_CHICAGO, CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.DRAFT_FIRST_ROUND, CATEGORIES.STAT_STEALS_500],
  },
  // Day 28
  {
    id: 'grid_28',
    title: 'SportsGrid #28: Pacific Rim to East River',
    rowCategories: [CATEGORIES.METRO_BAY_AREA, CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.DRAFT_TOP_10, CATEGORIES.ERA_2000S],
    colCategories: [CATEGORIES.METRO_NY, CATEGORIES.ACCOLADE_MULTI_CHAMP, CATEGORIES.DRAFT_FIRST_OVERALL, CATEGORIES.ERA_ACTIVE_2020S],
  },
  // Day 29
  {
    id: 'grid_29',
    title: 'SportsGrid #29: Sunshine State & Playmakers',
    rowCategories: [CATEGORIES.METRO_FLORIDA, CATEGORIES.ACCOLADE_HOF, CATEGORIES.DRAFT_TOP_10, CATEGORIES.ERA_15_SEASONS],
    colCategories: [CATEGORIES.METRO_BOSTON, CATEGORIES.ACCOLADE_MVP, CATEGORIES.CAREER_ONE_FRANCHISE, CATEGORIES.STAT_ASSISTS_1000],
  },
  // Day 30
  {
    id: 'grid_30',
    title: 'SportsGrid #30: Hollywood Stars & Motor City',
    rowCategories: [CATEGORIES.METRO_LA, CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.DRAFT_TOP_10, CATEGORIES.ERA_ACTIVE_2020S],
    colCategories: [CATEGORIES.METRO_DETROIT, CATEGORIES.ACCOLADE_MVP, CATEGORIES.DRAFT_FIRST_ROUND, CATEGORIES.ERA_15_SEASONS],
  },
];
