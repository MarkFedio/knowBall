import fs from 'fs';
import path from 'path';
import { Athlete } from '../src/types';

const ROOT_DIR = process.cwd();

// File paths
const NBA_ATHLETES_FILE = path.join(ROOT_DIR, 'src', 'data', 'athletes-nba.json');
const NHL_ATHLETES_FILE = path.join(ROOT_DIR, 'src', 'data', 'athletes-nhl.json');
const MLB_ATHLETES_FILE = path.join(ROOT_DIR, 'src', 'data', 'athletes-mlb.json');
const NFL_ATHLETES_FILE = path.join(ROOT_DIR, 'src', 'data', 'athletes-nfl.json');

const NBA_TOTALS_CSV = path.join(ROOT_DIR, '.cache', 'nba', 'totals.csv');
const NHL_REALTIME_JSON = path.join(ROOT_DIR, '.cache', 'nhl', 'skaters_realtime.json');
const NHL_GOALIES_JSON = path.join(ROOT_DIR, '.cache', 'nhl', 'goalies_aggregate.json');
const MLB_PITCHING_CSV = path.join(ROOT_DIR, '.cache', 'mlb', 'pitching.csv');
const NFL_WIKI_QB_JSON = path.join(ROOT_DIR, '.cache', 'nfl', 'wiki_qb_wins.json');

console.log('=== ENRICHING ATHLETES WITH BLOCKS AND WINS ===');

// ==========================================
// 1. NBA BLOCKS
// ==========================================
console.log('\n--- 1. Processing NBA Blocks ---');
const nbaTotalsLines = fs.readFileSync(NBA_TOTALS_CSV, 'utf-8').split('\n');
const nbaHeader = nbaTotalsLines[0].split(',');
const nbaIdIdx = nbaHeader.indexOf('player_id');
const nbaBlkIdx = nbaHeader.indexOf('blk');
const nbaTeamIdx = nbaHeader.indexOf('team');

const nbaBlkMap = new Map<string, number>();
for (let i = 1; i < nbaTotalsLines.length; i++) {
  const line = nbaTotalsLines[i];
  if (!line) continue;
  const cols = line.split(',');
  const team = cols[nbaTeamIdx]?.trim();
  if (!team || team === 'TOT' || /^\d+TM$/.test(team)) continue;
  const id = cols[nbaIdIdx]?.trim();
  const blk = parseInt(cols[nbaBlkIdx] || '0', 10) || 0;
  if (id) {
    nbaBlkMap.set(id, (nbaBlkMap.get(id) || 0) + blk);
  }
}

const nbaAthletes: Athlete[] = JSON.parse(fs.readFileSync(NBA_ATHLETES_FILE, 'utf-8'));
let nbaEnrichedCount = 0;
let nbaOver500Count = 0;

for (const a of nbaAthletes) {
  const rawId = a.id.replace('ath_nba_', '');
  const blk = nbaBlkMap.get(rawId) || 0;
  a.stats.blocks = blk;
  if (blk > 0) nbaEnrichedCount++;
  if (blk >= 500) nbaOver500Count++;
}

console.log(`NBA: Enriched ${nbaAthletes.length} players. ${nbaEnrichedCount} have blocks > 0, ${nbaOver500Count} have 500+ blocks.`);
const topNbaBlocks = [...nbaAthletes].sort((a, b) => (b.stats.blocks || 0) - (a.stats.blocks || 0)).slice(0, 5);
console.log('Top NBA Blockers:', topNbaBlocks.map((a) => `${a.name} (${a.stats.blocks})`).join(', '));
fs.writeFileSync(NBA_ATHLETES_FILE, JSON.stringify(nbaAthletes, null, 2), 'utf-8');

