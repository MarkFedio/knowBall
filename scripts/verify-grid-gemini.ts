/**
 * Multi-Bot Grid Verification Harness using Google Gemini
 *
 * Runs parallel bot workers that:
 * 1. Generate category intersections (Row Category × Col Category).
 * 2. Query Gemini independently for real-world athletes matching both criteria.
 * 3. Match names against the local athlete dataset (with nickname/diacritic normalization).
 * 4. Verify whether the grid engine (doesAthleteMatchCell) accepts the answer.
 * 5. Triage results into:
 *    - ✅ Validated (Bot found athlete -> in DB -> Grid accepts)
 *    - ⚠️ Missing in DB (Real athlete identified by Gemini, but missing from database)
 *    - 🚨 Engine/Data Discrepancy (Athlete in DB, but grid engine rejected them)
 */

import fs from 'fs';
import path from 'path';
import { ATHLETES } from '../src/data/athletes';
import { CATEGORIES } from '../src/data/categories';
import { DAILY_PUZZLE, doesAthleteMatchCell, getMetroSingleEventIntersection } from '../src/data/puzzles';
import { areCategoriesTriviallyRedundant } from '../src/lib/gridGenerator';
import { normalizeSearchString, resolveAlias } from '../src/lib/searchUtils';
import { Athlete, Category } from '../src/types';

// ============================================================================
// Environment & Configuration Loader
// ============================================================================
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const [key, ...rest] = trimmed.split('=');
        if (key && rest.length > 0) {
          const val = rest.join('=').replace(/^["']|["']$/g, '');
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = val.trim();
          }
        }
      }
    }
  }
}

loadEnv();

const CACHE_DIR = path.join(process.cwd(), '.cache');
const BOT_CACHE_FILE = path.join(CACHE_DIR, 'gemini-bot-cache.json');
const REPORT_FILE = path.join(CACHE_DIR, 'gemini-report.json');
const MISSING_CANDIDATES_FILE = path.join(CACHE_DIR, 'gemini-missing-candidates.json');
const DISCREPANCIES_FILE = path.join(CACHE_DIR, 'gemini-discrepancies.json');

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Load Bot Cache
let botCache: Record<string, BotAthleteAnswer[]> = {};
if (fs.existsSync(BOT_CACHE_FILE)) {
  try {
    botCache = JSON.parse(fs.readFileSync(BOT_CACHE_FILE, 'utf-8'));
  } catch {
    botCache = {};
  }
}

function saveBotCache() {
  fs.writeFileSync(BOT_CACHE_FILE, JSON.stringify(botCache, null, 2), 'utf-8');
}

// ============================================================================
// Types
// ============================================================================
interface BotAthleteAnswer {
  name: string;
  sport: 'NFL' | 'NBA' | 'MLB' | 'NHL';
  reasoning: string;
}

interface CellVerificationResult {
  rowCategory: { id: string; name: string };
  colCategory: { id: string; name: string };
  botAnswers: BotAthleteAnswer[];
  accepted: { athleteName: string; athleteId: string; sport: string; reasoning: string }[];
  missingFromDb: { athleteName: string; sport: string; reasoning: string }[];
  rejectedByGrid: { athleteName: string; athleteId: string; failureReason?: string; reasoning: string }[];
}

// ============================================================================
// Fast In-Memory Athlete Search Index
// ============================================================================
interface IndexedAthlete {
  athlete: Athlete;
  normName: string;
  tokens: string[];
}

const ATHLETE_INDEX: IndexedAthlete[] = ATHLETES.map((a) => {
  const normName = normalizeSearchString(a.name);
  return {
    athlete: a,
    normName,
    tokens: normName.split(' '),
  };
});

function findAthleteByName(rawName: string): Athlete | null {
  const resolved = resolveAlias(rawName);
  const qNorm = normalizeSearchString(resolved);

  // 1. Exact match
  for (const item of ATHLETE_INDEX) {
    if (item.normName === qNorm) return item.athlete;
  }

  // 2. Starts with query or full match
  for (const item of ATHLETE_INDEX) {
    if (item.normName.startsWith(qNorm) && Math.abs(item.normName.length - qNorm.length) <= 3) {
      return item.athlete;
    }
  }

  // 3. Last name + First initial or token matching
  const qTokens = qNorm.split(' ');
  if (qTokens.length >= 2) {
    const lastName = qTokens[qTokens.length - 1];
    for (const item of ATHLETE_INDEX) {
      if (item.tokens[item.tokens.length - 1] === lastName) {
        if (item.normName.includes(qTokens[0])) {
          return item.athlete;
        }
      }
    }
  }

  return null;
}

