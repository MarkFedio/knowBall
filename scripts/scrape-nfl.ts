/**
 * NFL Ingestion Pipeline
 *
 * Ingests all ~25,000 historical NFL players from 1920 to 2026.
 * Uses strict unique ID indexing (gsis_id, pfr_id, esb_id, name+birth_date)
 * so that distinct players sharing a name (e.g. Tony Adams, Marcus Allen,
 * Orlando Brown) are NEVER cross-contaminated.
 *
 * Output: src/data/athletes-nfl.json
 */

import fs from 'fs';
import path from 'path';
import { Athlete } from '../src/types';
import { MASTER_TEAM_TO_MARKET, getMarketsForAthlete } from '../src/lib/marketResolver';
import { NFL_AUGMENTS } from './augment-all-sports-2026';

const CACHE_DIR = path.join(process.cwd(), '.cache', 'nfl');
const OUTPUT_FILE = path.join(process.cwd(), 'src', 'data', 'athletes-nfl.json');

const PLAYERS_URL = 'https://github.com/nflverse/nflverse-data/releases/download/players/players.csv';
const DRAFT_URL = 'https://github.com/nflverse/nflverse-data/releases/download/draft_picks/draft_picks.csv';
const WIKI_HOF_URL = 'https://en.wikipedia.org/w/api.php?action=parse&page=List_of_Pro_Football_Hall_of_Fame_inductees&prop=wikitext&format=json';

// Super Bowl Champions by NFL season year (1966 season is SB I)
const SUPER_BOWL_WINNERS: Record<number, string[]> = {
  1966: ['GB'], 1967: ['GB'], 1968: ['NYJ'], 1969: ['KC'], 1970: ['BAL', 'IND'],
  1971: ['DAL'], 1972: ['MIA'], 1973: ['MIA'], 1974: ['PIT'], 1975: ['PIT'],
  1976: ['OAK', 'LV'], 1977: ['DAL'], 1978: ['PIT'], 1979: ['PIT'], 1980: ['OAK', 'LV'],
  1981: ['SF'], 1982: ['WAS'], 1983: ['LA', 'RAI', 'OAK', 'LV'], 1984: ['SF'], 1985: ['CHI'],
  1986: ['NYG'], 1987: ['WAS'], 1988: ['SF'], 1989: ['SF'], 1990: ['NYG'],
  1991: ['WAS'], 1992: ['DAL'], 1993: ['DAL'], 1994: ['SF'], 1995: ['DAL'],
  1996: ['GB'], 1997: ['DEN'], 1998: ['DEN'], 1999: ['STL', 'RAM', 'LAR', 'LA'], 2000: ['BAL'],
  2001: ['NE', 'NWE'], 2002: ['TB'], 2003: ['NE', 'NWE'], 2004: ['NE', 'NWE'], 2005: ['PIT'],
  2006: ['IND'], 2007: ['NYG'], 2008: ['PIT'], 2009: ['NO'], 2010: ['GB'],
  2011: ['NYG'], 2012: ['BAL'], 2013: ['SEA'], 2014: ['NE', 'NWE'], 2015: ['DEN'],
  2016: ['NE', 'NWE'], 2017: ['PHI'], 2018: ['NE', 'NWE'], 2019: ['KC'], 2020: ['TB'],
  2021: ['LAR', 'LA'], 2022: ['KC'], 2023: ['KC'], 2024: ['KC'],
};

// Official AP NFL MVPs with season years and winning market
export interface MvpRecord {
  name: string;
  years: number[];
  markets: string[];
}
export const NFL_MVP_LIST: MvpRecord[] = [
  { name: 'Otto Graham', years: [1951, 1953, 1955], markets: ['CLE'] },
  { name: 'Jim Brown', years: [1957, 1958, 1965], markets: ['CLE'] },
  { name: 'Johnny Unitas', years: [1959, 1964, 1967], markets: ['BAL'] },
  { name: 'Norm Van Brocklin', years: [1960], markets: ['PHI'] },
  { name: 'Paul Hornung', years: [1961], markets: ['GB'] },
  { name: 'Jim Taylor', years: [1962], markets: ['GB'] },
  { name: 'Y.A. Tittle', years: [1963], markets: ['NY'] },
  { name: 'Jack Kemp', years: [1965], markets: ['BUF'] },
  { name: 'Bart Starr', years: [1966], markets: ['GB'] },
  { name: 'Earl Morrall', years: [1968], markets: ['BAL'] },
  { name: 'Roman Gabriel', years: [1969], markets: ['LA'] },
  { name: 'John Brodie', years: [1970], markets: ['BAY'] },
  { name: 'Alan Page', years: [1971], markets: ['MIN'] },
  { name: 'Larry Brown', years: [1972], markets: ['WAS'] },
  { name: 'O.J. Simpson', years: [1973], markets: ['BUF'] },
  { name: 'Ken Stabler', years: [1974], markets: ['BAY'] },
  { name: 'Fran Tarkenton', years: [1975], markets: ['MIN'] },
  { name: 'Bert Jones', years: [1976], markets: ['BAL'] },
  { name: 'Walter Payton', years: [1977], markets: ['CHI'] },
  { name: 'Terry Bradshaw', years: [1978], markets: ['PIT'] },
  { name: 'Earl Campbell', years: [1979], markets: ['HOU'] },
  { name: 'Brian Sipe', years: [1980], markets: ['CLE'] },
  { name: 'Ken Anderson', years: [1981], markets: ['CIN'] },
  { name: 'Mark Moseley', years: [1982], markets: ['WAS'] },
  { name: 'Joe Theismann', years: [1983], markets: ['WAS'] },
  { name: 'Dan Marino', years: [1984], markets: ['FLA'] },
  { name: 'Marcus Allen', years: [1985], markets: ['LA'] },
  { name: 'Lawrence Taylor', years: [1986], markets: ['NY'] },
  { name: 'John Elway', years: [1987], markets: ['DEN'] },
  { name: 'Boomer Esiason', years: [1988], markets: ['CIN'] },
  { name: 'Joe Montana', years: [1989, 1990], markets: ['BAY'] },
  { name: 'Thurman Thomas', years: [1991], markets: ['BUF'] },
  { name: 'Steve Young', years: [1992, 1994], markets: ['BAY'] },
  { name: 'Emmitt Smith', years: [1993], markets: ['DAL'] },
  { name: 'Brett Favre', years: [1995, 1996, 1997], markets: ['GB'] },
  { name: 'Barry Sanders', years: [1997], markets: ['DET'] },
  { name: 'Terrell Davis', years: [1998], markets: ['DEN'] },
  { name: 'Kurt Warner', years: [1999, 2001], markets: ['STL'] },
  { name: 'Marshall Faulk', years: [2000], markets: ['STL'] },
  { name: 'Rich Gannon', years: [2002], markets: ['BAY'] },
  { name: 'Peyton Manning', years: [2003, 2004, 2008, 2009, 2013], markets: ['IND', 'DEN'] },
  { name: 'Steve McNair', years: [2003], markets: ['TEN'] },
  { name: 'Shaun Alexander', years: [2005], markets: ['SEA'] },
  { name: 'LaDainian Tomlinson', years: [2006], markets: ['SD'] },
  { name: 'Tom Brady', years: [2007, 2010, 2017], markets: ['BOS'] },
  { name: 'Aaron Rodgers', years: [2011, 2014, 2020, 2021], markets: ['GB'] },
  { name: 'Adrian Peterson', years: [2012], markets: ['MIN'] },
  { name: 'Cam Newton', years: [2015], markets: ['CHA'] },
  { name: 'Matt Ryan', years: [2016], markets: ['ATL'] },
  { name: 'Patrick Mahomes', years: [2018, 2022], markets: ['KC'] },
  { name: 'Lamar Jackson', years: [2019, 2023], markets: ['BAL'] },
];

