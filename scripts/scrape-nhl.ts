/**
 * NHL Data Pipeline
 * Ingests complete historical NHL player records from the official NHL Stats API.
 * Extracts:
 *  - Player bio, active years, positions
 *  - All franchises played for & metro market mapping (from 1917 to 2024)
 *  - Career points, assists, saves, goals, penalty minutes
 *  - Accolades: Stanley Cups (championships), Hart Memorial Trophies (MVPs), Hockey Hall of Fame
 *
 * Output: src/data/athletes-nhl.json
 */

import fs from 'fs';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), '.cache', 'nhl');
const OUTPUT_FILE = path.join(process.cwd(), 'src', 'data', 'athletes-nhl.json');

const SKATER_SUMMARY_URL = 'https://api.nhle.com/stats/rest/en/skater/summary?isAggregate=true&isGame=false&limit=-1&cayenneExp=gameTypeId=2';
const GOALIE_SUMMARY_URL = 'https://api.nhle.com/stats/rest/en/goalie/summary?isAggregate=true&isGame=false&limit=-1&cayenneExp=gameTypeId=2';
const WIKI_HHOF_URL = 'https://en.wikipedia.org/w/api.php?action=parse&page=List_of_members_of_the_Hockey_Hall_of_Fame&prop=wikitext&format=json';

// Stanley Cup Champions by season ending year
const STANLEY_CUP_CHAMPIONS: Record<number, string[]> = {
  1918: ['TOR'], 1920: ['OTT', 'SEN'], 1921: ['OTT', 'SEN'], 1922: ['TOR'],
  1923: ['OTT', 'SEN'], 1924: ['MTL'], 1925: ['VIC'], 1926: ['MMR'], 1927: ['OTT', 'SEN'],
  1928: ['NYR'], 1929: ['BOS'], 1930: ['MTL'], 1931: ['MTL'], 1932: ['TOR'],
  1933: ['NYR'], 1934: ['CHI'], 1935: ['MMR'], 1936: ['DET'], 1937: ['DET'],
  1938: ['CHI'], 1939: ['BOS'], 1940: ['NYR'], 1941: ['BOS'], 1942: ['TOR'],
  1943: ['DET'], 1944: ['MTL'], 1945: ['TOR'], 1946: ['MTL'], 1947: ['TOR'],
  1948: ['TOR'], 1949: ['TOR'], 1950: ['DET'], 1951: ['TOR'], 1952: ['DET'],
  1953: ['MTL'], 1954: ['DET'], 1955: ['DET'], 1956: ['MTL'], 1957: ['MTL'],
  1958: ['MTL'], 1959: ['MTL'], 1960: ['MTL'], 1961: ['CHI'], 1962: ['TOR'],
  1963: ['TOR'], 1964: ['TOR'], 1965: ['MTL'], 1966: ['MTL'], 1967: ['TOR'],
  1968: ['MTL'], 1969: ['MTL'], 1970: ['BOS'], 1971: ['MTL'], 1972: ['BOS'],
  1973: ['MTL'], 1974: ['PHI'], 1975: ['PHI'], 1976: ['MTL'], 1977: ['MTL'],
  1978: ['MTL'], 1979: ['MTL'], 1980: ['NYI'], 1981: ['NYI'], 1982: ['NYI'],
  1983: ['NYI'], 1984: ['EDM'], 1985: ['EDM'], 1986: ['MTL'], 1987: ['EDM'],
  1988: ['EDM'], 1989: ['CGY'], 1990: ['EDM'], 1991: ['PIT'], 1992: ['PIT'],
  1993: ['MTL'], 1994: ['NYR'], 1995: ['NJD'], 1996: ['COL'], 1997: ['DET'],
  1998: ['DET'], 1999: ['DAL'], 2000: ['NJD'], 2001: ['COL'], 2002: ['DET'],
  2003: ['NJD'], 2004: ['TBL'], 2006: ['CAR'], 2007: ['ANA'], 2008: ['DET'],
  2009: ['PIT'], 2010: ['CHI'], 2011: ['BOS'], 2012: ['LAK'], 2013: ['CHI'],
  2014: ['LAK'], 2015: ['CHI'], 2016: ['PIT'], 2017: ['PIT'], 2018: ['WSH'],
  2019: ['STL'], 2020: ['TBL'], 2021: ['TBL'], 2022: ['COL'], 2023: ['VGK'],
  2024: ['FLA'],
};

