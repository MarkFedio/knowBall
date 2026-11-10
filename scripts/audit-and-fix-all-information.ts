import fs from 'fs';
import path from 'path';
import { Athlete } from '../src/types';
import { getMarketsForAthlete } from '../src/lib/marketResolver';
import { NFL_MVP_LIST, NFL_ROOKIE_OF_THE_YEAR_LIST, HISTORICAL_PRE1970_ROTY_LEGENDS } from './scrape-nfl';
import { CALDER_ROTY_SET } from './scrape-nhl';

const MLB_PATH = path.join(process.cwd(), 'src/data/athletes-mlb.json');
const NBA_PATH = path.join(process.cwd(), 'src/data/athletes-nba.json');
const NFL_PATH = path.join(process.cwd(), 'src/data/athletes-nfl.json');
const NHL_PATH = path.join(process.cwd(), 'src/data/athletes-nhl.json');

console.log('======================================================');
console.log('STARTING EXHAUSTIVE DATA ACCURACY & REPAIR AUDIT');
console.log('======================================================\n');

// ============================================================================
// 1. MLB AUDIT & REPAIR
// ============================================================================
console.log('--- Processing MLB Data ---');
const mlb: Athlete[] = JSON.parse(fs.readFileSync(MLB_PATH, 'utf8'));
let mlbFixed = 0;

for (const a of mlb) {
  // A. Null draftRound repair
  if (a.draftRound === null || (a.draftRound !== undefined && isNaN(a.draftRound))) {
    a.draftRound = a.draftPick && a.draftPick <= 45 ? 1 : 2;
    mlbFixed++;
  }

  // B. Ghost championships/mvps
  if ((!a.championships || a.championships === 0) && a.championshipMarkets && a.championshipMarkets.length > 0) {
    a.championshipMarkets = [];
    mlbFixed++;
  }
  if ((!a.mvps || a.mvps === 0) && a.mvpMarkets && a.mvpMarkets.length > 0) {
    a.mvpMarkets = [];
    mlbFixed++;
  }

  // C. Modern and Era Committee Hall of Fame sync
  const ERA_COMMITTEE_HOF = new Set([
    'ath_mlb_baineha01', // Harold Baines (2019)
    'ath_mlb_smithle02', // Lee Smith (2019)
    'ath_mlb_simmote01', // Ted Simmons (2020)
    'ath_mlb_hodgegi01', // Gil Hodges (2022)
    'ath_mlb_kaatji01',  // Jim Kaat (2022)
    'ath_mlb_minosmi01', // Minnie Miñoso (2022)
    'ath_mlb_olivato01', // Tony Oliva (2022)
    'ath_mlb_allendi01', // Dick Allen (2025)
    'ath_mlb_parkeda01', // Dave Parker (2025)
  ]);
  if (ERA_COMMITTEE_HOF.has(a.id) && !a.hallOfFame) {
    a.hallOfFame = true;
    mlbFixed++;
  }

  // D. Empty positions repair
  if (!a.positions || a.positions.length === 0) {
    if (a.name === 'Jeff Banister') a.positions = ['C', 'PH'];
    else if (a.name === 'John Bormann' || a.name === 'Jack Aragon' || a.name === 'Red Barbary') a.positions = ['C'];
    else if (a.name === 'Elmer Bowman' || a.name === 'Bill Batsch' || a.name === 'Red Bluhm') a.positions = ['1B'];
    else if (a.name === 'Doc Bass' || a.name === 'Ivan Bigler') a.positions = ['OF'];
    else a.positions = ['PH'];
    mlbFixed++;
  }

  // E. College string formatting
  if (a.college) {
    const clean = a.college.replace(/[\x22\x27\\]/g, '').trim();
    if (clean !== a.college) {
      a.college = clean;
      mlbFixed++;
    }
    // Remove false conference on community colleges
    const lower = clean.toLowerCase();
    if (
      (lower.includes('community college') || lower.includes('junior college') || lower.includes(' cc') || lower.includes(' jc')) &&
      !lower.includes(';') &&
      !lower.includes(',')
    ) {
      if (a.collegeConference) {
        a.collegeConference = undefined;
        mlbFixed++;
      }
    }
  }

  // F. Markets refresh
  a.markets = Array.from(getMarketsForAthlete(a));
}

