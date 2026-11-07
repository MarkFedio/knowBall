'use client';

import React, { useState } from 'react';
import { X, Trophy, Share2, Check, Sparkles } from 'lucide-react';
import { CellState, PlayMode, Sport } from '@/types';

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
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const correctCount = cells.flat().filter((c) => c.isCorrect).length;
  const isComplete = correctCount === 16;

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

    const modeText = playMode === 'IMMACULATE' ? 'Immaculate 16' : 'Casual 4-Strikes';
    const bonusText = hasGrandSlam ? '\n🎯 Grand Slam Diversity Bonus (4+ Sports) Active!' : '';

    return `SportsGrid 4x4 🏆\nScore: ${correctCount}/16 (${modeText})\nRarity Score: ${totalRarityScore.toFixed(1)}${bonusText}\n\n${emojiGrid}\nPlay: https://sportsgrid.app`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-100 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
          <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              {isComplete ? 'Puzzle Completed!' : 'Game Summary'}
            </h2>
            <p className="text-sm text-zinc-400">
              {playMode === 'IMMACULATE' ? 'The Immaculate 16 Mode' : '4 Strikes Mode'}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="my-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-center">
            <div className="text-2xl font-black text-white">{correctCount}/16</div>
            <div className="text-xs uppercase tracking-wider text-zinc-400 mt-1">Correct Cells</div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-center">
            <div className="text-2xl font-black text-emerald-400">{totalRarityScore.toFixed(1)}</div>
            <div className="text-xs uppercase tracking-wider text-zinc-400 mt-1">Rarity Score</div>
          </div>

          <div className="col-span-2 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-center sm:col-span-1">
            <div className="text-2xl font-black text-amber-400">
              {guessesUsed}/{maxGuesses}
            </div>
            <div className="text-xs uppercase tracking-wider text-zinc-400 mt-1">
              {playMode === 'IMMACULATE' ? 'Guesses Used' : 'Strikes Total'}
            </div>
          </div>
        </div>

        {/* Grand slam indicator */}
        <div className={`mb-5 rounded-xl border p-3 text-xs ${
          hasGrandSlam 
            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' 
            : 'border-zinc-800 bg-zinc-900/40 text-zinc-400'
        }`}>
          <div className="flex items-center gap-2 font-semibold">
            <Sparkles className="h-4 w-4" />
            <span>Grand Slam Diversity Bonus ({sportsUsed.size}/4 Sports Used)</span>
          </div>
          <p className="mt-1 text-zinc-400">
            {hasGrandSlam 
              ? 'Unlocked! 25% rarity reduction applied for using NFL, NBA, MLB, and NHL athletes.'
              : 'Include athletes from at least 4 different sports to unlock a 25% rarity bonus.'}
          </p>
        </div>

        {/* Emoji Matrix Preview */}
        <div className="mb-5 flex flex-col items-center justify-center rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4">
          <div className="font-mono text-xl tracking-widest leading-loose">
            {cells.map((row, r) => (
              <div key={r} className="flex gap-1.5">
                {row.map((cell, c) => (
                  <span key={c}>
                    {cell.isCorrect ? '🟩' : cell.isBurnt ? '🟥' : '⬜'}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Share Button */}
        <button
          onClick={handleCopy}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-center font-bold text-black transition hover:bg-emerald-400"
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
      </div>
    </div>
  );
};
