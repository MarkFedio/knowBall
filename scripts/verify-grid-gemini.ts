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
const ENRICHMENT_EXPORT_FILE = path.join(CACHE_DIR, 'missing-athletes-for-enrichment.json');

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

function findAthletesByName(rawName: string): Athlete[] {
  const resolved = resolveAlias(rawName);
  const qNorm = normalizeSearchString(resolved);

  const matched: Athlete[] = [];

  // 1. Exact match
  for (const item of ATHLETE_INDEX) {
    if (item.normName === qNorm) matched.push(item.athlete);
  }
  if (matched.length > 0) {
    return matched.sort((a, b) => (b.popularityScore || 50) - (a.popularityScore || 50));
  }

  // 2. Starts with query or full match
  for (const item of ATHLETE_INDEX) {
    if (item.normName.startsWith(qNorm) && Math.abs(item.normName.length - qNorm.length) <= 3) {
      matched.push(item.athlete);
    }
  }
  if (matched.length > 0) {
    return matched.sort((a, b) => (b.popularityScore || 50) - (a.popularityScore || 50));
  }

  // 3. Last name + First initial or token matching
  const qTokens = qNorm.split(' ');
  if (qTokens.length >= 2) {
    const lastName = qTokens[qTokens.length - 1];
    for (const item of ATHLETE_INDEX) {
      if (item.tokens[item.tokens.length - 1] === lastName) {
        if (item.normName.includes(qTokens[0])) {
          matched.push(item.athlete);
        }
      }
    }
  }

  return matched.sort((a, b) => (b.popularityScore || 50) - (a.popularityScore || 50));
}

// ============================================================================
// Model Auto-Discovery & Dynamic Fallback Pool
// ============================================================================
let AVAILABLE_MODELS_POOL: string[] = [];
let currentActiveModel: string = 'gemini-2.0-flash';

function getNextAvailableModel(currentModel: string): string | null {
  AVAILABLE_MODELS_POOL = AVAILABLE_MODELS_POOL.filter((m) => m !== currentModel);
  return AVAILABLE_MODELS_POOL.length > 0 ? AVAILABLE_MODELS_POOL[0] : null;
}

async function initAvailableModelsPool(apiKey: string, preferredModel?: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.text();
      console.warn(`[WARN] Could not fetch models list (${res.status}): ${err}`);
      AVAILABLE_MODELS_POOL = ['gemini-2.0-flash', 'gemini-1.5-flash-8b', 'gemini-1.5-pro'];
      return preferredModel || 'gemini-2.0-flash';
    }

    const data = await res.json();
    const all: string[] = (data.models || [])
      .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
      .map((m: any) => m.name.replace(/^models\//, ''))
      .filter(
        (name: string) =>
          !name.includes('2.5') &&
          !name.includes('embedding') &&
          !name.includes('imagen') &&
          !name.includes('aqa') &&
          !name.includes('tts')
      );

    // Sort models:
    // 1. Preferred model (if provided)
    // 2. High-quota / fast models (8b, lite, 2.0-flash, 1.5-pro)
    // 3. Move known rate-limited models (gemini-3.8-flash) toward the end
    const sorted = all.sort((a, b) => {
      if (preferredModel) {
        if (a === preferredModel) return -1;
        if (b === preferredModel) return 1;
      }

      // Deprioritize 3.8-flash since it frequently hits the 5 RPM / 300 min free quota cap
      if (a === 'gemini-3.8-flash') return 1;
      if (b === 'gemini-3.8-flash') return -1;

      const aIsLight = a.includes('8b') || a.includes('lite') || (a.includes('flash') && !a.includes('3.8'));
      const bIsLight = b.includes('8b') || b.includes('lite') || (b.includes('flash') && !b.includes('3.8'));
      if (aIsLight && !bIsLight) return -1;
      if (!aIsLight && bIsLight) return 1;

      return 0;
    });

    AVAILABLE_MODELS_POOL = sorted;
    console.log(`📡 Discovered ${all.length} compatible models for your account.`);
    console.log(`📋 Candidate queue: ${AVAILABLE_MODELS_POOL.slice(0, 4).join(', ')}...`);

    currentActiveModel = AVAILABLE_MODELS_POOL[0] || 'gemini-2.0-flash';
    return currentActiveModel;
  } catch (err: any) {
    console.warn(`[WARN] Error querying model list:`, err.message);
  }

  AVAILABLE_MODELS_POOL = ['gemini-2.0-flash', 'gemini-1.5-flash-8b', 'gemini-1.5-pro'];
  currentActiveModel = preferredModel || 'gemini-2.0-flash';
  return currentActiveModel;
}

