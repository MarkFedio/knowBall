/**
 * MLB Data Pipeline
 * Ingests complete historical MLB player records from the Baseball Data Bank.
 * Extracts:
 *  - Player bio & active years
 *  - All teams played for & metro market mapping
 *  - Career hits, stolen bases, pitching saves
 *  - Accolades: World Series championships, MVPs, Cy Youngs, Rookie of the Year, Hall of Fame, All-Star games
 *  - College & conference detection (SEC, Big Ten, ACC, Pac-12)
 *
 * Output: src/data/athletes-mlb.json
 */

import fs from 'fs';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), '.cache', 'mlb');
const OUTPUT_FILE = path.join(process.cwd(), 'src', 'data', 'athletes-mlb.json');

const BASE_URL = 'https://raw.githubusercontent.com/xorq-labs/baseballdatabank/master';

const CSV_SOURCES = {
  people: `${BASE_URL}/core/People.csv`,
  batting: `${BASE_URL}/core/Batting.csv`,
  pitching: `${BASE_URL}/core/Pitching.csv`,
  appearances: `${BASE_URL}/core/Appearances.csv`,
  teams: `${BASE_URL}/core/Teams.csv`,
  awards: `${BASE_URL}/contrib/AwardsPlayers.csv`,
  hof: `${BASE_URL}/contrib/HallOfFame.csv`,
  allstar: `${BASE_URL}/core/AllstarFull.csv`,
  college: `${BASE_URL}/contrib/CollegePlaying.csv`,
  schools: `${BASE_URL}/contrib/Schools.csv`,
};

// Metro market mapping for MLB franchises
const TEAM_TO_MARKET: Record<string, { market: string; name: string }> = {
  NYA: { market: 'NY', name: 'New York Yankees' },
  NYY: { market: 'NY', name: 'New York Yankees' },
  NYN: { market: 'NY', name: 'New York Mets' },
  NYM: { market: 'NY', name: 'New York Mets' },
  BOS: { market: 'BOS', name: 'Boston Red Sox' },
  CHN: { market: 'CHI', name: 'Chicago Cubs' },
  CHC: { market: 'CHI', name: 'Chicago Cubs' },
  CHA: { market: 'CHI', name: 'Chicago White Sox' },
  CHW: { market: 'CHI', name: 'Chicago White Sox' },
  LAN: { market: 'LA', name: 'Los Angeles Dodgers' },
  LAD: { market: 'LA', name: 'Los Angeles Dodgers' },
  BRO: { market: 'NY', name: 'Brooklyn Dodgers' },
  LAA: { market: 'LA', name: 'Los Angeles Angels' },
  ANA: { market: 'LA', name: 'Anaheim Angels' },
  CAL: { market: 'LA', name: 'California Angels' },
  SFN: { market: 'BAY', name: 'San Francisco Giants' },
  SFG: { market: 'BAY', name: 'San Francisco Giants' },
  NYG: { market: 'NY', name: 'New York Giants (Baseball)' },
  OAK: { market: 'BAY', name: 'Oakland Athletics' },
  PHA: { market: 'PHI', name: 'Philadelphia Athletics' },
  PHI: { market: 'PHI', name: 'Philadelphia Phillies' },
  DET: { market: 'DET', name: 'Detroit Tigers' },
  HOU: { market: 'HOU', name: 'Houston Astros' },
  TEX: { market: 'DAL', name: 'Texas Rangers' },
  TOR: { market: 'TOR', name: 'Toronto Blue Jays' },
  BAL: { market: 'BAL', name: 'Baltimore Orioles' },
  WAS: { market: 'WAS', name: 'Washington Nationals' },
  WSN: { market: 'WAS', name: 'Washington Nationals' },
  MON: { market: 'WAS', name: 'Montreal Expos' },
  ATL: { market: 'ATL', name: 'Atlanta Braves' },
  MLN: { market: 'ATL', name: 'Milwaukee Braves' },
  BSN: { market: 'BOS', name: 'Boston Braves' },
  SLN: { market: 'STL', name: 'St. Louis Cardinals' },
  STL: { market: 'STL', name: 'St. Louis Cardinals' },
  PIT: { market: 'PIT', name: 'Pittsburgh Pirates' },
  CIN: { market: 'CIN', name: 'Cincinnati Reds' },
  CLE: { market: 'CLE', name: 'Cleveland Guardians' },
  MIN: { market: 'MIN', name: 'Minnesota Twins' },
  FLO: { market: 'FLA', name: 'Florida Marlins' },
  MIA: { market: 'FLA', name: 'Miami Marlins' },
  TBA: { market: 'FLA', name: 'Tampa Bay Rays' },
  TBR: { market: 'FLA', name: 'Tampa Bay Rays' },
  SDN: { market: 'SD', name: 'San Diego Padres' },
  SDP: { market: 'SD', name: 'San Diego Padres' },
  SEA: { market: 'SEA', name: 'Seattle Mariners' },
  COL: { market: 'DEN', name: 'Colorado Rockies' },
  ARI: { market: 'PHX', name: 'Arizona Diamondbacks' },
  KCA: { market: 'KC', name: 'Kansas City Royals' },
  KCR: { market: 'KC', name: 'Kansas City Royals' },
  ML4: { market: 'MIL', name: 'Milwaukee Brewers' },
  MIL: { market: 'MIL', name: 'Milwaukee Brewers' },
};

