import { Category, DailyPuzzle } from '@/types';
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
 * 30 Curated, guaranteed-solvable 4x4 daily puzzles.
 * Every single cell across all 30 puzzles has at least 43 historical answers.
 */
export const PUZZLE_BANK: Omit<PuzzleDefinition, 'date' | 'puzzleNumber'>[] = [
  // 1. Inaugural Cross-Stats & Metros
  {
    id: 'grid_01',
    title: 'SportsGrid #1: Metro Cross-Stats',
    rowCategories: [CATEGORIES.METRO_BOSTON, CATEGORIES.METRO_NY, CATEGORIES.METRO_CHICAGO, CATEGORIES.METRO_LA],
    colCategories: [CATEGORIES.STAT_STEALS_500, CATEGORIES.STAT_ASSISTS_1000, CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.ACCOLADE_MVP],
  },
  // 2. Hall of Fame & Championships
  {
    id: 'grid_02',
    title: 'SportsGrid #2: Rings & Legends',
    rowCategories: [CATEGORIES.METRO_BOSTON, CATEGORIES.METRO_NY, CATEGORIES.METRO_CHICAGO, CATEGORIES.METRO_LA],
    colCategories: [CATEGORIES.STAT_STEALS_500, CATEGORIES.STAT_ASSISTS_1000, CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.ACCOLADE_HOF],
  },
  // 3. The 10K Points & Milestones
  {
    id: 'grid_03',
    title: 'SportsGrid #3: High Scorers Matrix',
    rowCategories: [CATEGORIES.METRO_BOSTON, CATEGORIES.METRO_NY, CATEGORIES.METRO_CHICAGO, CATEGORIES.METRO_LA],
    colCategories: [CATEGORIES.STAT_STEALS_500, CATEGORIES.STAT_ASSISTS_1000, CATEGORIES.STAT_POINTS_10K, CATEGORIES.ACCOLADE_CHAMPION],
  },
  // 4. Turnovers & Titles
  {
    id: 'grid_04',
    title: 'SportsGrid #4: Possession & Rings',
    rowCategories: [CATEGORIES.METRO_BOSTON, CATEGORIES.METRO_NY, CATEGORIES.METRO_CHICAGO, CATEGORIES.METRO_LA],
    colCategories: [CATEGORIES.STAT_STEALS_500, CATEGORIES.STAT_ASSISTS_1000, CATEGORIES.STAT_TURNOVERS_150, CATEGORIES.ACCOLADE_CHAMPION],
  },
  // 5. West Coast to East Coast (Bay Area & LA)
  {
    id: 'grid_05',
    title: 'SportsGrid #5: Coast-to-Coast Clash',
    rowCategories: [CATEGORIES.METRO_BAY_AREA, CATEGORIES.METRO_NY, CATEGORIES.METRO_CHICAGO, CATEGORIES.METRO_LA],
    colCategories: [CATEGORIES.STAT_STEALS_500, CATEGORIES.STAT_ASSISTS_1000, CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.ACCOLADE_MVP],
  },
  // 6. Philly, Boston, NY & Chicago
  {
    id: 'grid_06',
    title: 'SportsGrid #6: Eastern Hubs & Rust Belt',
    rowCategories: [CATEGORIES.METRO_PHILLY, CATEGORIES.METRO_NY, CATEGORIES.METRO_BOSTON, CATEGORIES.METRO_CHICAGO],
    colCategories: [CATEGORIES.STAT_STEALS_500, CATEGORIES.STAT_ASSISTS_1000, CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.ACCOLADE_HOF],
  },
  // 7. Quad-Sport: The Big 4 Leagues in New York
  {
    id: 'grid_07',
    title: 'SportsGrid #7: Big Apple Quad-Sport',
    rowCategories: [CATEGORIES.SPORT_NFL, CATEGORIES.SPORT_NBA, CATEGORIES.SPORT_MLB, CATEGORIES.SPORT_NHL],
    colCategories: [CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.ACCOLADE_MVP, CATEGORIES.ACCOLADE_HOF, CATEGORIES.METRO_NY],
  },
  // 8. Quad-Sport: The Boston Dynasty Matrix
  {
    id: 'grid_08',
    title: 'SportsGrid #8: Title Town Quad-Sport',
    rowCategories: [CATEGORIES.SPORT_NFL, CATEGORIES.SPORT_NBA, CATEGORIES.SPORT_MLB, CATEGORIES.SPORT_NHL],
    colCategories: [CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.ACCOLADE_MVP, CATEGORIES.ACCOLADE_HOF, CATEGORIES.METRO_BOSTON],
  },
  // 9. Quad-Sport: The Windy City Legends
  {
    id: 'grid_09',
    title: 'SportsGrid #9: Chicago Quad-Sport',
    rowCategories: [CATEGORIES.SPORT_NFL, CATEGORIES.SPORT_NBA, CATEGORIES.SPORT_MLB, CATEGORIES.SPORT_NHL],
    colCategories: [CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.ACCOLADE_MVP, CATEGORIES.ACCOLADE_HOF, CATEGORIES.METRO_CHICAGO],
  },
  // 10. Quad-Sport: City of Champions (LA)
  {
    id: 'grid_10',
    title: 'SportsGrid #10: Hollywood Quad-Sport',
    rowCategories: [CATEGORIES.SPORT_NFL, CATEGORIES.SPORT_NBA, CATEGORIES.SPORT_MLB, CATEGORIES.SPORT_NHL],
    colCategories: [CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.ACCOLADE_MVP, CATEGORIES.ACCOLADE_HOF, CATEGORIES.METRO_LA],
  },
  // 11. Longevity & Accolades
  {
    id: 'grid_11',
    title: 'SportsGrid #11: 15+ Seasons Ironmen',
    rowCategories: [CATEGORIES.SPORT_NFL, CATEGORIES.SPORT_NBA, CATEGORIES.SPORT_MLB, CATEGORIES.SPORT_NHL],
    colCategories: [CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.ACCOLADE_MVP, CATEGORIES.ACCOLADE_HOF, CATEGORIES.ERA_15_SEASONS],
  },
  // 12. Modern Era Stars (2020s Active)
  {
    id: 'grid_12',
    title: 'SportsGrid #12: 2020s Modern Era',
    rowCategories: [CATEGORIES.SPORT_NFL, CATEGORIES.SPORT_NBA, CATEGORIES.SPORT_MLB, CATEGORIES.SPORT_NHL],
    colCategories: [CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.ACCOLADE_MVP, CATEGORIES.ACCOLADE_HOF, CATEGORIES.ERA_ACTIVE_2020S],
  },
  // 13. Longevity & New York
  {
    id: 'grid_13',
    title: 'SportsGrid #13: Decades in Gotham',
    rowCategories: [CATEGORIES.SPORT_NFL, CATEGORIES.SPORT_NBA, CATEGORIES.SPORT_MLB, CATEGORIES.SPORT_NHL],
    colCategories: [CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.ACCOLADE_MVP, CATEGORIES.METRO_NY, CATEGORIES.ERA_15_SEASONS],
  },
  // 14. Boston Longevity
  {
    id: 'grid_14',
    title: 'SportsGrid #14: New England Endurance',
    rowCategories: [CATEGORIES.SPORT_NFL, CATEGORIES.SPORT_NBA, CATEGORIES.SPORT_MLB, CATEGORIES.SPORT_NHL],
    colCategories: [CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.ACCOLADE_HOF, CATEGORIES.METRO_BOSTON, CATEGORIES.ERA_15_SEASONS],
  },
  // 15. Chicago Longevity
  {
    id: 'grid_15',
    title: 'SportsGrid #15: Windy City Veterans',
    rowCategories: [CATEGORIES.SPORT_NFL, CATEGORIES.SPORT_NBA, CATEGORIES.SPORT_MLB, CATEGORIES.SPORT_NHL],
    colCategories: [CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.ACCOLADE_HOF, CATEGORIES.METRO_CHICAGO, CATEGORIES.ERA_15_SEASONS],
  },
  // 16. Los Angeles Longevity
  {
    id: 'grid_16',
    title: 'SportsGrid #16: California Gold',
    rowCategories: [CATEGORIES.SPORT_NFL, CATEGORIES.SPORT_NBA, CATEGORIES.SPORT_MLB, CATEGORIES.SPORT_NHL],
    colCategories: [CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.ACCOLADE_HOF, CATEGORIES.METRO_LA, CATEGORIES.ERA_15_SEASONS],
  },
  // 17. Inverted: Cross-Stats vs 4 Major Cities
  {
    id: 'grid_17',
    title: 'SportsGrid #17: Stats vs North America',
    rowCategories: [CATEGORIES.STAT_STEALS_500, CATEGORIES.STAT_ASSISTS_1000, CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.ACCOLADE_MVP],
    colCategories: [CATEGORIES.METRO_BOSTON, CATEGORIES.METRO_NY, CATEGORIES.METRO_CHICAGO, CATEGORIES.METRO_LA],
  },
  // 18. Inverted: Pure Stats Quad
  {
    id: 'grid_18',
    title: 'SportsGrid #18: The All-Stat Matrix',
    rowCategories: [CATEGORIES.STAT_STEALS_500, CATEGORIES.STAT_ASSISTS_1000, CATEGORIES.STAT_POINTS_10K, CATEGORIES.STAT_TURNOVERS_150],
    colCategories: [CATEGORIES.METRO_BOSTON, CATEGORIES.METRO_NY, CATEGORIES.METRO_CHICAGO, CATEGORIES.METRO_LA],
  },
  // 19. Bay Area & Hall of Famers
  {
    id: 'grid_19',
    title: 'SportsGrid #19: Golden Gate & Beyond',
    rowCategories: [CATEGORIES.STAT_STEALS_500, CATEGORIES.STAT_ASSISTS_1000, CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.ACCOLADE_HOF],
    colCategories: [CATEGORIES.METRO_BAY_AREA, CATEGORIES.METRO_NY, CATEGORIES.METRO_CHICAGO, CATEGORIES.METRO_LA],
  },
  // 20. Philadelphia & Hall of Famers
  {
    id: 'grid_20',
    title: 'SportsGrid #20: Liberty Bell Cross-Sport',
    rowCategories: [CATEGORIES.STAT_STEALS_500, CATEGORIES.STAT_ASSISTS_1000, CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.ACCOLADE_HOF],
    colCategories: [CATEGORIES.METRO_PHILLY, CATEGORIES.METRO_NY, CATEGORIES.METRO_BOSTON, CATEGORIES.METRO_LA],
  },
  // 21. Pure Accolades vs Cities
  {
    id: 'grid_21',
    title: 'SportsGrid #21: The Accolade Decathlon',
    rowCategories: [CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.ACCOLADE_MVP, CATEGORIES.ACCOLADE_HOF, CATEGORIES.ERA_15_SEASONS],
    colCategories: [CATEGORIES.METRO_BOSTON, CATEGORIES.METRO_NY, CATEGORIES.METRO_CHICAGO, CATEGORIES.METRO_LA],
  },
  // 22. Accolades in the Bay
  {
    id: 'grid_22',
    title: 'SportsGrid #22: Pacific Champions',
    rowCategories: [CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.ACCOLADE_MVP, CATEGORIES.ACCOLADE_HOF, CATEGORIES.ERA_15_SEASONS],
    colCategories: [CATEGORIES.METRO_BAY_AREA, CATEGORIES.METRO_NY, CATEGORIES.METRO_CHICAGO, CATEGORIES.METRO_LA],
  },
  // 23. Philly & East Coast Accolades
  {
    id: 'grid_23',
    title: 'SportsGrid #23: East Coast Royalty',
    rowCategories: [CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.ACCOLADE_MVP, CATEGORIES.ACCOLADE_HOF, CATEGORIES.ERA_15_SEASONS],
    colCategories: [CATEGORIES.METRO_PHILLY, CATEGORIES.METRO_NY, CATEGORIES.METRO_BOSTON, CATEGORIES.METRO_LA],
  },
  // 24. Modern Stars & The Four Cities
  {
    id: 'grid_24',
    title: 'SportsGrid #24: Today’s Superstars',
    rowCategories: [CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.ACCOLADE_MVP, CATEGORIES.ACCOLADE_HOF, CATEGORIES.ERA_ACTIVE_2020S],
    colCategories: [CATEGORIES.METRO_BOSTON, CATEGORIES.METRO_NY, CATEGORIES.METRO_CHICAGO, CATEGORIES.METRO_LA],
  },
  // 25. Modern Stars in the Bay Area
  {
    id: 'grid_25',
    title: 'SportsGrid #25: West Coast 2020s',
    rowCategories: [CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.ACCOLADE_MVP, CATEGORIES.ACCOLADE_HOF, CATEGORIES.ERA_ACTIVE_2020S],
    colCategories: [CATEGORIES.METRO_BAY_AREA, CATEGORIES.METRO_NY, CATEGORIES.METRO_CHICAGO, CATEGORIES.METRO_LA],
  },
  // 26. Modern Stars in Philadelphia
  {
    id: 'grid_26',
    title: 'SportsGrid #26: Broad Street Modern Stars',
    rowCategories: [CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.ACCOLADE_MVP, CATEGORIES.ACCOLADE_HOF, CATEGORIES.ERA_ACTIVE_2020S],
    colCategories: [CATEGORIES.METRO_PHILLY, CATEGORIES.METRO_NY, CATEGORIES.METRO_BOSTON, CATEGORIES.METRO_LA],
  },
  // 27. Steals & Accolades
  {
    id: 'grid_27',
    title: 'SportsGrid #27: The Thief’s Matrix',
    rowCategories: [CATEGORIES.METRO_BOSTON, CATEGORIES.METRO_NY, CATEGORIES.METRO_CHICAGO, CATEGORIES.METRO_LA],
    colCategories: [CATEGORIES.STAT_STEALS_500, CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.ACCOLADE_MVP, CATEGORIES.ACCOLADE_HOF],
  },
  // 28. Playmakers Matrix (Assists)
  {
    id: 'grid_28',
    title: 'SportsGrid #28: The Playmaker’s Matrix',
    rowCategories: [CATEGORIES.METRO_BOSTON, CATEGORIES.METRO_NY, CATEGORIES.METRO_CHICAGO, CATEGORIES.METRO_LA],
    colCategories: [CATEGORIES.STAT_ASSISTS_1000, CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.ACCOLADE_MVP, CATEGORIES.ACCOLADE_HOF],
  },
  // 29. Pure Scoring & Rings
  {
    id: 'grid_29',
    title: 'SportsGrid #29: High-Octane Scorers',
    rowCategories: [CATEGORIES.METRO_BOSTON, CATEGORIES.METRO_NY, CATEGORIES.METRO_CHICAGO, CATEGORIES.METRO_LA],
    colCategories: [CATEGORIES.STAT_POINTS_10K, CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.ACCOLADE_MVP, CATEGORIES.ACCOLADE_HOF],
  },
  // 30. Ball Control & Trophies
  {
    id: 'grid_30',
    title: 'SportsGrid #30: The Championship Decathlon',
    rowCategories: [CATEGORIES.METRO_BOSTON, CATEGORIES.METRO_NY, CATEGORIES.METRO_CHICAGO, CATEGORIES.METRO_LA],
    colCategories: [CATEGORIES.STAT_TURNOVERS_150, CATEGORIES.ACCOLADE_CHAMPION, CATEGORIES.ACCOLADE_MVP, CATEGORIES.ACCOLADE_HOF],
  },
];