// ==========================================
// 2. NHL BLOCKS (SKATERS) & WINS (GOALIES)
// ==========================================
console.log('\n--- 2. Processing NHL Blocks & Wins ---');
const nhlRealtimeData = JSON.parse(fs.readFileSync(NHL_REALTIME_JSON, 'utf-8')).data;
const nhlGoaliesData = JSON.parse(fs.readFileSync(NHL_GOALIES_JSON, 'utf-8')).data;

const nhlBlockMap = new Map<number, number>();
nhlRealtimeData.forEach((p: { playerId?: number; blockedShots?: number }) => {
  if (p.playerId) nhlBlockMap.set(p.playerId, p.blockedShots || 0);
});

const nhlWinMap = new Map<number, number>();
nhlGoaliesData.forEach((g: { playerId?: number; wins?: number }) => {
  if (g.playerId) nhlWinMap.set(g.playerId, g.wins || 0);
});

const nhlAthletes: Athlete[] = JSON.parse(fs.readFileSync(NHL_ATHLETES_FILE, 'utf-8'));
let nhlBlocksEnriched = 0;
let nhlBlocksOver500 = 0;
let nhlWinsEnriched = 0;
let nhlWinsOver100 = 0;

for (const a of nhlAthletes) {
  const rawId = parseInt(a.id.replace('ath_nhl_', ''), 10);
  const isGoalie = a.positions.includes('G');

  if (isGoalie) {
    const wins = nhlWinMap.get(rawId) || 0;
    a.stats.wins = wins;
    a.stats.blocks = 0;
    if (wins > 0) nhlWinsEnriched++;
    if (wins >= 100) nhlWinsOver100++;
  } else {
    const blk = nhlBlockMap.get(rawId) || 0;
    a.stats.blocks = blk;
    if (blk > 0) nhlBlocksEnriched++;
    if (blk >= 500) nhlBlocksOver500++;
  }
}

console.log(`NHL: ${nhlBlocksEnriched} skaters with blocks > 0 (${nhlBlocksOver500} with 500+).`);
console.log(`NHL: ${nhlWinsEnriched} goalies with wins > 0 (${nhlWinsOver100} with 100+).`);
const topNhlBlocks = [...nhlAthletes].filter((a) => !a.positions.includes('G')).sort((a, b) => (b.stats.blocks || 0) - (a.stats.blocks || 0)).slice(0, 5);
console.log('Top NHL Blockers:', topNhlBlocks.map((a) => `${a.name} (${a.stats.blocks})`).join(', '));
const topNhlWins = [...nhlAthletes].filter((a) => a.positions.includes('G')).sort((a, b) => (b.stats.wins || 0) - (a.stats.wins || 0)).slice(0, 5);
console.log('Top NHL Goalie Wins:', topNhlWins.map((a) => `${a.name} (${a.stats.wins})`).join(', '));
fs.writeFileSync(NHL_ATHLETES_FILE, JSON.stringify(nhlAthletes, null, 2), 'utf-8');

// ==========================================
// 3. MLB PITCHER WINS
// ==========================================
console.log('\n--- 3. Processing MLB Pitcher Wins ---');
const mlbPitchingLines = fs.readFileSync(MLB_PITCHING_CSV, 'utf-8').split('\n');
const mlbHeader = mlbPitchingLines[0].split(',');
const mlbIdIdx = mlbHeader.indexOf('playerID');
const mlbWIdx = mlbHeader.indexOf('W');

const mlbWinMap = new Map<string, number>();
for (let i = 1; i < mlbPitchingLines.length; i++) {
  const line = mlbPitchingLines[i];
  if (!line) continue;
  const cols = line.split(',');
  const id = cols[mlbIdIdx]?.trim();
  const w = parseInt(cols[mlbWIdx] || '0', 10) || 0;
  if (id) {
    mlbWinMap.set(id, (mlbWinMap.get(id) || 0) + w);
  }
}

const mlbAthletes: Athlete[] = JSON.parse(fs.readFileSync(MLB_ATHLETES_FILE, 'utf-8'));
let mlbWinsEnriched = 0;
let mlbWinsOver100 = 0;

