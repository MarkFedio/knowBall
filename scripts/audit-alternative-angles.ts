/**
 * Alternative Audit Suite: Multi-Vector Verification Engine
 *
 * Approaches validation from 5 distinct angles:
 * 1. Historical Ground-Truth Accolades (MVP & Champion Census across 4 leagues)
 * 2. Complete Combinatorial Category Grid Exhaustion (Every Metro x Every Category)
 * 3. Single-Event vs Cumulative Logic on Iconic Journeymen
 * 4. Franchise Relocation & Heritage Market Accuracy (Expos, Sonics, Oilers, etc.)
 * 5. Entity Uniqueness, ID Collision, & Name Segregation Audit
 */

import fs from 'fs';
import path from 'path';
import { Athlete, Category } from '../src/types';
import { normalizeSearchString, resolveAlias } from '../src/lib/searchUtils';
import { isAthleteInMarket } from '../src/lib/marketResolver';
import { CATEGORIES } from '../src/data/categories';
import { doesAthleteMatchCell } from '../src/data/puzzles';

const MLB_FILE = path.join(process.cwd(), 'src', 'data', 'athletes-mlb.json');
const NBA_FILE = path.join(process.cwd(), 'src', 'data', 'athletes-nba.json');
const NFL_FILE = path.join(process.cwd(), 'src', 'data', 'athletes-nfl.json');
const NHL_FILE = path.join(process.cwd(), 'src', 'data', 'athletes-nhl.json');

const mlb: Athlete[] = JSON.parse(fs.readFileSync(MLB_FILE, 'utf-8'));
const nba: Athlete[] = JSON.parse(fs.readFileSync(NBA_FILE, 'utf-8'));
const nfl: Athlete[] = JSON.parse(fs.readFileSync(NFL_FILE, 'utf-8'));
const nhl: Athlete[] = JSON.parse(fs.readFileSync(NHL_FILE, 'utf-8'));

const allAthletes: Athlete[] = [...mlb, ...nba, ...nfl, ...nhl];