export interface RotyRecord {
  name: string;
  year: number;
  aliases?: string[];
}

export const NFL_ROOKIE_OF_THE_YEAR_LIST: RotyRecord[] = [
  // Combined AP / AFL Era (1957-1966)
  { name: 'Jim Brown', year: 1957 },
  { name: 'Jimmy Phillips', year: 1958 },
  { name: 'Nick Pietrosante', year: 1959 },
  { name: 'Gail Cogdill', year: 1960 },
  { name: 'Abner Haynes', year: 1960 },
  { name: 'Mike Ditka', year: 1961 },
  { name: 'Earl Faison', year: 1961 },
  { name: 'Ronnie Bull', year: 1962 },
  { name: 'Curtis McClinton', year: 1962 },
  { name: 'Paul Flatley', year: 1963 },
  { name: 'David Grayson', year: 1963 },
  { name: 'Charley Taylor', year: 1964 },
  { name: 'Matt Snell', year: 1964 },
  { name: 'Gale Sayers', year: 1965 },
  { name: 'Joe Namath', year: 1965 },
  { name: 'Tommy Nobis', year: 1966 },
  { name: 'Bobby Burnett', year: 1966 },
  // AP OROY / DROY / AFL Era (1967-present)
  { name: 'Mel Farr', year: 1967 },
  { name: 'Lem Barney', year: 1967 },
  { name: 'George Webster', year: 1967 },
  { name: 'Earl McCullouch', year: 1968 },
  { name: 'Claude Humphrey', year: 1968 },
  { name: 'Paul Robinson', year: 1968 },
  { name: 'Calvin Hill', year: 1969 },
  { name: 'Joe Greene', year: 1969 },
  { name: 'Carl Garrett', year: 1969 },
  { name: 'Dennis Shaw', year: 1970 },
  { name: 'Bruce Taylor', year: 1970 },
  { name: 'Jim Plunkett', year: 1971 },
  { name: 'Isiah Robertson', year: 1971 },
  { name: 'Franco Harris', year: 1972 },
  { name: 'Willie Buchanon', year: 1972 },
  { name: 'Chuck Foreman', year: 1973 },
  { name: 'Wally Chambers', year: 1973 },
  { name: 'Don Woods', year: 1974 },
  { name: 'Jack Lambert', year: 1974 },
  { name: 'Mike Thomas', year: 1975 },
  { name: 'Robert Brazile', year: 1975 },
  { name: 'Sammy White', year: 1976 },
  { name: 'Mike Haynes', year: 1976 },
  { name: 'Tony Dorsett', year: 1977 },
  { name: 'A.J. Duhe', year: 1977 },
  { name: 'Earl Campbell', year: 1978 },
  { name: 'Al Baker', year: 1978 },
  { name: 'Ottis Anderson', year: 1979 },
  { name: 'Jim Haslett', year: 1979 },
  { name: 'Billy Sims', year: 1980 },
  { name: 'Buddy Curry', year: 1980 },
  { name: 'Al Richardson', year: 1980 },
  { name: 'George Rogers', year: 1981 },
  { name: 'Lawrence Taylor', year: 1981 },
  { name: 'Marcus Allen', year: 1982 },
  { name: 'Chip Banks', year: 1982 },
  { name: 'Eric Dickerson', year: 1983 },
  { name: 'Vernon Maxwell', year: 1983 },
  { name: 'Louis Lipps', year: 1984 },
  { name: 'Bill Maas', year: 1984 },
  { name: 'Eddie Brown', year: 1985 },
  { name: 'Duane Bickett', year: 1985 },
  { name: 'Rueben Mayes', year: 1986 },
  { name: 'John Offerdahl', year: 1986 },
  { name: 'Troy Stradford', year: 1987 },
  { name: 'Shane Conlan', year: 1987 },
  { name: 'John Stephens', year: 1988 },
  { name: 'Erik McMillan', year: 1988 },
  { name: 'Barry Sanders', year: 1989 },
  { name: 'Derrick Thomas', year: 1989 },
  { name: 'Emmitt Smith', year: 1990 },
  { name: 'Mark Carrier', year: 1990 },
  { name: 'Leonard Russell', year: 1991 },
  { name: 'Mike Croel', year: 1991 },
  { name: 'Carl Pickens', year: 1992 },
  { name: 'Dale Carter', year: 1992 },
  { name: 'Jerome Bettis', year: 1993 },
  { name: 'Dana Stubblefield', year: 1993 },
  { name: 'Marshall Faulk', year: 1994 },
  { name: 'Tim Bowens', year: 1994 },
  { name: 'Curtis Martin', year: 1995 },
  { name: 'Hugh Douglas', year: 1995 },
  { name: 'Eddie George', year: 1996 },
  { name: 'Simeon Rice', year: 1996 },
  { name: 'Warrick Dunn', year: 1997 },
  { name: 'Peter Boulware', year: 1997 },
  { name: 'Randy Moss', year: 1998 },
  { name: 'Charles Woodson', year: 1998 },
  { name: 'Edgerrin James', year: 1999 },
  { name: 'Jevon Kearse', year: 1999 },
  { name: 'Mike Anderson', year: 2000 },
  { name: 'Brian Urlacher', year: 2000 },
  { name: 'Anthony Thomas', year: 2001 },
  { name: 'Kendrell Bell', year: 2001 },
  { name: 'Clinton Portis', year: 2002 },
  { name: 'Julius Peppers', year: 2002 },
  { name: 'Anquan Boldin', year: 2003 },
  { name: 'Terrell Suggs', year: 2003 },
  { name: 'Ben Roethlisberger', year: 2004 },
  { name: 'Jonathan Vilma', year: 2004 },
  { name: 'Cadillac Williams', year: 2005, aliases: ['Carnell Williams'] },
  { name: 'Shawne Merriman', year: 2005 },
  { name: 'Vince Young', year: 2006 },
  { name: 'DeMeco Ryans', year: 2006 },
  { name: 'Adrian Peterson', year: 2007 },
  { name: 'Patrick Willis', year: 2007 },
  { name: 'Matt Ryan', year: 2008 },
  { name: 'Jerod Mayo', year: 2008 },
  { name: 'Percy Harvin', year: 2009 },
  { name: 'Brian Cushing', year: 2009 },
  { name: 'Sam Bradford', year: 2010 },
  { name: 'Ndamukong Suh', year: 2010 },
  { name: 'Cam Newton', year: 2011 },
  { name: 'Von Miller', year: 2011 },
  { name: 'Robert Griffin III', year: 2012, aliases: ['Robert Griffin'] },
  { name: 'Luke Kuechly', year: 2012 },
  { name: 'Eddie Lacy', year: 2013 },
  { name: 'Sheldon Richardson', year: 2013 },
  { name: 'Odell Beckham Jr.', year: 2014, aliases: ['Odell Beckham'] },
  { name: 'Aaron Donald', year: 2014 },
  { name: 'Todd Gurley', year: 2015 },
  { name: 'Marcus Peters', year: 2015 },
  { name: 'Dak Prescott', year: 2016 },
  { name: 'Joey Bosa', year: 2016 },
  { name: 'Alvin Kamara', year: 2017 },
  { name: 'Marshon Lattimore', year: 2017 },
  { name: 'Saquon Barkley', year: 2018 },
  { name: 'Shaquille Leonard', year: 2018, aliases: ['Darius Leonard'] },
  { name: 'Kyler Murray', year: 2019 },
  { name: 'Nick Bosa', year: 2019 },
  { name: 'Justin Herbert', year: 2020 },
  { name: 'Chase Young', year: 2020 },
  { name: 'Ja\'Marr Chase', year: 2021 },
  { name: 'Micah Parsons', year: 2021 },
  { name: 'Garrett Wilson', year: 2022 },
  { name: 'Sauce Gardner', year: 2022, aliases: ['Ahmad Gardner'] },
  { name: 'C.J. Stroud', year: 2023, aliases: ['CJ Stroud'] },
  { name: 'Will Anderson Jr.', year: 2023, aliases: ['Will Anderson'] },
  { name: 'Jayden Daniels', year: 2024 },
  { name: 'Jared Verse', year: 2024 }
];