// Fast CSV line reader
function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split('\n').filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map((h) => h.trim());
  const records: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Handle simple CSV splitting (no commas within quoted strings in baseball databank)
    const values = lines[i].split(',');
    const record: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      record[headers[j]] = (values[j] ?? '').trim();
    }
    records.push(record);
  }
  return records;
}

// Download and cache helper
async function fetchCachedCSV(key: keyof typeof CSV_SOURCES, url: string): Promise<string> {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }

  const filePath = path.join(CACHE_DIR, `${key}.csv`);
  if (fs.existsSync(filePath)) {
    console.log(`[Cache Hit] Loading ${key}.csv from local cache...`);
    return fs.readFileSync(filePath, 'utf-8');
  }

  console.log(`[Fetching] Downloading ${key}.csv from GitHub...`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  }
  const text = await res.text();
  fs.writeFileSync(filePath, text, 'utf-8');
  return text;
}

// College conference matcher
function matchConference(schoolName: string): string | undefined {
  const s = schoolName.toLowerCase();
  if (
    s.includes('louisiana state') ||
    s.includes('lsu') ||
    s.includes('florida') ||
    s.includes('vanderbilt') ||
    s.includes('arkansas') ||
    s.includes('ole miss') ||
    s.includes('mississippi') ||
    s.includes('alabama') ||
    s.includes('auburn') ||
    s.includes('tennessee') ||
    s.includes('georgia') ||
    s.includes('kentucky') ||
    s.includes('south carolina') ||
    s.includes('texas a&m')
  ) {
    return 'SEC';
  }

  if (
    s.includes('michigan') ||
    s.includes('ohio state') ||
    s.includes('indiana') ||
    s.includes('iowa') ||
    s.includes('illinois') ||
    s.includes('penn state') ||
    s.includes('michigan state') ||
    s.includes('nebraska') ||
    s.includes('wisconsin') ||
    s.includes('minnesota') ||
    s.includes('purdue')
  ) {
    return 'Big Ten';
  }

  if (
    s.includes('north carolina') ||
    s.includes('virginia') ||
    s.includes('wake forest') ||
    s.includes('clemson') ||
    s.includes('florida state') ||
    s.includes('miami') ||
    s.includes('georgia tech') ||
    s.includes('nc state') ||
    s.includes('notre dame') ||
    s.includes('duke')
  ) {
    return 'ACC';
  }

  if (
    s.includes('arizona') ||
    s.includes('california') ||
    s.includes('stanford') ||
    s.includes('oregon') ||
    s.includes('washington') ||
    s.includes('ucla') ||
    s.includes('usc')
  ) {
    return 'Pac-12';
  }

  return undefined;
}

