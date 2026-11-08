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
  Info,
} from 'lucide-react';
import { PlayMode, Sport, DailyPuzzle, VisualTheme } from '@/types';
import { LedScoreboardClock } from './LedScoreboardClock';
import { LeagueIcon } from './LeagueIcon';
import { GrandSlamModal } from './GrandSlamModal';

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
  const [isGrandSlamModalOpen, setIsGrandSlamModalOpen] = useState(false);

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
    theme === 'SCOREBOARD'
      ? 'Scoreboard'
      : theme === 'NEON'
      ? 'Cyber Neon'
      : 'Classic Dark';

  return (
    <header className="w-full max-w-5xl mx-auto mb-4 flex flex-col gap-3">
      {/* ======================================================== */}
      {/* 1. PRIMARY STADIUM SCOREBOARD HEADER BAR                 */}
      {/* ======================================================== */}
      <div
        className={`w-full flex flex-col md:flex-row items-center justify-between gap-4 px-4 py-3 rounded-2xl transition-all duration-300 ${
          isScoreboard
            ? 'bg-[#0f131b] border border-amber-500/35 shadow-[0_4px_24px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.08)]'
            : isNeon
            ? 'bg-[#09111c]/80 border border-[#00e5a3]/30 shadow-[0_0_20px_rgba(0,229,163,0.08)] backdrop-blur-md'
            : 'bg-zinc-900 border border-zinc-800'
        }`}
      >
        {/* Left: SPORTSGRID Logo & ALL-SPORTS 4x4 Badge */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center select-none cursor-pointer group"
            onClick={onOpenHowToPlay}
          >
            {isScoreboard ? (
              <span className="font-scoreboard text-3xl sm:text-4xl font-black tracking-wider text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                SPORTS<span className="text-amber-400">GRID</span>
              </span>
            ) : isNeon ? (
              <span className="text-2xl sm:text-3xl font-black italic tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#00f5b8] to-[#22d3ee] drop-shadow-[0_0_12px_rgba(0,245,184,0.5)]">
                SPORTSGRID
              </span>
            ) : (
              <span className="text-2xl font-black tracking-tight text-white">
                SPORTS<span className="text-emerald-400">GRID</span>
              </span>
            )}
          </div>

          {/* ALL-SPORTS 4x4 Badge */}
          <div
            className={`flex flex-col items-center justify-center px-2 py-0.5 rounded-lg border select-none ${
              isScoreboard
                ? 'bg-[#18150d] border-amber-500/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
                : isNeon
                ? 'bg-[#0c1c28]/90 border-cyan-400/50 shadow-[0_0_8px_rgba(34,211,238,0.25)]'
                : 'bg-zinc-800 border-zinc-700'
            }`}
          >
            <span
              className={`text-[8px] font-black tracking-widest uppercase ${
                isScoreboard ? 'text-amber-300' : isNeon ? 'text-cyan-200' : 'text-zinc-400'
              }`}
            >
              ALL-SPORTS
            </span>
            <span
              className={`text-xs sm:text-sm font-black italic leading-none ${
                isScoreboard ? 'text-amber-400' : isNeon ? 'text-cyan-400' : 'text-zinc-200'
              }`}
            >
              4×4
            </span>
          </div>
        </div>

        {/* Center: Scoreboard Seven-Segment LED Display */}
        <div className="flex items-center justify-center">
          <LedScoreboardClock timeStr={timeLeft} theme={theme} />
        </div>

        {/* Right: Guesses Left, Rarity Score & 4 League Illuminated Badges */}
        <div className="flex items-center gap-4 sm:gap-5">
          {/* Counters */}
          <div className="flex flex-col text-right select-none font-mono text-xs sm:text-sm">
            <div className="flex items-center justify-end gap-1.5 leading-tight">
              <span className="text-zinc-400 text-xs font-sans">
                {playMode === 'IMMACULATE' ? 'Guesses Left:' : 'Strikes:'}
              </span>
              <span
                className={`font-bold font-mono text-sm sm:text-base ${
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

            <div className="flex items-center justify-end gap-1.5 leading-tight mt-0.5">
              <span className="text-zinc-400 text-xs font-sans">Rarity Score:</span>
              <span
                className={`font-bold font-mono text-sm sm:text-base ${
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

          {/* Grand Slam 4-League Badges Tracker */}
          <div className="relative group">
            <button
              type="button"
              onClick={() => setIsGrandSlamModalOpen(true)}
              className="flex flex-col items-end gap-1 p-1 -m-1 rounded-xl transition hover:bg-white/5 text-left focus:outline-none focus:ring-1 focus:ring-amber-500/50 cursor-pointer"
              title="Grand Slam Bonus - Click for details"
            >
              {/* Grand Slam Header Label & Progress Pill */}
              <div className="flex items-center justify-between gap-1.5 w-full">
                <span
                  className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-colors ${
                    hasGrandSlam
                      ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                      : 'text-amber-400/90 group-hover:text-amber-300'
                  }`}
                >
                  <Sparkles
                    className={`w-2.5 h-2.5 ${
                      hasGrandSlam ? 'text-emerald-400 animate-spin-slow' : 'text-amber-400'
                    }`}
                  />
                  GRAND SLAM
                </span>
                <span
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border transition-colors ${
                    hasGrandSlam
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                      : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {hasGrandSlam ? '-25%' : `${sportsUsed.size}/4`}
                </span>
              </div>

              {/* 4 Circular League Badges (NFL, NBA, MLB, NHL) */}
              <div className="flex items-center gap-1.5 sm:gap-2">
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
            </button>

            {/* Desktop Hover Tooltip */}
            <div className="absolute right-0 top-full mt-2 w-64 p-3 rounded-xl bg-[#091524]/95 border border-amber-500/40 shadow-[0_10px_25px_rgba(0,0,0,0.8)] backdrop-blur-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-40 text-left">
              <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Grand Slam Bonus
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-400">
                  {hasGrandSlam ? 'ACTIVE (-25%)' : `${sportsUsed.size}/4 Completed`}
                </span>
              </div>
              <p className="text-[11px] text-zinc-300 mt-2 leading-relaxed">
                Use at least one athlete from each of the 4 major leagues (NFL, NBA, MLB, NHL) to earn a <strong className="text-emerald-300">25% discount</strong> on your rarity score.
              </p>
              <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400">
                <span>Click for full checklist</span>
                <span className="text-amber-400 font-bold">Details →</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. SECONDARY CONTROLS & UTILITIES SUB-BAR                */}
      {/* ======================================================== */}
      <div
        className={`w-full flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 rounded-xl text-xs transition-colors duration-200 ${
          isScoreboard
            ? 'bg-[#0e121a] border border-amber-500/20 shadow-inner'
            : isNeon
            ? 'bg-zinc-950/60 border border-zinc-800/80'
            : 'bg-zinc-900 border border-zinc-800'
        }`}
      >
        {/* Left: Mode Switcher & Puzzle Title */}
        <div className="flex items-center gap-2">
          {/* Play Mode Switcher */}
          <div className="flex rounded-lg bg-zinc-900 p-0.5 border border-zinc-800">
            <button
              onClick={() => onToggleMode('IMMACULATE')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                playMode === 'IMMACULATE'
                  ? isScoreboard
                    ? 'bg-amber-400 text-black shadow-sm'
                    : isNeon
                    ? 'bg-[#00e5a3] text-black shadow-sm'
                    : 'bg-white text-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Flame className="h-3 w-3" />
              Immaculate 16
            </button>
            <button
              onClick={() => onToggleMode('STRIKES')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                playMode === 'STRIKES'
                  ? isScoreboard
                    ? 'bg-amber-400 text-black shadow-sm'
                    : isNeon
                    ? 'bg-cyan-400 text-black shadow-sm'
                    : 'bg-white text-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              4 Strikes
            </button>
          </div>

          {/* Daily Puzzle Title Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-medium text-zinc-300">
            <span
              className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                isScoreboard ? 'bg-amber-400' : 'bg-[#00e5a3]'
              }`}
            />
            <span>{currentPuzzle.title}</span>
          </div>

          {hasGrandSlam && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black border flex items-center gap-1 ${
                isScoreboard
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}
            >
              <Sparkles className="w-2.5 h-2.5" />
              GRAND SLAM (-25% Rarity)
            </span>
          )}
        </div>

        {/* Right: Actions (Theme Toggle, Random, Reveal, Audio, Help, Stats, Reset) */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Theme Switcher Button */}
          {onToggleTheme && (
            <button
              onClick={cycleTheme}
              title={`Active Theme: ${themeLabel}. Click to switch theme.`}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-bold transition ${
                isScoreboard
                  ? 'bg-[#1b170c] border-amber-500/40 text-amber-300 hover:bg-[#251f10]'
                  : isNeon
                  ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/40'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white'
              }`}
            >
              <Palette className="h-3.5 w-3.5" />
              <span>{themeLabel}</span>
            </button>
          )}

          {/* Random Board */}
          <button
            onClick={onNewRandomPuzzle}
            title="Generate Random Solvable Grid"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white transition font-medium"
          >
            <Dices className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden md:inline text-[11px]">Random</span>
          </button>

          {/* Give Up / Reveal Answers */}
          {!isGameOver && (
            <button
              onClick={onGiveUp}
              title="Give Up & Reveal Answers"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-rose-500/40 hover:bg-rose-950/20 hover:text-rose-300 transition font-medium"
            >
              <Eye className="h-3.5 w-3.5" />
              <span className="hidden md:inline text-[11px]">Reveal</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 transition"
          >
            {soundEnabled ? (
              <Volume2 className="h-3.5 w-3.5 text-amber-400" />
            ) : (
              <VolumeX className="h-3.5 w-3.5 text-zinc-500" />
            )}
          </button>

          {/* Help */}
          <button
            onClick={onOpenHowToPlay}
            title="How to Play"
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 transition"
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </button>

          {/* Stats */}
          <button
            onClick={onOpenStats}
            title="Stats & Share"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition font-medium ${
              isScoreboard
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/40'
            }`}
          >
            <Trophy className="h-3.5 w-3.5" />
            <span className="text-[11px]">Stats</span>
          </button>

          {/* Reset */}
          <button
            onClick={onResetGame}
            title="Reset Board"
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Grand Slam Explanation Modal */}
      <GrandSlamModal
        isOpen={isGrandSlamModalOpen}
        onClose={() => setIsGrandSlamModalOpen(false)}
        sportsUsed={sportsUsed}
        hasGrandSlam={hasGrandSlam}
      />
    </header>
  );
};