fs.writeFileSync(MLB_PATH, JSON.stringify(mlb, null, 2), 'utf8');
console.log(`MLB finished: updated ${mlbFixed} data fields.\n`);

// ============================================================================
// 2. NBA AUDIT & REPAIR
// ============================================================================
console.log('--- Processing NBA Data ---');
const nba: Athlete[] = JSON.parse(fs.readFileSync(NBA_PATH, 'utf8'));
let nbaFixed = 0;

for (const a of nba) {
  // A. Ghost championships/mvps
  if ((!a.championships || a.championships === 0) && a.championshipMarkets && a.championshipMarkets.length > 0) {
    a.championshipMarkets = [];
    nbaFixed++;
  }
  if ((!a.mvps || a.mvps === 0) && a.mvpMarkets && a.mvpMarkets.length > 0) {
    a.mvpMarkets = [];
    nbaFixed++;
  }

  // B. Historical franchise championship markets fix
  if (a.championshipMarkets && a.championshipMarkets.length > 0) {
    const updated = a.championshipMarkets.map((m) => {
      // Rochester Royals 1951: won in Rochester (BUF), not Sacramento (SAC)
      if (m === 'SAC' && a.teams.includes('ROC')) return 'BUF';
      // Syracuse Nationals 1955: won in Syracuse (BUF), not Philadelphia (PHI)
      if (m === 'PHI' && a.teams.includes('SYR') && !a.teams.includes('PHI') && !a.teams.includes('PHW')) return 'BUF';
      // St. Louis Hawks 1958: won in St. Louis (STL), not Atlanta (ATL)
      if (m === 'ATL' && a.teams.includes('STL') && !a.teams.includes('ATL')) return 'STL';
      return m;
    });
    if (JSON.stringify(updated) !== JSON.stringify(a.championshipMarkets)) {
      a.championshipMarkets = updated;
      nbaFixed++;
    }
  }

  // C. Historical MVP markets fix
  if (a.mvpMarkets && a.mvpMarkets.length > 0) {
    const updated = a.mvpMarkets.map((m) => {
      // Bob Pettit 1956, 1959 MVPs with St. Louis Hawks
      if (m === 'ATL' && a.teams.includes('STL')) return 'STL';
      // Oscar Robertson 1964 MVP with Cincinnati Royals
      if (m === 'SAC' && a.teams.includes('CIN')) return 'CIN';
      return m;
    });
    if (JSON.stringify(updated) !== JSON.stringify(a.mvpMarkets)) {
      a.mvpMarkets = updated;
      nbaFixed++;
    }
  }

  // D. Empty positions repair
  if (!a.positions || a.positions.length === 0) {
    if (a.name === 'Hayden Gray') {
      a.positions = ['PG', 'SG'];
    } else {
      const ast = a.stats?.assists ?? 0;
      const pts = Math.max(1, a.stats?.points ?? 1);
      const ratio = ast / pts;
      if (ratio > 0.18) a.positions = ['PG', 'SG'];
      else if (ratio > 0.1) a.positions = ['SG', 'SF'];
      else a.positions = ['SF', 'PF'];
    }
    nbaFixed++;
  }

  // E. College string formatting
  if (a.college) {
    const clean = a.college.replace(/[\x22\x27\\]/g, '').trim();
    if (clean !== a.college) {
      a.college = clean;
      nbaFixed++;
    }
    const lower = clean.toLowerCase();
    if (
      (lower.includes('community college') || lower.includes('junior college') || lower.includes(' cc') || lower.includes(' jc')) &&
      !lower.includes(';') &&
      !lower.includes(',')
    ) {
      if (a.collegeConference) {
        a.collegeConference = undefined;
        nbaFixed++;
      }
    }
  }

  // F. Markets refresh
  a.markets = Array.from(getMarketsForAthlete(a));
}

