/**
 * NBA Data Pipeline
 * Ingests complete historical NBA player records from Basketball Reference datasets.
 * Extracts:
 *  - Player bio, active years, positions
 *  - All franchises played for & metro market mapping
 *  - Career points, assists, steals, turnovers
 *  - Accolades: NBA Championships (rings), MVPs, Rookie of the Year, DPOY, All-Star games, Hall of Fame
 *  - College & conference detection (SEC, Big Ten, ACC, Big East, Pac-12)
 *  - Draft year, round, overall pick
 *
 * Output: src/data/athletes-nba.json
 */

import fs from 'fs';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), '.cache', 'nba');
const OUTPUT_FILE = path.join(process.cwd(), 'src', 'data', 'athletes-nba.json');

const BASE_URL = 'https://raw.githubusercontent.com/sumitrodatta/bball-reference-datasets/master/Data';

const CSV_SOURCES = {
  career: `${BASE_URL}/Player%20Career%20Info.csv`,
  totals: `${BASE_URL}/Player%20Totals.csv`,
  awards: `${BASE_URL}/Player%20Award%20Shares.csv`,
  draft: `${BASE_URL}/Draft%20Pick%20History.csv`,
  allstar: `${BASE_URL}/All-Star%20Selections.csv`,
};

// NBA & ABA Championship franchise per season
const NBA_CHAMPIONS: Record<number, string[]> = {
  1947: ['PHW'], 1948: ['BLB'], 1949: ['MNL'], 1950: ['MNL'],
  1951: ['ROC'], 1952: ['MNL'], 1953: ['MNL'], 1954: ['MNL'], 1955: ['SYR'],
  1956: ['PHW'], 1957: ['BOS'], 1958: ['STL'], 1959: ['BOS'], 1960: ['BOS'],
  1961: ['BOS'], 1962: ['BOS'], 1963: ['BOS'], 1964: ['BOS'], 1965: ['BOS'],
  1966: ['BOS'], 1967: ['PHI'], 1968: ['BOS', 'PIT'], 1969: ['BOS', 'OAK'], 1970: ['NYK', 'IND'],
  1971: ['MIL', 'UTA'], 1972: ['LAL', 'IND'], 1973: ['NYK', 'IND'], 1974: ['BOS', 'NYA'], 1975: ['GSW', 'KEN'],
  1976: ['BOS', 'NYA'], 1977: ['POR'], 1978: ['WSB'], 1979: ['SEA'], 1980: ['LAL'],
  1981: ['BOS'], 1982: ['LAL'], 1983: ['PHI'], 1984: ['BOS'], 1985: ['LAL'],
  1986: ['BOS'], 1987: ['LAL'], 1988: ['LAL'], 1989: ['DET'], 1990: ['DET'],
  1991: ['CHI'], 1992: ['CHI'], 1993: ['CHI'], 1994: ['HOU'], 1995: ['HOU'],
  1996: ['CHI'], 1997: ['CHI'], 1998: ['CHI'], 1999: ['SAS'], 2000: ['LAL'],
  2001: ['LAL'], 2002: ['LAL'], 2003: ['SAS'], 2004: ['DET'], 2005: ['SAS'],
  2006: ['MIA'], 2007: ['SAS'], 2008: ['BOS'], 2009: ['LAL'], 2010: ['LAL'],
  2011: ['DAL'], 2012: ['MIA'], 2013: ['MIA'], 2014: ['SAS'], 2015: ['GSW'],
  2016: ['CLE'], 2017: ['GSW'], 2018: ['GSW'], 2019: ['TOR'], 2020: ['LAL'],
  2021: ['MIL'], 2022: ['GSW'], 2023: ['DEN'], 2024: ['BOS'],
};

