export type Sport = 'NFL' | 'NBA' | 'MLB' | 'NHL' | 'SOCCER';

export type CategoryType = 
  | 'SPORT' 
  | 'METRO' 
  | 'ACCOLADE' 
  | 'BACKGROUND' 
  | 'NUMBER_ERA' 
  | 'CROSS_STAT';

export interface AthleteStats {
  steals?: number;     // MLB Stolen Bases or NBA Steals
  assists?: number;    // NBA / NHL / Soccer Assists
  points?: number;     // NBA Points / NHL Points (G+A) / NFL Points scored
  hits?: number;       // MLB Base Hits or NHL Body Checks
  saves?: number;      // MLB Pitching Saves or NHL/Soccer Goalie Saves
  turnovers?: number;  // NFL INTs+Fumbles or NBA Turnovers
}

export interface Athlete {
  id: string;
  name: string;
  sports: Sport[];
  teams: string[];             // e.g. ['NE', 'TB']
  teamNames: string[];         // e.g. ['New England Patriots', 'Tampa Bay Buccaneers']
  markets: string[];           // e.g. ['BOS', 'TB']
  positions: string[];         // e.g. ['QB']
  activeYears: [number, number]; // [2000, 2022]
  jerseyNumbers: number[];     // [12]
  college?: string;            // 'Michigan'
  collegeConference?: string;  // 'Big Ten'
  draftPick?: number;          // 199
  draftRound?: number;         // 6
  draftYear?: number;          // 2000
  isUndrafted?: boolean;       // false
  
  // Accolades
  championships: number;       // 7
  mvps: number;                // 3
  hallOfFame: boolean;         // false
  rookieOfTheYear: boolean;    // false

  // The 6 Normalized Cross-Sport Stats
  stats: AthleteStats;

  // Fame / Obscurity weight (1 = ultra obscure, 100 = household name like Jordan/Brady)
  popularityScore: number;
}

export interface Category {
  id: string;
  name: string;
  shortName: string;
  type: CategoryType;
  description: string;
  iconName?: string;
  matches: (athlete: Athlete) => boolean;
}

export type PlayMode = 'IMMACULATE' | 'STRIKES';

export interface CellState {
  row: number;
  col: number;
  athlete?: Athlete;
  rarity?: number;
  isCorrect?: boolean;
  isBurnt?: boolean;
}

export interface DailyPuzzle {
  id: string;
  date: string;
  title: string;
  rowCategories: Category[];
  colCategories: Category[];
}