async function run() {
  console.log('=== Starting MLB Ingestion Pipeline ===');

  // 1. Fetch CSVs
  const [
    peopleRaw,
    battingRaw,
    pitchingRaw,
    appearancesRaw,
    teamsRaw,
    awardsRaw,
    hofRaw,
    allstarRaw,
    collegeRaw,
    schoolsRaw,
  ] = await Promise.all([
    fetchCachedCSV('people', CSV_SOURCES.people),
    fetchCachedCSV('batting', CSV_SOURCES.batting),
    fetchCachedCSV('pitching', CSV_SOURCES.pitching),
    fetchCachedCSV('appearances', CSV_SOURCES.appearances),
    fetchCachedCSV('teams', CSV_SOURCES.teams),
    fetchCachedCSV('awards', CSV_SOURCES.awards),
    fetchCachedCSV('hof', CSV_SOURCES.hof),
    fetchCachedCSV('allstar', CSV_SOURCES.allstar),
    fetchCachedCSV('college', CSV_SOURCES.college),
    fetchCachedCSV('schools', CSV_SOURCES.schools),
  ]);

  console.log('Parsing CSV tables...');
  const people = parseCSV(peopleRaw);
  const batting = parseCSV(battingRaw);
  const pitching = parseCSV(pitchingRaw);
  const appearances = parseCSV(appearancesRaw);
  const teams = parseCSV(teamsRaw);
  const awards = parseCSV(awardsRaw);
  const hof = parseCSV(hofRaw);
  const allstar = parseCSV(allstarRaw);
  const college = parseCSV(collegeRaw);
  const schools = parseCSV(schoolsRaw);

  // Map schools
  const schoolMap = new Map<string, string>();
  schools.forEach((s) => {
    schoolMap.set(s.schoolID, s.name_full);
  });

  const playerCollegeMap = new Map<string, { school: string; conf?: string }>();
  college.forEach((c) => {
    const schoolName = schoolMap.get(c.schoolID);
    if (schoolName) {
      playerCollegeMap.set(c.playerID, {
        school: schoolName,
        conf: matchConference(schoolName),
      });
    }
  });

  // World Series winning teams per year: Set of "teamID-yearID"
  const wsWinners = new Set<string>();
  teams.forEach((t) => {
    if (t.WSWin === 'Y') {
      wsWinners.add(`${t.teamID}-${t.yearID}`);
    }
  });

  // Hall of fame inductees: Set of playerID
  const hofSet = new Set<string>();
  hof.forEach((h) => {
    if (h.inducted === 'Y' && (h.category === 'Player' || !h.category)) {
      hofSet.add(h.playerID);
    }
  });

  // Supplemental recent HOF inductees (2019-2024 not in older Lahman cut)
  const recentHof = [
    'riverma01', // Mariano Rivera (2019)
    'jeterde01', // Derek Jeter (2020)
    'hallaro01', // Roy Halladay (2019)
    'martied01', // Edgar Martinez (2019)
    'mussimi01', // Mike Mussina (2019)
    'walkela01', // Larry Walker (2020)
    'ortizda01', // David Ortiz (2022)
    'rolensc01', // Scott Rolen (2023)
    'mcgrifr01', // Fred McGriff (2023)
    'beltrad01', // Adrian Beltre (2024)
    'mauerjo01', // Joe Mauer (2024)
    'heltoto01', // Todd Helton (2024)
  ];
  recentHof.forEach((id) => hofSet.add(id));

  // Awards map: playerID -> { mvp: number, roty: boolean, cyYoung: number }
  const playerAwards = new Map<string, { mvp: number; roty: boolean; cyYoung: number }>();
  awards.forEach((a) => {
    const p = playerAwards.get(a.playerID) || { mvp: 0, roty: false, cyYoung: 0 };
    if (a.awardID === 'Most Valuable Player') {
      p.mvp += 1;
    } else if (a.awardID === 'Rookie of the Year') {
      p.roty = true;
    } else if (a.awardID === 'Cy Young Award') {
      p.cyYoung += 1;
    }
    playerAwards.set(a.playerID, p);
  });

  // Supplemental recent MVPs (2019-2024)
  const recentMvps: Record<string, number> = {
    troubmi01: 1, // Mike Trout (already had 2, gets 3rd in 2019)
    bellico01: 1, // Cody Bellinger (2019)
    abreujo02: 1, // Jose Abreu (2020)
    freemfr01: 1, // Freddie Freeman (2020)
    ohtansh01: 2, // Shohei Ohtani (2021, 2023)
    harpebr03: 1, // Bryce Harper (already had 1, 2nd in 2021)
    judgeaa01: 1, // Aaron Judge (2022)
    goldssp01: 1, // Paul Goldschmidt (2022)
    acunaro01: 1, // Ronald Acuna Jr (2023)
  };
  Object.entries(recentMvps).forEach(([id, extra]) => {
    const p = playerAwards.get(id) || { mvp: 0, roty: false, cyYoung: 0 };
    p.mvp += extra;
    playerAwards.set(id, p);
  });

  // All-Star count map
  const allStarCount = new Map<string, number>();
  allstar.forEach((as) => {
    allStarCount.set(as.playerID, (allStarCount.get(as.playerID) || 0) + 1);
  });

  // Accumulate Batting stats per player
  interface AggBatting {
    hits: number;
    steals: number;
    hr: number;
    games: number;
  }
  const battingMap = new Map<string, AggBatting>();
  batting.forEach((b) => {
    const cur = battingMap.get(b.playerID) || { hits: 0, steals: 0, hr: 0, games: 0 };
    cur.hits += parseInt(b.H || '0', 10);
    cur.steals += parseInt(b.SB || '0', 10);
    cur.hr += parseInt(b.HR || '0', 10);
    cur.games += parseInt(b.G || '0', 10);
    battingMap.set(b.playerID, cur);
  });

  // Accumulate Pitching stats per player
  interface AggPitching {
    saves: number;
    strikeouts: number;
    wins: number;
    games: number;
  }
  const pitchingMap = new Map<string, AggPitching>();
  pitching.forEach((p) => {
    const cur = pitchingMap.get(p.playerID) || { saves: 0, strikeouts: 0, wins: 0, games: 0 };
    cur.saves += parseInt(p.SV || '0', 10);
    cur.strikeouts += parseInt(p.SO || '0', 10);
    cur.wins += parseInt(p.W || '0', 10);
    cur.games += parseInt(p.G || '0', 10);
    pitchingMap.set(p.playerID, cur);
  });

  // Accumulate Appearances: Teams, Markets, Positions, and Championships
  interface AggAppearances {
    teams: Set<string>;
    teamNames: Set<string>;
    markets: Set<string>;
    positions: Set<string>;
    championships: number;
  }
  const appMap = new Map<string, AggAppearances>();

  appearances.forEach((app) => {
    const cur = appMap.get(app.playerID) || {
      teams: new Set<string>(),
      teamNames: new Set<string>(),
      markets: new Set<string>(),
      positions: new Set<string>(),
      championships: 0,
    };

    const teamKey = app.teamID;
    cur.teams.add(teamKey);

    const meta = TEAM_TO_MARKET[teamKey];
    if (meta) {
      cur.markets.add(meta.market);
      cur.teamNames.add(meta.name);
    } else {
      cur.teamNames.add(teamKey);
    }

    // World series champion check
    if (wsWinners.has(`${teamKey}-${app.yearID}`)) {
      cur.championships += 1;
    }

    // Positions
    if (parseInt(app.G_p || '0', 10) > 0) cur.positions.add('P');
    if (parseInt(app.G_c || '0', 10) > 0) cur.positions.add('C');
    if (parseInt(app.G_1b || '0', 10) > 0) cur.positions.add('1B');
    if (parseInt(app.G_2b || '0', 10) > 0) cur.positions.add('2B');
    if (parseInt(app.G_3b || '0', 10) > 0) cur.positions.add('3B');
    if (parseInt(app.G_ss || '0', 10) > 0) cur.positions.add('SS');
    if (
      parseInt(app.G_lf || '0', 10) > 0 ||
      parseInt(app.G_cf || '0', 10) > 0 ||
      parseInt(app.G_rf || '0', 10) > 0 ||
      parseInt(app.G_of || '0', 10) > 0
    ) {
      cur.positions.add('OF');
    }
    if (parseInt(app.G_dh || '0', 10) > 0) cur.positions.add('DH');

    appMap.set(app.playerID, cur);
  });

  console.log('Filtering and normalizing athlete records...');

  const athletes = [];

  for (const person of people) {
    const playerId = person.playerID;
    const nameFirst = person.nameFirst?.trim();
    const nameLast = person.nameLast?.trim();
    if (!nameFirst || !nameLast) continue;

    const fullName = `${nameFirst} ${nameLast}`;
    const debutYear = person.debut ? parseInt(person.debut.split('-')[0], 10) : 0;
    const finalYear = person.finalGame ? parseInt(person.finalGame.split('-')[0], 10) : debutYear;

    // Filter criteria:
    // Only include players active from 1950 onward, OR Hall of Famers, OR award winners, OR 1,000+ hits / 50+ saves
    const isHOF = hofSet.has(playerId);
    const awardsInfo = playerAwards.get(playerId) || { mvp: 0, roty: false, cyYoung: 0 };
    const hasMajorAward = awardsInfo.mvp > 0 || awardsInfo.roty || awardsInfo.cyYoung > 0;
    const battingStats = battingMap.get(playerId) || { hits: 0, steals: 0, hr: 0, games: 0 };
    const pitchingStats = pitchingMap.get(playerId) || { saves: 0, strikeouts: 0, wins: 0, games: 0 };

    const totalGames = Math.max(battingStats.games, pitchingStats.games);

    // Filter threshold for game database quality:
    const isNotable =
      isHOF ||
      hasMajorAward ||
      battingStats.hits >= 500 ||
      battingStats.steals >= 100 ||
      pitchingStats.saves >= 50 ||
      pitchingStats.wins >= 50 ||
      (debutYear >= 1970 && totalGames >= 150);

    if (!isNotable) continue;

    const appInfo = appMap.get(playerId) || {
      teams: new Set<string>(),
      teamNames: new Set<string>(),
      markets: new Set<string>(),
      positions: new Set<string>(),
      championships: 0,
    };

    const collegeInfo = playerCollegeMap.get(playerId);

    // Calculate popularity score (1 to 100)
    let popularity = 40;
    if (isHOF) popularity += 30;
    if (awardsInfo.mvp > 0) popularity += 25;
    if (battingStats.hits >= 3000) popularity += 25;
    if (battingStats.steals >= 500) popularity += 20;
    if (pitchingStats.saves >= 300) popularity += 20;
    if (debutYear >= 2000) popularity += 10;
    popularity = Math.min(100, Math.max(10, popularity));

    athletes.push({
      id: `ath_mlb_${playerId}`,
      name: fullName,
      sports: ['MLB'],
      teams: Array.from(appInfo.teams),
      teamNames: Array.from(appInfo.teamNames),
      markets: Array.from(appInfo.markets),
      positions: Array.from(appInfo.positions),
      activeYears: [debutYear, finalYear],
      jerseyNumbers: [], // Lahman does not track jersey numbers directly
      college: collegeInfo?.school,
      collegeConference: collegeInfo?.conf,
      championships: appInfo.championships,
      mvps: awardsInfo.mvp,
      hallOfFame: isHOF,
      rookieOfTheYear: awardsInfo.roty,
      stats: {
        hits: battingStats.hits,
        steals: battingStats.steals,
        saves: pitchingStats.saves,
      },
      popularityScore: popularity,
    });
  }

  console.log(`Generated ${athletes.length} high-quality MLB athletes!`);

  // Write output
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(athletes, null, 2), 'utf-8');
  console.log(`Successfully saved to ${OUTPUT_FILE}`);
}

run().catch((err) => {
  console.error('Error running MLB ingestion:', err);
  process.exit(1);
});
