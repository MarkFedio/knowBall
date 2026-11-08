'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Athlete, CellState, PlayMode, Sport, DailyPuzzle, CareerStats } from '@/types';
import { DAILY_PUZZLE } from '@/data/puzzles';
import { generateProceduralPuzzle } from '@/lib/gridGenerator';
import {
  saveGameState,
  loadGameState,
  clearGameState,
  loadCareerStats,
  recordGameFinished,
  DEFAULT_CAREER_STATS,
} from '@/lib/storage';
import { Header } from '@/components/Header';
import { Grid } from '@/components/Grid';
import { SearchModal } from '@/components/SearchModal';
import { StatsModal } from '@/components/StatsModal';
import { HowToPlayModal } from '@/components/HowToPlayModal';
import { CellSolutionsModal } from '@/components/CellSolutionsModal';
import { sound } from '@/lib/sound';

export default function Home() {
  const [currentPuzzle, setCurrentPuzzle] = useState<DailyPuzzle>(DAILY_PUZZLE);

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
  const [hasGivenUp, setHasGivenUp] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isStorageLoaded, setIsStorageLoaded] = useState<boolean>(false);
  const [careerStats, setCareerStats] = useState<CareerStats>(DEFAULT_CAREER_STATS);

  // Modals
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);
  const [inspectCell, setInspectCell] = useState<{ row: number; col: number } | null>(null);
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
    if (hasGivenUp) return true;
    const correctCount = cells.flat().filter((c) => c.isCorrect).length;
    if (correctCount === 16) return true;
    if (playMode === 'IMMACULATE') {
      return guessesUsed >= maxGuesses;
    } else {
      return strikesUsed >= maxStrikes;
    }
  }, [cells, playMode, guessesUsed, strikesUsed, hasGivenUp]);

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
        // Fallback
      }
    }
  };

  // Load saved puzzle state and career stats on mount or when puzzle changes
  useEffect(() => {
    const stats = loadCareerStats();
    setCareerStats(stats);

    const saved = loadGameState(currentPuzzle.id);
    if (saved) {
      setCells(saved.cells);
      setGuessedAthleteIds(new Set(saved.guessedAthleteIds));
      setGuessesUsed(saved.guessesUsed);
      setStrikesUsed(saved.strikesUsed);
      setPlayMode(saved.playMode);
      setHasGivenUp(saved.hasGivenUp);
    }
    setIsStorageLoaded(true);
  }, [currentPuzzle.id]);

  // Auto-save game state to localStorage whenever board progresses
  useEffect(() => {
    if (!isStorageLoaded) return;
    if (guessesUsed > 0 || strikesUsed > 0 || hasGivenUp) {
      saveGameState({
        puzzleId: currentPuzzle.id,
        date: currentPuzzle.date,
        cells,
        guessedAthleteIds: Array.from(guessedAthleteIds),
        guessesUsed,
        strikesUsed,
        playMode,
        hasGivenUp,
        lastUpdated: Date.now(),
      });
    }
  }, [cells, guessesUsed, strikesUsed, hasGivenUp, playMode, guessedAthleteIds, currentPuzzle, isStorageLoaded]);

  // Record career stats when puzzle concludes
  useEffect(() => {
    if (!isStorageLoaded || !isGameOver) return;
    const correctCount = cells.flat().filter((c) => c.isCorrect).length;
    const isWon = correctCount === 16;
    const isImmaculate =
      isWon && (playMode === 'IMMACULATE' ? guessesUsed === 16 : strikesUsed === 0);

    const updated = recordGameFinished({
      puzzleId: currentPuzzle.id,
      date: currentPuzzle.date,
      isWon,
      isImmaculate,
      correctCount,
      rarityScore: totalRarityScore,
      hasGrandSlam,
    });
    setCareerStats(updated);
  }, [isGameOver, isStorageLoaded]);

  // Check for 16/16 win
  useEffect(() => {
    const correctCount = cells.flat().filter((c) => c.isCorrect).length;
    if (correctCount === 16) {
      sound.playVictory();
      triggerConfetti();
      const timer = setTimeout(() => setIsStatsOpen(true), 600);
      return () => clearTimeout(timer);
    }
  }, [cells]);

  const handleCellClick = (row: number, col: number) => {
    if (isGameOver) {
      // If game is over, clicking any cell opens the solutions inspector
      setInspectCell({ row, col });
      return;
    }

    const cell = cells[row][col];
    if (cell.isCorrect || cell.isBurnt) return;
    setActiveCell({ row, col });
  };

  const handleGuessSuccess = (athlete: Athlete, rarity: number) => {
    if (!activeCell) return;
    const { row, col } = activeCell;

    sound.playSuccess();

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

    sound.playError();

    if (playMode === 'IMMACULATE') {
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
      const nextStrikes = strikesUsed + 1;
      setStrikesUsed(nextStrikes);
      if (nextStrikes >= maxStrikes) {
        setCells((prev) =>
          prev.map((r) =>
            r.map((c) => (c.isCorrect ? c : { ...c, isBurnt: true }))
          )
        );
        setActiveCell(null);
      }
    }
  };

  const resetBoard = (newPuzzle?: DailyPuzzle) => {
    const targetPuzzle = newPuzzle || currentPuzzle;
    clearGameState(targetPuzzle.id);
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
    setHasGivenUp(false);
    setActiveCell(null);
    setInspectCell(null);
    if (newPuzzle) {
      setCurrentPuzzle(newPuzzle);
    }
  };

  const handleNewRandomPuzzle = () => {
    if (guessesUsed > 0 || strikesUsed > 0) {
      if (!confirm('Generate a new random grid and reset progress?')) return;
    }
    const randomPuzzle = generateProceduralPuzzle();
    resetBoard(randomPuzzle);
  };

  const handleGiveUp = () => {
    if (confirm('Reveal all answers and finish this game?')) {
      setHasGivenUp(true);
      // Mark unfilled cells as burnt
      setCells((prev) =>
        prev.map((r) =>
          r.map((c) => (c.isCorrect ? c : { ...c, isBurnt: true }))
        )
      );
      setIsStatsOpen(true);
    }
  };

  return (
    <main className="min-h-screen bg-black text-zinc-100 flex flex-col justify-between px-3 sm:px-6 py-6 font-sans">
      <div className="flex-1 flex flex-col items-center">
        {/* Header with Game Status, Mode Switcher, and Counters */}
        <Header
          currentPuzzle={currentPuzzle}
          onNewRandomPuzzle={handleNewRandomPuzzle}
          onGiveUp={handleGiveUp}
          isGameOver={isGameOver}
          soundEnabled={soundEnabled}
          onToggleSound={() => {
            const next = !soundEnabled;
            setSoundEnabled(next);
            sound.enabled = next;
          }}
          playMode={playMode}
          onToggleMode={(mode) => {
            if (guessesUsed === 0 && strikesUsed === 0) {
              setPlayMode(mode);
            } else {
              if (confirm('Switching modes will restart your current board. Continue?')) {
                setPlayMode(mode);
                resetBoard();
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
            if (confirm('Reset this board?')) {
              resetBoard();
            }
          }}
        />

        {/* The 4x4 Grid Board */}
        <Grid
          rowCategories={currentPuzzle.rowCategories}
          colCategories={currentPuzzle.colCategories}
          cells={cells}
          onCellClick={handleCellClick}
          isGameOver={isGameOver}
        />

        {/* Post-Game Notice & Inspector Tip */}
        {isGameOver && (
          <div className="w-full max-w-xl mt-4 p-4 rounded-2xl border border-zinc-800 bg-zinc-900/90 text-center animate-in fade-in slide-in-from-bottom-2">
            <h3 className="font-bold text-base text-zinc-100">
              {cells.flat().filter((c) => c.isCorrect).length === 16
                ? '🎉 Immaculate Perfection! You solved all 16 cells!'
                : 'Game Finished! Click any cell above to inspect all valid answers.'}
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
                onClick={handleNewRandomPuzzle}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-black hover:bg-cyan-400 transition"
              >
                Next Random Grid
              </button>
              <button
                onClick={() => resetBoard()}
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
        SportsGrid • The 4×4 Multi-Sport Trivia Grid • NFL • NBA • MLB • NHL
      </footer>

      {/* Autocomplete Search Modal */}
      {activeCell && (
        <SearchModal
          isOpen={!!activeCell}
          rowCategory={currentPuzzle.rowCategories[activeCell.row]}
          colCategory={currentPuzzle.colCategories[activeCell.col]}
          guessedAthleteIds={guessedAthleteIds}
          onClose={() => setActiveCell(null)}
          onGuessSuccess={handleGuessSuccess}
          onGuessFailure={handleGuessFailure}
        />
      )}

      {/* Cell Solutions Inspector Modal (When clicked after game over or to inspect) */}
      {inspectCell && (
        <CellSolutionsModal
          isOpen={!!inspectCell}
          rowCategory={currentPuzzle.rowCategories[inspectCell.row]}
          colCategory={currentPuzzle.colCategories[inspectCell.col]}
          userGuessedAthlete={cells[inspectCell.row][inspectCell.col]?.athlete}
          onClose={() => setInspectCell(null)}
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
        careerStats={careerStats}
      />
    </main>
  );
}