export const HISTORICAL_PRE1970_ROTY_LEGENDS: Partial<Athlete>[] = [
  {
    id: 'ath_nfl_roty_phillips_jimmy',
    name: 'Jimmy Phillips',
    sports: ['NFL'],
    teams: ['RAM', 'LAR', 'LA', 'MIN'],
    teamNames: ['Los Angeles Rams', 'Minnesota Vikings'],
    positions: ['WR', 'TE'],
    activeYears: [1958, 1967],
    jerseyNumbers: [87, 88],
    championships: 0,
    mvps: 0,
    hallOfFame: false,
    rookieOfTheYear: true,
    stats: { points: 0, turnovers: 0 },
    popularityScore: 40,
    championshipMarkets: [],
    mvpMarkets: [],
  },
  {
    id: 'ath_nfl_roty_pietrosante_nick',
    name: 'Nick Pietrosante',
    sports: ['NFL'],
    teams: ['DET', 'CLE'],
    teamNames: ['Detroit Lions', 'Cleveland Browns'],
    positions: ['FB', 'RB'],
    activeYears: [1959, 1967],
    jerseyNumbers: [33],
    championships: 0,
    mvps: 0,
    hallOfFame: false,
    rookieOfTheYear: true,
    stats: { points: 0, turnovers: 0 },
    popularityScore: 40,
    championshipMarkets: [],
    mvpMarkets: [],
  },
  {
    id: 'ath_nfl_roty_cogdill_gail',
    name: 'Gail Cogdill',
    sports: ['NFL'],
    teams: ['DET', 'BAL'],
    teamNames: ['Detroit Lions', 'Baltimore Colts'],
    positions: ['WR'],
    activeYears: [1960, 1970],
    jerseyNumbers: [84, 88],
    championships: 1,
    mvps: 0,
    hallOfFame: false,
    rookieOfTheYear: true,
    stats: { points: 0, turnovers: 0 },
    popularityScore: 45,
    championshipMarkets: ['BAL'],
    mvpMarkets: [],
  },
  {
    id: 'ath_nfl_roty_haynes_abner',
    name: 'Abner Haynes',
    sports: ['NFL'],
    teams: ['KC', 'DEN', 'MIA', 'NYJ'],
    teamNames: ['Dallas Texans', 'Kansas City Chiefs', 'Denver Broncos', 'Miami Dolphins', 'New York Jets'],
    positions: ['RB'],
    activeYears: [1960, 1967],
    jerseyNumbers: [28],
    championships: 1,
    mvps: 1,
    hallOfFame: false,
    rookieOfTheYear: true,
    stats: { points: 0, turnovers: 0 },
    popularityScore: 60,
    championshipMarkets: ['KC', 'DAL'],
    mvpMarkets: ['KC', 'DAL'],
  },
  {
    id: 'ath_nfl_roty_faison_earl',
    name: 'Earl Faison',
    sports: ['NFL'],
    teams: ['SD', 'LAC', 'MIA'],
    teamNames: ['San Diego Chargers', 'Miami Dolphins'],
    positions: ['DE'],
    activeYears: [1961, 1966],
    jerseyNumbers: [86],
    championships: 1,
    mvps: 0,
    hallOfFame: false,
    rookieOfTheYear: true,
    stats: { points: 0, turnovers: 0 },
    popularityScore: 50,
    championshipMarkets: ['SD'],
    mvpMarkets: [],
  },
  {
    id: 'ath_nfl_roty_bull_ronnie',
    name: 'Ronnie Bull',
    sports: ['NFL'],
    teams: ['CHI', 'PHI'],
    teamNames: ['Chicago Bears', 'Philadelphia Eagles'],
    positions: ['RB', 'FB'],
    activeYears: [1962, 1971],
    jerseyNumbers: [29, 47],
    championships: 1,
    mvps: 0,
    hallOfFame: false,
    rookieOfTheYear: true,
    stats: { points: 0, turnovers: 0 },
    popularityScore: 40,
    championshipMarkets: ['CHI'],
    mvpMarkets: [],
  },
  {
    id: 'ath_nfl_roty_mcclinton_curtis',
    name: 'Curtis McClinton',
    sports: ['NFL'],
    teams: ['KC'],
    teamNames: ['Dallas Texans', 'Kansas City Chiefs'],
    positions: ['FB', 'RB'],
    activeYears: [1962, 1969],
    jerseyNumbers: [32],
    championships: 2,
    mvps: 0,
    hallOfFame: false,
    rookieOfTheYear: true,
    stats: { points: 0, turnovers: 0 },
    popularityScore: 55,
    championshipMarkets: ['KC', 'DAL'],
    mvpMarkets: [],
  },
  {
    id: 'ath_nfl_roty_flatley_paul',
    name: 'Paul Flatley',
    sports: ['NFL'],
    teams: ['MIN', 'ATL'],
    teamNames: ['Minnesota Vikings', 'Atlanta Falcons'],
    positions: ['WR'],
    activeYears: [1963, 1970],
    jerseyNumbers: [85],
    championships: 0,
    mvps: 0,
    hallOfFame: false,
    rookieOfTheYear: true,
    stats: { points: 0, turnovers: 0 },
    popularityScore: 40,
    championshipMarkets: [],
    mvpMarkets: [],
  },
  {
    id: 'ath_nfl_roty_grayson_david',
    name: 'David Grayson',
    sports: ['NFL'],
    teams: ['KC', 'OAK', 'LV'],
    teamNames: ['Dallas Texans', 'Kansas City Chiefs', 'Oakland Raiders'],
    positions: ['DB', 'CB', 'S'],
    activeYears: [1963, 1970],
    jerseyNumbers: [45, 46],
    championships: 2,
    mvps: 0,
    hallOfFame: false,
    rookieOfTheYear: true,
    stats: { points: 0, turnovers: 0 },
    popularityScore: 50,
    championshipMarkets: ['KC', 'BAY'],
    mvpMarkets: [],
  },
  {
    id: 'ath_nfl_roty_snell_matt',
    name: 'Matt Snell',
    sports: ['NFL'],
    teams: ['NYJ'],
    teamNames: ['New York Jets'],
    positions: ['FB', 'RB'],
    activeYears: [1964, 1972],
    jerseyNumbers: [41],
    championships: 1,
    mvps: 0,
    hallOfFame: false,
    rookieOfTheYear: true,
    stats: { points: 0, turnovers: 0 },
    popularityScore: 70,
    championshipMarkets: ['NY'],
    mvpMarkets: [],
  },
  {
    id: 'ath_nfl_roty_burnett_bobby',
    name: 'Bobby Burnett',
    sports: ['NFL'],
    teams: ['BUF', 'DEN'],
    teamNames: ['Buffalo Bills', 'Denver Broncos'],
    positions: ['RB'],
    activeYears: [1966, 1969],
    jerseyNumbers: [21, 23],
    championships: 0,
    mvps: 0,
    hallOfFame: false,
    rookieOfTheYear: true,
    stats: { points: 0, turnovers: 0 },
    popularityScore: 35,
    championshipMarkets: [],
    mvpMarkets: [],
  },
  {
    id: 'ath_nfl_roty_farr_mel',
    name: 'Mel Farr',
    sports: ['NFL'],
    teams: ['DET'],
    teamNames: ['Detroit Lions'],
    positions: ['RB'],
    activeYears: [1967, 1973],
    jerseyNumbers: [24],
    championships: 0,
    mvps: 0,
    hallOfFame: false,
    rookieOfTheYear: true,
    stats: { points: 0, turnovers: 0 },
    popularityScore: 55,
    championshipMarkets: [],
    mvpMarkets: [],
  },
  {
    id: 'ath_nfl_roty_robinson_paul',
    name: 'Paul Robinson',
    sports: ['NFL'],
    teams: ['CIN', 'HOU', 'TEN'],
    teamNames: ['Cincinnati Bengals', 'Houston Oilers'],
    positions: ['RB'],
    activeYears: [1968, 1973],
    jerseyNumbers: [19, 21],
    championships: 0,
    mvps: 0,
    hallOfFame: false,
    rookieOfTheYear: true,
    stats: { points: 0, turnovers: 0 },
    popularityScore: 50,
    championshipMarkets: [],
    mvpMarkets: [],
  },
];