fs.writeFileSync(NBA_PATH, JSON.stringify(nba, null, 2), 'utf8');
console.log(`NBA finished: updated ${nbaFixed} data fields.\n`);

// ============================================================================
// 3. NFL AUDIT & REPAIR
// ============================================================================
console.log('--- Processing NFL Data ---');
const nfl: Athlete[] = JSON.parse(fs.readFileSync(NFL_PATH, 'utf8'));
let nflFixed = 0;

// Ensure pre-1970 ROTY legends are present
const existingNflIds = new Set(nfl.map((a) => a.id));
for (const leg of HISTORICAL_PRE1970_ROTY_LEGENDS) {
  if (!existingNflIds.has(leg.id!)) {
    const athlete = leg as Athlete;
    athlete.markets = Array.from(getMarketsForAthlete(athlete));
    nfl.push(athlete);
    existingNflIds.add(leg.id!);
    nflFixed++;
  }
}

for (const a of nfl) {
  // A. Ghost championships/mvps & missing mvpMarkets
  if ((!a.championships || a.championships === 0) && a.championshipMarkets && a.championshipMarkets.length > 0) {
    a.championshipMarkets = [];
    nflFixed++;
  }
  if ((!a.mvps || a.mvps === 0) && a.mvpMarkets && a.mvpMarkets.length > 0) {
    a.mvpMarkets = [];
    nflFixed++;
  }
  if (a.mvps > 0 && (!a.mvpMarkets || a.mvpMarkets.length === 0)) {
    const match = NFL_MVP_LIST.find((m) => m.name.toLowerCase() === a.name.toLowerCase());
    if (match) {
      a.mvpMarkets = [...match.markets];
      nflFixed++;
    }
  }

  // B. Green Bay & Buffalo MVP markets fix
  if (a.mvpMarkets && a.mvpMarkets.length > 0) {
    const updated = a.mvpMarkets.map((m) => {
      // Green Bay Packers MVPs (Favre, Rodgers, Hornung, Hutson, Taylor)
      if (m === 'MIL' && a.teams.includes('GB')) return 'GB';
      // Buffalo Bills MVPs (O.J. Simpson, Thurman Thomas, Jack Kemp)
      if (m === 'NY' && a.teams.includes('BUF') && !a.teams.includes('NYG') && !a.teams.includes('NYJ')) return 'BUF';
      return m;
    });
    if (JSON.stringify(updated) !== JSON.stringify(a.mvpMarkets)) {
      a.mvpMarkets = updated;
      nflFixed++;
    }
  }

  // C. Green Bay & Buffalo championship markets fix
  if (a.championshipMarkets && a.championshipMarkets.length > 0) {
    const updated = a.championshipMarkets.map((m) => {
      // Green Bay Packers champions
      if (m === 'MIL' && a.teams.includes('GB')) return 'GB';
      // Buffalo Bills champions (Billy Shaw)
      if (m === 'NY' && a.teams.includes('BUF') && !a.teams.includes('NYG') && !a.teams.includes('NYJ')) return 'BUF';
      return m;
    });
    if (JSON.stringify(updated) !== JSON.stringify(a.championshipMarkets)) {
      a.championshipMarkets = updated;
      nflFixed++;
    }
  }

  // D. College string formatting
  if (a.college) {
    const clean = a.college.replace(/[\x22\x27\\]/g, '').trim();
    if (clean !== a.college) {
      a.college = clean;
      nflFixed++;
    }
    const lower = clean.toLowerCase();
    if (
      (lower.includes('community college') || lower.includes('junior college') || lower.includes(' cc') || lower.includes(' jc')) &&
      !lower.includes(';') &&
      !lower.includes(',')
    ) {
      if (a.collegeConference) {
        a.collegeConference = undefined;
        nflFixed++;
      }
    }
  }

  // E. Rookie of the Year sync
  const aNorm = a.name.toLowerCase().replace(/[^a-z]/g, '');
  const rotyMatch = NFL_ROOKIE_OF_THE_YEAR_LIST.find((r) => {
    const names = [r.name, ...(r.aliases || [])].map((n) => n.toLowerCase().replace(/[^a-z]/g, ''));
    if (!names.includes(aNorm)) return false;
    return (
      (r.year >= a.activeYears[0] - 2 && r.year <= a.activeYears[1] + 2) ||
      (r.year <= a.activeYears[1] && r.year >= a.activeYears[0] - 12)
    );
  });
  if (rotyMatch) {
    if (!a.rookieOfTheYear) {
      a.rookieOfTheYear = true;
      nflFixed++;
    }
    if (rotyMatch.year < a.activeYears[0]) {
      a.activeYears[0] = rotyMatch.year;
      nflFixed++;
    }
  }

  // F. Markets refresh
  a.markets = Array.from(getMarketsForAthlete(a));
}

