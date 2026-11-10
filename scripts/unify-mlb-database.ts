/**
 * MLB Database Unification Script
 *
 * Merges duplicate historical and live records in `src/data/athletes-mlb.json`.
 * Ensures all players active from 2022 through 2026 (like Teoscar Hernandez,
 * Jose Abreu, Javier Baez, Ronald Acuna Jr., etc.) are fully updated in their
 * canonical historical records (`ath_mlb_*`) with:
 * - Active years through 2026
 * - Complete modern teams (e.g. Dodgers for Teoscar, Astros for Abreu, Tigers for Baez)
 * - Complete markets, uniform numbers, stats, and accolades (e.g. 2024 Dodgers championship)
 *
 * Purges the redundant `ath_mlb_live_*` records so no player is duplicated.
 */

import fs from 'fs';
import path from 'path';
import { Athlete } from '../src/types';
import { getMarketsForAthlete } from '../src/lib/marketResolver';

const MLB_FILE = path.join(process.cwd(), 'src', 'data', 'athletes-mlb.json');

const FIRST_NAME_ALIASES: Record<string, string> = {
  matt: 'matthew',
  matthew: 'matt',
  mike: 'michael',
  michael: 'mike',
  dan: 'daniel',
  daniel: 'dan',
  josh: 'joshua',
  joshua: 'josh',
  phil: 'philip',
  philip: 'phil',
  nick: 'nicholas',
  nicholas: 'nick',
  nicklaus: 'nick',
  jake: 'jacob',
  jacob: 'jake',
  tayron: 'tyron',
  tyron: 'tayron',
  carlos: 'yolmer',
  yolmer: 'carlos',
  jackson: 'clint',
  clint: 'jackson',
};

function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\b(jr|sr|ii|iii|iv)\b/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function getSuperKeys(name: string): string[] {
  const norm = normalizeName(name);
  const keys = new Set<string>([norm]);

  const words = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .trim()
    .split(/\s+/);

  if (words.length >= 2) {
    const first = words[0];
    const last = words[words.length - 1];

    keys.add(`${first}${last}`);

    const alias = FIRST_NAME_ALIASES[first];
    if (alias) {
      keys.add(`${alias}${last}`);
    }
  }

  return Array.from(keys);
}