// Team code to Market & Full Name
const TEAM_TO_MARKET: Record<string, { market: string; name: string }> = {
  BOS: { market: 'BOS', name: 'Boston Celtics' },
  NYK: { market: 'NY', name: 'New York Knicks' },
  BRK: { market: 'NY', name: 'Brooklyn Nets' },
  BKN: { market: 'NY', name: 'Brooklyn Nets' },
  NJN: { market: 'NY', name: 'New Jersey Nets' },
  NYA: { market: 'NY', name: 'New York Nets' },
  NYN: { market: 'NY', name: 'New York Nets' },
  CHI: { market: 'CHI', name: 'Chicago Bulls' },
  CHS: { market: 'CHI', name: 'Chicago Stags' },
  CHP: { market: 'CHI', name: 'Chicago Packers' },
  CHZ: { market: 'CHI', name: 'Chicago Zephyrs' },
  LAL: { market: 'LA', name: 'Los Angeles Lakers' },
  LAC: { market: 'LA', name: 'Los Angeles Clippers' },
  SDC: { market: 'LA', name: 'San Diego Clippers' },
  BUF: { market: 'LA', name: 'Buffalo Braves' },
  ANA: { market: 'LA', name: 'Anaheim Amigos' },
  GSW: { market: 'BAY', name: 'Golden State Warriors' },
  SFW: { market: 'BAY', name: 'San Francisco Warriors' },
  OAK: { market: 'BAY', name: 'Oakland Oaks' },
  PHW: { market: 'PHI', name: 'Philadelphia Warriors' },
  PHI: { market: 'PHI', name: 'Philadelphia 76ers' },
  SYR: { market: 'PHI', name: 'Syracuse Nationals' },
  DET: { market: 'DET', name: 'Detroit Pistons' },
  FTW: { market: 'DET', name: 'Fort Wayne Pistons' },
  DTF: { market: 'DET', name: 'Detroit Falcons' },
  MIA: { market: 'MIA', name: 'Miami Heat' },
  FLO: { market: 'MIA', name: 'The Floridians' },
  ORL: { market: 'FLA', name: 'Orlando Magic' },
  DAL: { market: 'DAL', name: 'Dallas Mavericks' },
  TEX: { market: 'DAL', name: 'Texas Chaparrals' },
  HOU: { market: 'HOU', name: 'Houston Rockets' },
  SDR: { market: 'HOU', name: 'San Diego Rockets' },
  SAS: { market: 'SA', name: 'San Antonio Spurs' },
  SAA: { market: 'SA', name: 'San Antonio Spurs' },
  TOR: { market: 'TOR', name: 'Toronto Raptors' },
  TRH: { market: 'TOR', name: 'Toronto Huskies' },
  PHX: { market: 'PHX', name: 'Phoenix Suns' },
  PHO: { market: 'PHX', name: 'Phoenix Suns' },
  DEN: { market: 'DEN', name: 'Denver Nuggets' },
  DNA: { market: 'DEN', name: 'Denver Rockets' },
  DNR: { market: 'DEN', name: 'Denver Rockets' },
  DNN: { market: 'DEN', name: 'Denver Nuggets' },
  MIL: { market: 'MIL', name: 'Milwaukee Bucks' },
  MLH: { market: 'MIL', name: 'Milwaukee Hawks' },
  ATL: { market: 'ATL', name: 'Atlanta Hawks' },
  STL: { market: 'ATL', name: 'St. Louis Hawks' },
  STB: { market: 'STL', name: 'St. Louis Bombers' },
  SSL: { market: 'STL', name: 'Spirits of St. Louis' },
  CLE: { market: 'CLE', name: 'Cleveland Cavaliers' },
  CLR: { market: 'CLE', name: 'Cleveland Rebels' },
  POR: { market: 'POR', name: 'Portland Trail Blazers' },
  UTA: { market: 'UTA', name: 'Utah Jazz' },
  UTS: { market: 'UTA', name: 'Utah Stars' },
  NOJ: { market: 'NO', name: 'New Orleans Jazz' },
  NOP: { market: 'NO', name: 'New Orleans Pelicans' },
  NOH: { market: 'NO', name: 'New Orleans Hornets' },
  NOK: { market: 'NO', name: 'New Orleans/Oklahoma City Hornets' },
  IND: { market: 'IND', name: 'Indiana Pacers' },
  INA: { market: 'IND', name: 'Indiana Pacers' },
  INJ: { market: 'IND', name: 'Indianapolis Jets' },
  INO: { market: 'IND', name: 'Indianapolis Olympians' },
  WAS: { market: 'WAS', name: 'Washington Wizards' },
  WSB: { market: 'WAS', name: 'Washington Bullets' },
  WSC: { market: 'WAS', name: 'Washington Capitols' },
  WSA: { market: 'WAS', name: 'Washington Caps' },
  CAP: { market: 'WAS', name: 'Capital Bullets' },
  BAL: { market: 'WAS', name: 'Baltimore Bullets' },
  BLB: { market: 'WAS', name: 'Baltimore Bullets' },
  MIN: { market: 'MIN', name: 'Minnesota Timberwolves' },
  MNL: { market: 'MIN', name: 'Minneapolis Lakers' },
  MNM: { market: 'MIN', name: 'Minnesota Muskies' },
  MNP: { market: 'MIN', name: 'Minnesota Pipers' },
  SAC: { market: 'SAC', name: 'Sacramento Kings' },
  KCK: { market: 'KC', name: 'Kansas City Kings' },
  KCO: { market: 'KC', name: 'Kansas City-Omaha Kings' },
  CIN: { market: 'CIN', name: 'Cincinnati Royals' },
  ROC: { market: 'ROC', name: 'Rochester Royals' },
  OKC: { market: 'OKC', name: 'Oklahoma City Thunder' },
  SEA: { market: 'SEA', name: 'Seattle SuperSonics' },
  MEM: { market: 'MEM', name: 'Memphis Grizzlies' },
  VAN: { market: 'VAN', name: 'Vancouver Grizzlies' },
  CHA: { market: 'CHA', name: 'Charlotte Hornets' },
  CHH: { market: 'CHA', name: 'Charlotte Hornets' },
  CHO: { market: 'CHA', name: 'Charlotte Hornets' },
  CAR: { market: 'CHA', name: 'Carolina Cougars' },
  PIT: { market: 'PIT', name: 'Pittsburgh Ironmen' },
  PTC: { market: 'PIT', name: 'Pittsburgh Condors' },
  PTP: { market: 'PIT', name: 'Pittsburgh Pipers' },
  KEN: { market: 'IND', name: 'Kentucky Colonels' },
  VIR: { market: 'WAS', name: 'Virginia Squires' },
  PRO: { market: 'BOS', name: 'Providence Steamrollers' },
  SHE: { market: 'MIL', name: 'Sheboygan Red Skins' },
  WAT: { market: 'CHI', name: 'Waterloo Hawks' },
  AND: { market: 'IND', name: 'Anderson Packers' },
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

async function fetchCachedCSV(key: keyof typeof CSV_SOURCES, url: string): Promise<string> {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }

  const filePath = path.join(CACHE_DIR, `${key}.csv`);
  if (fs.existsSync(filePath)) {
    console.log(`[Cache Hit] Loading NBA ${key}.csv...`);
    return fs.readFileSync(filePath, 'utf-8');
  }

  console.log(`[Fetching] Downloading NBA ${key}.csv...`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  }
  const text = await res.text();
  fs.writeFileSync(filePath, text, 'utf-8');
  return text;
}

