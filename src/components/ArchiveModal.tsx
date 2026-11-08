'use client';

import React from 'react';
import { X, Calendar, CheckCircle2, Play, Flame, Trophy } from 'lucide-react';
import { DailyPuzzle } from '@/types';
import { getAllPastPuzzles } from '@/data/puzzles';
import { loadGameState, loadCareerStats } from '@/lib/storage';

interface ArchiveModalProps {
  isOpen: boolean;
  currentPuzzleId: string;
  onClose: () => void;
  onSelectPuzzle: (puzzle: DailyPuzzle) => void;
}

export const ArchiveModal: React.FC<ArchiveModalProps> = ({
  isOpen,
  currentPuzzleId,
  onClose,
  onSelectPuzzle,
}) => {
  if (!isOpen) return null;

  const pastPuzzles = getAllPastPuzzles();
  const careerStats = loadCareerStats();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative flex max-h-[90dvh] sm:max-h-[85vh] w-full max-w-lg flex-col rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 sm:right-4 sm:top-4 rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
          <div className="rounded-xl bg-cyan-500/10 p-2.5 text-cyan-400">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">Past Grids Archive</h2>
            <p className="text-xs text-zinc-400">
              Browse and play previous daily puzzles ({pastPuzzles.length} available)
            </p>
          </div>
        </div>

        {/* Puzzle Cards List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 my-4 pr-1">
          {pastPuzzles.map(({ puzzle, puzzleNumber }) => {
            const isCurrent = puzzle.id === currentPuzzleId;
            const savedState = loadGameState(puzzle.id);
            const isCompleted = careerStats.completedPuzzleIds.includes(puzzle.id);
            const correctCount = savedState
              ? savedState.cells.flat().filter((c) => c.isCorrect).length
              : 0;

            return (
              <div
                key={puzzle.id}
                className={`flex items-center justify-between rounded-xl border p-3.5 transition ${
                  isCurrent
                    ? 'border-emerald-500/60 bg-emerald-950/20 shadow-sm shadow-emerald-500/10'
                    : 'border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/70'
                }`}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-zinc-100">
                      KnowBall #{puzzleNumber}
                    </span>
                    {isCurrent && (
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-400 border border-emerald-500/30">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <span className="font-mono text-zinc-500">{puzzle.date}</span>
                    <span>•</span>
                    <span className="line-clamp-1 text-zinc-400 text-[11px]">
                      {puzzle.rowCategories.map((c) => c.shortName).join(', ')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  {/* Status Indicator */}
                  {isCompleted ? (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-xs font-bold text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{correctCount}/16</span>
                    </span>
                  ) : savedState && (savedState.guessesUsed > 0 || savedState.strikesUsed > 0) ? (
                    <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-xs font-bold text-amber-400">
                      {correctCount}/16 In Progress
                    </span>
                  ) : (
                    <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-semibold text-zinc-400">
                      Unplayed
                    </span>
                  )}

                  {/* Play Button */}
                  <button
                    onClick={() => {
                      onSelectPuzzle(puzzle);
                      onClose();
                    }}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition flex items-center gap-1 ${
                      isCurrent
                        ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-sm shadow-emerald-500/20'
                    }`}
                  >
                    <Play className="h-3 w-3 fill-current" />
                    <span>{isCurrent ? 'Playing' : 'Play'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-zinc-800 px-4 py-2 text-xs font-bold text-zinc-200 transition hover:bg-zinc-700"
          >
            Close Archive
          </button>
        </div>
      </div>
    </div>
  );
};