export function unifyMLBDatabase(): { mergedCount: number; remainingCount: number } {
  console.log('=== Unifying MLB Database (Historical + Live) ===');

  const raw = fs.readFileSync(MLB_FILE, 'utf-8');
  const athletes: Athlete[] = JSON.parse(raw);
  console.log(`Initial MLB athlete count: ${athletes.length}`);

  const lives = athletes.filter((a) => a.id.startsWith('ath_mlb_live_'));
  const hists = athletes.filter((a) => !a.id.startsWith('ath_mlb_live_'));
  console.log(`Historical: ${hists.length}, Live: ${lives.length}`);

  // Build index for historical athletes by all superKeys
  const histMap = new Map<string, Athlete[]>();
  for (const h of hists) {
    for (const k of getSuperKeys(h.name)) {
      if (!histMap.has(k)) histMap.set(k, []);
      histMap.get(k)!.push(h);
    }
  }

  const liveIdsToRemove = new Set<string>();
  let mergedCount = 0;

  for (const live of lives) {
    let matchedHist: Athlete | null = null;

    for (const k of getSuperKeys(live.name)) {
      const candidates = histMap.get(k);
      if (candidates && candidates.length > 0) {
        // Find candidate whose active years or teams overlap
        const cand = candidates.find(
          (c) =>
            Math.abs(c.activeYears[0] - live.activeYears[0]) <= 5 ||
            c.teams.some((t) => live.teams.includes(t))
        );
        if (cand) {
          matchedHist = cand;
          break;
        }
      }
    }

    if (matchedHist) {
      liveIdsToRemove.add(live.id);
      mergedCount++;

      // 1. Active Years
      matchedHist.activeYears[0] = Math.min(matchedHist.activeYears[0], live.activeYears[0]);
      matchedHist.activeYears[1] = Math.max(matchedHist.activeYears[1], live.activeYears[1]);

      // 2. Teams & Team Names
      for (const t of live.teams) {
        if (!matchedHist.teams.includes(t)) matchedHist.teams.push(t);
      }
      if (live.teamNames) {
        if (!matchedHist.teamNames) matchedHist.teamNames = [];
        for (const tn of live.teamNames) {
          if (!matchedHist.teamNames.includes(tn)) matchedHist.teamNames.push(tn);
        }
      }

      // 3. Uniform Numbers
      if (live.jerseyNumbers) {
        if (!matchedHist.jerseyNumbers) matchedHist.jerseyNumbers = [];
        for (const j of live.jerseyNumbers) {
          if (!matchedHist.jerseyNumbers.includes(j)) matchedHist.jerseyNumbers.push(j);
        }
        matchedHist.jerseyNumbers.sort((a, b) => a - b);
      }

      // 4. Draft & College
      if (!matchedHist.draftPick && live.draftPick) matchedHist.draftPick = live.draftPick;
      if (!matchedHist.draftRound && live.draftRound) matchedHist.draftRound = live.draftRound;
      if (!matchedHist.draftYear && live.draftYear) matchedHist.draftYear = live.draftYear;
      if (!matchedHist.college && live.college) matchedHist.college = live.college;
      if (!matchedHist.collegeConference && live.collegeConference) matchedHist.collegeConference = live.collegeConference;

      // 5. Positions
      if (live.positions) {
        if (!matchedHist.positions) matchedHist.positions = [];
        for (const p of live.positions) {
          if (!matchedHist.positions.includes(p)) matchedHist.positions.push(p);
        }
      }

      // 6. Accolades
      matchedHist.championships = Math.max(matchedHist.championships || 0, live.championships || 0);
      matchedHist.mvps = Math.max(matchedHist.mvps || 0, live.mvps || 0);
      if (live.rookieOfTheYear) matchedHist.rookieOfTheYear = true;
      if (live.hallOfFame) matchedHist.hallOfFame = true;

      // 7. Accolade Markets
      if (live.championshipMarkets) {
        if (!matchedHist.championshipMarkets) matchedHist.championshipMarkets = [];
        for (const cm of live.championshipMarkets) {
          if (!matchedHist.championshipMarkets.includes(cm)) matchedHist.championshipMarkets.push(cm);
        }
      }
      if (live.mvpMarkets) {
        if (!matchedHist.mvpMarkets) matchedHist.mvpMarkets = [];
        for (const mm of live.mvpMarkets) {
          if (!matchedHist.mvpMarkets.includes(mm)) matchedHist.mvpMarkets.push(mm);
        }
      }

      // 8. Stats
      if (!matchedHist.stats) matchedHist.stats = {};
      if (live.stats) {
        matchedHist.stats.hits = Math.max(matchedHist.stats.hits || 0, live.stats.hits || 0);
        matchedHist.stats.steals = Math.max(matchedHist.stats.steals || 0, live.stats.steals || 0);
        matchedHist.stats.saves = Math.max(matchedHist.stats.saves || 0, live.stats.saves || 0);
        matchedHist.stats.wins = Math.max(matchedHist.stats.wins || 0, live.stats.wins || 0);
      }

      // 9. Popularity
      matchedHist.popularityScore = Math.max(matchedHist.popularityScore || 0, live.popularityScore || 0);

      // 10. Recalculate Markets
      matchedHist.markets = Array.from(getMarketsForAthlete(matchedHist));
    }
  }

  // Filter out redundant live records
  const unifiedAthletes = athletes.filter((a) => !liveIdsToRemove.has(a.id));

  // Ensure all athletes have valid markets and positions
  for (const a of unifiedAthletes) {
    a.markets = Array.from(getMarketsForAthlete(a));
    if (!a.positions || a.positions.length === 0) a.positions = ['P'];
  }

  fs.writeFileSync(MLB_FILE, JSON.stringify(unifiedAthletes, null, 2), 'utf-8');
  console.log(`Successfully merged ${mergedCount} duplicate live records into canonical historical records.`);
  console.log(`Saved ${unifiedAthletes.length} total athletes to ${MLB_FILE}`);

  return { mergedCount, remainingCount: unifiedAthletes.length };
}

if (require.main === module) {
  unifyMLBDatabase();
}
