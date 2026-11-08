/**
 * Comprehensive Uniform & Jersey Number Scraping Pipeline
 * 
 * Scrapes numbers 0 through 99 from Sports Reference (Baseball-Reference,
 * Basketball-Reference, Hockey-Reference).
 * 
 * - Fully cached to `.cache/uniforms/{sport}/{number}.html`
 * - Strictly respects the 3.1-second rate limit between uncached downloads
 * - Cross-references players by ID (data-append-csv) and normalized name
 * - Backfills full career jersey numbers across MLB, NBA, and NHL
 */

import fs from 'fs';
import path from 'path';
import { Athlete } from '../src/types';

const CACHE_BASE = path.join(process.cwd(), '.cache', 'uniforms');

const SPORT_CONFIGS: Record<
  string,
  {
    name: string;
    file: string;
    idPrefix: string;
    baseUrl: (num: number) => string;
  }
> = {
  nba: {
    name: 'NBA',
    file: path.join(process.cwd(), 'src', 'data', 'athletes-nba.json'),
    idPrefix: 'ath_nba_',
    baseUrl: (num) => `https://www.basketball-reference.com/friv/numbers.fcgi?number=${num}`,
  },
  mlb: {
    name: 'MLB',
    file: path.join(process.cwd(), 'src', 'data', 'athletes-mlb.json'),
    idPrefix: 'ath_mlb_',
    baseUrl: (num) => `https://www.baseball-reference.com/friv/numbers.cgi?number=${num}`,
  },
  nhl: {
    name: 'NHL',
    file: path.join(process.cwd(), 'src', 'data', 'athletes-nhl.json'),
    idPrefix: 'ath_nhl_',
    baseUrl: (num) => `https://www.hockey-reference.com/friv/numbers.cgi?number=${num}`,
  },
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cleanPlayerName(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, '') // remove HTML tags
    .replace(/[*#+†]/g, '')   // remove HOF, all-star, and switch hitter symbols
    .replace(/\s+/g, ' ')
    .trim();
}

async function scrapeSport(sportKey: string) {
  const config = SPORT_CONFIGS[sportKey];
  if (!config) {
    console.error(`Unknown sport: ${sportKey}`);
    return;
  }

  console.log(`\n======================================================`);
  console.log(`Starting Uniform Number Scrape for: ${config.name}`);
  console.log(`======================================================`);

  const cacheDir = path.join(CACHE_BASE, sportKey);
  fs.mkdirSync(cacheDir, { recursive: true });

  // Load target athletes
  const rawData = fs.readFileSync(config.file, 'utf-8');
  const athletes: Athlete[] = JSON.parse(rawData);
  console.log(`Loaded ${athletes.length} ${config.name} athletes from ${config.file}`);

  // Build lookups
  const byId = new Map<string, Athlete>();
  const byName = new Map<string, Athlete[]>();

  for (const a of athletes) {
    byId.set(a.id, a);
    const norm = a.name.toLowerCase().trim();
    const existing = byName.get(norm) || [];
    existing.push(a);
    byName.set(norm, existing);
  }

  // Track player numbers: Map<Athlete, Set<number>>
  const numbersMap = new Map<Athlete, Set<number>>();
  athletes.forEach((a) => {
    numbersMap.set(a, new Set(a.jerseyNumbers || []));
  });

  const numbersToScrape = Array.from({ length: 100 }, (_, i) => i); // 0 to 99

  let totalParsedRows = 0;
  let cacheHits = 0;
  let liveDownloads = 0;

  for (const num of numbersToScrape) {
    const cacheFile = path.join(cacheDir, `${num}.html`);
    let html = '';

    if (fs.existsSync(cacheFile)) {
      html = fs.readFileSync(cacheFile, 'utf-8');
      cacheHits++;
    } else {
      const url = config.baseUrl(num);
      console.log(`[${config.name} #${num}] Fetching from ${url}...`);

      let attempts = 0;
      let success = false;
      while (attempts < 3 && !success) {
        attempts++;
        try {
          const res = await fetch(url, {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
          });

          if (res.status === 429) {
            console.warn(`[Rate Limited 429] Waiting 60 seconds before retry...`);
            await sleep(60000);
            continue;
          }

          if (!res.ok) {
            console.warn(`[HTTP ${res.status}] Failed to fetch #${num}`);
            break;
          }

          html = await res.text();
          fs.writeFileSync(cacheFile, html, 'utf-8');
          liveDownloads++;
          success = true;

          // Respect Sports Reference rate limit: 20 req/min = 3.1s between requests
          await sleep(3100);
        } catch (err) {
          console.error(`Error fetching #${num}:`, err);
          await sleep(5000);
        }
      }
    }

    if (!html) continue;

    // Pattern: <th scope="row" ... data-append-csv="([^"]+)" ...><a ...>(.*?)</a>
    const rowRegex = /<th\s+scope="row"[^>]*data-append-csv="([^"]+)"[^>]*>.*?<a[^>]*>(.*?)<\/a>/g;
    const matches = [...html.matchAll(rowRegex)];

    for (const m of matches) {
      totalParsedRows++;
      const csvId = m[1].trim();
      const rawName = m[2];
      const cleanName = cleanPlayerName(rawName);

      // Match 1: By ID
      let matchedAthlete: Athlete | undefined = byId.get(`${config.idPrefix}${csvId}`);

      // Match 2: By Name
      if (!matchedAthlete) {
        const candidates = byName.get(cleanName.toLowerCase());
        if (candidates && candidates.length === 1) {
          matchedAthlete = candidates[0];
        } else if (candidates && candidates.length > 1) {
          matchedAthlete = candidates[0];
        }
      }

      if (matchedAthlete) {
        const set = numbersMap.get(matchedAthlete)!;
        set.add(num);
      }
    }

    if (num % 10 === 0 || num === 99) {
      console.log(`[${config.name}] Processed up to #${num} (${matches.length} players found for #${num})`);
    }
  }

  console.log(`\n--- ${config.name} Scraping Results ---`);
  console.log(`Cache Hits: ${cacheHits} / 100`);
  console.log(`Live Downloads: ${liveDownloads} / 100`);
  console.log(`Total Player-Number Records Parsed: ${totalParsedRows}`);

  // Apply to athletes
  let updatedCount = 0;
  for (const a of athletes) {
    const set = numbersMap.get(a)!;
    const current = a.jerseyNumbers || [];
    const merged = Array.from(set).sort((x, y) => x - y);
    if (merged.length !== current.length || !merged.every((v, idx) => v === current[idx])) {
      a.jerseyNumbers = merged;
      updatedCount++;
    }
  }

  const totalWithNumbers = athletes.filter((a) => a.jerseyNumbers && a.jerseyNumbers.length > 0).length;
  const coveragePercent = Math.round((totalWithNumbers / athletes.length) * 1000) / 10;

  console.log(`Updated ${updatedCount} ${config.name} athletes.`);
  console.log(
    `Total ${config.name} Athletes with Jersey Numbers: ${totalWithNumbers} / ${athletes.length} (${coveragePercent}%)`
  );

  // Write updated file
  fs.writeFileSync(config.file, JSON.stringify(athletes, null, 2), 'utf-8');
  console.log(`Successfully saved ${config.file}!`);
}

async function main() {
  const args = process.argv.slice(2);
  const sportArg = args.find((a) => a.startsWith('--sport='))?.split('=')[1]?.toLowerCase() || 'all';

  if (sportArg === 'all') {
    await scrapeSport('nba');
    await scrapeSport('nhl');
    await scrapeSport('mlb');
  } else {
    await scrapeSport(sportArg);
  }

  console.log('\n=== All Requested Uniform Scrapes Completed Successfully! ===\n');
}

main().catch((err) => {
  console.error('Fatal error in scraper pipeline:', err);
  process.exit(1);
});
