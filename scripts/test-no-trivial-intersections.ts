import { ATHLETES } from '../src/data/athletes';
import { CATEGORIES } from '../src/data/categories';
import { DAILY_PUZZLE } from '../src/data/puzzles';
import {
  validatePuzzleSolvability,
  generateProceduralPuzzle,
  areCategoriesTriviallyRedundant,
} from '../src/lib/gridGenerator';

console.log('=== TEST 1: Validate DAILY_PUZZLE ===');
const dailyReport = validatePuzzleSolvability(
  DAILY_PUZZLE.rowCategories,
  DAILY_PUZZLE.colCategories,
  ATHLETES,
  4
);
console.log('DAILY_PUZZLE isSolvable:', dailyReport.isSolvable);
console.log('DAILY_PUZZLE minAnswers:', dailyReport.minAnswers);
console.log('DAILY_PUZZLE emptyCells:', dailyReport.emptyCells);
console.log('DAILY_PUZZLE redundantCells:', dailyReport.redundantCells);

if (!dailyReport.isSolvable || dailyReport.redundantCells.length > 0) {
  console.error('FAIL: DAILY_PUZZLE has issues!');
  process.exit(1);
} else {
  console.log('PASS: DAILY_PUZZLE is 100% solvable with 0 redundant cells!\n');
}

console.log('=== TEST 2: Validate areCategoriesTriviallyRedundant on known conflict pairs ===');
const conflicts = [
  { a: CATEGORIES.CAREER_6_TEAMS, b: CATEGORIES.CAREER_2_TEAMS, desc: '6+ Franchises x 2+ Franchises' },
  { a: CATEGORIES.CAREER_3_TEAMS, b: CATEGORIES.CAREER_4_TEAMS, desc: '3+ Franchises x 4+ Franchises' },
  { a: CATEGORIES.CAREER_ONE_FRANCHISE, b: CATEGORIES.CAREER_2_TEAMS, desc: '1 Franchise x 2+ Franchises' },
  { a: CATEGORIES.ACCOLADE_MULTI_CHAMP_4, b: CATEGORIES.ACCOLADE_CHAMPION, desc: 'Won 4+ Championships x Won Championship' },
  { a: CATEGORIES.ACCOLADE_MULTI_CHAMP_2, b: CATEGORIES.ACCOLADE_MULTI_CHAMP, desc: 'Won 2+ Championships x Won 3+ Championships' },
  { a: CATEGORIES.STAT_POINTS_1K, b: CATEGORIES.STAT_POINTS_500, desc: '1,000+ Points x 500+ Points' },
  { a: CATEGORIES.STAT_STEALS_250, b: CATEGORIES.STAT_STEALS_100, desc: '250+ Steals x 100+ Steals' },
  { a: CATEGORIES.ERA_15_SEASONS, b: CATEGORIES.ERA_8_SEASONS, desc: '15+ Seasons x 8+ Seasons' },
  { a: CATEGORIES.NUMBER_0_TO_9, b: CATEGORIES.NUMBER_10_TO_19, desc: 'Jersey 0-9 x Jersey 10-19' },
];

for (const { a, b, desc } of conflicts) {
  const result = areCategoriesTriviallyRedundant(a, b, ATHLETES);
  if (!result.isRedundant) {
    console.error(`FAIL: Expected conflict for ${desc}, but got not redundant!`);
    process.exit(1);
  } else {
    console.log(`PASS: Correctly rejected ${desc} (${result.reason})`);
  }
}

console.log('\n=== TEST 3: Generate 100 Procedural Boards and Assert Zero Redundancy ===');
let successfulBoards = 0;
let totalCellsTested = 0;

for (let i = 1; i <= 100; i++) {
  const puzzle = generateProceduralPuzzle(ATHLETES);
  const report = validatePuzzleSolvability(puzzle.rowCategories, puzzle.colCategories, ATHLETES, 4);

  if (!report.isSolvable) {
    console.error(`FAIL: Board #${i} is not solvable! Empty: ${report.emptyCells.length}, Redundant: ${report.redundantCells.length}`);
    process.exit(1);
  }

  if (report.redundantCells.length > 0) {
    console.error(`FAIL: Board #${i} has redundant cells!`, report.redundantCells);
    process.exit(1);
  }

  totalCellsTested += 16;
  successfulBoards++;
  if (i % 20 === 0) {
    console.log(`  Progress: ${i}/100 boards generated and verified...`);
  }
}

console.log(`PASS: Successfully generated ${successfulBoards}/100 procedural boards!`);
console.log(`PASS: Tested ${totalCellsTested} cells — ZERO trivial intersections or redundant categories found!`);
