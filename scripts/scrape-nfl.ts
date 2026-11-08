/**
 * NFL Data Pipeline
 * Ingests complete historical NFL player records from nflverse datasets.
 * Extracts:
 *  - Player bio, active years, positions
 *  - All franchises played for & metro market mapping (from 1920 to 2024 historical rosters)
 *  - Career points (TDs * 6), turnovers (interceptions + fumbles lost)
 *  - Accolades: Super Bowl Championships (rings), AP MVPs, Hall of Fame, Pro Bowls, All-Pro
 *  - College & conference detection (SEC, Big Ten, ACC, Big East, Big 12, Pac-12)
 *  - Draft year, round, overall pick, jersey numbers
 *
 * Output: src/data/athletes-nfl.json
 */

import fs from 'fs';
import path from 'path';

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

// Official AP NFL MVPs (1957 - 2024)
const NFL_MVPS: Record<string, number> = {
  'Jim Brown': 3,
  'Johnny Unitas': 3,
  'Norm Van Brocklin': 1,
  'Paul Hornung': 1,
  'Jim Taylor': 1,
  'Y.A. Tittle': 1,
  'Bart Starr': 1,
  'Earl Morrall': 1,
  'Roman Gabriel': 1,
  'John Brodie': 1,
  'Alan Page': 1,
  'Larry Brown': 1,
  'O.J. Simpson': 1,
  'Ken Stabler': 1,
  'Fran Tarkenton': 1,
  'Bert Jones': 1,
  'Walter Payton': 1,
  'Terry Bradshaw': 1,
  'Earl Campbell': 1,
  'Brian Sipe': 1,
  'Ken Anderson': 1,
  'Mark Moseley': 1,
  'Joe Theismann': 1,
  'Dan Marino': 1,
  'Marcus Allen': 1,
  'Lawrence Taylor': 1,
  'John Elway': 1,
  'Boomer Esiason': 1,
  'Joe Montana': 2,
  'Thurman Thomas': 1,
  'Steve Young': 2,
  'Emmitt Smith': 1,
  'Brett Favre': 3,
  'Barry Sanders': 1,
  'Terrell Davis': 1,
  'Kurt Warner': 2,
  'Marshall Faulk': 1,
  'Rich Gannon': 1,
  'Peyton Manning': 5,
  'Steve McNair': 1,
  'Shaun Alexander': 1,
  'LaDainian Tomlinson': 1,
  'Tom Brady': 3,
  'Aaron Rodgers': 4,
  'Adrian Peterson': 1,
  'Cam Newton': 1,
  'Matt Ryan': 1,
  'Patrick Mahomes': 2,
  'Lamar Jackson': 2,
};

