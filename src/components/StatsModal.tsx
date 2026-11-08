'use client';

import React, { useState, useEffect } from 'react';
import { X, Trophy, Share2, Check, Sparkles, Flame, Award, Star, BarChart3, Infinity as InfinityIcon } from 'lucide-react';
import { CellState, PlayMode, Sport, CareerStats } from '@/types';
import { loadCareerStats } from '@/lib/storage';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cells: CellState[][];
  playMode: PlayMode;
  totalRarityScore: number;
  guessesUsed: number;
  maxGuesses: number;
  sportsUsed: Set<Sport>;
  hasGrandSlam: boolean;
  careerStats?: CareerStats;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  cells,
  playMode,
  totalRarityScore,
  guessesUsed,
  maxGuesses,
  sportsUsed,
  hasGrandSlam,
  careerStats: propCareerStats,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'GAME' | 'CAREER'>('GAME');
  const [careerStats, setCareerStats] = useState<CareerStats>(propCareerStats || loadCareerStats());

  useEffect(() => {
    if (isOpen) {
      setCareerStats(propCareerStats || loadCareerStats());
    }
  }, [isOpen, propCareerStats]);

  if (!isOpen) return null;

  const correctCount = cells.flat().filter((c) => c.isCorrect).length;
  const isComplete = correctCount === 16;
  const winRate =
    careerStats.gamesPlayed > 0
      ? Math.round((careerStats.gamesWon / careerStats.gamesPlayed) * 100)
      : 0;

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

  // Generate emoji grid
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6 text-zinc-100 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 sm:right-4 sm:top-4 rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
          <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              {isComplete ? 'Puzzle Completed!' : 'Statistics & Summary'}
            </h2>
            <p className="text-xs text-zinc-400">
              {playMode === 'IMMACULATE' ? 'Ball Knower (16 Guesses)' : 'Unlimited Mode (Practice)'}
            </p>
          </div>
        </div>

        {/* Verdict Banner */}
        <div
          className={`my-3 p-3 rounded-xl border text-center font-black tracking-wider uppercase text-sm ${
            verdict === 'APOCALYPTIC SICKO'
              ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
              : verdict === 'CERTIFIED BALL KNOWER'
              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.4)]'
              : verdict === 'LEGIT BALL KNOWER'
              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
              : 'bg-rose-500/20 border-rose-500 text-rose-300'
          }`}
        >
          VERDICT: {verdict}
        </div>

        {/* Tab Switcher */}
        <div className="my-4 flex rounded-xl border border-zinc-800 bg-zinc-900/60 p-1">
          <button
            onClick={() => setActiveTab('GAME')}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
              activeTab === 'GAME'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Today&apos;s Grid
          </button>
          <button
            onClick={() => setActiveTab('CAREER')}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'CAREER'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5 text-amber-400" />
            Career Stats
          </button>
        </div>

        {/* TAB 1: TODAY'S GAME */}
        {activeTab === 'GAME' && (
          <div>
            {/* Stats Grid */}
            <div className="my-4 grid grid-cols-3 gap-2.5">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-center">
                <div className="text-2xl font-black text-white">{correctCount}/16</div>
                <div className="text-[10px] uppercase tracking-wider text-zinc-400 mt-1">Correct Cells</div>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-center">
                <div className="text-2xl font-black text-emerald-400">{totalRarityScore.toFixed(1)}</div>
                <div className="text-[10px] uppercase tracking-wider text-zinc-400 mt-1">Rarity Score</div>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-center">
                <div className="text-2xl font-black text-amber-400">
                  {playMode === 'IMMACULATE' ? `${guessesUsed}/${maxGuesses}` : `${guessesUsed} (∞)`}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-zinc-400 mt-1">
                  Guesses
                </div>
              </div>
            </div>

            {/* Grand slam indicator */}
            <div
              className={`mb-4 rounded-xl border p-3 text-xs ${
                hasGrandSlam
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                  : 'border-zinc-800 bg-zinc-900/40 text-zinc-400'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold">
                <Sparkles className="h-4 w-4" />
                <span>Grand Slam Bonus ({sportsUsed.size}/4 Sports Used)</span>
              </div>
              <p className="mt-1 text-zinc-400 text-[11px] leading-relaxed">
                {hasGrandSlam
                  ? 'Unlocked! 25% rarity reduction applied for using NFL, NBA, MLB, and NHL athletes.'
                  : 'Include athletes from all 4 major sports (NFL, NBA, MLB, NHL) to unlock a 25% rarity deduction.'}
              </p>
            </div>

            {/* Emoji Matrix Preview */}
            <div className="mb-5 flex flex-col items-center justify-center rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4">
              <div className="font-mono text-xl tracking-widest leading-loose">
                {cells.map((row, r) => (
                  <div key={r} className="flex gap-1.5">
                    {row.map((cell, c) => (
                      <span key={c}>{cell.isCorrect ? '🟩' : cell.isBurnt ? '🟥' : '⬜'}</span>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Share Button / Unlimited Mode Notice */}
            {playMode === 'IMMACULATE' ? (
              <button
                onClick={handleCopy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-center font-bold text-black transition hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
              >
                {copied ? (
                  <>
                    <Check className="h-5 w-5" /> Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <Share2 className="h-5 w-5" /> Share Result
                  </>
                )}
              </button>
            ) : (
              <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 py-3.5 px-4 text-center">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                  <InfinityIcon className="h-4 w-4 text-cyan-400" />
                  <span>Unlimited Mode — Non-Shareable</span>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Sharing results is disabled in Unlimited Mode. Switch to <strong>Ball Knower</strong> mode to earn an official shareable verdict!
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CAREER STATS */}
        {activeTab === 'CAREER' && (
          <div>
            {/* Primary Streak & Win Rate Banner */}
            <div className="my-4 grid grid-cols-4 gap-2">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-center">
                <div className="text-xl font-black text-white">{careerStats.gamesPlayed}</div>
                <div className="text-[10px] uppercase text-zinc-400">Played</div>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-center">
                <div className="text-xl font-black text-emerald-400">{winRate}%</div>
                <div className="text-[10px] uppercase text-zinc-400">Win Rate</div>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-center">
                <div className="flex items-center justify-center gap-1 text-xl font-black text-orange-400">
                  <Flame className="h-4 w-4" />
                  {careerStats.currentStreak}
                </div>
                <div className="text-[10px] uppercase text-zinc-400">Streak</div>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-center">
                <div className="text-xl font-black text-amber-400">{careerStats.maxStreak}</div>
                <div className="text-[10px] uppercase text-zinc-400">Max Streak</div>
              </div>
            </div>

            {/* Detailed Career Milestones */}
            <div className="space-y-2 mb-5">
              <div className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3 text-xs">
                <div className="flex items-center gap-2 text-zinc-300">
                  <Award className="h-4 w-4 text-emerald-400" />
                  <span>Best Rarity Score</span>
                </div>
                <span className="font-mono font-bold text-emerald-400">
                  {careerStats.bestRarityScore !== null ? careerStats.bestRarityScore.toFixed(1) : '—'}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3 text-xs">
                <div className="flex items-center gap-2 text-zinc-300">
                  <BarChart3 className="h-4 w-4 text-cyan-400" />
                  <span>Average Rarity Score</span>
                </div>
                <span className="font-mono font-bold text-cyan-400">
                  {careerStats.averageRarityScore > 0 ? careerStats.averageRarityScore.toFixed(1) : '—'}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3 text-xs">
                <div className="flex items-center gap-2 text-zinc-300">
                  <Star className="h-4 w-4 text-amber-400" />
                  <span>Immaculate Comps (16/16, 0 Burns)</span>
                </div>
                <span className="font-mono font-bold text-amber-400">
                  {careerStats.immaculateCompletions || 0}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3 text-xs">
                <div className="flex items-center gap-2 text-zinc-300">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <span>Grand Slams (All 4 Sports)</span>
                </div>
                <span className="font-mono font-bold text-purple-400">
                  {careerStats.grandSlamsAchieved || 0}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full rounded-xl bg-zinc-800 py-3 text-center text-xs font-bold text-zinc-200 transition hover:bg-zinc-700"
            >
              Back to Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