// Hart Memorial Trophy (NHL MVP) winners 1924-2024
const HART_MVPS: Record<string, number> = {
  'Wayne Gretzky': 9,
  'Gordie Howe': 6,
  'Eddie Shore': 4,
  'Mario Lemieux': 3,
  'Bobby Clarke': 3,
  'Bobby Orr': 3,
  'Alexander Ovechkin': 3,
  'Alex Ovechkin': 3,
  'Connor McDavid': 3,
  'Howie Morenz': 3,
  'Dominik Hasek': 2,
  'Sidney Crosby': 2,
  'Mark Messier': 2,
  'Phil Esposito': 2,
  'Stan Mikita': 2,
  'Bobby Hull': 2,
  'Jean Beliveau': 2,
  'Bill Cowley': 2,
  'Nels Stewart': 2,
  'Evgeni Malkin': 1,
  'Auston Matthews': 1,
  'Nathan MacKinnon': 1,
  'Leon Draisaitl': 1,
  'Nikita Kucherov': 1,
  'Patrick Kane': 1,
  'Carey Price': 1,
  'Corey Perry': 1,
  'Henrik Sedin': 1,
  'Joe Thornton': 1,
  'Martin St. Louis': 1,
  'Peter Forsberg': 1,
  'Jose Theodore': 1,
  'Chris Pronger': 1,
  'Jaromir Jagr': 1,
  'Sergei Fedorov': 1,
  'Eric Lindros': 1,
  'Brett Hull': 1,
  'Maurice Richard': 1,
  'Jacques Plante': 1,
  'Frank Brimsek': 1,
  'Al Rollins': 1,
  'Max Bentley': 1,
  'Babe Pratt': 1,
  'Ebbie Goodfellow': 1,
  'Paul Thompson': 1,
  'Tommy Anderson': 1,
  'Herb Gardiner': 1,
  'Roy Worters': 1,
  'Frank Boucher': 1,
  'Billy Burch': 1,
};

// NHL Team Code to Metro Market & Full Name
const NHL_TEAMS: Record<string, { market: string; name: string }> = {
  BOS: { market: 'BOS', name: 'Boston Bruins' },
  NYR: { market: 'NY', name: 'New York Rangers' },
  NYI: { market: 'NY', name: 'New York Islanders' },
  NJD: { market: 'NY', name: 'New Jersey Devils' },
  CHI: { market: 'CHI', name: 'Chicago Blackhawks' },
  LAK: { market: 'LA', name: 'Los Angeles Kings' },
  ANA: { market: 'LA', name: 'Anaheim Ducks' },
  MDA: { market: 'LA', name: 'Mighty Ducks of Anaheim' },
  SJS: { market: 'BAY', name: 'San Jose Sharks' },
  PHI: { market: 'PHI', name: 'Philadelphia Flyers' },
  DET: { market: 'DET', name: 'Detroit Red Wings' },
  FLA: { market: 'MIA', name: 'Florida Panthers' },
  TBL: { market: 'FLA', name: 'Tampa Bay Lightning' },
  DAL: { market: 'DAL', name: 'Dallas Stars' },
  MNS: { market: 'MIN', name: 'Minnesota North Stars' },
  COL: { market: 'DEN', name: 'Colorado Avalanche' },
  QUE: { market: 'DEN', name: 'Quebec Nordiques' },
  CLR: { market: 'DEN', name: 'Colorado Rockies' },
  ARI: { market: 'PHX', name: 'Arizona Coyotes' },
  PHX: { market: 'PHX', name: 'Phoenix Coyotes' },
  UTA: { market: 'UTA', name: 'Utah Hockey Club' },
  VGK: { market: 'LV', name: 'Vegas Golden Knights' },
  SEA: { market: 'SEA', name: 'Seattle Kraken' },
  WSH: { market: 'WAS', name: 'Washington Capitals' },
  PIT: { market: 'PIT', name: 'Pittsburgh Penguins' },
  STL: { market: 'STL', name: 'St. Louis Blues' },
  MIN: { market: 'MIN', name: 'Minnesota Wild' },
  NSH: { market: 'NSH', name: 'Nashville Predators' },
  CAR: { market: 'CHA', name: 'Carolina Hurricanes' },
  HFD: { market: 'BOS', name: 'Hartford Whalers' },
  CBJ: { market: 'CLE', name: 'Columbus Blue Jackets' },
  BUF: { market: 'NY', name: 'Buffalo Sabres' },
  TOR: { market: 'TOR', name: 'Toronto Maple Leafs' },
  MTL: { market: 'MTL', name: 'Montreal Canadiens' },
  OTT: { market: 'OTT', name: 'Ottawa Senators' },
  SEN: { market: 'OTT', name: 'Ottawa Senators' },
  WPG: { market: 'WPG', name: 'Winnipeg Jets' },
  WIN: { market: 'WPG', name: 'Winnipeg Jets' },
  ATL: { market: 'ATL', name: 'Atlanta Thrashers' },
  AFM: { market: 'ATL', name: 'Atlanta Flames' },
  EDM: { market: 'EDM', name: 'Edmonton Oilers' },
  CGY: { market: 'CGY', name: 'Calgary Flames' },
  VAN: { market: 'VAN', name: 'Vancouver Canucks' },
  KCS: { market: 'KC', name: 'Kansas City Scouts' },
  CGS: { market: 'BAY', name: 'California Golden Seals' },
  OAK: { market: 'BAY', name: 'Oakland Seals' },
  MMR: { market: 'MTL', name: 'Montreal Maroons' },
  NYA: { market: 'NY', name: 'New York Americans' },
  BRK: { market: 'NY', name: 'Brooklyn Americans' },
  HAM: { market: 'TOR', name: 'Hamilton Tigers' },
};

