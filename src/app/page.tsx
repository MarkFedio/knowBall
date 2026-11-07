'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { SAMPLE_PUZZLE } from '@/data/puzzles';
import { Athlete, CellState, PlayMode, Sport } from '@/types';
import { Header } from '@/components/Header';
import { Grid } from '@/components/Grid';
import { SearchModal } from '@/components/SearchModal';
import { StatsModal } from '@/components/StatsModal';
import { HowToPlayModal } from '@/components/HowToPlayModal';

export default function Home() {
  const puzzle = SAMPLE_PUZZLE;

  // 4x4 Grid State
  const [cells, setCells] = useState<CellState[][]>(() =>
    Array.from({ length: 4 }, (_, r) =>
      Array.from({ length: 4 }, (_, c) => ({
        row: r,
        col: c,
        isCorrect: false,
        isBurnt: false,
      }))
    )
  );

  const [playMode, setPlayMode] = useState<PlayMode>('IMMACULATE');
  const [guessedAthleteIds, setGuessedAthleteIds] = useState<Set<string>>(new Set());
  const [guessesUsed, setGuessesUsed] = useState<number>(0);
  const [strikesUsed, setStrikesUsed] = useState<number>(0);

  // Modals
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // Track sports used across correct guesses
  const sportsUsed = useMemo(() => {
    const sports = new Set<Sport>();
    cells.flat().forEach((cell) => {
      if (cell.isCorrect && cell.athlete) {
        cell.athlete.sports.forEach((s) => sports.add(s));
      }
    });
    return sports;
  }, [cells]);

  const hasGrandSlam = sportsUsed.size >= 4;

  // Max thresholds
  const maxGuesses = 16;
  const maxStrikes = 4;

  const isGameOver = useMemo(() => {
    const correctCount = cells.flat().filter((c) => c.isCorrect).length;
    if (correctCount === 16) return true;
    if (playMode === 'IMMACULATE') {
      return guessesUsed >= maxGuesses;
    } else {
      return strikesUsed >= maxStrikes;
    }
  }, [cells, playMode, guessesUsed, strikesUsed]);

  // Total Rarity Score calculation
  const totalRarityScore = useMemo(() => {
    let score = 0;
    cells.flat().forEach((cell) => {
      if (cell.isCorrect && cell.rarity) {
        score += cell.rarity;
      } else if (cell.isBurnt) {
        score += 100;
      }
    });

    if (hasGrandSlam && score > 0) {
      score *= 0.75; // 25% discount for Grand Slam
    }
    return score;
  }, [cells, hasGrandSlam]);

  // Confetti trigger helper
  const triggerConfetti = async () => {
    if (typeof window !== 'undefined') {
      try {
        const confetti = (await import('canvas-confetti')).default;
        confetti({
          particleCount: 130,
          spread: 85,
          origin: { y: 0.6 },
        });
      } catch {
        // Ignore fallback
      }
    }
  };

  // Check for win
  useEffect(() => {
    const correctCount = cells.flat().filter((c) => c.isCorrect).length;
    if (correctCount === 16) {
      triggerConfetti();
      const timer = setTimeout(() => setIsStatsOpen(true), 600);
      return () => clearTimeout(timer);
    }
  }, [cells]);

  const handleCellClick = (row: number, col: number) => {
    if (isGameOver) return;
    setActiveCell({ row, col });
  };

  const handleGuessSuccess = (athlete: Athlete, rarity: number) => {
    if (!activeCell) return;
    const { row, col } = activeCell;

    setCells((prev) => {
      const next = prev.map((r) => [...r]);
      next[row][col] = {
        row,
        col,
        athlete,
        rarity,
        isCorrect: true,
        isBurnt: false,
      };
      return next;
    });

    setGuessedAthleteIds((prev) => new Set(prev).add(athlete.id));
    setGuessesUsed((prev) => prev + 1);
    setActiveCell(null);
  };

  const handleGuessFailure = (athlete: Athlete) => {
    if (!activeCell) return;
    const { row, col } = activeCell;

    if (playMode === 'IMMACULATE') {
      // In Immaculate mode, an incorrect guess burns the cell permanently
      setCells((prev) => {
        const next = prev.map((r) => [...r]);
        next[row][col] = {
          row,
          col,
          isCorrect: false,
          isBurnt: true,
        };
        return next;
      });
      setGuessesUsed((prev) => prev + 1);
      setActiveCell(null);
    } else {
      // In Strikes mode, increments strikes
      const nextStrikes = strikesUsed + 1;
      setStrikesUsed(nextStrikes);
      if (nextStrikes >= maxStrikes) {
        // Burn all remaining empty cells on game over
        setCells((prev) =>
          prev.map((r) =>
            r.map((c) => (c.isCorrect ? c : { ...c, isBurnt: true }))
          )
        );
        setActiveCell(null);
      }
    }
  };

  const handleResetGame = () => {
    setCells(
      Array.from({ length: 4 }, (_, r) =>
        Array.from({ length: 4 }, (_, c) => ({
          row: r,
          col: c,
          isCorrect: false,
          isBurnt: false,
        }))
      )
    );
    setGuessedAthleteIds(new Set());
    setGuessesUsed(0);
    setStrikesUsed(0);
    setActiveCell(null);
  };

  return (
    <main className="min-h-screen bg-black text-zinc-100 flex flex-col justify-between px-3 sm:px-6 py-6 font-sans">
      <div className="flex-1 flex flex-col items-center">
        {/* Header with Title, Mode Toggle, and Counters */}
        <Header
          playMode={playMode}
          onToggleMode={(mode) => {
            if (guessesUsed === 0 && strikesUsed === 0) {
              setPlayMode(mode);
            } else {
              if (confirm('Switching modes will restart your current board. Continue?')) {
                setPlayMode(mode);
                handleResetGame();
              }
            }
          }}
          guessesUsed={guessesUsed}
          maxGuesses={maxGuesses}
          strikesUsed={strikesUsed}
          maxStrikes={maxStrikes}
          totalRarityScore={totalRarityScore}
          sportsUsed={sportsUsed}
          hasGrandSlam={hasGrandSlam}
          onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
          onOpenStats={() => setIsStatsOpen(true)}
          onResetGame={() => {
            if (confirm('Are you sure you want to reset the grid?')) {
              handleResetGame();
            }
          }}
        />

        {/* The 4x4 Grid Board */}
        <Grid
          rowCategories={puzzle.rowCategories}
          colCategories={puzzle.colCategories}
          cells={cells}
          onCellClick={handleCellClick}
          isGameOver={isGameOver}
        />

        {/* Game Over Notice Bar */}
        {isGameOver && (
          <div className="w-full max-w-xl mt-4 p-4 rounded-2xl border border-zinc-800 bg-zinc-900/90 text-center animate-in fade-in slide-in-from-bottom-2">
            <h3 className="font-bold text-base text-zinc-100">
              {cells.flat().filter((c) => c.isCorrect).length === 16
                ? '🎉 Immaculate Perfection! You solved all 16 cells!'
                : 'Game Over! You reached the guess limit.'}
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Final Rarity Score: <span className="font-mono text-emerald-400 font-bold">{totalRarityScore.toFixed(1)}</span>
            </p>
            <div className="mt-3 flex justify-center gap-3">
              <button
                onClick={() => setIsStatsOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-black hover:bg-emerald-400 transition"
              >
                View Stats & Share
              </button>
              <button
                onClick={handleResetGame}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-xs text-zinc-600 border-t border-zinc-900 pt-4">
        SportsGrid • The 4×4 Multi-Sport Trivia Grid • NFL • NBA • MLB • NHL • Soccer
      </footer>

      {/* Autocomplete Search Modal */}
      {activeCell && (
        <SearchModal
          isOpen={!!activeCell}
          rowCategory={puzzle.rowCategories[activeCell.row]}
          colCategory={puzzle.colCategories[activeCell.col]}
          guessedAthleteIds={guessedAthleteIds}
          onClose={() => setActiveCell(null)}
          onGuessSuccess={handleGuessSuccess}
          onGuessFailure={handleGuessFailure}
        />
      )}

      {/* How to Play Modal */}
      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
      />

      {/* Post-Game Stats & Share Modal */}
      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        cells={cells}
        playMode={playMode}
        totalRarityScore={totalRarityScore}
        guessesUsed={guessesUsed}
        maxGuesses={maxGuesses}
        sportsUsed={sportsUsed}
        hasGrandSlam={hasGrandSlam}
      />
    </main>
  );
}