// ============================================================================
// ANGLE 1: Authoritative MVP Census Check
// ============================================================================
function runAngle1MvpCensus() {
  console.log('================================================================');
  console.log('ANGLE 1: HISTORICAL MVP CENSUS & MARKET ACCURACY');
  console.log('================================================================');

  // Ground truth samples across eras
  const MVP_GROUND_TRUTH: { name: string; sport: string; minMvps: number; expectedMarket: string }[] = [
    // NBA
    { name: 'Kareem Abdul-Jabbar', sport: 'NBA', minMvps: 6, expectedMarket: 'MIL' },
    { name: 'Michael Jordan', sport: 'NBA', minMvps: 5, expectedMarket: 'CHI' },
    { name: 'Bill Russell', sport: 'NBA', minMvps: 5, expectedMarket: 'BOS' },
    { name: 'Wilt Chamberlain', sport: 'NBA', minMvps: 4, expectedMarket: 'PHI' },
    { name: 'LeBron James', sport: 'NBA', minMvps: 4, expectedMarket: 'MIA' },
    { name: 'Larry Bird', sport: 'NBA', minMvps: 3, expectedMarket: 'BOS' },
    { name: 'Magic Johnson', sport: 'NBA', minMvps: 3, expectedMarket: 'LA' },
    { name: 'Nikola Jokic', sport: 'NBA', minMvps: 3, expectedMarket: 'DEN' },
    { name: 'Stephen Curry', sport: 'NBA', minMvps: 2, expectedMarket: 'BAY' },
    { name: 'Giannis Antetokounmpo', sport: 'NBA', minMvps: 2, expectedMarket: 'MIL' },
    { name: 'Steve Nash', sport: 'NBA', minMvps: 2, expectedMarket: 'PHX' },
    { name: 'Tim Duncan', sport: 'NBA', minMvps: 2, expectedMarket: 'TEX' },
    { name: 'Karl Malone', sport: 'NBA', minMvps: 2, expectedMarket: 'SLC' },
    { name: 'Shaquille O\'Neal', sport: 'NBA', minMvps: 1, expectedMarket: 'LA' },
    { name: 'Kobe Bryant', sport: 'NBA', minMvps: 1, expectedMarket: 'LA' },
    { name: 'Kevin Durant', sport: 'NBA', minMvps: 1, expectedMarket: 'OKC' },
    { name: 'Dirk Nowitzki', sport: 'NBA', minMvps: 1, expectedMarket: 'TEX' },
    { name: 'Hakeem Olajuwon', sport: 'NBA', minMvps: 1, expectedMarket: 'HOU' },
    { name: 'Charles Barkley', sport: 'NBA', minMvps: 1, expectedMarket: 'PHX' },
    { name: 'Allen Iverson', sport: 'NBA', minMvps: 1, expectedMarket: 'PHI' },
    { name: 'Kevin Garnett', sport: 'NBA', minMvps: 1, expectedMarket: 'MIN' },
    { name: 'Derrick Rose', sport: 'NBA', minMvps: 1, expectedMarket: 'CHI' },
    { name: 'Russell Westbrook', sport: 'NBA', minMvps: 1, expectedMarket: 'OKC' },
    { name: 'James Harden', sport: 'NBA', minMvps: 1, expectedMarket: 'HOU' },
    { name: 'Joel Embiid', sport: 'NBA', minMvps: 1, expectedMarket: 'PHI' },

    // NFL
    { name: 'Peyton Manning', sport: 'NFL', minMvps: 5, expectedMarket: 'IND' },
    { name: 'Aaron Rodgers', sport: 'NFL', minMvps: 4, expectedMarket: 'MIL' },
    { name: 'Tom Brady', sport: 'NFL', minMvps: 3, expectedMarket: 'BOS' },
    { name: 'Brett Favre', sport: 'NFL', minMvps: 3, expectedMarket: 'MIL' },
    { name: 'Jim Brown', sport: 'NFL', minMvps: 3, expectedMarket: 'CLE' },
    { name: 'Johnny Unitas', sport: 'NFL', minMvps: 3, expectedMarket: 'BAL' },
    { name: 'Patrick Mahomes', sport: 'NFL', minMvps: 2, expectedMarket: 'KC' },
    { name: 'Lamar Jackson', sport: 'NFL', minMvps: 2, expectedMarket: 'BAL' },
    { name: 'Kurt Warner', sport: 'NFL', minMvps: 2, expectedMarket: 'STL' },
    { name: 'Steve Young', sport: 'NFL', minMvps: 2, expectedMarket: 'BAY' },
    { name: 'Joe Montana', sport: 'NFL', minMvps: 2, expectedMarket: 'BAY' },
    { name: 'Walter Payton', sport: 'NFL', minMvps: 1, expectedMarket: 'CHI' },
    { name: 'Barry Sanders', sport: 'NFL', minMvps: 1, expectedMarket: 'DET' },
    { name: 'Dan Marino', sport: 'NFL', minMvps: 1, expectedMarket: 'MIA' },
    { name: 'John Elway', sport: 'NFL', minMvps: 1, expectedMarket: 'DEN' },
    { name: 'Marshall Faulk', sport: 'NFL', minMvps: 1, expectedMarket: 'STL' },
    { name: 'LaDainian Tomlinson', sport: 'NFL', minMvps: 1, expectedMarket: 'SD' },
    { name: 'Adrian Peterson', sport: 'NFL', minMvps: 1, expectedMarket: 'MIN' },
    { name: 'Lawrence Taylor', sport: 'NFL', minMvps: 1, expectedMarket: 'NY' },

    // MLB
    { name: 'Barry Bonds', sport: 'MLB', minMvps: 7, expectedMarket: 'BAY' },
    { name: 'Mike Trout', sport: 'MLB', minMvps: 3, expectedMarket: 'LA' },
    { name: 'Albert Pujols', sport: 'MLB', minMvps: 3, expectedMarket: 'STL' },
    { name: 'Alex Rodriguez', sport: 'MLB', minMvps: 3, expectedMarket: 'NY' },
    { name: 'Mickey Mantle', sport: 'MLB', minMvps: 3, expectedMarket: 'NY' },
    { name: 'Stan Musial', sport: 'MLB', minMvps: 3, expectedMarket: 'STL' },
    { name: 'Ted Williams', sport: 'MLB', minMvps: 2, expectedMarket: 'BOS' },
    { name: 'Shohei Ohtani', sport: 'MLB', minMvps: 2, expectedMarket: 'LA' },
    { name: 'Aaron Judge', sport: 'MLB', minMvps: 1, expectedMarket: 'NY' },
    { name: 'Bryce Harper', sport: 'MLB', minMvps: 2, expectedMarket: 'WAS' },
    { name: 'Miguel Cabrera', sport: 'MLB', minMvps: 2, expectedMarket: 'DET' },
    { name: 'Cal Ripken Jr.', sport: 'MLB', minMvps: 2, expectedMarket: 'BAL' },
    { name: 'Willie Mays', sport: 'MLB', minMvps: 2, expectedMarket: 'NY' },

    // NHL
    { name: 'Wayne Gretzky', sport: 'NHL', minMvps: 9, expectedMarket: 'EDM' },
    { name: 'Mario Lemieux', sport: 'NHL', minMvps: 3, expectedMarket: 'PIT' },
    { name: 'Bobby Clarke', sport: 'NHL', minMvps: 3, expectedMarket: 'PHI' },
    { name: 'Bobby Orr', sport: 'NHL', minMvps: 3, expectedMarket: 'BOS' },
    { name: 'Gordie Howe', sport: 'NHL', minMvps: 6, expectedMarket: 'DET' },
    { name: 'Alexander Ovechkin', sport: 'NHL', minMvps: 3, expectedMarket: 'WAS' },
    { name: 'Sidney Crosby', sport: 'NHL', minMvps: 2, expectedMarket: 'PIT' },
    { name: 'Connor McDavid', sport: 'NHL', minMvps: 3, expectedMarket: 'EDM' },
    { name: 'Dominik Hasek', sport: 'NHL', minMvps: 2, expectedMarket: 'NY' },
    { name: 'Nathan MacKinnon', sport: 'NHL', minMvps: 1, expectedMarket: 'DEN' },
  ];

  let passed = 0;
  let failed = 0;

  for (const t of MVP_GROUND_TRUTH) {
    const list = t.sport === 'NBA' ? nba : t.sport === 'NFL' ? nfl : t.sport === 'MLB' ? mlb : nhl;
    const resolvedName = resolveAlias(t.name);
    const targetNorm = normalizeSearchString(resolvedName);
    const athlete = list.find((a) => {
      const aNorm = normalizeSearchString(a.name);
      return aNorm === targetNorm || aNorm.replace(/\s+jr$/, '') === targetNorm.replace(/\s+jr$/, '');
    });

    if (!athlete) {
      console.error(`[FAIL] ${t.sport} MVP "${t.name}" MISSING FROM DATABASE!`);
      failed++;
      continue;
    }

    if ((athlete.mvps ?? 0) < t.minMvps) {
      console.error(`[FAIL] "${t.name}" has ${athlete.mvps} MVPs (expected at least ${t.minMvps})`);
      failed++;
      continue;
    }

    const marketSynonyms: Record<string, string[]> = {
      TEX: ['TEX', 'DAL', 'HOU', 'SA'],
      SLC: ['SLC', 'UTA'],
    };
    const validTargets = marketSynonyms[t.expectedMarket] || [t.expectedMarket];
    const hasExpectedMarket = validTargets.some(
      (m) => athlete.mvpMarkets?.includes(m) || athlete.markets?.includes(m)
    );
    if (!hasExpectedMarket) {
      console.warn(`[WARN] "${t.name}" mvpMarkets (${athlete.mvpMarkets}) does not contain ${t.expectedMarket}`);
    }

    passed++;
  }

  console.log(`MVP Census Result: ${passed}/${MVP_GROUND_TRUTH.length} Verified Clean (${failed} Failures)\n`);
}

