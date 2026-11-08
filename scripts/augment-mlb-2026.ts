/**
 * MLB 2022-2026 Live Augmentation Script
 * Connects to the official MLB Stats API (statsapi.mlb.com)
 * Fetches all players active from 2022 through 2026.
 *
 * Ingests:
 * - Brand new debuts (e.g. Paul Skenes, Bobby Witt Jr., Gunnar Henderson, Corbin Carroll, Elly De La Cruz, Adley Rutschman, etc.)
 * - Updates active years, teams, markets, World Series titles, MVPs, and stats for veteran players (e.g. Shohei Ohtani, Aaron Judge, Mookie Betts)
 *
 * Updates: src/data/athletes-mlb.json
 */

import fs from 'fs';
import path from 'path';
import { Athlete } from '../src/types';

const MLB_OUTPUT_FILE = path.join(process.cwd(), 'src', 'data', 'athletes-mlb.json');

// Metro mapping for MLB franchises
const TEAM_NAME_TO_MARKET: Record<string, { abbrev: string; market: string }> = {
  'New York Yankees': { abbrev: 'NYA', market: 'NY' },
  'New York Mets': { abbrev: 'NYN', market: 'NY' },
  'Boston Red Sox': { abbrev: 'BOS', market: 'BOS' },
  'Chicago Cubs': { abbrev: 'CHN', market: 'CHI' },
  'Chicago White Sox': { abbrev: 'CHA', market: 'CHI' },
  'Los Angeles Dodgers': { abbrev: 'LAN', market: 'LA' },
  'Los Angeles Angels': { abbrev: 'LAA', market: 'LA' },
  'San Francisco Giants': { abbrev: 'SFN', market: 'BAY' },
  'Oakland Athletics': { abbrev: 'OAK', market: 'BAY' },
  'Athletics': { abbrev: 'ATH', market: 'BAY' },
  'Philadelphia Phillies': { abbrev: 'PHI', market: 'PHI' },
  'Detroit Tigers': { abbrev: 'DET', market: 'DET' },
  'Houston Astros': { abbrev: 'HOU', market: 'HOU' },
  'Texas Rangers': { abbrev: 'TEX', market: 'DAL' },
  'Toronto Blue Jays': { abbrev: 'TOR', market: 'TOR' },
  'Baltimore Orioles': { abbrev: 'BAL', market: 'BAL' },
  'Washington Nationals': { abbrev: 'WAS', market: 'WAS' },
  'Atlanta Braves': { abbrev: 'ATL', market: 'ATL' },
  'St. Louis Cardinals': { abbrev: 'SLN', market: 'STL' },
  'Pittsburgh Pirates': { abbrev: 'PIT', market: 'PIT' },
  'Cincinnati Reds': { abbrev: 'CIN', market: 'CIN' },
  'Cleveland Guardians': { abbrev: 'CLE', market: 'CLE' },
  'Minnesota Twins': { abbrev: 'MIN', market: 'MIN' },
  'Miami Marlins': { abbrev: 'MIA', market: 'FLA' },
  'Tampa Bay Rays': { abbrev: 'TBA', market: 'FLA' },
  'San Diego Padres': { abbrev: 'SDN', market: 'SD' },
  'Seattle Mariners': { abbrev: 'SEA', market: 'SEA' },
  'Colorado Rockies': { abbrev: 'COL', market: 'DEN' },
  'Arizona Diamondbacks': { abbrev: 'ARI', market: 'PHX' },
  'Kansas City Royals': { abbrev: 'KCA', market: 'KC' },
  'Milwaukee Brewers': { abbrev: 'MIL', market: 'MIL' },
};

function matchConference(school?: string): string | undefined {
  if (!school) return undefined;
  const s = school.toLowerCase().trim();

  // SEC
  if (
    s.includes('lsu') ||
    s.includes('louisiana state') ||
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

  // Big Ten
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
    s.includes('purdue') ||
    s.includes('maryland') ||
    s.includes('rutgers')
  ) {
    return 'Big Ten';
  }

  // ACC
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
    s.includes('duke') ||
    s.includes('louisville')
  ) {
    return 'ACC';
  }

  // Pac-12
  if (
    s.includes('arizona') ||
    s.includes('california') ||
    s.includes('stanford') ||
    s.includes('oregon') ||
    s.includes('washington') ||
    s.includes('ucla') ||
    s.includes('usc') ||
    s.includes('oregon state')
  ) {
    return 'Pac-12';
  }

  // Big 12
  if (
    s.includes('texas') ||
    s.includes('oklahoma') ||
    s.includes('texas tech') ||
    s.includes('tcu') ||
    s.includes('baylor') ||
    s.includes('kansas') ||
    s.includes('oklahoma state') ||
    s.includes('west virginia')
  ) {
    return 'Big 12';
  }

  return undefined;
}

