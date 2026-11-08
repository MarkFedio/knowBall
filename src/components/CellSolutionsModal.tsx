'use client';

import React from 'react';
import { X, Search, CheckCircle2 } from 'lucide-react';
import { Athlete, Category, Sport } from '@/types';
import { getAllSolutionsForCell } from '@/lib/gridGenerator';
import { getRarityTier } from '@/lib/rarityUtils';

interface CellSolutionsModalProps {
  isOpen: boolean;
  rowCategory: Category;
  colCategory: Category;
  userGuessedAthlete?: Athlete;
  onClose: () => void;
}

const SPORT_COLORS: Record<Sport, { bg: string; text: string; border: string }> = {
  NFL: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  NBA: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  MLB: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  NHL: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
};

export const CellSolutionsModal: React.FC<CellSolutionsModalProps> = ({
  isOpen,
  rowCategory,
  colCategory,
  userGuessedAthlete,
  onClose,
}) => {
  if (!isOpen) return null;

  const solutions = getAllSolutionsForCell(rowCategory, colCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90dvh] sm:max-h-[85vh] w-full max-w-xl flex-col rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6 shadow-2xl text-zinc-100">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 sm:right-4 sm:top-4 rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-4 pr-10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
            <Search className="h-4 w-4" /> Solutions Inspector
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1 text-sm font-semibold text-zinc-200">
              {rowCategory.name}
            </span>
            <span className="text-zinc-500 font-bold">×</span>
            <span className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1 text-sm font-semibold text-zinc-200">
              {colCategory.name}
            </span>
          </div>
          <p className="mt-2 text-xs text-zinc-400">
            Found <span className="font-bold text-emerald-400">{solutions.length}</span> eligible athletes in the database.
          </p>
        </div>

        {/* Solutions List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {solutions.length === 0 ? (
            <div className="py-12 text-center text-sm text-zinc-500">
              No athletes found for this intersection.
            </div>
          ) : (
            solutions.map(({ athlete, rarity }) => {
              const isUserPick = userGuessedAthlete?.id === athlete.id;

              return (
                <div
                  key={athlete.id}
                  className={`flex items-center justify-between rounded-xl border p-3 transition ${
                    isUserPick
                      ? 'border-emerald-500/50 bg-emerald-950/20'
                      : 'border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/80'
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${isUserPick ? 'text-emerald-300' : 'text-zinc-100'}`}>
                        {athlete.name}
                      </span>

                      {/* Sport Badges */}
                      <div className="flex gap-1">
                        {athlete.sports.map((sport) => {
                          const style = SPORT_COLORS[sport];
                          return (
                            <span
                              key={sport}
                              className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${style.bg} ${style.text} ${style.border}`}
                            >
                              {sport}
                            </span>
                          );
                        })}
                      </div>

                      {isUserPick && (
                        <span className="flex items-center gap-1 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/40">
                          <CheckCircle2 className="h-3 w-3" /> Your Guess
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-zinc-400">
                      <span>{athlete.positions.join('/')}</span> •{' '}
                      <span>{athlete.teamNames.slice(0, 3).join(', ')}{athlete.teamNames.length > 3 ? '...' : ''}</span> •{' '}
                      <span className="text-zinc-500">
                        {athlete.activeYears[0]}–{athlete.activeYears[1] >= 2026 ? 'Pres' : athlete.activeYears[1]}
                      </span>
                    </div>
                  </div>

                  {/* Rarity Score */}
                  <div className="text-right">
                    {(() => {
                      const tier = getRarityTier(rarity);
                      return (
                        <span className={tier.pillClass}>
                          {rarity.toFixed(1)}% {tier.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