function parseStat(val: string | undefined): number {
  if (!val || val === 'NA' || val === '') return 0;
  const num = parseInt(val, 10);
  return isNaN(num) ? 0 : num;
}

function matchConference(college: string): string | undefined {
  if (!college) return undefined;
  const s = college.toLowerCase();

  if (
    s === 'unc' ||
    s.includes('north carolina') ||
    s.includes('duke') ||
    s.includes('wake forest') ||
    s.includes('virginia') ||
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

  if (
    s === 'lsu' ||
    s.includes('kentucky') ||
    s.includes('louisiana state') ||
    s.includes('alabama') ||
    s.includes('auburn') ||
    s.includes('florida') ||
    s.includes('arkansas') ||
    s.includes('tennessee') ||
    s.includes('georgia') ||
    s.includes('south carolina') ||
    s.includes('vanderbilt') ||
    s.includes('texas a&m') ||
    s.includes('mississippi') ||
    s.includes('ole miss') ||
    s.includes('missouri') ||
    s.includes('oklahoma') ||
    s.includes('texas')
  ) {
    return 'SEC';
  }

  if (
    s === 'ucla' ||
    s === 'usc' ||
    s.includes('michigan') ||
    s.includes('indiana') ||
    s.includes('ohio state') ||
    s.includes('illinois') ||
    s.includes('purdue') ||
    s.includes('michigan state') ||
    s.includes('wisconsin') ||
    s.includes('iowa') ||
    s.includes('minnesota') ||
    s.includes('penn state') ||
    s.includes('maryland') ||
    s.includes('rutgers') ||
    s.includes('nebraska') ||
    s.includes('northwestern')
  ) {
    return 'Big Ten';
  }

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

  if (
    s.includes('kansas') ||
    s.includes('baylor') ||
    s.includes('houston') ||
    s.includes('texas tech') ||
    s.includes('iowa state') ||
    s.includes('kansas state') ||
    s.includes('oklahoma state') ||
    s.includes('west virginia') ||
    s.includes('tcu') ||
    s.includes('cincinnati') ||
    s.includes('byu') ||
    s.includes('ucf')
  ) {
    return 'Big 12';
  }

  if (
    s.includes('arizona') ||
    s.includes('california') ||
    s.includes('stanford') ||
    s.includes('oregon') ||
    s.includes('washington')
  ) {
    return 'Pac-12';
  }

  return undefined;
}

async function run() {
  console.log('=== Starting NBA Ingestion Pipeline ===');

  const [careerRaw, totalsRaw, awardsRaw, draftRaw, allstarRaw] = await Promise.all([
    fetchCachedCSV('career', CSV_SOURCES.career),
    fetchCachedCSV('totals', CSV_SOURCES.totals),
    fetchCachedCSV('awards', CSV_SOURCES.awards),
    fetchCachedCSV('draft', CSV_SOURCES.draft),
    fetchCachedCSV('allstar', CSV_SOURCES.allstar),
  ]);

  console.log('Parsing NBA CSV tables...');
  const career = parseCSV(careerRaw);
  const totals = parseCSV(totalsRaw);
  const awards = parseCSV(awardsRaw);
  const draft = parseCSV(draftRaw);
  const allstar = parseCSV(allstarRaw);

  // Draft map: player_id -> { round, pick, year }
  const draftMap = new Map<string, { round: number; pick: number; year: number }>();
  draft.forEach((d) => {
    const pick = parseInt(d.overall_pick || '0', 10);
    const round = parseInt(d.round || '0', 10);
    const year = parseInt(d.season || '0', 10);
    if (d.player_id && pick > 0) {
      draftMap.set(d.player_id, { pick, round, year });
    }
  });

  // Awards map: player_id -> { mvp, roy, dpoy }
  const awardsMap = new Map<string, { mvp: number; roy: boolean; dpoy: number }>();
  awards.forEach((a) => {
    if (a.winner === 'TRUE') {
      const cur = awardsMap.get(a.player_id) || { mvp: 0, roy: false, dpoy: 0 };
      if (a.award === 'nba mvp' || a.award === 'aba mvp') cur.mvp += 1;
      if (a.award === 'nba roy' || a.award === 'aba roy' || a.award === 'baa roy') cur.roy = true;
      if (a.award === 'nba dpoy') cur.dpoy += 1;
      awardsMap.set(a.player_id, cur);
    }
  });

  // All-Star count map
  const allstarCount = new Map<string, number>();
  allstar.forEach((as) => {
    if (as.player_id) {
      allstarCount.set(as.player_id, (allstarCount.get(as.player_id) || 0) + 1);
    }
  });

  // Accumulate totals & teams per player
  interface AggTotals {
    pts: number;
    ast: number;
    stl: number;
    tov: number;
    games: number;
    teams: Set<string>;
    teamNames: Set<string>;
    markets: Set<string>;
    positions: Set<string>;
    championships: number;
  }
  const totalsMap = new Map<string, AggTotals>();

  totals.forEach((row) => {
    if (!row.player_id) return;
    const team = row.team?.trim();
    // Skip multi-team aggregate rows so we don't double count stats and don't add "2TM" as a team
    if (!team || team === 'TOT' || /^\d+TM$/.test(team)) return;

    const cur = totalsMap.get(row.player_id) || {
      pts: 0,
      ast: 0,
      stl: 0,
      tov: 0,
      games: 0,
      teams: new Set<string>(),
      teamNames: new Set<string>(),
      markets: new Set<string>(),
      positions: new Set<string>(),
      championships: 0,
    };

    cur.pts += parseStat(row.pts);
    cur.ast += parseStat(row.ast);
    cur.stl += parseStat(row.stl);
    cur.tov += parseStat(row.tov);
    cur.games += parseStat(row.g);

    cur.teams.add(team);
    const meta = TEAM_TO_MARKET[team];
    if (meta) {
      cur.markets.add(meta.market);
      cur.teamNames.add(meta.name);
    } else {
      cur.teamNames.add(team);
    }

    // Check championship ring
    const season = parseInt(row.season || '0', 10);
    const champs = NBA_CHAMPIONS[season];
    if (champs && champs.includes(team)) {
      cur.championships += 1;
    }

    if (row.pos && row.pos !== 'NA') {
      cur.positions.add(row.pos);
    }

    totalsMap.set(row.player_id, cur);
  });

  console.log('Normalizing NBA player profiles...');

  const athletes = [];

  for (const c of career) {
    const id = c.player_id;
    if (!id || !c.player) continue;

    const fromYear = parseInt(c.from || '0', 10);
    const toYear = parseInt(c.to || '0', 10);

    const tot = totalsMap.get(id) || {
      pts: 0,
      ast: 0,
      stl: 0,
      tov: 0,
      games: 0,
      teams: new Set<string>(),
      teamNames: new Set<string>(),
      markets: new Set<string>(),
      positions: new Set<string>(),
      championships: 0,
    };

    // Must have at least 1 appearance / recorded team
    if (tot.teams.size === 0 && !c.debut) continue;

    const draftInfo = draftMap.get(id);
    const awardInfo = awardsMap.get(id) || { mvp: 0, roy: false, dpoy: 0 };
    const isHof = c.hof === 'TRUE';
    const asCount = allstarCount.get(id) || 0;

    // College & conference
    const college = c.colleges || undefined;
    const collegeConference = college ? matchConference(college) : undefined;

    // Popularity score calculation (1 to 100)
    let popularity = 5;
    if (tot.games >= 100) popularity += 10;
    if (tot.games >= 500) popularity += 15;
    if (tot.games >= 1000) popularity += 15;
    if (tot.pts >= 10000) popularity += 15;
    if (tot.pts >= 20000) popularity += 20;
    if (tot.pts >= 30000) popularity += 25;
    if (tot.ast >= 5000) popularity += 15;
    if (tot.ast >= 10000) popularity += 20;
    if (tot.stl >= 1500) popularity += 15;
    if (asCount >= 1) popularity += 10;
    if (asCount >= 5) popularity += 15;
    if (awardInfo.roy) popularity += 15;
    if (awardInfo.mvp > 0) popularity += 25;
    if (isHof) popularity += 30;
    if (toYear >= 2015) popularity += 5;
    popularity = Math.min(100, Math.max(1, popularity));

    athletes.push({
      id: `ath_nba_${id}`,
      name: c.player.trim(),
      sports: ['NBA'],
      teams: Array.from(tot.teams),
      teamNames: Array.from(tot.teamNames),
      markets: Array.from(tot.markets),
      positions: Array.from(tot.positions),
      activeYears: [fromYear, toYear],
      jerseyNumbers: [],
      college,
      collegeConference,
      draftPick: draftInfo?.pick,
      draftRound: draftInfo?.round,
      draftYear: draftInfo?.year,
      championships: tot.championships,
      mvps: awardInfo.mvp,
      hallOfFame: isHof,
      rookieOfTheYear: awardInfo.roy,
      stats: {
        points: tot.pts,
        assists: tot.ast,
        steals: tot.stl,
        turnovers: tot.tov,
      },
      popularityScore: popularity,
    });
  }

  console.log(`Generated ${athletes.length} complete NBA athletes!`);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(athletes, null, 2), 'utf-8');
  console.log(`Saved to ${OUTPUT_FILE}`);
}

run().catch((err) => {
  console.error('Error running NBA ingestion:', err);
  process.exit(1);
});