// ============================================================================
// Retry & Quota Helpers
// ============================================================================
function parseRetryDelay(errText: string): number {
  try {
    const json = JSON.parse(errText);
    const retryDetail = json?.error?.details?.find(
      (d: any) => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
    );
    if (retryDetail?.retryDelay) {
      const match = retryDetail.retryDelay.match(/([0-9.]+)/);
      if (match) return Math.ceil(parseFloat(match[1]));
    }
  } catch {}
  const match = errText.match(/retry in ([0-9.]+)s/i);
  if (match) return Math.ceil(parseFloat(match[1]));
  return 38;
}

// ============================================================================
// Gemini API Bot Caller
// ============================================================================
async function queryGeminiForIntersection(
  rowCat: Category,
  colCat: Category,
  apiKey: string,
  modelName: string,
  isMock: boolean = false,
  attempt: number = 1
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
3. Scoring & Points Rule: In the NFL, "Points" means direct points scored (rushing/receiving touchdowns, field goals, extra points). Passing touchdowns DO NOT count as player points.
4. Stat Homonym Rules:
   - "Wins" applies ONLY to MLB pitchers, NHL goalies, or NFL starting QBs.
   - "Assists" applies ONLY to NBA players or NHL skaters.
   - "Steals" applies ONLY to MLB stolen bases or NBA defensive steals.
   - "Hits" applies ONLY to MLB base hits or NHL body checks.
   - "Blocks" applies ONLY to NBA blocked shots or NHL blocked shots.
   - "Saves" applies ONLY to MLB pitching saves or NHL goalie saves.
   - "Turnovers" applies ONLY to NFL interceptions/fumbles lost or NBA turnovers.
5. Multi-Sport Athletes: Ensure the athlete actually achieved the required statistic in the sport where that stat is officially recorded (e.g. do not credit an NHL forward with goalie wins).
6. CRITICAL - Accurate Names Only: Only put an athlete into the "name" field if you are 100% certain they satisfy BOTH categories. Never output an athlete into "name" and then explain in "reasoning" that they are disqualified, wore a different jersey number, or should be replaced. If unsure, name a different athlete.
7. Return ONLY a valid JSON array of objects. Do not include markdown code block syntax.

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
  const timeoutId = setTimeout(() => controller.abort(), 35000); // 35s timeout

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
      if (attempt <= 3) {
        process.stdout.write(`\n⏳ [Timeout] Server took >35s for "${rowCat.shortName} x ${colCat.shortName}". Retrying (Attempt ${attempt}/3)...\n`);
        return queryGeminiForIntersection(rowCat, colCat, apiKey, modelName, isMock, attempt + 1);
      }
      throw new Error(`Request timed out after 35s for ${rowCat.shortName} x ${colCat.shortName}`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const errText = await response.text();

    // Catch 429 (Quota limit) and 503 (High demand) with automatic backoff and retry
    if ((response.status === 429 || response.status === 503) && attempt <= 3) {
      const waitSec = parseRetryDelay(errText) + 2;

      // If quota is exhausted (waitSec > 60), switch to the next available model in the pool!
      if (waitSec > 60) {
        const nextModel = getNextAvailableModel(modelName);
        if (nextModel) {
          process.stdout.write(
            `\n🔄 [Quota Exhausted] "${modelName}" is locked for ${Math.round(waitSec / 60)} mins. Auto-switching to "${nextModel}"...\n`
          );
          currentActiveModel = nextModel;
          return queryGeminiForIntersection(rowCat, colCat, apiKey, nextModel, isMock, 1);
        }
        throw new Error(
          `Google Free Tier limit reached for all candidate models (retry in ${Math.round(waitSec / 60)} mins).`
        );
      }

      process.stdout.write(
        `\n⏳ [Quota/Demand: ${response.status}] Waiting ${waitSec}s before retrying "${rowCat.shortName} x ${colCat.shortName}" (Attempt ${attempt}/3)...\n`
      );
      await new Promise((r) => setTimeout(r, waitSec * 1000));
      return queryGeminiForIntersection(rowCat, colCat, apiKey, modelName, isMock, attempt + 1);
    }

    // Catch Google's model update recommendation dynamically
    const suggestedModelMatch = errText.match(/models\/([a-zA-Z0-9.-]+) for the latest/);
    if (suggestedModelMatch && suggestedModelMatch[1] && suggestedModelMatch[1] !== modelName) {
      const newModel = suggestedModelMatch[1];
      console.log(`\n🔄 Switching to recommended model "${newModel}"...`);
      currentActiveModel = newModel;
      return queryGeminiForIntersection(rowCat, colCat, apiKey, newModel, isMock, attempt);
    }

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
// Rate-Limited Concurrency Controller
// ============================================================================
async function runWithRateLimit<T, R>(
  items: T[],
  concurrency: number,
  delayBetweenCallsMs: number,
  fn: (item: T, idx: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  let index = 0;
  let lastDispatchTime = 0;

  async function worker() {
    while (index < items.length) {
      const currentIndex = index++;

      // Enforce rate limit delay between start times
      if (delayBetweenCallsMs > 0) {
        const now = Date.now();
        const timeSinceLast = now - lastDispatchTime;
        if (timeSinceLast < delayBetweenCallsMs) {
          const waitTime = delayBetweenCallsMs - timeSinceLast;
          lastDispatchTime = now + waitTime;
          await new Promise((r) => setTimeout(r, waitTime));
        } else {
          lastDispatchTime = now;
        }
      }

      const res = await fn(items[currentIndex], currentIndex);
      results[currentIndex] = res;
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
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
  const isPaid = args.includes('--paid');
  const isAll = args.includes('--all');
  const apiKey = getArg('key', process.env.GEMINI_API_KEY || (isMock ? 'mock_key' : ''));
  const mode = args.includes('--daily') ? 'daily' : args.includes('--metro') ? 'metro' : 'sample';
  const sampleCount = isAll ? 99999 : parseInt(getArg('sample', mode === 'daily' ? '16' : '15'), 10);
  
  // Rate limiting & concurrency: Free tier limit is 5 RPM (1 request every 12s)
  const defaultConcurrency = isPaid ? 4 : 1;
  const defaultDelay = isMock ? 0 : (isPaid ? 300 : 12500);
  const concurrency = parseInt(getArg('concurrency', String(defaultConcurrency)), 10);
  const delayMs = parseInt(getArg('delay', String(defaultDelay)), 10);
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

  if (args.includes('--list-models')) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      console.log('\n📋 AVAILABLE GEMINI MODELS FOR YOUR ACCOUNT:');
      for (const m of data.models || []) {
        if (m.supportedGenerationMethods?.includes('generateContent')) {
          const id = m.name.replace(/^models\//, '');
          console.log(`  • ${id.padEnd(30)} | ${m.displayName || ''}`);
        }
      }
      console.log('\n💡 Run with any model: npm run verify:gemini -- --model=<model_name>\n');
    } catch (e: any) {
      console.error('Failed to list models:', e.message);
    }
    process.exit(0);
  }

  let activeModel = requestedModel || 'gemini-2.0-flash';
  if (!isMock) {
    activeModel = await initAvailableModelsPool(apiKey, requestedModel || undefined);
  }

  const intersections = getTestIntersections(mode, sampleCount);
  console.log(`\n📋 Mode: [${isAll ? 'ALL RANDOM' : mode.toUpperCase()}]`);
  console.log(`⚡ Testing ${intersections.length} Category Intersections`);
  console.log(`🤖 Starting Model: ${activeModel}`);
  if (isPaid) {
    console.log(`🚀 Mode: [PAID TIER] | Concurrency: ${concurrency} workers | Delay: ${delayMs}ms`);
  } else {
    console.log(`⏱️  Pacing: [FREE TIER] | 1 request every ${(delayMs / 1000).toFixed(1)}s (prevents 429 quota exhaustion)`);
    console.log(`💡 Tip: If you have billing enabled on Google AI Studio, add --paid to run at full speed!`);
  }
  console.log(`📊 Athlete Database Size: ${ATHLETES.length.toLocaleString()} athletes\n`);

  const startTime = Date.now();

  let completedCount = 0;
  let liveAccepted = 0;
  let liveMissing = 0;
  let liveRejected = 0;

  function renderProgressBar(currentLabel: string = '') {
    const total = intersections.length;
    const percent = total > 0 ? completedCount / total : 0;
    const barLength = 20;
    const filled = Math.round(barLength * percent);
    const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
    const pctStr = (percent * 100).toFixed(1).padStart(5, ' ');
    const label = currentLabel ? ` | ${currentLabel.slice(0, 32)}` : '';
    const line = `\r[${bar}] ${pctStr}% (${completedCount}/${total}) | ✅ ${liveAccepted} | ⚠️ ${liveMissing} | 🚨 ${liveRejected}${label}`;
    process.stdout.write(line.padEnd(100, ' '));
  }

  renderProgressBar('Starting...');

  const results: CellVerificationResult[] = await runWithRateLimit(
    intersections,
    concurrency,
    delayMs,
    async ([rowCat, colCat], index) => {
      let botAnswers: BotAthleteAnswer[] = [];
      try {
        botAnswers = await queryGeminiForIntersection(rowCat, colCat, apiKey, currentActiveModel, isMock);
      } catch (err: any) {
        process.stdout.write(`\n  ⚠️  Failed: ${rowCat.shortName} × ${colCat.shortName} (${err.message})\n`);
        completedCount++;
        renderProgressBar(`${rowCat.shortName} × ${colCat.shortName}`);
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
        const candidates = findAthletesByName(botAns.name);

        if (candidates.length === 0) {
          cellResult.missingFromDb.push({
            athleteName: botAns.name,
            sport: botAns.sport,
            reasoning: botAns.reasoning,
          });
          continue;
        }

        // Check if ANY matching athlete with this name satisfies the cell criteria
        // (handles multiple athletes with identical names, e.g. Randy Johnson the 300-win pitcher vs the 1980s batter)
        const bestMatch =
          candidates.find((a) => doesAthleteMatchCell(rowCat, colCat, a).isMatch) ||
          candidates[0]; // fallback to the most popular player

        const match = doesAthleteMatchCell(rowCat, colCat, bestMatch);
        if (match.isMatch) {
          cellResult.accepted.push({
            athleteName: bestMatch.name,
            athleteId: bestMatch.id,
            sport: botAns.sport,
            reasoning: botAns.reasoning,
          });
        } else {
          cellResult.rejectedByGrid.push({
            athleteName: bestMatch.name,
            athleteId: bestMatch.id,
            failureReason: match.failureReason,
            reasoning: botAns.reasoning,
          });
        }
      }

      completedCount++;
      liveAccepted += cellResult.accepted.length;
      liveMissing += cellResult.missingFromDb.length;
      liveRejected += cellResult.rejectedByGrid.length;
      renderProgressBar(`${rowCat.shortName} × ${colCat.shortName}`);

      return cellResult;
    }
  );

  process.stdout.write('\n');
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

  // Group missing candidates uniquely by sport for direct ingestion into augmentation
  const enrichmentBySport: Record<string, { name: string; sport: string; reasonings: string[]; cells: string[] }[]> = {
    NFL: [],
    NBA: [],
    MLB: [],
    NHL: [],
  };

  const seenMissing = new Map<string, { name: string; sport: string; reasonings: string[]; cells: string[] }>();
  for (const m of allMissing) {
    const key = `${m.player.toLowerCase()}___${m.sport}`;
    if (!seenMissing.has(key)) {
      seenMissing.set(key, {
        name: m.player,
        sport: m.sport,
        reasonings: [m.reasoning],
        cells: [m.cell],
      });
    } else {
      const entry = seenMissing.get(key)!;
      if (!entry.cells.includes(m.cell)) entry.cells.push(m.cell);
      if (!entry.reasonings.includes(m.reasoning)) entry.reasonings.push(m.reasoning);
    }
  }

  for (const entry of seenMissing.values()) {
    const sp = entry.sport.toUpperCase();
    if (enrichmentBySport[sp]) {
      enrichmentBySport[sp].push(entry);
    } else {
      if (!enrichmentBySport['OTHER']) enrichmentBySport['OTHER'] = [];
      enrichmentBySport['OTHER'].push(entry);
    }
  }

  // Write detailed reports
  fs.writeFileSync(REPORT_FILE, JSON.stringify(results, null, 2), 'utf-8');
  fs.writeFileSync(MISSING_CANDIDATES_FILE, JSON.stringify(allMissing, null, 2), 'utf-8');
  fs.writeFileSync(DISCREPANCIES_FILE, JSON.stringify(allDiscrepancies, null, 2), 'utf-8');
  fs.writeFileSync(ENRICHMENT_EXPORT_FILE, JSON.stringify(enrichmentBySport, null, 2), 'utf-8');

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
  console.log(`  • ${ENRICHMENT_EXPORT_FILE} (Grouped by sport for auto-augmentation)`);
  console.log('');
}

main().catch((err) => {
  console.error('\n💥 Unhandled error in main():', err);
  process.exit(1);
});