async function fetchJSON(url: string): Promise<any> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'SportsGridApp/1.0' },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${res.status}`);
  }
  return res.json();
}

async function run() {
  console.log('=== Ingesting MLB Modern Rosters (2022–2026) via MLB Stats API ===');

  // Load existing Lahman MLB athletes
  const existingRaw = fs.readFileSync(MLB_OUTPUT_FILE, 'utf-8');
  const existingAthletes: Athlete[] = JSON.parse(existingRaw);
  console.log(`Loaded ${existingAthletes.length} existing MLB athletes.`);

  const athletesByName = new Map<string, Athlete>();
  existingAthletes.forEach((a) => {
    athletesByName.set(a.name.toLowerCase().trim(), a);
  });

  // 1. Fetch all players active in seasons 2022 through 2026
  const seasons = [2022, 2023, 2024, 2025, 2026];
  const uniquePlayerIds = new Set<number>();

  for (const season of seasons) {
    console.log(`Fetching player directory for season ${season}...`);
    try {
      const data = await fetchJSON(`https://statsapi.mlb.com/api/v1/sports/1/players?season=${season}`);
      for (const p of data.people || []) {
        if (p.id) uniquePlayerIds.add(p.id);
      }
    } catch (err) {
      console.warn(`Warning fetching season ${season}:`, err);
    }
  }

  const allPlayerIds = Array.from(uniquePlayerIds);
  console.log(`Found ${allPlayerIds.length} unique MLB players across 2022–2026!`);

  // 2. Hydrate in batches of 50
  const BATCH_SIZE = 50;
  let processedCount = 0;
  let newDebutsCount = 0;
  let updatedVeteransCount = 0;

  for (let i = 0; i < allPlayerIds.length; i += BATCH_SIZE) {
    const batch = allPlayerIds.slice(i, i + BATCH_SIZE);
    const idsParam = batch.join(',');
    const url = `https://statsapi.mlb.com/api/v1/people?personIds=${idsParam}&hydrate=stats(group=[hitting,pitching],type=[career,yearByYear]),draft,awards,education`;

    try {
      const data = await fetchJSON(url);
      const people = data.people || [];

      for (const p of people) {
        if (!p.fullName) continue;

        const fullName = p.fullName.trim();
        const normName = fullName.toLowerCase();

        // Extract Debut & Active Years
        const debutYear = p.mlbDebutDate ? parseInt(p.mlbDebutDate.split('-')[0], 10) : 2022;
        // In the API, players on 2024-2026 rosters are active through 2026
        const activeFinalYear = 2026;

        // Extract Jersey Numbers
        const jerseys: number[] = [];
        if (p.primaryNumber) {
          const num = parseInt(p.primaryNumber, 10);
          if (!isNaN(num) && num >= 0 && num <= 99) {
            jerseys.push(num);
          }
        }

        // Extract Draft info
        const draftInfo = p.drafts?.[0];
        const draftPick = draftInfo?.pickNumber ? parseInt(String(draftInfo.pickNumber), 10) : undefined;
        const draftRound = draftInfo?.pickRound ? parseInt(String(draftInfo.pickRound), 10) : undefined;
        const draftYear = draftInfo?.year ? parseInt(String(draftInfo.year), 10) : undefined;

        // Extract College
        const college = draftInfo?.school?.name || p.education?.colleges?.[0]?.name;
        const collegeConf = matchConference(college);

        // Extract Awards
        const awards = p.awards || [];
        const isRoy = awards.some(
          (a: any) =>
            a.id === 'NLROY' ||
            a.id === 'ALROY' ||
            (a.name && a.name.includes('Rookie of the Year') && (a.name.includes('AL') || a.name.includes('NL')))
        );
        const mvpCount = awards.filter(
          (a: any) =>
            a.id === 'NLMVP' ||
            a.id === 'ALMVP' ||
            a.name === 'AL MVP' ||
            a.name === 'NL MVP'
        ).length;
        const wsChampionships = awards.filter((a: any) => a.name === 'World Series Championship').length;
        const isHof = awards.some((a: any) => a.name && a.name.includes('Hall of Fame'));

        // Extract Career Stats (Hits, Steals, Saves)
        let careerHits = 0;
        let careerSteals = 0;
        let careerSaves = 0;

        for (const statGroup of p.stats || []) {
          const careerSplit = statGroup.splits?.find((s: any) => s.type?.displayName === 'career');
          if (careerSplit?.stat) {
            if (statGroup.group?.displayName === 'hitting') {
              careerHits += careerSplit.stat.hits || 0;
              careerSteals += careerSplit.stat.stolenBases || 0;
            } else if (statGroup.group?.displayName === 'pitching') {
              careerSaves += careerSplit.stat.saves || 0;
            }
          }
        }

        // Extract Teams & Markets from yearByYear splits and currentTeam
        const teamsSet = new Set<string>();
        const teamNamesSet = new Set<string>();
        const marketsSet = new Set<string>();

        if (p.currentTeam?.name) {
          const curName = p.currentTeam.name;
          teamNamesSet.add(curName);
          const meta = TEAM_NAME_TO_MARKET[curName];
          if (meta) {
            teamsSet.add(meta.abbrev);
            marketsSet.add(meta.market);
          }
        }

        for (const statGroup of p.stats || []) {
          for (const split of statGroup.splits || []) {
            if (split.team?.name) {
              const tName = split.team.name;
              teamNamesSet.add(tName);
              const meta = TEAM_NAME_TO_MARKET[tName];
              if (meta) {
                teamsSet.add(meta.abbrev);
                marketsSet.add(meta.market);
              }
            }
          }
        }

        // Positions
        const positions = [p.primaryPosition?.abbreviation || 'P'];

        // Check if athlete already exists
        const existing = athletesByName.get(normName);

        if (existing) {
          // Update veteran player to 2026
          existing.activeYears[1] = Math.max(existing.activeYears[1], activeFinalYear);

          // Merge jerseys
          jerseys.forEach((j) => {
            if (!existing.jerseyNumbers.includes(j)) existing.jerseyNumbers.push(j);
          });

          // Merge draft
          if (!existing.draftPick && draftPick) existing.draftPick = draftPick;
          if (!existing.draftRound && draftRound) existing.draftRound = draftRound;
          if (!existing.draftYear && draftYear) existing.draftYear = draftYear;

          // Merge college
          if (!existing.college && college) existing.college = college;
          if (!existing.collegeConference && collegeConf) existing.collegeConference = collegeConf;

          // Merge teams & markets
          teamsSet.forEach((t) => {
            if (!existing.teams.includes(t)) existing.teams.push(t);
          });
          teamNamesSet.forEach((tn) => {
            if (!existing.teamNames.includes(tn)) existing.teamNames.push(tn);
          });
          marketsSet.forEach((m) => {
            if (!existing.markets.includes(m)) existing.markets.push(m);
          });

          // Update awards
          existing.championships = Math.max(existing.championships, wsChampionships);
          existing.mvps = Math.max(existing.mvps, mvpCount);
          if (isRoy) existing.rookieOfTheYear = true;
          if (isHof) existing.hallOfFame = true;

          // Update stats with career highs
          existing.stats.hits = Math.max(existing.stats.hits || 0, careerHits);
          existing.stats.steals = Math.max(existing.stats.steals || 0, careerSteals);
          existing.stats.saves = Math.max(existing.stats.saves || 0, careerSaves);

          updatedVeteransCount++;
        } else {
          // Calculate popularity score for new player
          let popularity = 20;
          if (isRoy) popularity += 35;
          if (mvpCount > 0) popularity += 40;
          if (draftPick === 1) popularity += 25;
          if (draftPick && draftPick <= 5) popularity += 15;
          if (careerHits >= 500) popularity += 15;
          if (careerSteals >= 100) popularity += 15;
          if (careerSaves >= 50) popularity += 20;
          if (wsChampionships > 0) popularity += 15;
          popularity = Math.min(95, Math.max(10, popularity));

          const newAthlete: Athlete = {
            id: `ath_mlb_live_${p.id}`,
            name: fullName,
            sports: ['MLB'],
            teams: Array.from(teamsSet),
            teamNames: Array.from(teamNamesSet),
            markets: Array.from(marketsSet),
            positions,
            activeYears: [debutYear, activeFinalYear],
            jerseyNumbers: jerseys,
            college,
            collegeConference: collegeConf,
            draftPick,
            draftRound,
            draftYear,
            championships: wsChampionships,
            mvps: mvpCount,
            hallOfFame: isHof,
            rookieOfTheYear: isRoy,
            stats: {
              hits: careerHits,
              steals: careerSteals,
              saves: careerSaves,
            },
            popularityScore: popularity,
          };

          athletesByName.set(normName, newAthlete);
          existingAthletes.push(newAthlete);
          newDebutsCount++;
        }
      }
    } catch (batchErr) {
      console.warn(`Error processing batch ${i}-${i + BATCH_SIZE}:`, batchErr);
    }

    processedCount += batch.length;
    if (processedCount % 500 === 0 || processedCount >= allPlayerIds.length) {
      console.log(`Progress: ${processedCount}/${allPlayerIds.length} players processed...`);
    }

    // Gentle 100ms throttle between batches
    await new Promise((r) => setTimeout(r, 100));
  }

  console.log(`\n=== Augmentation Complete! ===`);
  console.log(`New modern MLB players added (2022–2026): ${newDebutsCount}`);
  console.log(`Existing veterans updated with 2022–2026 data: ${updatedVeteransCount}`);
  console.log(`Total MLB athletes in database: ${existingAthletes.length}`);

  // Save back to JSON
  fs.writeFileSync(MLB_OUTPUT_FILE, JSON.stringify(existingAthletes, null, 2), 'utf-8');
  console.log(`Successfully saved updated records to ${MLB_OUTPUT_FILE}!`);
}

export async function augmentWithModernMLB() {
  return run();
}

if (require.main === module) {
  run().catch((err) => {
    console.error('Fatal error during MLB augmentation:', err);
    process.exit(1);
  });
}