// ============================================================================
// Model Auto-Discovery & Validation
// ============================================================================
async function resolveAvailableModel(apiKey: string, preferredModel?: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.text();
      console.warn(`[WARN] Could not fetch models list (${res.status}): ${err}`);
      return preferredModel || 'gemini-2.0-flash';
    }

    const data = await res.json();
    const availableModels: string[] = (data.models || [])
      .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
      .map((m: any) => m.name.replace(/^models\//, ''));

    if (preferredModel && availableModels.includes(preferredModel)) {
      console.log(`🎯 Using user-requested model: ${preferredModel}`);
      return preferredModel;
    }

    // Ranked priority of fast flash models
    const priorities = [
      'gemini-2.0-flash',
      'gemini-2.5-flash',
      'gemini-2.0-flash-001',
      'gemini-2.0-flash-lite',
      'gemini-1.5-flash-latest',
      'gemini-1.5-flash',
      'gemini-pro',
    ];

    for (const cand of priorities) {
      if (availableModels.includes(cand)) {
        console.log(`📡 Auto-detected Gemini model: "${cand}" (from ${availableModels.length} available models)`);
        return cand;
      }
    }

    // Fallback to any model with "flash" or the first available
    const flashMatch = availableModels.find((m) => m.includes('flash'));
    if (flashMatch) {
      console.log(`📡 Selected Flash model: "${flashMatch}"`);
      return flashMatch;
    }

    if (availableModels.length > 0) {
      console.log(`📡 Selected default model: "${availableModels[0]}"`);
      return availableModels[0];
    }
  } catch (err: any) {
    console.warn(`[WARN] Error querying model list:`, err.message);
  }

  return preferredModel || 'gemini-2.0-flash';
}

// ============================================================================
// Gemini API Bot Caller
// ============================================================================
async function queryGeminiForIntersection(
  rowCat: Category,
  colCat: Category,
  apiKey: string,
  modelName: string,
  isMock: boolean = false
): Promise<BotAthleteAnswer[]> {
  if (isMock) {
    // Generate realistic test candidates for offline simulation
    return [
      { name: 'Tom Brady', sport: 'NFL', reasoning: 'Quarterback legend with multiple Super Bowls' },
      { name: 'David Ortiz', sport: 'MLB', reasoning: 'Won 3 World Series championships with Boston Red Sox' },
      { name: 'Rickey Henderson', sport: 'MLB', reasoning: 'Career stolen base record holder with 1,406 steals' },
      { name: 'Unknown Modern Rookie 2026', sport: 'NBA', reasoning: 'Recent draft pick not in dataset' },
    ];
  }
  const cacheKey = `${rowCat.id}___${colCat.id}`;
  if (botCache[cacheKey]) {
    return botCache[cacheKey];
  }

  // Check single event rule context to guide the bot accurately
  const singleEvent = getMetroSingleEventIntersection(rowCat, colCat);
  const singleEventRule = singleEvent
    ? `\nCRITICAL RULE: For single-event honors (${singleEvent.accoladeLabel} in ${singleEvent.metroLabel}), the athlete MUST have won that award WHILE playing for that city's team (e.g. Tom Brady won championships with New England, not Tampa Bay for Boston).`
    : '';

  const prompt = `You are a sports trivia solver verifying an Immaculate Grid style game covering NFL, NBA, MLB, and NHL.
Name 3 to 4 REAL athletes who satisfy BOTH of the following conditions:

Category 1: "${rowCat.name}" (${rowCat.description})
Category 2: "${colCat.name}" (${colCat.description})
${singleEventRule}

Rules:
1. Athletes must have played in the NFL, NBA, MLB, or NHL.
2. Provide real, historically accurate athletes.
3. Return ONLY a valid JSON array of objects. Do not include markdown code block syntax.

JSON format:
[
  {
    "name": "Full Athlete Name",
    "sport": "NFL" | "NBA" | "MLB" | "NHL",
    "reasoning": "Brief explanation of how they satisfy both categories"
  }
]`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2,
    },
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`Request timed out after 15s for ${rowCat.shortName} x ${colCat.shortName}`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) return [];

  try {
    const cleanJson = rawText.replace(/```json\n?|```/g, '').trim();
    const answers: BotAthleteAnswer[] = JSON.parse(cleanJson);
    botCache[cacheKey] = answers;
    saveBotCache();
    return answers;
  } catch (err) {
    console.warn(`[WARN] Failed to parse JSON from Gemini for ${rowCat.shortName} x ${colCat.shortName}:`, rawText);
    return [];
  }
}

// ============================================================================
// Concurrency Controller
// ============================================================================
async function runWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, idx: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const currentIndex = index++;
      const res = await fn(items[currentIndex], currentIndex);
      results[currentIndex] = res;
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