for (const a of mlbAthletes) {
  const rawId = a.id.replace('ath_mlb_', '');
  if (mlbWinMap.has(rawId)) {
    const wins = mlbWinMap.get(rawId) || 0;
    a.stats.wins = wins;
    if (wins > 0) mlbWinsEnriched++;
    if (wins >= 100) mlbWinsOver100++;
  }
}

console.log(`MLB: ${mlbWinsEnriched} pitchers with wins > 0 (${mlbWinsOver100} with 100+).`);
const topMlbWins = [...mlbAthletes].filter((a) => (a.stats.wins || 0) > 0).sort((a, b) => (b.stats.wins || 0) - (a.stats.wins || 0)).slice(0, 5);
console.log('Top MLB Pitcher Wins:', topMlbWins.map((a) => `${a.name} (${a.stats.wins})`).join(', '));
fs.writeFileSync(MLB_ATHLETES_FILE, JSON.stringify(mlbAthletes, null, 2), 'utf-8');

// ==========================================
// 4. NFL STARTING QB WINS
// ==========================================
console.log('\n--- 4. Processing NFL Starting QB Wins ---');
const nflWikiData = JSON.parse(fs.readFileSync(NFL_WIKI_QB_JSON, 'utf-8')).parse.wikitext['*'];
const nflRegSection = nflWikiData.split('==Regular season wins==')[1].split('== Franchise leaders outside of the top 100 ==')[0];

const nflQbWins = new Map<string, number>();
const nflLines = nflRegSection.split('\n');
let currentPlayer: string | null = null;

for (let i = 0; i < nflLines.length; i++) {
  const line = nflLines[i];
  if (line.includes('data-sort-value=')) {
    const m = line.match(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/);
    if (m) {
      currentPlayer = (m[2] || m[1]).trim();
    }
  } else if (currentPlayer && line.includes('border: 2px solid green')) {
    const m = line.match(/\|\s*(\d+)/);
    if (m) {
      nflQbWins.set(currentPlayer, parseInt(m[1], 10));
      currentPlayer = null;
    }
  }
}

// Canonical name aliases for matching
const QB_ALIASES: Record<string, string[]> = {
  'Johnny Unitas': ['John Unitas', 'Johnny Unitas'],
  'Michael Vick': ['Mike Vick', 'Michael Vick'],
  'Y. A. Tittle': ['Y.A. Tittle', 'Y. A. Tittle'],
  'Ken Stabler': ['Ken Stabler', 'Kenny Stabler'],
  'Matthew Stafford': ['Matthew Stafford', 'Matt Stafford'],
  'Russell Wilson': ['Russell Wilson'],
  'Patrick Mahomes': ['Patrick Mahomes', 'Patrick Mahomes II'],
  'Jim Kelly': ['Jim Kelly'],
  'Phil Simms': ['Phil Simms'],
  'Terry Bradshaw': ['Terry Bradshaw'],
  'Roger Staubach': ['Roger Staubach'],
  'Bart Starr': ['Bart Starr'],
  'Otto Graham': ['Otto Graham'],
  'Bobby Layne': ['Bobby Layne'],
  'Norm Van Brocklin': ['Norm Van Brocklin'],
  'John Brodie': ['John Brodie'],
  'Jack Kemp': ['Jack Kemp'],
  'Frank Ryan': ['Frank Ryan'],
  'Milt Plum': ['Milt Plum'],
  'Charlie Conerly': ['Charlie Conerly'],
};

