'use client';

import React, { useState, useEffect } from 'react';
import { HelpCircle, Trophy, RotateCcw, Flame, Sparkles, Dices, Eye, Volume2, VolumeX, Clock } from 'lucide-react';
import { PlayMode, Sport, DailyPuzzle } from '@/types';

interface HeaderProps {
  currentPuzzle: DailyPuzzle;
  onNewRandomPuzzle: () => void;
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
  const [timeLeft, setTimeLeft] = useState<string>('');

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

  return (
    <header className="w-full max-w-5xl mx-auto mb-6 flex flex-col gap-4">
      {/* Top Navbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
        {/* Brand */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-600 font-black text-black shadow-lg shadow-emerald-500/20">
            4×4
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                SPORTS<span className="text-emerald-400">GRID</span>
              </h1>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                ALL-SPORTS
              </span>
            </div>
            <p className="text-xs text-zinc-400">Daily Multi-Sport Trivia Matrix</p>
          </div>
        </div>

        {/* Puzzle Status Badge & Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          {/* Daily Puzzle Badge */}
          <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/90 py-2 px-3 text-xs font-semibold text-zinc-200">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{currentPuzzle.title}</span>
          </div>

          {/* Midnight Countdown Clock */}
          <div
            title="Time remaining until the next daily SportsGrid drops at midnight"
            className="hidden sm:flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/90 py-2 px-2.5 text-xs font-mono text-zinc-400"
          >
            <Clock className="h-3.5 w-3.5 text-zinc-500" />
            <span>{timeLeft || '24:00:00'}</span>
          </div>

          {/* Random Board Button */}
          <button
            onClick={onNewRandomPuzzle}
            title="Generate Random Solvable Grid"
            className="flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
          >
            <Dices className="h-4 w-4" />
            <span className="hidden md:inline">Random Grid</span>
          </button>

          {/* Give Up / Reveal Answers */}
          {!isGameOver && (
            <button
              onClick={onGiveUp}
              title="Give Up & Reveal Answers"
              className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-xs font-semibold text-zinc-400 transition hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300"
            >
              <Eye className="h-4 w-4" />
              <span className="hidden md:inline">Reveal Answers</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
            className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-2 text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4 text-emerald-400" /> : <VolumeX className="h-4 w-4 text-zinc-500" />}
          </button>

          {/* Action Icons */}
          <button
            onClick={onOpenHowToPlay}
            title="How to Play"
            className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-2 text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
          >
            <HelpCircle className="h-4 w-4" />
          </button>

          <button
            onClick={onOpenStats}
            title="Stats & Share"
            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
          >
            <Trophy className="h-4 w-4 text-emerald-400" />
            <span className="hidden sm:inline">Stats</span>
          </button>

          <button
            onClick={onResetGame}
            title="Reset Board"
            className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Game Mode Selector & Status Ticker */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-3 sm:p-4">
        {/* Mode Pill Toggle */}
        <div className="flex rounded-xl bg-zinc-950 p-1 border border-zinc-800">
          <button
            onClick={() => onToggleMode('IMMACULATE')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              playMode === 'IMMACULATE'
                ? 'bg-emerald-500 text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Flame className="h-3.5 w-3.5" />
            Immaculate 16
          </button>

          <button
            onClick={() => onToggleMode('STRIKES')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              playMode === 'STRIKES'
                ? 'bg-amber-400 text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            4 Strikes (Casual)
          </button>
        </div>

        {/* Live Counters */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-zinc-300">
          {/* Guesses / Strikes left */}
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400">
              {playMode === 'IMMACULATE' ? 'Guesses:' : 'Strikes:'}
            </span>
            <span className="font-mono font-bold text-white text-sm">
              {playMode === 'IMMACULATE' ? (
                `${maxGuesses - guessesUsed} left`
              ) : (
                `${strikesUsed} / ${maxStrikes}`
              )}
            </span>
          </div>

          <div className="h-4 w-[1px] bg-zinc-800 hidden sm:block" />

          {/* Rarity Score */}
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400">Rarity Score:</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              {totalRarityScore.toFixed(1)}
            </span>
          </div>

          <div className="h-4 w-[1px] bg-zinc-800 hidden sm:block" />

          {/* Grand Slam Tracker */}
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-cyan-400" /> Grand Slam:
            </span>
            <div className="flex gap-1">
              {ALL_SPORTS.map((sport) => {
                const isUsed = sportsUsed.has(sport);
                return (
                  <span
                    key={sport}
                    className={`rounded px-1 text-[9px] font-bold border transition ${
                      isUsed
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-600'
                    }`}
                  >
                    {sport}
                  </span>
                );
              })}
            </div>
            {hasGrandSlam && (
              <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-black text-emerald-300 border border-emerald-500/40">
                -25%
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