// ============================================================================
// Intersection Selection Logic
// ============================================================================
function getTestIntersections(mode: string, sampleCount: number): [Category, Category][] {
  if (mode === 'daily') {
    const pairs: [Category, Category][] = [];
    for (const r of DAILY_PUZZLE.rowCategories) {
      for (const c of DAILY_PUZZLE.colCategories) {
        pairs.push([r, c]);
      }
    }
    return pairs;
  }

  const allCategories = Object.values(CATEGORIES);
  const candidatePool: [Category, Category][] = [];

  if (mode === 'metro') {
    const metros = allCategories.filter((c) => c.type === 'METRO');
    const others = allCategories.filter(
      (c) => c.type === 'ACCOLADE' || c.type === 'CROSS_STAT' || c.type === 'NUMBER_ERA'
    );
    for (const m of metros) {
      for (const o of others) {
        candidatePool.push([m, o]);
      }
    }
  } else {
    for (let i = 0; i < allCategories.length; i++) {
      for (let j = i + 1; j < allCategories.length; j++) {
        candidatePool.push([allCategories[i], allCategories[j]]);
      }
    }
  }

  // Shuffle candidate pool
  candidatePool.sort(() => Math.random() - 0.5);

  // Pick non-redundant pairs on demand
  const validPairs: [Category, Category][] = [];
  for (const [catA, catB] of candidatePool) {
    if (validPairs.length >= sampleCount) break;
    // Check fast redundancy
    const redundancy = areCategoriesTriviallyRedundant(catA, catB, ATHLETES);
    if (!redundancy.isRedundant) {
      validPairs.push([catA, catB]);
    }
  }

  return validPairs;
}