// NFL Team code to Metro Market & Full Name
const NFL_TEAMS: Record<string, { market: string; name: string }> = {
  ARI: { market: 'PHX', name: 'Arizona Cardinals' },
  PHO: { market: 'PHX', name: 'Phoenix Cardinals' },
  CRD: { market: 'CHI', name: 'Chicago Cardinals' },
  ATL: { market: 'ATL', name: 'Atlanta Falcons' },
  BAL: { market: 'BAL', name: 'Baltimore Ravens' },
  BLT: { market: 'BAL', name: 'Baltimore Ravens' },
  BUF: { market: 'NY', name: 'Buffalo Bills' },
  CAR: { market: 'CHA', name: 'Carolina Panthers' },
  CHI: { market: 'CHI', name: 'Chicago Bears' },
  CIN: { market: 'CIN', name: 'Cincinnati Bengals' },
  CLE: { market: 'CLE', name: 'Cleveland Browns' },
  DAL: { market: 'DAL', name: 'Dallas Cowboys' },
  DEN: { market: 'DEN', name: 'Denver Broncos' },
  DET: { market: 'DET', name: 'Detroit Lions' },
  GB: { market: 'MIL', name: 'Green Bay Packers' },
  GNB: { market: 'MIL', name: 'Green Bay Packers' },
  HOU: { market: 'HOU', name: 'Houston Texans' },
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
  OAK: { market: 'BAY', name: 'Oakland Raiders' },
  RAI: { market: 'LA', name: 'Los Angeles Raiders' },
  MIA: { market: 'MIA', name: 'Miami Dolphins' },
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
  TBB: { market: 'FLA', name: 'Tampa Bay Buccaneers' },
  TEN: { market: 'TEN', name: 'Tennessee Titans' },
  OTI: { market: 'HOU', name: 'Houston Oilers' },
  WAS: { market: 'WAS', name: 'Washington Commanders' },
  WSH: { market: 'WAS', name: 'Washington Commanders' },
  BOS: { market: 'BOS', name: 'Boston Patriots' },
  NY: { market: 'NY', name: 'New York Titans' },
  DTX: { market: 'DAL', name: 'Dallas Texans' },
};

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
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
    const ec = existingConf.toLowerCase();
    if (ec.includes('sec') || ec.includes('southeastern')) return 'SEC';
    if (ec.includes('big ten') || ec.includes('big 10')) return 'Big Ten';
    if (ec.includes('acc') || ec.includes('atlantic coast')) return 'ACC';
    if (ec.includes('big east')) return 'Big East';
    if (ec.includes('big 12') || ec.includes('big xii')) return 'Big 12';
    if (ec.includes('pac-12') || ec.includes('pacific-12') || ec.includes('pac-10')) return 'Pac-12';
  }

  if (!college) return undefined;
  const s = college.toLowerCase();

  // 1. Big 12 (check before SEC/Big Ten to prevent 'texas tech' or 'iowa state' collisions)
  if (
    s.includes('texas tech') ||
    s.includes('iowa state') ||
    s.includes('kansas state') ||
    s.includes('oklahoma state') ||
    s.includes('west virginia') ||
    s.includes('baylor') ||
    s.includes('houston') ||
    s.includes('tcu') ||
    s.includes('cincinnati') ||
    s.includes('byu') ||
    s.includes('ucf') ||
    (s.includes('kansas') && !s.includes('state'))
  ) {
    return 'Big 12';
  }

  // 2. ACC
  if (
    s === 'unc' ||
    s.includes('north carolina') ||
    s.includes('duke') ||
    s.includes('wake forest') ||
    s.includes('virginia tech') ||
    (s.includes('virginia') && !s.includes('west virginia')) ||
    s.includes('georgia tech') ||
    s.includes('florida state') ||
    s.includes('louisville') ||
    s.includes('syracuse') ||
    s.includes('notre dame') ||
    s.includes('nc state') ||
    s.includes('clemson') ||
    s.includes('miami') ||
    s.includes('pittsburgh') ||
    s.includes('boston college')
  ) {
    return 'ACC';
  }

  // 3. SEC
  if (
    s === 'lsu' ||
    s.includes('kentucky') ||
    s.includes('louisiana state') ||
    s.includes('alabama') ||
    s.includes('auburn') ||
    (s.includes('florida') && !s.includes('state') && !s.includes('atlantic') && !s.includes('gulf')) ||
    s.includes('arkansas') ||
    s.includes('tennessee') ||
    (s.includes('georgia') && !s.includes('tech') && !s.includes('southern')) ||
    s.includes('south carolina') ||
    s.includes('vanderbilt') ||
    s.includes('texas a&m') ||
    s.includes('ole miss') ||
    (s.includes('mississippi') && !s.includes('valley') && !s.includes('southern')) ||
    s.includes('missouri') ||
    (s.includes('oklahoma') && !s.includes('state')) ||
    s === 'texas' ||
    s.includes('texas longhorns') ||
    (s.includes('texas') && s.includes('austin')) ||
    s === 'university of texas'
  ) {
    return 'SEC';
  }

  // 4. Big Ten
  if (
    s === 'ucla' ||
    s === 'usc' ||
    s.includes('southern california') ||
    s.includes('michigan state') ||
    s.includes('ohio state') ||
    s.includes('penn state') ||
    (s.includes('michigan') && !s.includes('state') && !s.includes('central') && !s.includes('eastern') && !s.includes('western')) ||
    (s.includes('indiana') && !s.includes('state')) ||
    s.includes('illinois') ||
    s.includes('purdue') ||
    s.includes('wisconsin') ||
    (s.includes('iowa') && !s.includes('state') && !s.includes('northern')) ||
    s.includes('minnesota') ||
    s.includes('maryland') ||
    s.includes('rutgers') ||
    s.includes('nebraska') ||
    s.includes('northwestern')
  ) {
    return 'Big Ten';
  }

  // 5. Big East
  if (
    s === 'uconn' ||
    s.includes('georgetown') ||
    s.includes('villanova') ||
    s.includes('st. john') ||
    s.includes('providence') ||
    s.includes('marquette') ||
    s.includes('connecticut') ||
    s.includes('seton hall') ||
    s.includes('creighton') ||
    s.includes('xavier') ||
    s.includes('butler')
  ) {
    return 'Big East';
  }

  // 6. Pac-12
  if (
    s.includes('arizona state') ||
    (s.includes('arizona') && !s.includes('state')) ||
    (s.includes('california') && !s.includes('state') && !s.includes('fullerton')) ||
    s.includes('stanford') ||
    s.includes('oregon state') ||
    (s.includes('oregon') && !s.includes('state')) ||
    s.includes('washington state') ||
    (s.includes('washington') && !s.includes('state') && !s.includes('st.') && !s.includes('valley'))
  ) {
    return 'Pac-12';
  }

  return undefined;
}