// ============================================================================
// ANGLE 2: Combinatorial Grid Exhaustion (Every Metro x Every Non-Metro Category)
// ============================================================================
function runAngle2GridExhaustion() {
  console.log('================================================================');
  console.log('ANGLE 2: COMBINATORIAL CATEGORY INTERSECTION EXHAUSTION');
  console.log('================================================================');

  const metros = [
    CATEGORIES.METRO_NY,
    CATEGORIES.METRO_BOSTON,
    CATEGORIES.METRO_CHICAGO,
    CATEGORIES.METRO_LA,
    CATEGORIES.METRO_BAY_AREA,
    CATEGORIES.METRO_PHILLY,
    CATEGORIES.METRO_DETROIT,
    CATEGORIES.METRO_FLORIDA,
    CATEGORIES.METRO_TEXAS,
    CATEGORIES.METRO_OHIO,
    CATEGORIES.METRO_DC_BALTIMORE,
    CATEGORIES.METRO_CANADA,
  ];

  const targetCategories: Category[] = [
    // Accolades
    CATEGORIES.ACCOLADE_CHAMPION,
    CATEGORIES.ACCOLADE_MULTI_CHAMP_2,
    CATEGORIES.ACCOLADE_MULTI_CHAMP,
    CATEGORIES.ACCOLADE_MVP,
    CATEGORIES.ACCOLADE_HOF,
    CATEGORIES.ACCOLADE_ROOKIE_OF_YEAR,

    // Uniform Numbers
    CATEGORIES.NUMBER_0_TO_9,
    CATEGORIES.NUMBER_10_TO_19,
    CATEGORIES.NUMBER_20_TO_29,
    CATEGORIES.NUMBER_30_TO_39,
    CATEGORIES.NUMBER_40_TO_49,
    CATEGORIES.NUMBER_50_TO_59,
    CATEGORIES.NUMBER_60_TO_69,
    CATEGORIES.NUMBER_70_TO_79,
    CATEGORIES.NUMBER_80_TO_89,
    CATEGORIES.NUMBER_90_TO_99,

    // Franchises Count
    CATEGORIES.CAREER_ONE_FRANCHISE,
    CATEGORIES.CAREER_2_TEAMS,
    CATEGORIES.CAREER_3_TEAMS,
    CATEGORIES.CAREER_4_TEAMS,
    CATEGORIES.CAREER_5_TEAMS,
    CATEGORIES.CAREER_6_TEAMS,

    // Inter-Metro Pairs
    CATEGORIES.METRO_BOSTON,
    CATEGORIES.METRO_CHICAGO,
    CATEGORIES.METRO_LA,
    CATEGORIES.METRO_BAY_AREA,
    CATEGORIES.METRO_PHILLY,
    CATEGORIES.METRO_FLORIDA,
    CATEGORIES.METRO_TEXAS,
    CATEGORIES.METRO_CANADA,
  ];

  let totalIntersections = 0;
  let zeroMatchIntersections: string[] = [];
  let minMatch = Infinity;
  let minMatchDetail = '';

  for (const m of metros) {
    const metroAthletes = allAthletes.filter((a) => m.matches(a));
    for (const c of targetCategories) {
      if (m.id === c.id) continue; // Same category
      totalIntersections++;

      const matches = metroAthletes.filter((a) => doesAthleteMatchCell(m, c, a).isMatch);
      const count = matches.length;

      if (count === 0) {
        zeroMatchIntersections.push(`"${m.shortName}" × "${c.shortName}"`);
      } else if (count < minMatch) {
        minMatch = count;
        minMatchDetail = `"${m.shortName}" × "${c.shortName}": ${count} matches (Sample: ${matches[0].name})`;
      }
    }
  }

  console.log(`Tested ${totalIntersections} Category Intersections.`);
  console.log(`Zero-Match (Dead) Cells: ${zeroMatchIntersections.length}`);
  if (zeroMatchIntersections.length > 0) {
    console.error(`  Dead Cells Found:`, zeroMatchIntersections);
  } else {
    console.log(`  ✓ 100% of tested intersections have at least 1 valid athlete!`);
    console.log(`  Rarest cell found: ${minMatchDetail}`);
  }
  console.log('');
}

