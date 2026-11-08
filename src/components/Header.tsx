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
  theme = 'NEON',
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

  return (
    <header className="w-full max-w-5xl mx-auto mb-4 select-none">
      {/* ======================================================== */}
      {/* THE FINTECH LINEAR TICKER (Desktop) / 2-TIER (Mobile)    */}
      {/* ======================================================== */}
      <div
        className={`w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl transition-all duration-300 ${
          isScoreboard
            ? 'bg-[#0e121a]/95 border border-amber-500/30 shadow-[0_6px_24px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.06)]'
            : isNeon
            ? 'bg-[#08111d]/90 border border-[#00e5a3]/35 shadow-[0_0_24px_rgba(0,229,163,0.12)] backdrop-blur-md'
            : 'bg-zinc-900 border border-zinc-800'
        }`}
      >
        {/* ==================================================== */}
        {/* MOBILE ROW 1 (Header Top Bar) / DESKTOP INLINE       */}
        {/* ==================================================== */}
        <div className="flex items-center justify-between w-full sm:w-auto sm:contents gap-2">
          {/* Logo */}
          <div
            onClick={onOpenHowToPlay}
            className="cursor-pointer group transition transform active:scale-95 shrink-0"
            title="SportsGrid - Click for How to Play"
          >
            {isScoreboard ? (
              <span className="font-scoreboard text-xl sm:text-3xl font-black tracking-wider text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                SPORTS<span className="text-amber-400">GRID</span>
              </span>
            ) : isNeon ? (
              <span className="text-lg sm:text-2xl font-black italic tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#00f5b8] to-[#22d3ee] drop-shadow-[0_0_10px_rgba(0,245,184,0.5)]">
                SPORTSGRID
              </span>
            ) : (
              <span className="text-lg sm:text-2xl font-black tracking-tight text-white">
                SPORTS<span className="text-emerald-400">GRID</span>
              </span>
            )}
          </div>

          {/* Clock */}
          <div className="flex items-center gap-2 shrink-0">
            <LedScoreboardClock timeStr={timeLeft} theme={theme} />

            {/* Puzzle Title Pill */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-950/60 border border-zinc-800 text-[11px] font-medium text-zinc-300">
              <span
                className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                  isScoreboard ? 'bg-amber-400' : isNeon ? 'bg-[#00f5b8]' : 'bg-emerald-400'
                }`}
              />
              <span className="truncate max-w-[140px]">{currentPuzzle.title}</span>
            </div>
          </div>

          {/* Action Suite Toolbar */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 sm:order-last">
            {/* Random Board */}
            <button
              onClick={onNewRandomPuzzle}
              title="Generate Random Solvable Grid"
              className="flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-lg bg-zinc-950/60 border border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white transition font-medium text-[11px]"
            >
              <Dices className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden md:inline">Random</span>
            </button>

            {/* Reveal Answers / Give Up */}
            {!isGameOver && (
              <button
                onClick={onGiveUp}
                title="Give Up & Reveal Answers"
                className="p-1.5 rounded-lg bg-zinc-950/60 border border-zinc-800 text-zinc-400 hover:border-rose-500/40 hover:bg-rose-950/20 hover:text-rose-300 transition text-[11px]"
              >
                <Eye className="h-3.5 w-3.5" />
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
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg border transition font-bold text-[11px] ${
                isScoreboard
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                  : 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/40'
              }`}
            >
              <Trophy className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden xs:inline">Stats</span>
            </button>

            {/* Reset Board */}
            <button
              onClick={onResetGame}
              title="Reset Board"
              className="p-1.5 rounded-lg bg-zinc-950/60 border border-zinc-800 text-zinc-400 hover:text-white transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Vertical Divider (Desktop only) */}
        <div className="hidden sm:block h-6 w-px bg-zinc-800/80" />

        {/* ==================================================== */}
        {/* MOBILE ROW 2 (Status Ticker) / DESKTOP INLINE        */}
        {/* ==================================================== */}
        <div className="flex items-center justify-between w-full sm:w-auto sm:contents gap-2 pt-1.5 sm:pt-0 border-t border-zinc-800/60 sm:border-t-0">
          {/* Play Mode Switcher */}
          <div className="flex rounded-lg bg-zinc-950/70 p-0.5 border border-zinc-800/80 text-[10px] sm:text-[11px] shrink-0">
            <button
              onClick={() => onToggleMode('IMMACULATE')}
              className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md font-bold transition ${
                playMode === 'IMMACULATE'
                  ? isScoreboard
                    ? 'bg-amber-400 text-black shadow-sm'
                    : isNeon
                    ? 'bg-[#00f5b8] text-black shadow-sm'
                    : 'bg-white text-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Flame className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              <span>Immaculate</span>
            </button>
            <button
              onClick={() => onToggleMode('STRIKES')}
              className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md font-bold transition ${
                playMode === 'STRIKES'
                  ? isScoreboard
                    ? 'bg-amber-400 text-black shadow-sm'
                    : isNeon
                    ? 'bg-cyan-400 text-black shadow-sm'
                    : 'bg-white text-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>Strikes</span>
            </button>
          </div>

          {/* Vertical Divider (Desktop only) */}
          <div className="hidden sm:block h-6 w-px bg-zinc-800/80" />

          {/* Live Stats: Guesses & Rarity */}
          <div className="flex sm:flex-col items-center sm:items-end justify-center gap-2 sm:gap-0 text-right font-mono text-[11px] sm:text-xs leading-tight shrink-0">
            <div className="flex items-center justify-end gap-1">
              <span className="text-zinc-400 text-[10px] sm:text-[11px] font-sans">
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

            <div className="flex items-center justify-end gap-1 sm:mt-0.5">
              <span className="text-zinc-400 text-[10px] sm:text-[11px] font-sans">Rarity:</span>
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

          {/* Vertical Divider (Desktop only) */}
          <div className="hidden sm:block h-6 w-px bg-zinc-800/80" />

          {/* Grand Slam 4-Sport Diversity Bonus */}
          <div
            onClick={() => setIsGrandSlamModalOpen(true)}
            className="flex items-center gap-1.5 sm:gap-2 shrink-0 cursor-pointer group"
            title="Click to view Grand Slam 4-Sport Diversity Bonus details"
          >
            <div className="flex flex-col items-end sm:items-center">
              <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-black tracking-wide text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)] group-hover:text-amber-200 transition">
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                <span className="hidden xs:inline">GRAND SLAM</span>
                <span className="xs:hidden">SLAM</span>
                <span className="ml-0.5 px-1 py-0.2 rounded bg-amber-500/15 border border-amber-500/40 text-[8.5px] sm:text-[9px] text-amber-200">
                  {hasGrandSlam ? '-25%' : `${sportsUsed.size}/4`}
                </span>
              </div>

              {/* 4 League Medallions */}
              <div className="flex items-center gap-0.5 sm:gap-1 mt-0.5 sm:mt-1">
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