async function run() {
  console.log('=== Starting NFL Ingestion Pipeline ===');

  // 1. Fetch Players universe (all ~25,000 historical NFL players)
  console.log('Loading NFL players universe...');
  const playersFile = path.join(CACHE_DIR, 'players.csv');
  const playersRaw = await fetchCachedFile(playersFile, PLAYERS_URL);
  const players = parseCSV(playersRaw);
  console.log(`Loaded ${players.length} total NFL player records.`);

  // 2. Fetch Draft Picks history (all drafted players from 1980 to 2024 with career stats)
  console.log('Loading NFL draft picks & career stats...');
  const draftFile = path.join(CACHE_DIR, 'draft_picks.csv');
  const draftRaw = await fetchCachedFile(draftFile, DRAFT_URL);
  const draft = parseCSV(draftRaw);
  console.log(`Loaded ${draft.length} drafted player records.`);

  // 3. Fetch Wikipedia Hall of Fame inductees
  console.log('Loading Pro Football Hall of Fame inductees...');
  const hofSet = new Set<string>();
  try {
    const wikiFile = path.join(CACHE_DIR, 'wiki_hof.json');
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
    console.log(`Loaded ${hofSet.size} official Hall of Fame members.`);
  } catch (err) {
    console.warn('Could not fetch Wiki HOF list, relying on dataset flags:', err);
  }

  // 4. Batch fetch and aggregate historical rosters (1920 to 2024)
  // Maps player ID (gsis_id or pfr_id or clean name) to teams, jerseys, rings, and seasons
  interface PlayerRosterMeta {
    teams: Set<string>;
    teamNames: Set<string>;
    markets: Set<string>;
    jerseys: Set<number>;
    championships: number;
    years: number[];
  }
  const rosterMap = new Map<string, PlayerRosterMeta>();

  const getRosterMeta = (key: string): PlayerRosterMeta => {
    let cur = rosterMap.get(key);
    if (!cur) {
      cur = {
        teams: new Set<string>(),
        teamNames: new Set<string>(),
        markets: new Set<string>(),
        jerseys: new Set<number>(),
        championships: 0,
        years: [],
      };
      rosterMap.set(key, cur);
    }
    return cur;
  };

  const rostersCacheFile = path.join(CACHE_DIR, 'aggregated_rosters.json');
  if (fs.existsSync(rostersCacheFile)) {
    console.log('[Cache Hit] Loading aggregated historical rosters...');
    const rawRosters = JSON.parse(fs.readFileSync(rostersCacheFile, 'utf-8'));
    for (const [k, v] of Object.entries(rawRosters)) {
      const item = v as any;
      rosterMap.set(k, {
        teams: new Set(item.teams),
        teamNames: new Set(item.teamNames),
        markets: new Set(item.markets),
        jerseys: new Set(item.jerseys),
        championships: item.championships,
        years: item.years,
      });
    }
  } else {
    console.log('Downloading & aggregating 1920-2024 NFL team rosters...');
    const allYears = Array.from({ length: 2025 - 1920 }, (_, i) => 1920 + i);
    const BATCH_SIZE = 15;

    for (let i = 0; i < allYears.length; i += BATCH_SIZE) {
      const batch = allYears.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(async (year) => {
          try {
            const yearFile = path.join(CACHE_DIR, `roster_${year}.csv`);
            const url = `https://github.com/nflverse/nflverse-data/releases/download/rosters/roster_${year}.csv`;
            const content = await fetchCachedFile(yearFile, url);
            const rows = parseCSV(content);

            const champs = SUPER_BOWL_WINNERS[year] || [];

            for (const r of rows) {
              const team = r.team?.trim();
              if (!team) continue;

              const keys = [r.gsis_id, r.pfr_id, r.full_name?.toLowerCase()].filter(Boolean) as string[];
              if (keys.length === 0) continue;

              const meta = NFL_TEAMS[team];
              const champWon = champs.includes(team);
              const jerseyNum = parseInt(r.jersey_number || '0', 10);

              for (const k of keys) {
                const target = getRosterMeta(k);
                target.teams.add(team);
                if (meta) {
                  target.markets.add(meta.market);
                  target.teamNames.add(meta.name);
                } else {
                  target.teamNames.add(team);
                }
                if (jerseyNum > 0 && jerseyNum < 100) {
                  target.jerseys.add(jerseyNum);
                }
                if (champWon) {
                  target.championships += 1;
                }
                target.years.push(year);
              }
            }
          } catch (err) {
            // Some very early years may have alternative names
          }
        })
      );
    }

    // Serialize aggregated rosters to cache
    const serialized: Record<string, any> = {};
    for (const [k, v] of rosterMap.entries()) {
      serialized[k] = {
        teams: Array.from(v.teams),
        teamNames: Array.from(v.teamNames),
        markets: Array.from(v.markets),
        jerseys: Array.from(v.jerseys),
        championships: v.championships,
        years: v.years,
      };
    }
    fs.writeFileSync(rostersCacheFile, JSON.stringify(serialized), 'utf-8');
    console.log(`Aggregated ${rosterMap.size} roster entity keys.`);
  }

  // 5. Build stats & accolades map from draft_picks.csv
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
    if (d.pfr_player_name) statsMap.set(d.pfr_player_name.toLowerCase(), statObj);
  });

  // 6. Ingest seasonal stats (1999 to 2024) to accumulate stats for undrafted players
  const seasonalStatsCache = path.join(CACHE_DIR, 'seasonal_stats.json');
  interface AggSeasonStats {
    points: number;
    turnovers: number;
    games: number;
  }
  const seasonStatsMap = new Map<string, AggSeasonStats>();

  if (fs.existsSync(seasonalStatsCache)) {
    console.log('[Cache Hit] Loading seasonal stats...');
    const raw = JSON.parse(fs.readFileSync(seasonalStatsCache, 'utf-8'));
    for (const [k, v] of Object.entries(raw)) {
      seasonStatsMap.set(k, v as AggSeasonStats);
    }
  } else {
    console.log('Ingesting modern seasonal stats (1999 to 2024)...');
    const modernYears = Array.from({ length: 2025 - 1999 }, (_, i) => 1999 + i);
    for (const y of modernYears) {
      try {
        const filePath = path.join(CACHE_DIR, `player_stats_season_${y}.csv`);
        const url = `https://github.com/nflverse/nflverse-data/releases/download/player_stats/player_stats_season_${y}.csv`;
        const content = await fetchCachedFile(filePath, url);
        const rows = parseCSV(content);

        for (const r of rows) {
          const id = r.player_id;
          if (!id) continue;

          const rushTds = parseStat(r.rushing_tds);
          const recTds = parseStat(r.receiving_tds);
          const stTds = parseStat(r.special_teams_tds);
          const ints = parseStat(r.interceptions);
          const fumbles = parseStat(r.rushing_fumbles_lost) + parseStat(r.receiving_fumbles_lost) + parseStat(r.sack_fumbles_lost);
          const games = parseStat(r.games);

          const cur = seasonStatsMap.get(id) || { points: 0, turnovers: 0, games: 0 };
          cur.points += (rushTds + recTds + stTds) * 6;
          cur.turnovers += (ints + fumbles);
          cur.games += games;
          seasonStatsMap.set(id, cur);
        }
      } catch (err) {
        // Continue if year unavailable
      }
    }

    const ser: Record<string, AggSeasonStats> = {};
    for (const [k, v] of seasonStatsMap.entries()) ser[k] = v;
    fs.writeFileSync(seasonalStatsCache, JSON.stringify(ser), 'utf-8');
  }

  // 7. Normalize all players
  console.log('Normalizing NFL player profiles...');
  const athletes = [];

  for (const p of players) {
    const id = p.gsis_id || p.pfr_id || p.esb_id;
    const name = p.display_name?.trim();
    if (!id || !name) continue;

    // Aggregate roster metadata
    const rMeta1 = p.gsis_id ? rosterMap.get(p.gsis_id) : undefined;
    const rMeta2 = p.pfr_id ? rosterMap.get(p.pfr_id) : undefined;
    const rMeta3 = rosterMap.get(name.toLowerCase());

    const teams = new Set<string>();
    const teamNames = new Set<string>();
    const markets = new Set<string>();
    const jerseys = new Set<number>();
    let championships = 0;
    const years: number[] = [];

    [rMeta1, rMeta2, rMeta3].forEach((m) => {
      if (!m) return;
      m.teams.forEach((t) => teams.add(t));
      m.teamNames.forEach((n) => teamNames.add(n));
      m.markets.forEach((mk) => markets.add(mk));
      m.jerseys.forEach((j) => jerseys.add(j));
      championships = Math.max(championships, m.championships);
      years.push(...m.years);
    });

    // Add draft team and latest team if not already present
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

    // Active years
    const rookieSeason = parseInt(p.rookie_season || '0', 10);
    const lastSeason = parseInt(p.last_season || '0', 10);
    let fromYear = rookieSeason > 0 ? rookieSeason : (years.length > 0 ? Math.min(...years) : 0);
    let toYear = lastSeason > 0 ? lastSeason : (years.length > 0 ? Math.max(...years) : fromYear);
    if (fromYear === 0 && toYear === 0) continue;
    if (fromYear === 0) fromYear = toYear;
    if (toYear === 0) toYear = fromYear;

    // Jersey numbers
    const jNum = parseInt(p.jersey_number || '0', 10);
    if (jNum > 0 && jNum < 100) jerseys.add(jNum);

    // Positions
    const positions = new Set<string>();
    if (p.position && p.position !== 'NA') positions.add(p.position);
    if (p.position_group && p.position_group !== 'NA') positions.add(p.position_group);

    // Draft info
    const draftPick = parseInt(p.draft_pick || '0', 10);
    const draftRound = parseInt(p.draft_round || '0', 10);
    const draftYear = parseInt(p.draft_year || '0', 10);

    // Stats & Honors
    const st1 = p.gsis_id ? statsMap.get(p.gsis_id) : undefined;
    const st2 = p.pfr_id ? statsMap.get(p.pfr_id) : undefined;
    const st3 = statsMap.get(name.toLowerCase());
    const draftStat = st1 || st2 || st3;

    const modernStat = p.gsis_id ? seasonStatsMap.get(p.gsis_id) : undefined;

    const totalGames = Math.max(draftStat?.games || 0, modernStat?.games || 0, parseStat(p.years_of_experience) * 16);
    const points = Math.max(draftStat?.points || 0, modernStat?.points || 0);
    const turnovers = Math.max(draftStat?.turnovers || 0, modernStat?.turnovers || 0);
    const probowls = draftStat?.probowls || 0;
    const allpro = draftStat?.allpro || 0;

    // Hall of Fame check
    const isHof = draftStat?.hof === true || hofSet.has(name.toLowerCase());

    // MVP count
    const mvps = NFL_MVPS[name] || 0;

    // College & conference
    const college = p.college_name || undefined;
    const collegeConference = matchConference(college || '', p.college_conference);

    // Popularity score calculation (1 to 100)
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

    athletes.push({
      id: `ath_nfl_${id}`,
      name,
      sports: ['NFL'],
      teams: Array.from(teams),
      teamNames: Array.from(teamNames),
      markets: Array.from(markets),
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
      rookieOfTheYear: false, // NFL AP OROY/DROY separate
      stats: {
        points,
        turnovers,
      },
      popularityScore: popularity,
    });
  }

  console.log(`Generated ${athletes.length} complete NFL athletes!`);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(athletes, null, 2), 'utf-8');
  console.log(`Saved to ${OUTPUT_FILE}`);
}

run().catch((err) => {
  console.error('Error running NFL ingestion:', err);
  process.exit(1);
});