fs.writeFileSync(NFL_PATH, JSON.stringify(nfl, null, 2), 'utf8');
console.log(`NFL finished: updated ${nflFixed} data fields.\n`);

// ============================================================================
// 4. NHL AUDIT & REPAIR
// ============================================================================
console.log('--- Processing NHL Data ---');
const nhl: Athlete[] = JSON.parse(fs.readFileSync(NHL_PATH, 'utf8'));
let nhlFixed = 0;

for (const a of nhl) {
  // A. Ghost championships/mvps
  if ((!a.championships || a.championships === 0) && a.championshipMarkets && a.championshipMarkets.length > 0) {
    a.championshipMarkets = [];
    nhlFixed++;
  }
  if ((!a.mvps || a.mvps === 0) && a.mvpMarkets && a.mvpMarkets.length > 0) {
    a.mvpMarkets = [];
    nhlFixed++;
  }

  // B. Vegas Golden Knights championship markets ('VGK' -> 'LV')
  if (a.championshipMarkets && a.championshipMarkets.includes('VGK')) {
    a.championshipMarkets = a.championshipMarkets.map((m) => (m === 'VGK' ? 'LV' : m));
    nhlFixed++;
  }

  // C. Dominik Hasek Buffalo MVP market ('NY' -> 'BUF')
  if (a.name === 'Dominik Hasek' && a.mvpMarkets && a.mvpMarkets.includes('NY')) {
    a.mvpMarkets = a.mvpMarkets.map((m) => (m === 'NY' ? 'BUF' : m));
    nhlFixed++;
  }

  // D. Erroneous Paul Thompson MVP removal (2015-2017 player)
  if (a.id === 'ath_nhl_8476200') {
    a.mvps = 0;
    a.mvpMarkets = [];
    nhlFixed++;
  }

  // E. College string formatting
  if (a.college) {
    const clean = a.college.replace(/[\x22\x27\\]/g, '').trim();
    if (clean !== a.college) {
      a.college = clean;
      nhlFixed++;
    }
  }

  // F. Calder Memorial Trophy (Rookie of the Year) sync
  const nameNorm = a.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '');
  if (CALDER_ROTY_SET.has(nameNorm) && !a.rookieOfTheYear) {
    a.rookieOfTheYear = true;
    nhlFixed++;
  }

  // G. Markets refresh
  a.markets = Array.from(getMarketsForAthlete(a));
}

fs.writeFileSync(NHL_PATH, JSON.stringify(nhl, null, 2), 'utf8');
console.log(`NHL finished: updated ${nhlFixed} data fields.\n`);

console.log('======================================================');
console.log('ALL FOUR DATABASES REPAIRED AND SYNCHRONIZED CLEANLY');
console.log('======================================================');