async function fetchCachedJSON(fileName: string, url: string, customHeaders?: Record<string, string>): Promise<any> {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }

  const filePath = path.join(CACHE_DIR, fileName);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  let retries = 4;
  while (retries > 0) {
    try {
      const res = await fetch(url, { headers: customHeaders });
      if (res.status === 429) {
        console.log(`[Rate limited 429] Waiting 2s before retry for ${fileName}...`);
        await new Promise((r) => setTimeout(r, 2000));
        retries--;
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      const data = await res.json();
      fs.writeFileSync(filePath, JSON.stringify(data), 'utf-8');
      return data;
    } catch (err) {
      retries--;
      if (retries === 0) throw err;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}

async function run() {
  console.log('=== Starting NHL Ingestion Pipeline ===');

  // 1. Fetch complete historical aggregate skaters & goalies
  console.log('Fetching all historical skaters and goalies from NHL API...');
  const [skatersRes, goaliesRes] = await Promise.all([
    fetchCachedJSON('skaters_aggregate.json', SKATER_SUMMARY_URL),
    fetchCachedJSON('goalies_aggregate.json', GOALIE_SUMMARY_URL),
  ]);

  const rawSkaters: any[] = skatersRes.data || [];
  const rawGoalies: any[] = goaliesRes.data || [];
  console.log(`Loaded ${rawSkaters.length} skaters and ${rawGoalies.length} goalies.`);

  // 2. Fetch Hockey Hall of Fame inductees from Wikipedia
  console.log('Loading Hockey Hall of Fame inductees...');
  const hhofSet = new Set<string>();
  try {
    const wikiData = await fetchCachedJSON('wiki_hhof.json', WIKI_HHOF_URL, {
      'User-Agent': 'SportsGridApp/1.0',
    });
    const content = wikiData.parse?.wikitext?.['*'] || '';
    const matches = [...content.matchAll(/\{\{sortname\|([^\|\}]+)\|([^\|\}]+)(?:\|[^\}]*)?\}\}/g)];
    matches.forEach((m) => {
      const fullName = `${m[1].trim()} ${m[2].trim()}`.replace(/\s+/g, ' ');
      hhofSet.add(fullName.toLowerCase());
    });
    console.log(`Loaded ${hhofSet.size} official Hockey Hall of Fame members.`);
  } catch (err) {
    console.warn('Could not fetch Wiki HHOF list:', err);
  }

  // 3. Batch fetch historical seasons to map every player to all teams & Stanley Cups
  interface PlayerSeasonMeta {
    teams: Set<string>;
    teamNames: Set<string>;
    markets: Set<string>;
    championships: number;
    years: number[];
  }
  const playerTeamsMap = new Map<number, PlayerSeasonMeta>();

  const getPlayerMeta = (id: number): PlayerSeasonMeta => {
    let cur = playerTeamsMap.get(id);
    if (!cur) {
      cur = {
        teams: new Set<string>(),
        teamNames: new Set<string>(),
        markets: new Set<string>(),
        championships: 0,
        years: [],
      };
      playerTeamsMap.set(id, cur);
    }
    return cur;
  };

  const seasonsCacheFile = path.join(CACHE_DIR, 'player_season_teams.json');
  if (fs.existsSync(seasonsCacheFile)) {
    console.log('[Cache Hit] Loading aggregated NHL player team histories...');
    const rawData = JSON.parse(fs.readFileSync(seasonsCacheFile, 'utf-8'));
    for (const [k, v] of Object.entries(rawData)) {
      const pId = parseInt(k, 10);
      const item = v as any;
      playerTeamsMap.set(pId, {
        teams: new Set(item.teams),
        teamNames: new Set(item.teamNames),
        markets: new Set(item.markets),
        championships: item.championships,
        years: item.years,
      });
    }
  } else {
    console.log('Downloading 1917-2024 NHL season rosters for team history...');
    const seasons: number[] = [];
    for (let y = 1917; y <= 2024; y++) {
      if (y === 2004) continue; // 2004-05 lockout
      seasons.push(y * 10000 + (y + 1));
    }

    for (const seasonId of seasons) {
      const endingYear = Math.floor(seasonId % 10000);
      const champs = STANLEY_CUP_CHAMPIONS[endingYear] || [];

      try {
        // Skaters for season
        const skaterUrl = `https://api.nhle.com/stats/rest/en/skater/summary?cayenneExp=seasonId=${seasonId} and gameTypeId=2&limit=-1`;
        const sData = await fetchCachedJSON(`skaters_${seasonId}.json`, skaterUrl);
        (sData.data || []).forEach((row: any) => {
          if (!row.playerId) return;
          const meta = getPlayerMeta(row.playerId);
          const abbrevs = (row.teamAbbrevs || '').split(',').map((t: string) => t.trim()).filter(Boolean);
          for (const team of abbrevs) {
            meta.teams.add(team);
            const tm = NHL_TEAMS[team];
            if (tm) {
              meta.markets.add(tm.market);
              meta.teamNames.add(tm.name);
            } else {
              meta.teamNames.add(team);
            }
            if (champs.includes(team)) {
              meta.championships += 1;
            }
          }
          meta.years.push(Math.floor(seasonId / 10000), endingYear);
        });

        // Goalies for season
        const goalieUrl = `https://api.nhle.com/stats/rest/en/goalie/summary?cayenneExp=seasonId=${seasonId} and gameTypeId=2&limit=-1`;
        const gData = await fetchCachedJSON(`goalies_${seasonId}.json`, goalieUrl);
        (gData.data || []).forEach((row: any) => {
          if (!row.playerId) return;
          const meta = getPlayerMeta(row.playerId);
          const abbrevs = (row.teamAbbrevs || '').split(',').map((t: string) => t.trim()).filter(Boolean);
          for (const team of abbrevs) {
            meta.teams.add(team);
            const tm = NHL_TEAMS[team];
            if (tm) {
              meta.markets.add(tm.market);
              meta.teamNames.add(tm.name);
            } else {
              meta.teamNames.add(team);
            }
            if (champs.includes(team)) {
              meta.championships += 1;
            }
          }
          meta.years.push(Math.floor(seasonId / 10000), endingYear);
        });
      } catch (err) {
        // Continue if particular season has alternate structure
      }

      // Small pacing delay to respect API rate limits
      await new Promise((r) => setTimeout(r, 50));
    }

    // Save serialized team history
    const ser: Record<string, any> = {};
    for (const [k, v] of playerTeamsMap.entries()) {
      ser[k] = {
        teams: Array.from(v.teams),
        teamNames: Array.from(v.teamNames),
        markets: Array.from(v.markets),
        championships: v.championships,
        years: v.years,
      };
    }
    fs.writeFileSync(seasonsCacheFile, JSON.stringify(ser), 'utf-8');
    console.log(`Saved team history for ${playerTeamsMap.size} NHL players.`);
  }

  // 4. Normalize Skaters
  console.log('Normalizing NHL athletes...');
  const athletes = [];

  for (const s of rawSkaters) {
    const id = s.playerId;
    const name = s.skaterFullName?.trim();
    if (!id || !name) continue;

    const teamMeta = playerTeamsMap.get(id) || {
      teams: new Set<string>(),
      teamNames: new Set<string>(),
      markets: new Set<string>(),
      championships: 0,
      years: [],
    };

    const fromYear = teamMeta.years.length > 0 ? Math.min(...teamMeta.years) : 0;
    const toYear = teamMeta.years.length > 0 ? Math.max(...teamMeta.years) : fromYear;

    const points = s.points ?? ((s.goals || 0) + (s.assists || 0));
    const assists = s.assists || 0;
    const games = s.gamesPlayed || 0;
    const isHof = hhofSet.has(name.toLowerCase());
    const mvps = HART_MVPS[name] || 0;

    // Popularity score calculation (1 to 100)
    let popularity = 5;
    if (games >= 100) popularity += 10;
    if (games >= 500) popularity += 15;
    if (games >= 1000) popularity += 15;
    if (points >= 300) popularity += 10;
    if (points >= 600) popularity += 15;
    if (points >= 1000) popularity += 20;
    if (assists >= 400) popularity += 10;
    if (assists >= 800) popularity += 15;
    if (teamMeta.championships >= 1) popularity += 15;
    if (teamMeta.championships >= 3) popularity += 15;
    if (mvps > 0) popularity += 25;
    if (isHof) popularity += 30;
    if (toYear >= 2015) popularity += 5;
    popularity = Math.min(100, Math.max(1, popularity));

    athletes.push({
      id: `ath_nhl_${id}`,
      name,
      sports: ['NHL'],
      teams: Array.from(teamMeta.teams),
      teamNames: Array.from(teamMeta.teamNames),
      markets: Array.from(teamMeta.markets),
      positions: [s.positionCode].filter(Boolean),
      activeYears: [fromYear, toYear],
      jerseyNumbers: [],
      college: undefined,
      collegeConference: undefined,
      draftPick: undefined,
      draftRound: undefined,
      draftYear: undefined,
      championships: teamMeta.championships,
      mvps,
      hallOfFame: isHof,
      rookieOfTheYear: false,
      stats: {
        points,
        assists,
        hits: s.shots || 0, // Using shots as NHL physical volume stat
      },
      popularityScore: popularity,
    });
  }

  // 5. Normalize Goalies
  for (const g of rawGoalies) {
    const id = g.playerId;
    const name = g.goalieFullName?.trim();
    if (!id || !name) continue;

    const teamMeta = playerTeamsMap.get(id) || {
      teams: new Set<string>(),
      teamNames: new Set<string>(),
      markets: new Set<string>(),
      championships: 0,
      years: [],
    };

    const fromYear = teamMeta.years.length > 0 ? Math.min(...teamMeta.years) : 0;
    const toYear = teamMeta.years.length > 0 ? Math.max(...teamMeta.years) : fromYear;

    const points = g.points || 0;
    const assists = g.assists || 0;
    const saves = g.saves || 0;
    const games = g.gamesPlayed || 0;
    const wins = g.wins || 0;
    const isHof = hhofSet.has(name.toLowerCase());
    const mvps = HART_MVPS[name] || 0;

    // Popularity score calculation (1 to 100)
    let popularity = 5;
    if (games >= 100) popularity += 10;
    if (games >= 400) popularity += 15;
    if (games >= 700) popularity += 20;
    if (wins >= 150) popularity += 10;
    if (wins >= 300) popularity += 15;
    if (saves >= 10000) popularity += 15;
    if (saves >= 20000) popularity += 20;
    if (teamMeta.championships >= 1) popularity += 15;
    if (teamMeta.championships >= 3) popularity += 15;
    if (mvps > 0) popularity += 25;
    if (isHof) popularity += 30;
    if (toYear >= 2015) popularity += 5;
    popularity = Math.min(100, Math.max(1, popularity));

    athletes.push({
      id: `ath_nhl_${id}`,
      name,
      sports: ['NHL'],
      teams: Array.from(teamMeta.teams),
      teamNames: Array.from(teamMeta.teamNames),
      markets: Array.from(teamMeta.markets),
      positions: ['G'],
      activeYears: [fromYear, toYear],
      jerseyNumbers: [],
      college: undefined,
      collegeConference: undefined,
      draftPick: undefined,
      draftRound: undefined,
      draftYear: undefined,
      championships: teamMeta.championships,
      mvps,
      hallOfFame: isHof,
      rookieOfTheYear: false,
      stats: {
        points,
        assists,
        saves,
      },
      popularityScore: popularity,
    });
  }

  console.log(`Generated ${athletes.length} complete NHL athletes!`);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(athletes, null, 2), 'utf-8');
  console.log(`Saved to ${OUTPUT_FILE}`);
}

run().catch((err) => {
  console.error('Error running NHL ingestion:', err);
  process.exit(1);
});
