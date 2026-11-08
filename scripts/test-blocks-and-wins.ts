import { CATEGORIES } from '../src/data/categories';
import { generateProceduralPuzzle } from '../src/lib/gridGenerator';
import { Athlete } from '../src/types';
import fs from 'fs';
import path from 'path';

console.log('=== VERIFYING BLOCKS AND WINS CATEGORIES & PROCEDURAL GENERATION ===\n');

// Load all athletes
const nba: Athlete[] = JSON.parse(fs.readFileSync('src/data/athletes-nba.json', 'utf-8'));
const nhl: Athlete[] = JSON.parse(fs.readFileSync('src/data/athletes-nhl.json', 'utf-8'));
const mlb: Athlete[] = JSON.parse(fs.readFileSync('src/data/athletes-mlb.json', 'utf-8'));
const nfl: Athlete[] = JSON.parse(fs.readFileSync('src/data/athletes-nfl.json', 'utf-8'));

const allAthletes = [...nba, ...nhl, ...mlb, ...nfl];
console.log(`Total Athletes Loaded: ${allAthletes.length}`);

// 1. Verify Blocks Categories
console.log('\n--- 1. Testing BLOCKS Categories ---');
const blockTiers = [
  CATEGORIES.STAT_BLOCKS_500,
  CATEGORIES.STAT_BLOCKS_1000,
  CATEGORIES.STAT_BLOCKS_1500,
  CATEGORIES.STAT_BLOCKS_2000,
];

for (const cat of blockTiers) {
  const nbaMatches = nba.filter(cat.matches);
  const nhlMatches = nhl.filter(cat.matches);
  console.log(
    `[${cat.name}]: Total = ${nbaMatches.length + nhlMatches.length} (NBA: ${nbaMatches.length}, NHL: ${nhlMatches.length})`
  );
  console.log(`   Sample NBA: ${nbaMatches.slice(0, 3).map((a) => `${a.name} (${a.stats.blocks})`).join(', ')}`);
  console.log(`   Sample NHL: ${nhlMatches.slice(0, 3).map((a) => `${a.name} (${a.stats.blocks})`).join(', ')}`);
}

// 2. Verify Wins Categories
console.log('\n--- 2. Testing WINS Categories ---');
const winTiers = [
  CATEGORIES.STAT_WINS_50,
  CATEGORIES.STAT_WINS_100,
  CATEGORIES.STAT_WINS_150,
  CATEGORIES.STAT_WINS_200,
  CATEGORIES.STAT_WINS_300,
];

for (const cat of winTiers) {
  const mlbMatches = mlb.filter(cat.matches);
  const nhlMatches = nhl.filter(cat.matches);
  const nflMatches = nfl.filter(cat.matches);
  const total = mlbMatches.length + nhlMatches.length + nflMatches.length;
  console.log(
    `[${cat.name}]: Total = ${total} (MLB: ${mlbMatches.length}, NHL: ${nhlMatches.length}, NFL: ${nflMatches.length})`
  );
  console.log(`   Sample MLB: ${mlbMatches.slice(0, 3).map((a) => `${a.name} (${a.stats.wins})`).join(', ')}`);
  console.log(`   Sample NHL: ${nhlMatches.slice(0, 3).map((a) => `${a.name} (${a.stats.wins})`).join(', ')}`);
  if (nflMatches.length > 0) {
    console.log(`   Sample NFL: ${nflMatches.slice(0, 3).map((a) => `${a.name} (${a.stats.wins})`).join(', ')}`);
  }
}

// 3. Test Procedural Puzzle Generation with New Categories
console.log('\n--- 3. Testing Procedural Puzzle Generation (20 boards) ---');
let boardsWithBlocks = 0;
let boardsWithWins = 0;

for (let i = 1; i <= 20; i++) {
  const puzzle = generateProceduralPuzzle(allAthletes);
  const allCatIds = [...puzzle.rowCategories, ...puzzle.colCategories].map((c) => c.id);
  const hasBlocks = allCatIds.some((id) => id.includes('blocks'));
  const hasWins = allCatIds.some((id) => id.includes('wins'));
  if (hasBlocks) boardsWithBlocks++;
  if (hasWins) boardsWithWins++;

  // Verify every cell has at least 1 solution
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const rowCat = puzzle.rowCategories[r];
      const colCat = puzzle.colCategories[c];
      const valid = allAthletes.filter((a) => rowCat.matches(a) && colCat.matches(a));
      if (valid.length === 0) {
        throw new Error(`Deadlock cell at [${rowCat.name}] x [${colCat.name}]`);
      }
    }
  }
}

console.log(`Generated 20 procedural puzzles successfully!`);
console.log(`- Puzzles with Blocks category: ${boardsWithBlocks}/20`);
console.log(`- Puzzles with Wins category: ${boardsWithWins}/20`);
console.log(`- All 320 grid cells verified 100% solvable with >0 valid athletes!`);

console.log('\n=== ALL TESTS PASSED! ===');