// NFL Team code to Metro Market & Full Name
const NFL_TEAMS: Record<string, { market: string; name: string }> = {
  ARI: { market: 'PHX', name: 'Arizona Cardinals' },
  PHO: { market: 'PHX', name: 'Phoenix Cardinals' },
  CRD: { market: 'CHI', name: 'Chicago Cardinals' },
  ATL: { market: 'ATL', name: 'Atlanta Falcons' },
  BAL: { market: 'BAL', name: 'Baltimore Ravens' },
  BLT: { market: 'BAL', name: 'Baltimore Ravens' },
  BUF: { market: 'BUF', name: 'Buffalo Bills' },
  CAR: { market: 'CHA', name: 'Carolina Panthers' },
  CHI: { market: 'CHI', name: 'Chicago Bears' },
  CIN: { market: 'CIN', name: 'Cincinnati Bengals' },
  CLE: { market: 'CLE', name: 'Cleveland Browns' },
  CLV: { market: 'CLE', name: 'Cleveland Browns' },
  DAL: { market: 'DAL', name: 'Dallas Cowboys' },
  DEN: { market: 'DEN', name: 'Denver Broncos' },
  DET: { market: 'DET', name: 'Detroit Lions' },
  GB: { market: 'GB', name: 'Green Bay Packers' },
  GNB: { market: 'GB', name: 'Green Bay Packers' },
  HOU: { market: 'HOU', name: 'Houston Texans' },
  HST: { market: 'HOU', name: 'Houston Oilers' },
  IND: { market: 'IND', name: 'Indianapolis Colts' },
  JAX: { market: 'FLA', name: 'Jacksonville Jaguars' },
  JAC: { market: 'FLA', name: 'Jacksonville Jaguars' },
  KC: { market: 'KC', name: 'Kansas City Chiefs' },
  KAN: { market: 'KC', name: 'Kansas City Chiefs' },
  LAC: { market: 'LA', name: 'Los Angeles Chargers' },
  SD: { market: 'SD', name: 'San Diego Chargers' },
  SDG: { market: 'SD', name: 'San Diego Chargers' },
  LAR: { market: 'LA', name: 'Los Angeles Rams' },
  LA: { market: 'LA', name: 'Los Angeles Rams' },
  RAM: { market: 'LA', name: 'Los Angeles Rams' },
  STL: { market: 'STL', name: 'St. Louis Rams' },
  LV: { market: 'LV', name: 'Las Vegas Raiders' },
  LVR: { market: 'LV', name: 'Las Vegas Raiders' },
  OAK: { market: 'BAY', name: 'Oakland Raiders' },
  RAI: { market: 'LA', name: 'Los Angeles Raiders' },
  MIA: { market: 'FLA', name: 'Miami Dolphins' },
  MIN: { market: 'MIN', name: 'Minnesota Vikings' },
  NE: { market: 'BOS', name: 'New England Patriots' },
  NWE: { market: 'BOS', name: 'New England Patriots' },
  NO: { market: 'NO', name: 'New Orleans Saints' },
  NOR: { market: 'NO', name: 'New Orleans Saints' },
  NYG: { market: 'NY', name: 'New York Giants' },
  NYJ: { market: 'NY', name: 'New York Jets' },
  PHI: { market: 'PHI', name: 'Philadelphia Eagles' },
  PIT: { market: 'PIT', name: 'Pittsburgh Steelers' },
  SF: { market: 'BAY', name: 'San Francisco 49ers' },
  SFO: { market: 'BAY', name: 'San Francisco 49ers' },
  SEA: { market: 'SEA', name: 'Seattle Seahawks' },
  TB: { market: 'FLA', name: 'Tampa Bay Buccaneers' },
  TAM: { market: 'FLA', name: 'Tampa Bay Buccaneers' },
  TEN: { market: 'TEN', name: 'Tennessee Titans' },
  OTI: { market: 'HOU', name: 'Houston Oilers' },
  WAS: { market: 'WAS', name: 'Washington Commanders' },
  WSH: { market: 'WAS', name: 'Washington Commanders' },
};

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
}

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split('\n').filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  const headers = parseCSVLine(lines[0]);
  const records: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const rowValues = parseCSVLine(lines[i]);
    const record: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      record[headers[j]] = rowValues[j] ?? '';
    }
    records.push(record);
  }
  return records;
}