// Also add classic historical NFL QBs with known records if not yet in dataset
const HISTORICAL_LEGEND_QBS: Array<{
  id: string;
  name: string;
  teams: string[];
  teamNames: string[];
  markets: string[];
  activeYears: [number, number];
  jerseyNumbers: number[];
  championships: number;
  championshipMarkets: string[];
  mvps: number;
  mvpMarkets: string[];
  hallOfFame: boolean;
  wins: number;
  popularity: number;
}> = [
  {
    id: 'ath_nfl_unitas_johnny',
    name: 'Johnny Unitas',
    teams: ['BAL', 'IND', 'SD'],
    teamNames: ['Baltimore Colts', 'San Diego Chargers'],
    markets: ['BAL', 'LA'],
    activeYears: [1956, 1973],
    jerseyNumbers: [19],
    championships: 3, // 1958, 1959 NFL Championships, Super Bowl V
    championshipMarkets: ['BAL'],
    mvps: 3,
    mvpMarkets: ['BAL'],
    hallOfFame: true,
    wins: 118,
    popularity: 92,
  },
  {
    id: 'ath_nfl_starr_bart',
    name: 'Bart Starr',
    teams: ['GB'],
    teamNames: ['Green Bay Packers'],
    markets: ['GB'],
    activeYears: [1956, 1971],
    jerseyNumbers: [15],
    championships: 5, // 1961, 1962, 1965, SB I, SB II
    championshipMarkets: ['GB'],
    mvps: 1,
    mvpMarkets: ['GB'],
    hallOfFame: true,
    wins: 94,
    popularity: 90,
  },
  {
    id: 'ath_nfl_tittle_ya',
    name: 'Y.A. Tittle',
    teams: ['BAL', 'SF', 'NYG'],
    teamNames: ['Baltimore Colts', 'San Francisco 49ers', 'New York Giants'],
    markets: ['BAL', 'BAY', 'NY'],
    activeYears: [1948, 1964],
    jerseyNumbers: [14, 63],
    championships: 0,
    championshipMarkets: [],
    mvps: 1,
    mvpMarkets: ['NY'],
    hallOfFame: true,
    wins: 78,
    popularity: 82,
  },
  {
    id: 'ath_nfl_graham_otto',
    name: 'Otto Graham',
    teams: ['CLE'],
    teamNames: ['Cleveland Browns'],
    markets: ['CLE'],
    activeYears: [1946, 1955],
    jerseyNumbers: [14, 60],
    championships: 7, // 4 AAFC, 3 NFL (1950, 1954, 1955)
    championshipMarkets: ['CLE'],
    mvps: 3,
    mvpMarkets: ['CLE'],
    hallOfFame: true,
    wins: 57,
    popularity: 88,
  },
  {
    id: 'ath_nfl_layne_bobby',
    name: 'Bobby Layne',
    teams: ['CHI', 'NYB', 'DET', 'PIT'],
    teamNames: ['Chicago Bears', 'New York Bulldogs', 'Detroit Lions', 'Pittsburgh Steelers'],
    markets: ['CHI', 'NY', 'DET', 'PIT'],
    activeYears: [1948, 1962],
    jerseyNumbers: [22],
    championships: 3, // 1952, 1953, 1957 Lions
    championshipMarkets: ['DET'],
    mvps: 0,
    mvpMarkets: [],
    hallOfFame: true,
    wins: 81,
    popularity: 84,
  },
  {
    id: 'ath_nfl_vanbrocklin_norm',
    name: 'Norm Van Brocklin',
    teams: ['RAM', 'LAR', 'LA', 'PHI'],
    teamNames: ['Los Angeles Rams', 'Philadelphia Eagles'],
    markets: ['LA', 'PHI'],
    activeYears: [1949, 1960],
    jerseyNumbers: [11, 25],
    championships: 2, // 1951 Rams, 1960 Eagles
    championshipMarkets: ['LA', 'PHI'],
    mvps: 1,
    mvpMarkets: ['PHI'],
    hallOfFame: true,
    wins: 61,
    popularity: 82,
  },
  {
    id: 'ath_nfl_brodie_john',
    name: 'John Brodie',
    teams: ['SF'],
    teamNames: ['San Francisco 49ers'],
    markets: ['BAY'],
    activeYears: [1957, 1973],
    jerseyNumbers: [12],
    championships: 0,
    championshipMarkets: [],
    mvps: 1,
    mvpMarkets: ['BAY'],
    hallOfFame: false,
    wins: 86,
    popularity: 75,
  },
  {
    id: 'ath_nfl_kemp_jack',
    name: 'Jack Kemp',
    teams: ['PIT', 'LAC', 'SD', 'BUF'],
    teamNames: ['Pittsburgh Steelers', 'San Diego Chargers', 'Buffalo Bills'],
    markets: ['PIT', 'LA', 'BUF'],
    activeYears: [1957, 1969],
    jerseyNumbers: [15],
    championships: 2, // 1964, 1965 Bills
    championshipMarkets: ['BUF'],
    mvps: 1,
    mvpMarkets: ['BUF'],
    hallOfFame: false,
    wins: 62,
    popularity: 76,
  },
];