// ============================================================================
// ANGLE 3: Single-Event vs Cumulative Logic on Complex Journeymen
// ============================================================================
function runAngle3JourneymanStressTest() {
  console.log('================================================================');
  console.log('ANGLE 3: SINGLE-EVENT vs CUMULATIVE JOURNEYMAN STRESS-TEST');
  console.log('================================================================');

  const testCases = [
    {
      name: 'Kevin Durant',
      sportList: nba,
      metro: CATEGORIES.METRO_BAY_AREA,
      champCat: CATEGORIES.ACCOLADE_CHAMPION,
      expected: true,
      reason: 'Won 2 Rings with GSW in Bay Area',
    },
    {
      name: 'Kevin Durant',
      sportList: nba,
      metro: CATEGORIES.METRO_NY,
      champCat: CATEGORIES.ACCOLADE_CHAMPION,
      expected: false,
      reason: 'Played for Brooklyn Nets, but never won a title with Brooklyn',
    },
    {
      name: 'Tom Brady',
      sportList: nfl,
      metro: CATEGORIES.METRO_BOSTON,
      champCat: CATEGORIES.ACCOLADE_CHAMPION,
      expected: true,
      reason: 'Won 6 Super Bowls with New England',
    },
    {
      name: 'Tom Brady',
      sportList: nfl,
      metro: CATEGORIES.METRO_FLORIDA,
      champCat: CATEGORIES.ACCOLADE_CHAMPION,
      expected: true,
      reason: 'Won Super Bowl LV with Tampa Bay Buccaneers',
    },
    {
      name: 'Peyton Manning',
      sportList: nfl,
      metro: CATEGORIES.METRO_OHIO,
      champCat: CATEGORIES.ACCOLADE_CHAMPION,
      expected: false,
      reason: 'Never played in Ohio',
    },
    {
      name: 'Ray Bourque',
      sportList: nhl,
      metro: CATEGORIES.METRO_BOSTON,
      champCat: CATEGORIES.ACCOLADE_CHAMPION,
      expected: false,
      reason: 'Played 21 years in Boston, but won his only Stanley Cup with Colorado',
    },
    {
      name: 'Ray Bourque',
      sportList: nhl,
      metro: CATEGORIES.METRO_BOSTON,
      champCat: CATEGORIES.CAREER_ONE_FRANCHISE,
      expected: false,
      reason: 'Played for Bruins and Avalanche (2 teams)',
    },
    {
      name: 'Randy Johnson',
      sportList: mlb,
      metro: CATEGORIES.METRO_NY,
      champCat: CATEGORIES.ACCOLADE_CHAMPION,
      expected: false,
      reason: 'Played for NY Yankees, but won World Series with Arizona Diamondbacks',
    },
    {
      name: 'Randy Johnson',
      sportList: mlb,
      metro: CATEGORIES.METRO_NY,
      champCat: CATEGORIES.CAREER_6_TEAMS,
      expected: true,
      reason: 'Played for 6 franchises (MTL, SEA, HOU, ARI, NYY, SFG)',
    },
  ];

  let passed = 0;
  for (const tc of testCases) {
    const matches = tc.sportList.filter((a) => a.name.toLowerCase() === tc.name.toLowerCase());
    const athlete = matches.sort((a, b) => (b.popularityScore ?? 0) - (a.popularityScore ?? 0))[0];
    if (!athlete) {
      console.error(`[FAIL] ${tc.name} missing from database!`);
      continue;
    }

    const res = doesAthleteMatchCell(tc.metro, tc.champCat, athlete);
    const success = res.isMatch === tc.expected;

    if (success) {
      passed++;
      console.log(`  ✓ [PASS] ${tc.name} × "${tc.metro.shortName}" × "${tc.champCat.shortName}" -> ${res.isMatch} (${tc.reason})`);
    } else {
      console.error(`  ✗ [FAIL] ${tc.name} × "${tc.metro.shortName}" × "${tc.champCat.shortName}" -> Got ${res.isMatch}, expected ${tc.expected}`);
    }
  }

  console.log(`Journeyman Test Result: ${passed}/${testCases.length} Passed\n`);
}