function parseStat(val: string | undefined): number {
  if (!val || val === 'NA' || val === '') return 0;
  const num = parseInt(val, 10);
  return isNaN(num) ? 0 : num;
}

async function fetchCachedFile(filePath: string, url: string): Promise<string> {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }

  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf-8');
  }

  console.log(`[Fetching] ${url}...`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  }
  const text = await res.text();
  fs.writeFileSync(filePath, text, 'utf-8');
  return text;
}

function matchConference(college: string, existingConf?: string): string | undefined {
  if (existingConf) {
    const c = existingConf.toLowerCase();
    if (c.includes('sec') || c.includes('southeastern')) return 'SEC';
    if (c.includes('big ten') || c.includes('big 10')) return 'Big Ten';
    if (c.includes('acc') || c.includes('atlantic coast')) return 'ACC';
    if (c.includes('big 12')) return 'Big 12';
    if (c.includes('big east')) return 'Big East';
    if (c.includes('pac-12') || c.includes('pac-10') || c.includes('pacific-12')) return 'Pac-12';
  }

  const s = college.toLowerCase().trim();
  if (
    s.includes('alabama') || s.includes('georgia') || s.includes('lsu') ||
    s.includes('florida') || s.includes('tennessee') || s.includes('auburn') ||
    s.includes('texas a&m') || s.includes('ole miss') || s.includes('mississippi') ||
    s.includes('south carolina') || s.includes('kentucky') || s.includes('arkansas') ||
    s.includes('missouri') || s.includes('vanderbilt')
  ) {
    return 'SEC';
  }

  if (
    s.includes('ohio state') || s.includes('michigan') || s.includes('penn state') ||
    s.includes('wisconsin') || s.includes('iowa') || s.includes('nebraska') ||
    s.includes('michigan state') || s.includes('illinois') || s.includes('indiana') ||
    s.includes('purdue') || s.includes('minnesota') || s.includes('northwestern') ||
    s.includes('maryland') || s.includes('rutgers')
  ) {
    return 'Big Ten';
  }

  if (
    s.includes('clemson') || s.includes('florida state') || s.includes('miami') ||
    s.includes('north carolina') || s.includes('virginia') || s.includes('nc state') ||
    s.includes('virginia tech') || s.includes('pittsburgh') || s.includes('boston college') ||
    s.includes('georgia tech') || s.includes('wake forest') || s.includes('duke') ||
    s.includes('louisville') || s.includes('syracuse')
  ) {
    return 'ACC';
  }

  if (
    s.includes('texas tech') || s.includes('oklahoma state') || s.includes('oklahoma') ||
    s.includes('texas') || s.includes('baylor') || s.includes('tcu') ||
    s.includes('kansas state') || s.includes('kansas') || s.includes('iowa state') ||
    s.includes('west virginia')
  ) {
    return 'Big 12';
  }

  if (
    s.includes('villanova') || s.includes('georgetown') || s.includes('st. john') ||
    s.includes('marquette') || s.includes('providence') || s.includes('connecticut') ||
    s.includes('seton hall') || s.includes('creighton') || s.includes('xavier') ||
    s.includes('butler')
  ) {
    return 'Big East';
  }

  if (
    s.includes('arizona state') || (s.includes('arizona') && !s.includes('state')) ||
    (s.includes('california') && !s.includes('state') && !s.includes('fullerton')) ||
    s.includes('stanford') || s.includes('oregon state') ||
    (s.includes('oregon') && !s.includes('state')) || s.includes('washington state') ||
    (s.includes('washington') && !s.includes('state') && !s.includes('st.') && !s.includes('valley')) ||
    s.includes('ucla') || s.includes('usc')
  ) {
    return 'Pac-12';
  }

  return undefined;
}

