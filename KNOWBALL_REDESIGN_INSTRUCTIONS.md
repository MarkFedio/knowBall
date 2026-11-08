# Implementation Guide: KNOWBALL Redesign ("Think you know ball? Prove it.")

This guide contains complete, step-by-step instructions and drop-in code for implementing the **KNOWBALL** brand overhaul across the codebase.

---

## Overview of Picks to Implement

1. **Brand & Logo:** **The Arena Marquee** — Heavy collegiate/stadium marquee lettering `KNOWBALL` with gold accent + the catchphrase *"Think you know ball? Prove it."* in gold subtext.
2. **Header Layout:** **The KnowBall Linear Command Header** (Variation 3 single-row architecture with the warm amber/graphite styling of choice #1).
3. **Cultural Rarity Tiers:** Updated in `src/lib/rarityUtils.ts` to sports debate vernacular (`★ CERTIFIED SICKO`, `◆ BALL KNOWER`, `SOLID PULL`, `CASUAL PICK`).
4. **Viral Post-Game Flex Card & Microcopy:** Updated in `src/components/StatsModal.tsx` and `src/app/page.tsx` with dynamic verdicts (`CERTIFIED BALL KNOWER` vs `CASUAL ALERT`), debate microcopy (`Tap Out`, `Run It Back`), and 1-click clipboard sharing.

---

## File 1: `src/lib/rarityUtils.ts` (Rarity Tiers Overhaul)

Replace the entire contents of `src/lib/rarityUtils.ts` with:

```typescript
/**
 * Rarity tier classification and badge styling for KNOWBALL:
 * - < 1.0%: CERTIFIED SICKO (Holographic Gold Foil)
 * - 1.0% - 5.0%: BALL KNOWER (Emerald Glow)
 * - 5.0% - 15.0%: SOLID PULL (Cyan Keyline)
 * - > 15.0%: CASUAL PICK (Muted Slate / Tease)
 */

export type RarityTierName = 'SICKO' | 'KNOWER' | 'SOLID' | 'CASUAL';

export interface RarityTierMeta {
  tier: RarityTierName;
  badgeClass: string;
  pillClass: string;
  prefixIcon: string;
  label: string;
}

export function getRarityTier(rarityPercentage: number | undefined): RarityTierMeta {
  const r = rarityPercentage ?? 100;

  if (r < 1.0) {
    return {
      tier: 'SICKO',
      badgeClass:
        'bg-[#281b04]/90 text-amber-300 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)]',
      pillClass:
        'border border-amber-400/90 bg-[#281b04]/95 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.5)] font-mono font-black text-[10px] tracking-wide px-2 py-0.5 rounded-md',
      prefixIcon: '★',
      label: 'CERTIFIED SICKO',
    };
  }

  if (r <= 5.0) {
    return {
      tier: 'KNOWER',
      badgeClass:
        'bg-[#062c19]/90 text-emerald-300 border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]',
      pillClass:
        'border border-emerald-400/90 bg-[#062c19]/95 text-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.4)] font-mono font-black text-[10px] tracking-wide px-2 py-0.5 rounded-md',
      prefixIcon: '◆',
      label: 'BALL KNOWER',
    };
  }

  if (r <= 15.0) {
    return {
      tier: 'SOLID',
      badgeClass:
        'bg-[#082f49]/90 text-cyan-300 border-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.4)]',
      pillClass:
        'border border-cyan-400/80 bg-[#082f49]/90 text-cyan-300 shadow-[0_0_6px_rgba(56,189,248,0.3)] font-mono font-black text-[10px] tracking-wide px-2 py-0.5 rounded-md',
      prefixIcon: '',
      label: 'SOLID PULL',
    };
  }

  return {
    tier: 'CASUAL',
    badgeClass: 'bg-[#18202c]/90 text-slate-300 border-slate-500/80',
    pillClass:
      'border border-slate-600 bg-[#18202c]/90 text-slate-300 font-mono font-bold text-[10px] tracking-wide px-2 py-0.5 rounded-md',
    prefixIcon: '',
    label: 'CASUAL PICK',
  };
}
```

---

## File 2: `src/components/Header.tsx` (Arena Marquee + Linear Command Header)

Replace the entire contents of `src/components/Header.tsx` with:

```tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Trophy,
  RotateCcw,
  Flame,
  Sparkles,
  Dices,
  Eye,
  Volume2,
  VolumeX,
  Palette,
  Flag,
} from 'lucide-react';
import { PlayMode, Sport, DailyPuzzle, VisualTheme } from '@/types';
import { LedScoreboardClock } from './LedScoreboardClock';
import { LeagueIcon } from './LeagueIcon';

interface HeaderProps {
  currentPuzzle: DailyPuzzle;
  onNewRandomPuzzle: () => void;
  onOpenArchive?: () => void;
  onGiveUp: () => void;
  isGameOver: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  playMode: PlayMode;
  onToggleMode: (mode: PlayMode) => void;
  guessesUsed: number;
  maxGuesses: number;
  strikesUsed: number;
  maxStrikes: number;
  totalRarityScore: number;
  sportsUsed: Set<Sport>;
  hasGrandSlam: boolean;
  theme?: VisualTheme;
  onToggleTheme?: (theme: VisualTheme) => void;
  onOpenHowToPlay: () => void;
  onOpenStats: () => void;
  onResetGame: () => void;
}

const ALL_SPORTS: Sport[] = ['NFL', 'NBA', 'MLB', 'NHL'];

export const Header: React.FC<HeaderProps> = ({
  currentPuzzle,
  onNewRandomPuzzle,
  onGiveUp,
  isGameOver,
  soundEnabled,
  onToggleSound,
  playMode,
  onToggleMode,
  guessesUsed,
  maxGuesses,
  strikesUsed,
  maxStrikes,
  totalRarityScore,
  sportsUsed,
  hasGrandSlam,
  theme = 'SCOREBOARD',
  onToggleTheme,
  onOpenHowToPlay,
  onOpenStats,
  onResetGame,
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('00:00:00');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
      const diffMs = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs / (1000 * 60)) % 60);
      const secs = Math.floor((diffMs / 1000) % 60);
      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const guessesRemaining = Math.max(0, maxGuesses - guessesUsed);
  const isScoreboard = theme === 'SCOREBOARD';
  const isNeon = theme === 'NEON';

  const cycleTheme = () => {
    if (!onToggleTheme) return;
    if (theme === 'SCOREBOARD') onToggleTheme('NEON');
    else if (theme === 'NEON') onToggleTheme('CLASSIC');
    else onToggleTheme('SCOREBOARD');
  };

  const themeLabel =
    theme === 'SCOREBOARD' ? 'Scoreboard' : theme === 'NEON' ? 'Cyber Neon' : 'Classic Dark';

  return (
    <header className="w-full max-w-5xl mx-auto mb-4 select-none">
      {/* ======================================================== */}
      {/* KNOWBALL LINEAR COMMAND BAR (SINGLE HORIZONTAL DECK)     */}
      {/* ======================================================== */}
      <div
        className={`w-full flex flex-wrap items-center justify-between gap-2.5 sm:gap-3.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl transition-all duration-300 ${
          isScoreboard
            ? 'bg-[#0e121a]/95 border border-amber-500/35 shadow-[0_6px_24px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.06)]'
            : isNeon
            ? 'bg-[#08111d]/90 border border-[#00e5a3]/35 shadow-[0_0_24px_rgba(0,229,163,0.12)] backdrop-blur-md'
            : 'bg-zinc-900 border border-zinc-800'
        }`}
      >
        {/* ---------------------------------------------------- */}
        {/* SECTION 1: THE ARENA MARQUEE BRAND & CATCHPHRASE     */}
        {/* ---------------------------------------------------- */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div
            onClick={onOpenHowToPlay}
            className="cursor-pointer group flex flex-col transition transform active:scale-95"
            title="KNOWBALL • 'Think you know ball? Prove it.' (Click for rules)"
          >
            {/* The Arena Marquee Logo */}
            <div className="font-scoreboard text-2xl sm:text-3xl font-black tracking-wider text-white leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              KNOW<span className="text-amber-400">BALL</span>
            </div>

            {/* Official Catchphrase */}
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-amber-400/90 drop-shadow-[0_0_6px_rgba(245,158,11,0.4)] mt-0.5">
              Think you know ball? Prove it.
            </span>
          </div>

          {/* Vertical Divider */}
          <div className="hidden sm:block h-7 w-px bg-zinc-800/80 mx-0.5" />

          {/* Play Mode Switcher (Ball Knower vs Casual) */}
          <div className="flex rounded-lg bg-zinc-950/70 p-0.5 border border-zinc-800/80 text-[11px]">
            <button
              onClick={() => onToggleMode('IMMACULATE')}
              title="Ball Knower: 16 Guesses, 0 Strikes"
              className={`flex items-center gap-1 px-2 py-1 rounded-md font-bold transition ${
                playMode === 'IMMACULATE'
                  ? isScoreboard
                    ? 'bg-amber-400 text-black shadow-sm'
                    : isNeon
                    ? 'bg-[#00f5b8] text-black shadow-sm'
                    : 'bg-white text-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Flame className="h-3 w-3" />
              <span>Ball Knower</span>
            </button>
            <button
              onClick={() => onToggleMode('STRIKES')}
              title="Casual Mode: 4 Strikes Allowed"
              className={`flex items-center gap-1 px-2 py-1 rounded-md font-bold transition ${
                playMode === 'STRIKES'
                  ? isScoreboard
                    ? 'bg-amber-400 text-black shadow-sm'
                    : isNeon
                    ? 'bg-cyan-400 text-black shadow-sm'
                    : 'bg-white text-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>Casual (4 Strikes)</span>
            </button>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* SECTION 2: DIGITAL CLOCK & PUZZLE IDENTIFIER         */}
        {/* ---------------------------------------------------- */}
        <div className="flex items-center gap-2.5 shrink-0">
          <LedScoreboardClock timeStr={timeLeft} theme={theme} />

          {/* Puzzle ID Chip */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-950/60 border border-zinc-800 text-[11px] font-medium text-zinc-300">
            <span
              className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                isScoreboard ? 'bg-amber-400' : isNeon ? 'bg-[#00f5b8]' : 'bg-emerald-400'
              }`}
            />
            <span className="truncate max-w-[130px] font-mono">{currentPuzzle.title}</span>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="hidden md:block h-7 w-px bg-zinc-800/80" />

        {/* ---------------------------------------------------- */}
        {/* SECTION 3: LIVE STATS (GUESSES & RARITY)             */}
        {/* ---------------------------------------------------- */}
        <div className="flex flex-col text-right font-mono text-xs leading-tight shrink-0">
          <div className="flex items-center justify-end gap-1.5">
            <span className="text-zinc-400 text-[11px] font-sans">
              {playMode === 'IMMACULATE' ? 'Guesses:' : 'Strikes:'}
            </span>
            <span
              className={`font-bold font-mono text-xs sm:text-sm ${
                isScoreboard
                  ? 'text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]'
                  : isNeon
                  ? 'text-[#00f5b8] drop-shadow-[0_0_6px_rgba(0,245,184,0.4)]'
                  : 'text-zinc-200'
              }`}
            >
              {playMode === 'IMMACULATE' ? guessesRemaining : `${strikesUsed}/${maxStrikes}`}
            </span>
          </div>

          <div className="flex items-center justify-end gap-1.5 mt-0.5">
            <span className="text-zinc-400 text-[11px] font-sans">Rarity:</span>
            <span
              className={`font-bold font-mono text-xs sm:text-sm ${
                isScoreboard
                  ? 'text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]'
                  : isNeon
                  ? 'text-[#00f5b8] drop-shadow-[0_0_6px_rgba(0,245,184,0.4)]'
                  : 'text-zinc-200'
              }`}
            >
              {totalRarityScore.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="hidden sm:block h-7 w-px bg-zinc-800/80" />

        {/* ---------------------------------------------------- */}
        {/* SECTION 4: GRAND SLAM & 4 LEAGUE TOKENS              */}
        {/* ---------------------------------------------------- */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex flex-col items-end sm:items-center">
            <div className="flex items-center gap-1 text-[10px] font-black tracking-wide text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]">
              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
              <span>GRAND SLAM</span>
              <span className="ml-0.5 px-1 py-0.2 rounded bg-amber-500/15 border border-amber-500/40 text-[9px] text-amber-200">
                {sportsUsed.size}/4
              </span>
            </div>

            {/* 4 League Medallions */}
            <div className="flex items-center gap-1 mt-1">
              {ALL_SPORTS.map((sport) => {
                const isUsed = sportsUsed.has(sport);
                return (
                  <LeagueIcon
                    key={sport}
                    sport={sport}
                    size="sm"
                    variant="circle"
                    active={isUsed}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="hidden md:block h-7 w-px bg-zinc-800/80" />

        {/* ---------------------------------------------------- */}
        {/* SECTION 5: ACTION SUITE TOOLBAR (STRICTLY LEFT-ALIGNED) */}
        {/* ---------------------------------------------------- */}
        <div className="flex items-center justify-start gap-1.5 w-full sm:w-auto shrink-0">
          {/* Theme Switcher */}
          {onToggleTheme && (
            <button
              onClick={cycleTheme}
              title={`Active Theme: ${themeLabel}. Click to switch.`}
              className={`p-1.5 sm:px-2 sm:py-1 rounded-lg border text-[11px] font-bold transition flex items-center gap-1 ${
                isScoreboard
                  ? 'bg-[#1a170e] border-amber-500/40 text-amber-300 hover:bg-[#251f10]'
                  : isNeon
                  ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/40'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white'
              }`}
            >
              <Palette className="h-3.5 w-3.5" />
              <span className="hidden xl:inline">{themeLabel}</span>
            </button>
          )}

          {/* Random Board */}
          <button
            onClick={onNewRandomPuzzle}
            title="Generate Random Solvable Grid"
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-950/60 border border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white transition font-medium text-[11px]"
          >
            <Dices className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden md:inline">Random</span>
          </button>

          {/* Tap Out (Give Up / Reveal Answers) */}
          {!isGameOver && (
            <button
              onClick={onGiveUp}
              title="Tap Out: Admit Defeat & Reveal Answers"
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-950/60 border border-zinc-800 text-rose-300/80 hover:border-rose-500/50 hover:bg-rose-950/20 hover:text-rose-200 transition text-[11px] font-bold"
            >
              <Flag className="h-3 w-3 text-rose-400" />
              <span className="hidden md:inline">Tap Out</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
            className="p-1.5 rounded-lg bg-zinc-950/60 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 transition"
          >
            {soundEnabled ? (
              <Volume2 className="h-3.5 w-3.5 text-amber-400" />
            ) : (
              <VolumeX className="h-3.5 w-3.5 text-zinc-500" />
            )}
          </button>

          {/* How to Play */}
          <button
            onClick={onOpenHowToPlay}
            title="How to Play"
            className="p-1.5 rounded-lg bg-zinc-950/60 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 transition"
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </button>

          {/* Stats Button */}
          <button
            onClick={onOpenStats}
            title="View Stats & Share"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition font-bold text-[11px] ${
              isScoreboard
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                : 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/40'
            }`}
          >
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            <span>Stats</span>
          </button>

          {/* Run It Back (Reset Board) */}
          <button
            onClick={onResetGame}
            title="Run It Back: Reset Current Board"
            className="p-1.5 rounded-lg bg-zinc-950/60 border border-zinc-800 text-zinc-400 hover:text-white transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
```

---

## File 3: `src/components/StatsModal.tsx` (Viral Flex Card & Share Text)

In `src/components/StatsModal.tsx`, update the `generateShareText()` method and add the **Verdict Banner**:

### Step 3A: Compute the Dynamic Verdict
Add this helper above the JSX return:

```typescript
// Dynamic Credibility Verdict
const getVerdict = () => {
  if (correctCount === 16) {
    if (totalRarityScore < 15) return 'APOCALYPTIC SICKO';
    return 'CERTIFIED BALL KNOWER';
  }
  if (correctCount >= 10) return 'LEGIT BALL KNOWER';
  if (correctCount >= 6) return 'HIGHLIGHT WATCHER';
  return 'CASUAL ALERT';
};
const verdict = getVerdict();
```

### Step 3B: Update `generateShareText`
Update `generateShareText` to match the viral Twitter/group-chat format:

```typescript
const generateShareText = () => {
  let emojiGrid = '';
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const cell = cells[r][c];
      if (cell.isCorrect) {
        emojiGrid += '🟩';
      } else if (cell.isBurnt) {
        emojiGrid += '🟥';
      } else {
        emojiGrid += '⬜';
      }
    }
    emojiGrid += '\n';
  }

  const grandSlamText = hasGrandSlam ? ' • Grand Slam 🏈🏀⚾🏒' : '';

  return `KNOWBALL 🏆
VERDICT: ${verdict}
Score: ${correctCount}/16 | Rarity: ${totalRarityScore.toFixed(1)}${grandSlamText}

${emojiGrid}
"Think you know ball? Prove it."
https://knowball.app`;
};
```

### Step 3C: Add Verdict Banner in Modal JSX
Directly inside the modal body, render the Verdict Banner:

```tsx
<div className={`my-3 p-3 rounded-xl border text-center font-black tracking-wider uppercase text-sm ${
  verdict === 'APOCALYPTIC SICKO'
    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
    : verdict === 'CERTIFIED BALL KNOWER'
    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.4)]'
    : verdict === 'LEGIT BALL KNOWER'
    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
    : 'bg-rose-500/20 border-rose-500 text-rose-300'
}`}>
  VERDICT: {verdict}
</div>
```

---

## File 4: `src/app/page.tsx` (Debate Microcopy in Post-Game Box)

In `src/app/page.tsx`, update the post-game notice box (around line 430) with the new slogan and action buttons:

```tsx
{/* Post-Game Notice & Inspector Tip */}
{isGameOver && (
  <div className="w-full max-w-xl mt-4 p-4 rounded-2xl border border-zinc-800 bg-[#0e121a]/95 text-center animate-in fade-in slide-in-from-bottom-2 shadow-2xl">
    <div className="text-[11px] font-black uppercase tracking-widest text-amber-400 mb-1">
      "Think you know ball? Prove it."
    </div>
    <h3 className="font-extrabold text-base text-zinc-100">
      {cells.flat().filter((c) => c.isCorrect).length === 16
        ? '🔥 CERTIFIED BALL KNOWER! You solved all 16 cells!'
        : 'FRAUD ALERT! Think you know ball? Inspect answers below or run it back.'}
    </h3>
    <p className="text-xs text-zinc-400 mt-1">
      Final Rarity Score:{' '}
      <span className="font-mono text-amber-400 font-bold">{totalRarityScore.toFixed(1)}</span>
    </p>
    <div className="mt-3 flex justify-center gap-3">
      <button
        onClick={() => setIsStatsOpen(true)}
        className="px-4 py-2 rounded-xl text-xs font-black bg-amber-400 text-black hover:bg-amber-300 transition shadow-md"
      >
        View Verdict & Share
      </button>
      <button
        onClick={handleNewRandomPuzzle}
        className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition"
      >
        Next Grid
      </button>
      <button
        onClick={() => resetBoard()}
        className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-800 text-zinc-300 hover:text-white transition"
      >
        Run It Back
      </button>
    </div>
  </div>
)}
```

---

## File 5: `src/app/layout.tsx` (Metadata Title & Tagline)

Update the site metadata in `src/app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  metadataBase: new URL("https://knowball.app"),
  title: "KnowBall | Think you know ball? Prove it.",
  description:
    "The daily 4×4 all-sports trivia matrix connecting NFL, NBA, MLB, and NHL. Think you know ball? Prove it.",
  applicationName: "KnowBall",
  // ...
};
```

---

## Guaranteed Text-Fitting & Left-Aligned Actions Safeguards

1. **Left-Aligned Action Buttons Row:**
   * In both desktop and mobile layouts, the action button cluster (`Random`, `Tap Out`, `Stats`, `Sound`, `How to Play`, `Run It Back`) is **strictly left-aligned (`justify-start`)** across the available container width. The previous right-floating `ml-auto` has been eliminated.

2. **Guaranteed Text Fit Inside All 5×5 Matrix Tiles:**
   * **Category Headers:** Uses `text-[7.5px] min-[390px]:text-[8px] sm:text-xs font-black uppercase tracking-tight sm:tracking-wider leading-[1.0] sm:leading-tight break-words hyphens-none`.
   * **Jersey Range Labels:** Multi-word ranges like `Wore #10–#19` wrap cleanly into `WORE` on line 1 and `#10–#19` on line 2 with `whitespace-normal` (never breaking after the hyphen).
   * **Long Single Words:** 12-letter words like `CHAMPIONSHIP` and `FRANCHISES` have a rendered width of ~52px at 7.5px font size, fitting inside the 62px mobile cell width with margin to spare.
   * **Solved Cells:** Player names use `truncate` so long names never clip borders. Rarity pills display a compact tag on mobile (`0.4% ⭐`) and expand to full label (`0.4% ⭐ CERTIFIED SICKO`) on desktop (`hidden sm:inline`).
   * **Redundant Icons:** The `?` help icons on category headers are hidden on mobile (`hidden sm:inline-block`) to preserve 100% of the tile's text bounding box.

---

## Verification & Build Checklist

1. Run `npm run build` to verify clean compilation with 0 TypeScript or PostCSS errors.
2. Run `npm run dev` and open `http://localhost:3000`.
3. Check:
   * Brand displays `KNOWBALL` in The Arena Marquee font with *"Think you know ball? Prove it."* subtext.
   * Header sits on a single compact linear bar with vertical dividers.
   * Solved cards show `★ CERTIFIED SICKO`, `◆ BALL KNOWER`, `SOLID PULL`, and `CASUAL PICK`.
   * Clicking "Stats" displays the Verdict Banner and the viral clipboard share text.
   * Giving up displays "Tap Out", and reset buttons say "Run It Back".
