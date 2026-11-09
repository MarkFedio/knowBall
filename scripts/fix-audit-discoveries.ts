import fs from 'fs';
import path from 'path';
import { Athlete } from '../src/types';
import { MASTER_TEAM_TO_MARKET, getMarketsForAthlete } from '../src/lib/marketResolver';

const MLB_PATH = path.join(process.cwd(), 'src/data/athletes-mlb.json');
const NBA_PATH = path.join(process.cwd(), 'src/data/athletes-nba.json');
const NFL_PATH = path.join(process.cwd(), 'src/data/athletes-nfl.json');
const NHL_PATH = path.join(process.cwd(), 'src/data/athletes-nhl.json');

console.log('Starting comprehensive fix and synchronization of audit discoveries...');

// 1. Clean NFL names
const nfl: Athlete[] = JSON.parse(fs.readFileSync(NFL_PATH, 'utf8'));
let nflFixed = 0;
for (const a of nfl) {
  if (a.name === 'Elroy (Crazylegs) Hirsch') {
    a.name = 'Elroy Hirsch';
    nflFixed++;
  } else if (a.name === 'Al\'zillion "AZ" Hamilton') {
    a.name = "Al'zillion Hamilton";
    nflFixed++;
  }
}
console.log(`NFL names cleaned: ${nflFixed}`);

// 2. Deduplicate and merge 22 NHL duplicate records
const nhl: Athlete[] = JSON.parse(fs.readFileSync(NHL_PATH, 'utf8'));
const nhlMap = new Map<string, Athlete>();
let nhlMerged = 0;

for (const a of nhl) {
  if (!nhlMap.has(a.id)) {
    nhlMap.set(a.id, a);
  } else {
    // Duplicate found: merge into existing record
    const existing = nhlMap.get(a.id)!;
    // Prefer the record with higher points or more detailed stats
    const existingPts = existing.stats?.points ?? 0;
    const newPts = a.stats?.points ?? 0;

    const primary = newPts > existingPts ? a : existing;
    const secondary = newPts > existingPts ? existing : a;

    // Combine positions
    const posSet = new Set([...primary.positions, ...secondary.positions]);
    primary.positions = Array.from(posSet);

    // Merge non-zero stats
    if (secondary.stats) {
      primary.stats = {
        ...primary.stats,
        saves: (primary.stats?.saves ?? 0) || secondary.stats.saves || undefined,
        wins: (primary.stats?.wins ?? 0) || secondary.stats.wins || undefined,
      };
    }

    // Ensure highest popularity score
    primary.popularityScore = Math.max(primary.popularityScore ?? 0, secondary.popularityScore ?? 0);

    nhlMap.set(a.id, primary);
    nhlMerged++;
  }
}

const cleanedNhl = Array.from(nhlMap.values());
console.log(`NHL duplicates merged: ${nhlMerged}. Clean NHL count: ${cleanedNhl.length}`);

// 3. Synchronize athlete.markets across all 4 files using full market resolver
const mlb: Athlete[] = JSON.parse(fs.readFileSync(MLB_PATH, 'utf8'));
const nba: Athlete[] = JSON.parse(fs.readFileSync(NBA_PATH, 'utf8'));

function updateMarkets(list: Athlete[], sport: string): number {
  let updated = 0;
  for (const a of list) {
    const resolved = Array.from(getMarketsForAthlete(a));
    const current = new Set(a.markets || []);
    let changed = false;
    for (const m of resolved) {
      if (!current.has(m)) {
        current.add(m);
        changed = true;
      }
    }
    if (changed) {
      a.markets = Array.from(current);
      updated++;
    }
  }
  console.log(`${sport}: Updated markets for ${updated} athletes.`);
  return updated;
}

updateMarkets(mlb, 'MLB');
updateMarkets(nba, 'NBA');
updateMarkets(nfl, 'NFL');
updateMarkets(cleanedNhl, 'NHL');

// Write back all files
fs.writeFileSync(MLB_PATH, JSON.stringify(mlb, null, 2), 'utf8');
fs.writeFileSync(NBA_PATH, JSON.stringify(nba, null, 2), 'utf8');
fs.writeFileSync(NFL_PATH, JSON.stringify(nfl, null, 2), 'utf8');
fs.writeFileSync(NHL_PATH, JSON.stringify(cleanedNhl, null, 2), 'utf8');

console.log('All 4 databases successfully updated and written to disk.');