export async function run() {
  console.log('=== Starting Clean NFL Ingestion Pipeline ===');

  // 1. Fetch Players universe (all ~25,000 historical NFL players)
  console.log('Loading NFL players universe...');
  const playersFile = path.join(CACHE_DIR, 'players.csv');
  const playersRaw = await fetchCachedFile(playersFile, PLAYERS_URL);
  const players = parseCSV(playersRaw);
  console.log(`Loaded ${players.length} total NFL player records.`);

  // 2. Index players by unique IDs and name+birth_date
  const playerByGsis = new Map<string, string>();
  const playerByPfr = new Map<string, string>();
  const playerByEsb = new Map<string, string>();
  const playerByNameBirth = new Map<string, string>();
  const playersByName = new Map<string, Array<{ id: string; rookie: number; last: number }>>();

  for (const p of players) {
    const id = p.gsis_id || p.pfr_id || p.esb_id;
    if (!id) continue;

    if (p.gsis_id) playerByGsis.set(p.gsis_id, id);
    if (p.pfr_id) playerByPfr.set(p.pfr_id, id);
    if (p.esb_id) playerByEsb.set(p.esb_id, id);

    const name = p.display_name?.trim().toLowerCase();
    if (name && p.birth_date) {
      playerByNameBirth.set(`${name}|${p.birth_date.trim()}`, id);
    }
    if (name) {
      if (!playersByName.has(name)) playersByName.set(name, []);
      playersByName.get(name)!.push({
        id,
        rookie: parseInt(p.rookie_season || '0', 10),
        last: parseInt(p.last_season || '0', 10),
      });
    }
  }

  // 3. Aggregate historical rosters across all 105 seasons
  console.log('Aggregating 1920-2024 NFL team rosters with strict unique ID resolution...');
  interface RosterMeta {
    teams: Set<string>;
    teamNames: Set<string>;
    markets: Set<string>;
    jerseys: Set<number>;
    championships: number;
    championshipMarkets: Set<string>;
    years: number[];
  }
  const rosterMap = new Map<string, RosterMeta>();

  const getRosterMeta = (key: string): RosterMeta => {
    let cur = rosterMap.get(key);
    if (!cur) {
      cur = {
        teams: new Set<string>(),
        teamNames: new Set<string>(),
        markets: new Set<string>(),
        jerseys: new Set<number>(),
        championships: 0,
        championshipMarkets: new Set<string>(),
        years: [],
      };
      rosterMap.set(key, cur);
    }
    return cur;
  };

  for (let year = 1920; year <= 2024; year++) {
    const yearFile = path.join(CACHE_DIR, `roster_${year}.csv`);
    const url = `https://github.com/nflverse/nflverse-data/releases/download/rosters/roster_${year}.csv`;
    let content = '';
    try {
      content = await fetchCachedFile(yearFile, url);
    } catch {
      continue;
    }

    const rows = parseCSV(content);
    const champs = SUPER_BOWL_WINNERS[year] || [];

    for (const r of rows) {
      const team = r.team?.trim();
      if (!team) continue;

      let targetPlayerId: string | undefined;

      if (r.gsis_id && playerByGsis.has(r.gsis_id)) {
        targetPlayerId = playerByGsis.get(r.gsis_id);
      } else if (r.pfr_id && playerByPfr.has(r.pfr_id)) {
        targetPlayerId = playerByPfr.get(r.pfr_id);
      } else if (r.esb_id && playerByEsb.has(r.esb_id)) {
        targetPlayerId = playerByEsb.get(r.esb_id);
      } else if (
        r.full_name &&
        r.birth_date &&
        playerByNameBirth.has(`${r.full_name.trim().toLowerCase()}|${r.birth_date.trim()}`)
      ) {
        targetPlayerId = playerByNameBirth.get(
          `${r.full_name.trim().toLowerCase()}|${r.birth_date.trim()}`
        );
      } else if (r.full_name) {
        const cands = playersByName.get(r.full_name.trim().toLowerCase());
        if (cands && cands.length > 0) {
          const matches = cands.filter(
            (c) =>
              (c.rookie === 0 && c.last === 0) ||
              ((c.rookie === 0 || year >= c.rookie - 2) && (c.last === 0 || year <= c.last + 2))
          );
          if (matches.length === 1) {
            targetPlayerId = matches[0].id;
          }
        }
      }

      if (!targetPlayerId) continue;

      const target = getRosterMeta(targetPlayerId);
      target.teams.add(team);

      const meta = NFL_TEAMS[team];
      if (meta) {
        target.markets.add(meta.market);
        target.teamNames.add(meta.name);
      } else {
        target.teamNames.add(team);
      }

      const jerseyNum = parseInt(r.jersey_number || '0', 10);
      if (jerseyNum > 0 && jerseyNum < 100) {
        target.jerseys.add(jerseyNum);
      }

      if (champs.includes(team)) {
        target.championships += 1;
        if (meta) {
          target.championshipMarkets.add(meta.market);
        }
      }

      target.years.push(year);
    }
  }

  console.log(`Aggregated rosters for ${rosterMap.size} distinct players.`);

  // 4. Draft stats & accolades map from draft_picks.csv
  interface DraftStats {
    games: number;
    points: number;
    turnovers: number;
    probowls: number;
    allpro: number;
    hof: boolean;
    pick?: number;
    round?: number;
    year?: number;
  }
  const statsMap = new Map<string, DraftStats>();

  const draftFile = path.join(CACHE_DIR, 'draft_picks.csv');
  const draftRaw = await fetchCachedFile(draftFile, DRAFT_URL);
  const draft = parseCSV(draftRaw);
  draft.forEach((d) => {
    const rushTds = parseStat(d.rush_tds);
    const recTds = parseStat(d.rec_tds);
    const passInts = parseStat(d.pass_ints);
    const games = parseStat(d.games);
    const probowls = parseStat(d.probowls);
    const allpro = parseStat(d.allpro);
    const isHof = d.hof === 'TRUE';
    const pick = parseStat(d.pick);
    const round = parseStat(d.round);
    const year = parseStat(d.season);

    const points = (rushTds + recTds) * 6;
    const turnovers = passInts;

    const statObj: DraftStats = {
      games,
      points,
      turnovers,
      probowls,
      allpro,
      hof: isHof,
      pick: pick > 0 ? pick : undefined,
      round: round > 0 ? round : undefined,
      year: year > 0 ? year : undefined,
    };

    if (d.gsis_id) statsMap.set(d.gsis_id, statObj);
    if (d.pfr_player_id) statsMap.set(d.pfr_player_id, statObj);
  });

  // Load Hall of Fame set from wiki
  const hofSet = new Set<string>();
  const wikiFile = path.join(CACHE_DIR, 'wiki_hof.json');
  try {
    let wikiText = '';
    if (fs.existsSync(wikiFile)) {
      wikiText = fs.readFileSync(wikiFile, 'utf-8');
    } else {
      const res = await fetch(WIKI_HOF_URL);
      wikiText = await res.text();
      fs.writeFileSync(wikiFile, wikiText, 'utf-8');
    }
    const wikiData = JSON.parse(wikiText);
    const content = wikiData.parse?.wikitext?.['*'] || '';
    const matches = [...content.matchAll(/\{\{sortname\|([^\|\}]+)\|([^\|\}]+)(?:\|[^\}]*)?\}\}/g)];
    matches.forEach((m) => {
      const fullName = `${m[1].trim()} ${m[2].trim()}`.replace(/\s+/g, ' ');
      hofSet.add(fullName.toLowerCase());
    });
  } catch {}

  // 5. Build Athletes
  console.log('Normalizing clean NFL player profiles...');
  const athletes: Athlete[] = [];

  for (const p of players) {
    const id = p.gsis_id || p.pfr_id || p.esb_id;
    const name = p.display_name?.trim();
    if (!id || !name) continue;

    const rMeta = rosterMap.get(id);

    const teams = new Set<string>();
    const teamNames = new Set<string>();
    const markets = new Set<string>();
    const jerseys = new Set<number>();
    let championships = 0;
    const championshipMarkets = new Set<string>();
    const years: number[] = [];

    if (rMeta) {
      rMeta.teams.forEach((t) => teams.add(t));
      rMeta.teamNames.forEach((n) => teamNames.add(n));
      rMeta.markets.forEach((m) => markets.add(m));
      rMeta.jerseys.forEach((j) => jerseys.add(j));
      championships = rMeta.championships;
      rMeta.championshipMarkets.forEach((cm) => championshipMarkets.add(cm));
      years.push(...rMeta.years);
    }

    if (p.draft_team) {
      teams.add(p.draft_team);
      const meta = NFL_TEAMS[p.draft_team];
      if (meta) {
        markets.add(meta.market);
        teamNames.add(meta.name);
      }
    }
    if (p.latest_team) {
      teams.add(p.latest_team);
      const meta = NFL_TEAMS[p.latest_team];
      if (meta) {
        markets.add(meta.market);
        teamNames.add(meta.name);
      }
    }

    const rookieSeason = parseInt(p.rookie_season || '0', 10);
    const lastSeason = parseInt(p.last_season || '0', 10);
    let fromYear = rookieSeason > 0 ? rookieSeason : (years.length > 0 ? Math.min(...years) : 0);
    let toYear = lastSeason > 0 ? lastSeason : (years.length > 0 ? Math.max(...years) : fromYear);
    if (fromYear === 0 && toYear === 0) continue;
    if (fromYear === 0) fromYear = toYear;
    if (toYear === 0) toYear = fromYear;
    if (fromYear > toYear) {
      const min = Math.min(fromYear, toYear);
      const max = Math.max(fromYear, toYear);
      fromYear = min;
      toYear = max;
    }

    // Safeguard erroneous lastSeason outliers in raw dataset
    if (years.length > 0 && toYear - Math.max(...years) > 5 && parseStat(p.years_of_experience) <= 3) {
      toYear = Math.max(...years);
    }

    const jNum = parseInt(p.jersey_number || '0', 10);
    if (jNum > 0 && jNum < 100) jerseys.add(jNum);

    const positions = new Set<string>();
    if (p.position && p.position !== 'NA') positions.add(p.position);
    if (p.position_group && p.position_group !== 'NA') positions.add(p.position_group);
    if (positions.size === 0) positions.add('ATH');

    const draftPick = parseInt(p.draft_pick || '0', 10);
    const draftRound = parseInt(p.draft_round || '0', 10);
    const draftYear = parseInt(p.draft_year || '0', 10);

    const draftStat = (p.gsis_id ? statsMap.get(p.gsis_id) : undefined) || (p.pfr_id ? statsMap.get(p.pfr_id) : undefined);
    const totalGames = Math.max(draftStat?.games || 0, parseStat(p.years_of_experience) * 16);
    const points = draftStat?.points || 0;
    const turnovers = draftStat?.turnovers || 0;
    const probowls = draftStat?.probowls || 0;
    const allpro = draftStat?.allpro || 0;

    // Hall of Fame: only if draftStat says true OR wiki name matches and player was active before 2015
    const isHof = draftStat?.hof === true || (hofSet.has(name.toLowerCase()) && toYear <= 2015);

    // MVP calculation: match player whose career covers the MVP award year
    let mvps = 0;
    const mvpMarkets = new Set<string>();
    const mvpMatch = NFL_MVP_LIST.find((m) => m.name.toLowerCase() === name.toLowerCase());
    if (mvpMatch) {
      const wonYears = mvpMatch.years.filter((yr) => yr >= fromYear - 1 && yr <= toYear + 1);
      if (wonYears.length > 0) {
        mvps = wonYears.length;
        mvpMatch.markets.forEach((m) => mvpMarkets.add(m));
      }
    }

    // ROTY calculation
    let isRoty = false;
    const nameNorm = name.toLowerCase().replace(/[^a-z]/g, '');
    const rotyMatch = NFL_ROOKIE_OF_THE_YEAR_LIST.find((r) => {
      const names = [r.name, ...(r.aliases || [])].map((n) => n.toLowerCase().replace(/[^a-z]/g, ''));
      if (!names.includes(nameNorm)) return false;
      return (
        (r.year >= fromYear - 2 && r.year <= toYear + 2) ||
        (r.year <= toYear && r.year >= fromYear - 12)
      );
    });
    if (rotyMatch) {
      isRoty = true;
      fromYear = Math.min(fromYear, rotyMatch.year);
    }

    const college = p.college_name || undefined;
    const collegeConference = matchConference(college || '', p.college_conference);

    // Popularity score calculation
    let popularity = 5;
    if (totalGames >= 30) popularity += 10;
    if (totalGames >= 80) popularity += 15;
    if (totalGames >= 150) popularity += 15;
    if (points >= 60) popularity += 10;
    if (points >= 180) popularity += 15;
    if (points >= 300) popularity += 20;
    if (turnovers >= 50) popularity += 10;
    if (turnovers >= 100) popularity += 15;
    if (probowls >= 1) popularity += 15;
    if (probowls >= 5) popularity += 20;
    if (allpro >= 1) popularity += 15;
    if (championships >= 1) popularity += 15;
    if (championships >= 3) popularity += 15;
    if (mvps > 0) popularity += 25;
    if (isHof) popularity += 30;
    if (toYear >= 2015) popularity += 5;
    popularity = Math.min(100, Math.max(1, popularity));

    const athlete: Athlete = {
      id: `ath_nfl_${id}`,
      name,
      sports: ['NFL'],
      teams: Array.from(teams),
      teamNames: Array.from(teamNames),
      markets: [],
      positions: Array.from(positions),
      activeYears: [fromYear, toYear],
      jerseyNumbers: Array.from(jerseys),
      college,
      collegeConference,
      draftPick: draftPick > 0 ? draftPick : draftStat?.pick,
      draftRound: draftRound > 0 ? draftRound : draftStat?.round,
      draftYear: draftYear > 0 ? draftYear : draftStat?.year,
      championships,
      mvps,
      hallOfFame: isHof,
      rookieOfTheYear: isRoty,
      stats: {
        points,
        turnovers,
      },
      popularityScore: popularity,
      championshipMarkets: championships > 0 ? Array.from(championshipMarkets) : [],
      mvpMarkets: mvps > 0 ? Array.from(mvpMarkets) : [],
    };
    athlete.markets = Array.from(getMarketsForAthlete(athlete));
    athletes.push(athlete);
  }

  // 6. Include pre-1970 Hall of Fame legends, historical QB legends, and pre-1970 ROTY legends if missing
  const existingIds = new Set(athletes.map((a) => a.id));
  if (fs.existsSync(OUTPUT_FILE)) {
    const currentDbRaw = fs.readFileSync(OUTPUT_FILE, 'utf-8');
    const currentDb: Athlete[] = JSON.parse(currentDbRaw);
    const backfilledLegends = currentDb.filter(
      (a) =>
        a.id.startsWith('ath_nfl_hof_') ||
        a.id.startsWith('ath_nfl_roty_') ||
        (!/ath_nfl_[0-9A-Z]/.test(a.id) && !a.id.startsWith('ath_nfl_00-'))
    );

    for (const leg of backfilledLegends) {
      if (!existingIds.has(leg.id)) {
        leg.markets = Array.from(getMarketsForAthlete(leg));
        athletes.push(leg);
        existingIds.add(leg.id);
      }
    }
  }

  for (const leg of HISTORICAL_PRE1970_ROTY_LEGENDS) {
    if (!existingIds.has(leg.id!)) {
      const athlete = leg as Athlete;
      athlete.markets = Array.from(getMarketsForAthlete(athlete));
      athletes.push(athlete);
      existingIds.add(leg.id!);
    }
  }

  // 7. Apply modern 2024-2026 augments to active players
  for (const aug of NFL_AUGMENTS) {
    const targetNorm = aug.name.toLowerCase().replace(/[\s.'"-]+/g, '');
    const found = athletes.find(
      (a) =>
        a.name.toLowerCase().replace(/[\s.'"-]+/g, '') === targetNorm &&
        a.activeYears[1] >= 2020
    );

    if (found) {
      if (aug.addTeams) {
        for (const t of aug.addTeams) {
          if (!found.teams.includes(t)) found.teams.push(t);
        }
      }
      if (aug.addTeamNames) {
        if (!found.teamNames) found.teamNames = [];
        for (const tn of aug.addTeamNames) {
          if (!found.teamNames.includes(tn)) found.teamNames.push(tn);
        }
      }
      if (aug.addJerseys) {
        if (!found.jerseyNumbers) found.jerseyNumbers = [];
        for (const j of aug.addJerseys) {
          if (!found.jerseyNumbers.includes(j)) found.jerseyNumbers.push(j);
        }
        found.jerseyNumbers.sort((a, b) => a - b);
      }
      if (aug.activeThrough) {
        found.activeYears[1] = Math.max(found.activeYears[1], aug.activeThrough);
      }
      if (aug.boostPopularity) {
        found.popularityScore = Math.max(found.popularityScore || 0, aug.boostPopularity);
      }
      found.markets = Array.from(getMarketsForAthlete(found));
    }
  }

  // Ensure all athletes have valid markets, positions, and clean accolade arrays
  for (const a of athletes) {
    a.markets = Array.from(getMarketsForAthlete(a));
    if (!a.positions || a.positions.length === 0) a.positions = ['ATH'];
    if (a.championships === 0) a.championshipMarkets = [];
    if (a.mvps === 0) a.mvpMarkets = [];
    if (a.mvps > 0 && (!a.mvpMarkets || a.mvpMarkets.length === 0)) {
      const match = NFL_MVP_LIST.find((m) => m.name.toLowerCase() === a.name.toLowerCase());
      if (match) {
        a.mvpMarkets = [...match.markets];
      }
    }
    // ROTY check for any backfilled or pre-existing athletes
    if (!a.rookieOfTheYear) {
      const aNorm = a.name.toLowerCase().replace(/[^a-z]/g, '');
      const match = NFL_ROOKIE_OF_THE_YEAR_LIST.find((r) => {
        const names = [r.name, ...(r.aliases || [])].map((n) => n.toLowerCase().replace(/[^a-z]/g, ''));
        if (!names.includes(aNorm)) return false;
        return (
          (r.year >= a.activeYears[0] - 2 && r.year <= a.activeYears[1] + 2) ||
          (r.year <= a.activeYears[1] && r.year >= a.activeYears[0] - 12)
        );
      });
      if (match) {
        a.rookieOfTheYear = true;
        a.activeYears[0] = Math.min(a.activeYears[0], match.year);
      }
    }
  }

  // Filter out athletes with 0 teams and 0 markets
  const validAthletes = athletes.filter((a) => a.teams.length > 0 && a.markets.length > 0);

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(validAthletes, null, 2), 'utf-8');
  console.log(`Pipeline complete! Saved ${validAthletes.length} clean NFL athletes to ${OUTPUT_FILE}`);
}

if (require.main === module) {
  run().catch(console.error);
}