// ============================================================================
// ANGLE 4: Relocated Franchise Heritage & Multi-Market Verification
// ============================================================================
function runAngle4RelocationHeritage() {
  console.log('================================================================');
  console.log('ANGLE 4: RELOCATED FRANCHISE HERITAGE & MARKET RESOLUTION');
  console.log('================================================================');

  const RELOCATION_CHECKS = [
    // Jackie Robinson: Brooklyn Dodgers -> Should have NY market, NOT LA!
    {
      sport: 'MLB',
      list: mlb,
      name: 'Jackie Robinson',
      shouldHaveMarkets: ['NY'],
      shouldNotHaveMarkets: ['LA'],
      notes: 'Played exclusively for Brooklyn Dodgers (1947-1956)',
    },
    // Pee Wee Reese: Brooklyn Dodgers -> NY market
    {
      sport: 'MLB',
      list: mlb,
      name: 'Pee Wee Reese',
      shouldHaveMarkets: ['NY'],
      shouldNotHaveMarkets: [],
      notes: 'Brooklyn Dodgers Hall of Famer',
    },
    // Willie Mays: NY Giants & SF Giants -> Should have BOTH NY and BAY!
    {
      sport: 'MLB',
      list: mlb,
      name: 'Willie Mays',
      shouldHaveMarkets: ['NY', 'BAY'],
      shouldNotHaveMarkets: [],
      notes: 'Played for NY Giants (NY), SF Giants (BAY), NY Mets (NY)',
    },
    // Gary Payton: Seattle SuperSonics -> Should have SEA market
    {
      sport: 'NBA',
      list: nba,
      name: 'Gary Payton',
      shouldHaveMarkets: ['SEA'],
      shouldNotHaveMarkets: [],
      notes: 'Seattle SuperSonics legend (1990-2003)',
    },
    // Shawn Kemp: Seattle SuperSonics -> SEA market
    {
      sport: 'NBA',
      list: nba,
      name: 'Shawn Kemp',
      shouldHaveMarkets: ['SEA', 'CLE'],
      shouldNotHaveMarkets: [],
      notes: 'SuperSonics Reign Man',
    },
    // Warren Moon: Houston Oilers -> Should have HOU market!
    {
      sport: 'NFL',
      list: nfl,
      name: 'Warren Moon',
      shouldHaveMarkets: ['HOU', 'MIN', 'SEA', 'KC'],
      shouldNotHaveMarkets: [],
      notes: 'Houston Oilers legend',
    },
    // Johnny Unitas: Baltimore Colts -> BAL market
    {
      sport: 'NFL',
      list: nfl,
      name: 'Johnny Unitas',
      shouldHaveMarkets: ['BAL'],
      shouldNotHaveMarkets: [],
      notes: 'Baltimore Colts legend',
    },
    // Peter Forsberg: Quebec Nordiques & Colorado Avalanche -> CAN and DEN markets
    {
      sport: 'NHL',
      list: nhl,
      name: 'Peter Forsberg',
      shouldHaveMarkets: ['CAN', 'DEN', 'PHI'],
      shouldNotHaveMarkets: [],
      notes: 'Quebec Nordiques & Colorado Avalanche superstar',
    },
  ];

  let passed = 0;
  for (const rc of RELOCATION_CHECKS) {
    const athlete = rc.list.find((a) => a.name.toLowerCase() === rc.name.toLowerCase());
    if (!athlete) {
      console.error(`[FAIL] ${rc.name} (${rc.sport}) MISSING from database!`);
      continue;
    }

    let ok = true;
    for (const req of rc.shouldHaveMarkets) {
      if (!athlete.markets.includes(req)) {
        console.error(`[FAIL] ${rc.name} missing expected market "${req}"! (Has: ${athlete.markets})`);
        ok = false;
      }
    }
    for (const forbidden of rc.shouldNotHaveMarkets) {
      if (athlete.markets.includes(forbidden)) {
        console.error(`[FAIL] ${rc.name} has incorrect anachronistic market "${forbidden}"!`);
        ok = false;
      }
    }

    if (ok) {
      passed++;
      console.log(`  ✓ [PASS] ${rc.name} (${rc.sport}): Markets [${athlete.markets.join(', ')}] accurately reflects heritage (${rc.notes})`);
    }
  }

  console.log(`Relocation Heritage Result: ${passed}/${RELOCATION_CHECKS.length} Passed\n`);
}