const nflAthletes: Athlete[] = JSON.parse(fs.readFileSync(NFL_ATHLETES_FILE, 'utf-8'));
const nflAthletesByName = new Map<string, Athlete>();
nflAthletes.forEach((a) => nflAthletesByName.set(a.name.toLowerCase(), a));

let nflWinsEnriched = 0;
let nflWinsOver100 = 0;

for (const [wikiName, wins] of nflQbWins.entries()) {
  const possibleNames = QB_ALIASES[wikiName] || [wikiName];
  let target: Athlete | undefined;
  for (const n of possibleNames) {
    target = nflAthletesByName.get(n.toLowerCase());
    if (target) break;
  }

  if (target) {
    target.stats.wins = wins;
    nflWinsEnriched++;
    if (wins >= 100) nflWinsOver100++;
  }
}

// Add the 8 historical legend QBs if not already present
for (const leg of HISTORICAL_LEGEND_QBS) {
  const existing = nflAthletesByName.get(leg.name.toLowerCase());
  if (existing) {
    existing.stats.wins = leg.wins;
    existing.hallOfFame = leg.hallOfFame;
    existing.mvps = leg.mvps;
    if (leg.mvpMarkets && leg.mvpMarkets.length > 0) existing.mvpMarkets = leg.mvpMarkets;
    existing.championships = leg.championships;
    if (leg.championshipMarkets.length > 0) existing.championshipMarkets = leg.championshipMarkets;
  } else {
    nflAthletes.push({
      id: leg.id,
      name: leg.name,
      sports: ['NFL'],
      teams: leg.teams,
      teamNames: leg.teamNames,
      markets: leg.markets,
      positions: ['QB'],
      activeYears: leg.activeYears,
      jerseyNumbers: leg.jerseyNumbers,
      championships: leg.championships,
      championshipMarkets: leg.championshipMarkets,
      mvps: leg.mvps,
      mvpMarkets: leg.mvpMarkets || [],
      hallOfFame: leg.hallOfFame,
      rookieOfTheYear: false,
      stats: {
        points: 0,
        turnovers: 0,
        wins: leg.wins,
      },
      popularityScore: leg.popularity,
    });
    nflWinsEnriched++;
    if (leg.wins >= 100) nflWinsOver100++;
  }
}

console.log(`NFL: ${nflWinsEnriched} quarterbacks with starting wins (${nflWinsOver100} with 100+).`);
const topNflWins = [...nflAthletes].filter((a) => (a.stats.wins || 0) > 0).sort((a, b) => (b.stats.wins || 0) - (a.stats.wins || 0)).slice(0, 5);
console.log('Top NFL QB Wins:', topNflWins.map((a) => `${a.name} (${a.stats.wins})`).join(', '));
fs.writeFileSync(NFL_ATHLETES_FILE, JSON.stringify(nflAthletes, null, 2), 'utf-8');

console.log('\n=== ALL 4 DATASETS SUCCESSFULLY ENRICHED! ===');
