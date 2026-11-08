import fs from 'fs';
import path from 'path';
import { Athlete, Category } from '../src/types';
import { CATEGORIES } from '../src/data/categories';
import { doesAthleteMatchCell, getMetroSingleEventIntersection } from '../src/data/puzzles';

interface AuditResult {
  sport: string;
  totalAthletes: number;
  athletesWithEmptyTeams: string[];
  athletesWithEmptyMarkets: string[];
  athletesWithInvalidYears: string[];
  championsWithoutMarkets: string[];
  mvpsWithoutMarkets: string[];
  athletesWithMissingStats: string[];
  categoryZeroMatchCount: string[];
}

function auditDataset(sportName: string, filePath: string): AuditResult {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const athletes: Athlete[] = JSON.parse(raw);

  const emptyTeams: string[] = [];
  const emptyMarkets: string[] = [];
  const invalidYears: string[] = [];
  const champsNoMarkets: string[] = [];
  const mvpsNoMarkets: string[] = [];
  const missingStats: string[] = [];

  for (const a of athletes) {
    if (!a.teams || a.teams.length === 0) emptyTeams.push(`${a.name} (${a.id})`);
    if (!a.markets || a.markets.length === 0) emptyMarkets.push(`${a.name} (${a.id})`);

    if (!a.activeYears || a.activeYears.length !== 2 || a.activeYears[0] > a.activeYears[1] || a.activeYears[0] <= 1800) {
      invalidYears.push(`${a.name} (${a.id}): [${a.activeYears}]`);
    }

    if (a.championships > 0) {
      if (!a.championshipMarkets || a.championshipMarkets.length === 0) {
        champsNoMarkets.push(`${a.name} (${a.id}): champCount=${a.championships}`);
      }
    }

    if (a.mvps > 0) {
      if (!a.mvpMarkets || a.mvpMarkets.length === 0) {
        mvpsNoMarkets.push(`${a.name} (${a.id}): mvpCount=${a.mvps}`);
      }
    }

    if (!a.stats) {
      missingStats.push(`${a.name} (${a.id})`);
    }
  }

  // Check if any category has 0 matches across the entire sport
  const categoryZeroMatch: string[] = [];
  for (const [key, cat] of Object.entries(CATEGORIES)) {
    const matchCount = athletes.filter((a) => cat.matches(a)).length;
    if (matchCount === 0) {
      categoryZeroMatch.push(`${cat.name} (${cat.id})`);
    }
  }

  return {
    sport: sportName,
    totalAthletes: athletes.length,
    athletesWithEmptyTeams: emptyTeams,
    athletesWithEmptyMarkets: emptyMarkets,
    athletesWithInvalidYears: invalidYears,
    championsWithoutMarkets: champsNoMarkets,
    mvpsWithoutMarkets: mvpsNoMarkets,
    athletesWithMissingStats: missingStats,
    categoryZeroMatchCount: categoryZeroMatch,
  };
}

async function runFullAudit() {
  console.log('======================================================');
  console.log('   FULL BACKEND DATA & INTERSECTION LOGIC AUDIT');
  console.log('======================================================\n');

  const sports = [
    { name: 'MLB', file: path.join(process.cwd(), 'src', 'data', 'athletes-mlb.json') },
    { name: 'NBA', file: path.join(process.cwd(), 'src', 'data', 'athletes-nba.json') },
    { name: 'NFL', file: path.join(process.cwd(), 'src', 'data', 'athletes-nfl.json') },
    { name: 'NHL', file: path.join(process.cwd(), 'src', 'data', 'athletes-nhl.json') },
  ];

  let totalAthletesAllSports = 0;

  for (const s of sports) {
    const res = auditDataset(s.name, s.file);
    totalAthletesAllSports += res.totalAthletes;

    console.log(`\n--- [${res.sport}] AUDIT (${res.totalAthletes.toLocaleString()} Athletes) ---`);
    console.log(`  Empty teams: ${res.athletesWithEmptyTeams.length}`);
    if (res.athletesWithEmptyTeams.length > 0) console.log(`    Sample:`, res.athletesWithEmptyTeams.slice(0, 3));

    console.log(`  Empty markets: ${res.athletesWithEmptyMarkets.length}`);
    if (res.athletesWithEmptyMarkets.length > 0) console.log(`    Sample:`, res.athletesWithEmptyMarkets.slice(0, 3));

    console.log(`  Invalid activeYears: ${res.athletesWithInvalidYears.length}`);
    if (res.athletesWithInvalidYears.length > 0) console.log(`    Sample:`, res.athletesWithInvalidYears.slice(0, 3));

    console.log(`  Champions missing championshipMarkets: ${res.championsWithoutMarkets.length}`);
    if (res.championsWithoutMarkets.length > 0) console.log(`    Sample:`, res.championsWithoutMarkets.slice(0, 5));

    console.log(`  MVPs missing mvpMarkets: ${res.mvpsWithoutMarkets.length}`);
    if (res.mvpsWithoutMarkets.length > 0) console.log(`    Sample:`, res.mvpsWithoutMarkets.slice(0, 5));

    console.log(`  Missing stats object: ${res.athletesWithMissingStats.length}`);

    console.log(`  Categories with 0 matches in ${res.sport}: ${res.categoryZeroMatchCount.length}`);
  }

  console.log(`\n======================================================`);
  console.log(`TOTAL ATHLETES AUDITED: ${totalAthletesAllSports.toLocaleString()}`);
  console.log(`======================================================\n`);

  // Check intersection logic tests
  console.log('--- TESTING INTERSECTION LOGIC ---');

  // Test 1: Single event vs Cumulative
  const metroNY = CATEGORIES.METRO_NY;
  const champ1 = CATEGORIES.ACCOLADE_CHAMPION;
  const champ4 = CATEGORIES.ACCOLADE_MULTI_CHAMP_4;
  const mvp = CATEGORIES.ACCOLADE_MVP;
  const hof = CATEGORIES.ACCOLADE_HOF;

  const info1 = getMetroSingleEventIntersection(metroNY, champ1);
  const info4 = getMetroSingleEventIntersection(metroNY, champ4);
  const infoMvp = getMetroSingleEventIntersection(metroNY, mvp);
  const infoHof = getMetroSingleEventIntersection(metroNY, hof);

  console.log(`  NY x Won Championship -> SingleEvent: ${info1 !== null ? 'YES (Correct)' : 'FAIL'}`);
  console.log(`  NY x Won 4+ Championships -> SingleEvent: ${info4 === null ? 'NO (Correct: Cumulative Exempt)' : 'FAIL: Still enforcing single team'}`);
  console.log(`  NY x League MVP -> SingleEvent: ${infoMvp !== null ? 'YES (Correct)' : 'FAIL'}`);
  console.log(`  NY x Hall of Fame -> SingleEvent: ${infoHof === null ? 'NO (Correct: Cumulative Exempt)' : 'FAIL: Still enforcing single team'}`);
}

runFullAudit().catch(console.error);