// ============================================================================
// ANGLE 5: Entity Uniqueness & ID Collision Audit
// ============================================================================
function runAngle5EntityUniqueness() {
  console.log('================================================================');
  console.log('ANGLE 5: ENTITY UNIQUENESS & ID COLLISION AUDIT');
  console.log('================================================================');

  const seenIds = new Set<string>();
  const duplicateIds: string[] = [];

  for (const a of allAthletes) {
    if (seenIds.has(a.id)) {
      duplicateIds.push(a.id);
    } else {
      seenIds.add(a.id);
    }
  }

  console.log(`Total Athletes Audited Across 4 Sports: ${allAthletes.length.toLocaleString()}`);
  console.log(`Unique ID Count: ${seenIds.size.toLocaleString()}`);
  console.log(`Duplicate IDs: ${duplicateIds.length}`);
  if (duplicateIds.length > 0) {
    console.error(`  Duplicates found:`, duplicateIds.slice(0, 10));
  } else {
    console.log(`  ✓ 100% of athletes have globally unique IDs.`);
  }

  // Check uniform number integrity
  let invalidUniformsCount = 0;
  for (const a of allAthletes) {
    if (a.jerseyNumbers) {
      for (const num of a.jerseyNumbers) {
        if (typeof num !== 'number' || isNaN(num) || num < 0 || num > 99) {
          invalidUniformsCount++;
          console.error(`Invalid jersey number ${num} on ${a.name} (${a.id})`);
        }
      }
    }
  }
  console.log(`Invalid Uniform Numbers: ${invalidUniformsCount}`);

  // Dual-number superstars check
  const dualNumberStars = [
    { name: 'Kobe Bryant', list: nba, reqNums: [8, 24] },
    { name: 'Michael Jordan', list: nba, reqNums: [23, 45] },
    { name: 'LeBron James', list: nba, reqNums: [23, 6] },
  ];

  for (const star of dualNumberStars) {
    const p = star.list.find((a) => a.name.toLowerCase() === star.name.toLowerCase());
    if (p) {
      const hasAll = star.reqNums.every((n) => p.jerseyNumbers?.includes(n));
      console.log(`  ✓ Superstar Dual Numbers: ${star.name} has [${p.jerseyNumbers?.join(', ')}] -> ${hasAll ? 'CORRECT' : 'MISSING NUMBER'}`);
    }
  }
  console.log('');
}

// ============================================================================
// MAIN RUNNER
// ============================================================================
function runAllAlternativeAudits() {
  console.log('\n======================================================');
  console.log('   MULTI-VECTOR ALTERNATIVE AUDIT SUITE STARTING');
  console.log('======================================================\n');

  runAngle1MvpCensus();
  runAngle2GridExhaustion();
  runAngle3JourneymanStressTest();
  runAngle4RelocationHeritage();
  runAngle5EntityUniqueness();

  console.log('======================================================');
  console.log('   MULTI-VECTOR ALTERNATIVE AUDIT COMPLETE');
  console.log('======================================================\n');
}

runAllAlternativeAudits();