// ============================================================================
// Main CLI Runner
// ============================================================================
async function main() {
  const args = process.argv.slice(2);
  const getArg = (name: string, def: string) => {
    const prefix = `--${name}=`;
    const match = args.find((a) => a.startsWith(prefix));
    if (match) return match.slice(prefix.length);
    const idx = args.indexOf(`--${name}`);
    if (idx !== -1 && args[idx + 1]) return args[idx + 1];
    return def;
  };

  const isMock = args.includes('--mock');
  const apiKey = getArg('key', process.env.GEMINI_API_KEY || (isMock ? 'mock_key' : ''));
  const mode = args.includes('--daily') ? 'daily' : args.includes('--metro') ? 'metro' : 'sample';
  const sampleCount = parseInt(getArg('sample', mode === 'daily' ? '16' : '15'), 10);
  const concurrency = parseInt(getArg('concurrency', '4'), 10);
  const requestedModel = getArg('model', '');

  console.log('================================================================');
  console.log('🤖  KNOWBALL GEMINI BOT PARALLEL VERIFICATION HARNESS');
  console.log('================================================================');

  if (!apiKey && !isMock) {
    console.error('\n❌ ERROR: GEMINI_API_KEY not found!');
    console.error('Please either:');
    console.error('  1. Add GEMINI_API_KEY=your_key_here to a .env.local file in the project root');
    console.error('  2. Run with --key=your_key_here');
    console.error('  3. Run `export GEMINI_API_KEY="your_key_here"`\n');
    console.error('💡 To test offline with simulated mock bot responses:');
    console.error('   npm run verify:gemini -- --mock\n');
    process.exit(1);
  }

  let activeModel = requestedModel || 'gemini-2.0-flash';
  if (!isMock) {
    activeModel = await resolveAvailableModel(apiKey, requestedModel || undefined);
  }

  const intersections = getTestIntersections(mode, sampleCount);
  console.log(`\n📋 Mode: [${mode.toUpperCase()}]`);
  console.log(`⚡ Testing ${intersections.length} Category Intersections`);
  console.log(`🤖 Model: ${activeModel} | Concurrency: ${concurrency} workers`);
  console.log(`📊 Athlete Database Size: ${ATHLETES.length.toLocaleString()} athletes\n`);

  const startTime = Date.now();

  const results: CellVerificationResult[] = await runWithConcurrency(
    intersections,
    concurrency,
    async ([rowCat, colCat], index) => {
      process.stdout.write(`[Worker] Testing [${index + 1}/${intersections.length}] "${rowCat.shortName}" × "${colCat.shortName}"...\n`);

      let botAnswers: BotAthleteAnswer[] = [];
      try {
        botAnswers = await queryGeminiForIntersection(rowCat, colCat, apiKey, activeModel, isMock);
      } catch (err: any) {
        console.error(`  ⚠️  Gemini call failed for ${rowCat.shortName} × ${colCat.shortName}:`, err.message);
        return {
          rowCategory: { id: rowCat.id, name: rowCat.name },
          colCategory: { id: colCat.id, name: colCat.name },
          botAnswers: [],
          accepted: [],
          missingFromDb: [],
          rejectedByGrid: [],
        };
      }

      const cellResult: CellVerificationResult = {
        rowCategory: { id: rowCat.id, name: rowCat.name },
        colCategory: { id: colCat.id, name: colCat.name },
        botAnswers,
        accepted: [],
        missingFromDb: [],
        rejectedByGrid: [],
      };

      for (const botAns of botAnswers) {
        const found = findAthleteByName(botAns.name);

        if (!found) {
          cellResult.missingFromDb.push({
            athleteName: botAns.name,
            sport: botAns.sport,
            reasoning: botAns.reasoning,
          });
          continue;
        }

        const match = doesAthleteMatchCell(rowCat, colCat, found);
        if (match.isMatch) {
          cellResult.accepted.push({
            athleteName: found.name,
            athleteId: found.id,
            sport: botAns.sport,
            reasoning: botAns.reasoning,
          });
        } else {
          cellResult.rejectedByGrid.push({
            athleteName: found.name,
            athleteId: found.id,
            failureReason: match.failureReason,
            reasoning: botAns.reasoning,
          });
        }
      }

      return cellResult;
    }
  );

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);

  // ============================================================================
  // Summarize & Report
  // ============================================================================
  let totalBotAnswers = 0;
  let totalAccepted = 0;
  let totalMissing = 0;
  let totalRejected = 0;

  const allMissing: { player: string; sport: string; cell: string; reasoning: string }[] = [];
  const allDiscrepancies: { player: string; id: string; cell: string; failureReason?: string; reasoning: string }[] = [];

  for (const r of results) {
    totalBotAnswers += r.botAnswers.length;
    totalAccepted += r.accepted.length;
    totalMissing += r.missingFromDb.length;
    totalRejected += r.rejectedByGrid.length;

    for (const m of r.missingFromDb) {
      allMissing.push({
        player: m.athleteName,
        sport: m.sport,
        cell: `${r.rowCategory.name} × ${r.colCategory.name}`,
        reasoning: m.reasoning,
      });
    }

    for (const d of r.rejectedByGrid) {
      allDiscrepancies.push({
        player: d.athleteName,
        id: d.athleteId,
        cell: `${r.rowCategory.name} × ${r.colCategory.name}`,
        failureReason: d.failureReason,
        reasoning: d.reasoning,
      });
    }
  }

  // Write detailed reports
  fs.writeFileSync(REPORT_FILE, JSON.stringify(results, null, 2), 'utf-8');
  fs.writeFileSync(MISSING_CANDIDATES_FILE, JSON.stringify(allMissing, null, 2), 'utf-8');
  fs.writeFileSync(DISCREPANCIES_FILE, JSON.stringify(allDiscrepancies, null, 2), 'utf-8');

  console.log('\n================================================================');
  console.log('🏁  VERIFICATION RUN COMPLETE');
  console.log('================================================================');
  console.log(`⏱️  Duration: ${durationSec} seconds`);
  console.log(`🧩 Intersections Tested: ${intersections.length}`);
  console.log(`💡 Total Bot Proposals: ${totalBotAnswers}`);
  console.log(`✅ Accepted by Grid: ${totalAccepted} (${totalBotAnswers > 0 ? Math.round((totalAccepted / totalBotAnswers) * 100) : 0}%)`);
  console.log(`⚠️  Missing from Dataset: ${totalMissing}`);
  console.log(`🚨 Grid Rejections (In DB, but rejected): ${totalRejected}`);
  console.log('================================================================\n');

  if (allDiscrepancies.length > 0) {
    console.log('🚨 SAMPLE ENGINE / DATA DISCREPANCIES (In DB but rejected):');
    for (const d of allDiscrepancies.slice(0, 5)) {
      console.log(`  • ${d.player} in [${d.cell}]`);
      console.log(`    Reason given: "${d.reasoning}"`);
      console.log(`    Engine rejected: "${d.failureReason || 'Failed category match'}"\n`);
    }
  }

  if (allMissing.length > 0) {
    console.log('⚠️  SAMPLE MISSING CANDIDATES (Not found in DB):');
    for (const m of allMissing.slice(0, 5)) {
      console.log(`  • ${m.player} (${m.sport}) for [${m.cell}]`);
      console.log(`    Detail: "${m.reasoning}"\n`);
    }
  }

  console.log('📁 Detailed JSON logs saved to:');
  console.log(`  • ${REPORT_FILE}`);
  console.log(`  • ${MISSING_CANDIDATES_FILE}`);
  console.log(`  • ${DISCREPANCIES_FILE}`);
  console.log('');
}

main().catch((err) => {
  console.error('\n💥 Unhandled error in main():', err);
  process.exit(1);
});
