import { Athlete } from '@/types';
import mlbData from './athletes-mlb.json';
import nbaData from './athletes-nba.json';
import nflData from './athletes-nfl.json';
import nhlData from './athletes-nhl.json';

const MULTI_SPORT_NAMES = new Set([
  'Bo Jackson',
  'Deion Sanders',
  'Danny Ainge',
  'Gene Conley',
  'Brian Jordan',
  'Chuck Connors',
]);

const MULTI_SPORT_ATHLETES: Athlete[] = [
  {
    id: 'ath_bo_jackson',
    name: 'Bo Jackson',
    sports: ['NFL', 'MLB'],
    teams: ['RAI', 'LV', 'KCR', 'KC', 'CHW', 'CAL', 'LAA'],
    teamNames: ['Los Angeles Raiders', 'Kansas City Royals', 'Chicago White Sox', 'California Angels'],
    markets: ['LA', 'CHI', 'KC'],
    positions: ['RB', 'OF'],
    activeYears: [1986, 1994],
    jerseyNumbers: [34, 16],
    college: 'Auburn',
    collegeConference: 'SEC',
    draftPick: 1, // 1st overall in 1986 NFL Draft
    draftRound: 1,
    draftYear: 1986,
    championships: 0,
    mvps: 0,
    hallOfFame: false,
    rookieOfTheYear: false,
    stats: { steals: 82, points: 108, hits: 598, turnovers: 7 },
    popularityScore: 95,
  },
  {
    id: 'ath_deion_sanders',
    name: 'Deion Sanders',
    sports: ['NFL', 'MLB'],
    teams: ['ATL', 'SF', 'DAL', 'WAS', 'BAL', 'NYY', 'CIN'],
    teamNames: ['Atlanta Falcons', 'San Francisco 49ers', 'Dallas Cowboys', 'New York Yankees', 'Atlanta Braves', 'Cincinnati Reds'],
    markets: ['BAY', 'DAL', 'NY', 'ATL', 'WAS', 'CIN'],
    positions: ['CB', 'OF', 'KR'],
    activeYears: [1989, 2005],
    jerseyNumbers: [21, 2],
    college: 'Florida State',
    collegeConference: 'ACC',
    draftPick: 5,
    draftRound: 1,
    draftYear: 1989,
    championships: 2, // 2 Super Bowls (49ers, Cowboys)
    mvps: 0,
    hallOfFame: true, // Pro Football Hall of Fame
    rookieOfTheYear: false,
    stats: { steals: 186, hits: 558, turnovers: 4, points: 18 },
    popularityScore: 98,
  },
  {
    id: 'ath_danny_ainge',
    name: 'Danny Ainge',
    sports: ['NBA', 'MLB'],
    teams: ['BOS', 'SAC', 'POR', 'PHX', 'TOR'],
    teamNames: ['Boston Celtics', 'Sacramento Kings', 'Portland Trail Blazers', 'Phoenix Suns', 'Toronto Blue Jays'],
    markets: ['BOS', 'SAC', 'POR', 'PHX', 'TOR'],
    positions: ['SG', 'PG', '2B', '3B'],
    activeYears: [1979, 1995],
    jerseyNumbers: [44, 22, 2],
    college: 'BYU',
    collegeConference: 'Big 12',
    draftPick: 31,
    draftRound: 2,
    draftYear: 1981,
    championships: 2, // 2 NBA Championships (Celtics 1984, 1986)
    mvps: 0,
    hallOfFame: false,
    rookieOfTheYear: false,
    stats: { steals: 1137, assists: 4199, points: 11964, hits: 146, turnovers: 1566 },
    popularityScore: 80,
  },
  {
    id: 'ath_gene_conley',
    name: 'Gene Conley',
    sports: ['NBA', 'MLB'],
    teams: ['BOS', 'NYK', 'MLN', 'ATL', 'PHI'],
    teamNames: ['Boston Celtics', 'New York Knicks', 'Milwaukee Braves', 'Philadelphia Phillies'],
    markets: ['BOS', 'NY', 'PHI', 'ATL'],
    positions: ['C', 'RHP'],
    activeYears: [1952, 1964],
    jerseyNumbers: [17, 22],
    college: 'Washington State',
    collegeConference: 'Pac-12',
    championships: 4, // 1 World Series (1957 Braves) + 3 NBA Championships (1959, 1960, 1961 Celtics)
    mvps: 0,
    hallOfFame: false,
    rookieOfTheYear: false,
    stats: { points: 2069, hits: 78, saves: 5 },
    popularityScore: 65,
  },
  {
    id: 'ath_brian_jordan',
    name: 'Brian Jordan',
    sports: ['NFL', 'MLB'],
    teams: ['ATL', 'SLN', 'STL', 'LAN', 'LA', 'TEX', 'DAL'],
    teamNames: ['Atlanta Falcons', 'St. Louis Cardinals', 'Atlanta Braves', 'Los Angeles Dodgers', 'Texas Rangers'],
    markets: ['ATL', 'STL', 'LA', 'DAL'],
    positions: ['DB', 'OF'],
    activeYears: [1989, 2006],
    jerseyNumbers: [33, 27],
    college: 'Richmond',
    collegeConference: undefined,
    draftPick: 173,
    draftRound: 7,
    draftYear: 1989,
    championships: 0,
    mvps: 0,
    hallOfFame: false,
    rookieOfTheYear: false,
    stats: { hits: 1454, steals: 119, points: 12, turnovers: 4 },
    popularityScore: 70,
  },
  {
    id: 'ath_chuck_connors',
    name: 'Chuck Connors',
    sports: ['NBA', 'MLB'],
    teams: ['BOS', 'BRO', 'NY', 'CHC', 'CHI'],
    teamNames: ['Boston Celtics', 'Brooklyn Dodgers', 'Chicago Cubs'],
    markets: ['BOS', 'NY', 'CHI'],
    positions: ['PF', '1B'],
    activeYears: [1946, 1951],
    jerseyNumbers: [11],
    college: 'Seton Hall',
    collegeConference: 'Big East',
    championships: 0,
    mvps: 0,
    hallOfFame: false,
    rookieOfTheYear: false,
    stats: { points: 239, hits: 48 },
    popularityScore: 60,
  },
];

// Combine all historical players from the 4 leagues, filtering out multi-sport entries
const MLB_ATHLETES: Athlete[] = (mlbData as unknown as Athlete[]).filter((p) => !MULTI_SPORT_NAMES.has(p.name));
const NBA_ATHLETES: Athlete[] = (nbaData as unknown as Athlete[]).filter((p) => !MULTI_SPORT_NAMES.has(p.name));
const NFL_ATHLETES: Athlete[] = (nflData as unknown as Athlete[]).filter((p) => !MULTI_SPORT_NAMES.has(p.name));
const NHL_ATHLETES: Athlete[] = (nhlData as unknown as Athlete[]).filter((p) => !MULTI_SPORT_NAMES.has(p.name));

export const ATHLETES: Athlete[] = [
  ...MULTI_SPORT_ATHLETES,
  ...MLB_ATHLETES,
  ...NBA_ATHLETES,
  ...NFL_ATHLETES,
  ...NHL_ATHLETES,
];
