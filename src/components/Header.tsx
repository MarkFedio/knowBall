'use client';

import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Trophy,
  RotateCcw,
  Flame,
  Infinity as InfinityIcon,
  Sparkles,
  Dices,
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

          {/* Play Mode Switcher (Ball Knower vs Unlimited) */}
          <div className="flex rounded-lg bg-zinc-950/70 p-0.5 border border-zinc-800/80 text-[10px] sm:text-[11px] shrink-0">
            <button
              onClick={() => onToggleMode('IMMACULATE')}
              title="Ball Knower: 16 Guesses, 0 Strikes (Official Rank & Shareable)"
              className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-md font-bold transition ${
                playMode === 'IMMACULATE'
                  ? isScoreboard
                    ? 'bg-amber-400 text-black shadow-sm'
                    : isNeon
                    ? 'bg-[#00f5b8] text-black shadow-sm'
                    : 'bg-white text-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Flame className="h-3 w-3 shrink-0" />
              <span>Ball Knower</span>
            </button>
            <button
              onClick={() => onToggleMode('UNLIMITED')}
              title="Unlimited Mode: Unlimited guesses for risky picks (Non-shareable)"
              className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-md font-bold transition ${
                playMode === 'UNLIMITED' || playMode === 'STRIKES'
                  ? isScoreboard
                    ? 'bg-amber-400 text-black shadow-sm'
                    : isNeon
                    ? 'bg-cyan-400 text-black shadow-sm'
                    : 'bg-white text-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <InfinityIcon className="h-3 w-3 shrink-0" />
              <span>Unlimited</span>
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
              Guesses:
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
              {playMode === 'IMMACULATE' ? guessesRemaining : `${guessesUsed} (∞)`}
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
        <div className="flex items-center shrink-0">
          <div className="flex flex-col w-full min-w-[124px]">
            {/* Title & Pill Header */}
            <div className="flex items-center justify-between w-full text-[10px] font-black tracking-wide text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]">
              <div className="flex items-center gap-1">
                <Sparkles
                  className={`w-2.5 h-2.5 ${hasGrandSlam ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`}
                />
                <span>GRAND SLAM</span>
              </div>
              <span
                className={`ml-1 px-1.5 py-0.5 rounded border text-[9px] font-mono transition-all ${
                  hasGrandSlam
                    ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 font-bold shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                    : 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                }`}
              >
                {hasGrandSlam ? '-25%' : `${sportsUsed.size}/4`}
              </span>
            </div>

            {/* 4 League Medallions: Spanning full width under text */}
            <div className="flex items-center justify-between w-full mt-1.5 px-0.5">
              {ALL_SPORTS.map((sport) => {
                const isUsed = sportsUsed.has(sport);
                return (
                  <LeagueIcon
                    key={sport}
                    sport={sport}
                    size="md"
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
        {/* SECTION 5: ACTION SUITE TOOLBAR                      */}
        {/* ---------------------------------------------------- */}
        <div className="w-full sm:w-auto flex items-center justify-start gap-1.5 shrink-0 mt-1 sm:mt-0">
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
