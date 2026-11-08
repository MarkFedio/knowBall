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
  Calendar,
} from 'lucide-react';
import { PlayMode, Sport, DailyPuzzle } from '@/types';
import { LedScoreboardClock } from './LedScoreboardClock';
import { LeagueIcon } from './LeagueIcon';

interface HeaderProps {
  currentPuzzle: DailyPuzzle;
  onNewRandomPuzzle: () => void;
  onOpenArchive: () => void;
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
  onOpenHowToPlay: () => void;
  onOpenStats: () => void;
  onResetGame: () => void;
}

const ALL_SPORTS: Sport[] = ['NFL', 'NBA', 'MLB', 'NHL'];

export const Header: React.FC<HeaderProps> = ({
  currentPuzzle,
  onNewRandomPuzzle,
  onOpenArchive,
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
  onOpenHowToPlay,
  onOpenStats,
  onResetGame,
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('00:00:10');

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

  return (
    <header className="w-full max-w-5xl mx-auto mb-4 flex flex-col gap-3">
      {/* ======================================================== */}
      {/* 1. PRIMARY STADIUM SCOREBOARD HEADER BAR (Matches Mockup) */}
      {/* ======================================================== */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 px-4 py-3 rounded-2xl bg-[#09111c]/80 border border-[#00e5a3]/30 shadow-[0_0_20px_rgba(0,229,163,0.08)] backdrop-blur-md">
        {/* Left: Neon SPORTSGRID Logo & ALL-SPORTS 4x4 Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center select-none cursor-pointer" onClick={onOpenHowToPlay}>
            <span className="text-2xl sm:text-3xl font-black italic tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#00f5b8] to-[#22d3ee] drop-shadow-[0_0_12px_rgba(0,245,184,0.5)]">
              SPORTSGRID
            </span>
          </div>

          {/* ALL-SPORTS 4x4 Badge */}
          <div className="flex flex-col items-center justify-center px-2 py-0.5 rounded-lg border border-cyan-400/50 bg-[#0c1c28]/90 shadow-[0_0_8px_rgba(34,211,238,0.25)] select-none">
            <span className="text-[8px] font-black tracking-widest uppercase text-cyan-200">
              ALL-SPORTS
            </span>
            <span className="text-xs sm:text-sm font-black italic text-cyan-400 leading-none">
              4×4
            </span>
          </div>
        </div>

        {/* Center: Scoreboard Seven-Segment LED Display */}
        <div className="flex items-center justify-center">
          <LedScoreboardClock timeStr={timeLeft} />
        </div>

        {/* Right: Guesses Left, Rarity Score & 4 League Illuminated Badges */}
        <div className="flex items-center gap-4 sm:gap-5">
          {/* Counters */}
          <div className="flex flex-col text-right select-none font-mono text-xs sm:text-sm">
            <div className="flex items-center justify-end gap-1.5 leading-tight">
              <span className="text-zinc-400 text-xs font-sans">
                {playMode === 'IMMACULATE' ? 'Guesses Left:' : 'Strikes:'}
              </span>
              <span className="font-bold text-[#00f5b8] drop-shadow-[0_0_6px_rgba(0,245,184,0.4)]">
                {playMode === 'IMMACULATE' ? guessesRemaining : `${strikesUsed}/${maxStrikes}`}
              </span>
            </div>

            <div className="flex items-center justify-end gap-1.5 leading-tight mt-0.5">
              <span className="text-zinc-400 text-xs font-sans">Rarity Score:</span>
              <span className="font-bold text-[#00f5b8] drop-shadow-[0_0_6px_rgba(0,245,184,0.4)]">
                {totalRarityScore.toFixed(1)}
              </span>
            </div>
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
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. SECONDARY CONTROLS & UTILITIES SUB-BAR                */}
      {/* ======================================================== */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-xs">
        {/* Left: Mode Switcher & Puzzle Title */}
        <div className="flex items-center gap-2">
          {/* Play Mode Switcher */}
          <div className="flex rounded-lg bg-zinc-900 p-0.5 border border-zinc-800">
            <button
              onClick={() => onToggleMode('IMMACULATE')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                playMode === 'IMMACULATE'
                  ? 'bg-[#00e5a3] text-black shadow-sm'
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
                  ? 'bg-amber-400 text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              4 Strikes
            </button>
          </div>

          {/* Daily Puzzle Title Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-medium text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e5a3] animate-pulse" />
            <span>{currentPuzzle.title}</span>
          </div>

          {hasGrandSlam && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/40 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              GRAND SLAM (-25% Rarity)
            </span>
          )}
        </div>

        {/* Right: Actions (Archive, Random, Stats, Help, Audio, Reset, Give Up) */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Past Grids */}
          <button
            onClick={onOpenArchive}
            title="Browse and play past daily SportsGrids"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900/90 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition font-medium"
          >
            <Calendar className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden md:inline text-[11px]">Past Grids</span>
          </button>

          {/* Random Board */}
          <button
            onClick={onNewRandomPuzzle}
            title="Generate Random Solvable Grid"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/40 transition font-medium"
          >
            <Dices className="h-3.5 w-3.5 text-cyan-400" />
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
              <Volume2 className="h-3.5 w-3.5 text-[#00e5a3]" />
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
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/40 transition font-medium"
          >
            <Trophy className="h-3.5 w-3.5 text-[#00e5a3]" />
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
    </header>
  );
};
