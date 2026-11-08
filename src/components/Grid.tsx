'use client';

import React from 'react';
import { Category, CellState, Sport } from '@/types';
import { getRarityTier } from '@/lib/rarityUtils';

interface GridProps {
  rowCategories: Category[];
  colCategories: Category[];
  cells: CellState[][];
  onCellClick: (row: number, col: number) => void;
  isGameOver: boolean;
  activeCell?: { row: number; col: number } | null;
}

const SPORT_COLORS: Record<Sport, { bg: string; text: string; border: string }> = {
  NFL: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' },
  NBA: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
  MLB: { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30' },
  NHL: { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30' },
};

const CATEGORY_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  SPORT: { label: 'SPORT', color: 'text-blue-400 bg-blue-500/10' },
  METRO: { label: 'METRO', color: 'text-purple-400 bg-purple-500/10' },
  ACCOLADE: { label: 'ACCOLADE', color: 'text-amber-400 bg-amber-500/10' },
  BACKGROUND: { label: 'COLLEGE/DRAFT', color: 'text-emerald-400 bg-emerald-500/10' },
  NUMBER_ERA: { label: 'NUMBER/ERA', color: 'text-pink-400 bg-pink-500/10' },
  CROSS_STAT: { label: 'CROSS-STAT', color: 'text-cyan-400 bg-cyan-500/10' },
};

export const Grid: React.FC<GridProps> = ({
  rowCategories,
  colCategories,
  cells,
  onCellClick,
  isGameOver,
  activeCell,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto overflow-x-auto pb-4 scrollbar-thin">
      {/* 5 columns: 1 for Row headers + 4 for Columns */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-3 min-w-[500px] sm:min-w-[620px]">
        {/* Top Left Corner */}
        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-900/40 border border-zinc-800/60 text-center">
          <span className="text-[11px] font-black uppercase tracking-widest text-zinc-500">
            4×4 MATRIX
          </span>
          {isGameOver && (
            <span className="text-[9px] font-bold text-cyan-400 mt-0.5">
              Click to Inspect
            </span>
          )}
        </div>

        {/* Column Headers */}
        {colCategories.map((col, cIdx) => {
          const typeMeta = CATEGORY_TYPE_LABELS[col.type] || { label: col.type, color: 'text-zinc-400 bg-zinc-800' };
          const isActiveCol = activeCell?.col === cIdx;

          return (
            <div
              key={col.id}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-200 min-h-[90px] relative ${
                isActiveCol
                  ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-500/10 scale-[1.01]'
                  : 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {isActiveCol && (
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-emerald-500 px-1.5 py-0.2 text-[8px] font-black uppercase text-black tracking-wider shadow">
                  Active
                </div>
              )}
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider mb-1 uppercase ${typeMeta.color}`}>
                {typeMeta.label}
              </span>
              <h3 className={`text-xs sm:text-sm font-bold leading-tight ${isActiveCol ? 'text-emerald-300' : 'text-zinc-100'}`}>
                {col.shortName}
              </h3>
              <p className="hidden md:block text-[10px] text-zinc-400 mt-1 line-clamp-1">
                {col.description}
              </p>
            </div>
          );
        })}

        {/* 4 Rows */}
        {rowCategories.map((row, rIdx) => {
          const rowTypeMeta = CATEGORY_TYPE_LABELS[row.type] || { label: row.type, color: 'text-zinc-400 bg-zinc-800' };
          const isActiveRow = activeCell?.row === rIdx;

          return (
            <React.Fragment key={row.id}>
              {/* Row Header */}
              <div
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-200 min-h-[105px] relative ${
                  isActiveRow
                    ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-500/10 scale-[1.01]'
                    : 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {isActiveRow && (
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-emerald-500 px-1.5 py-0.2 text-[8px] font-black uppercase text-black tracking-wider shadow">
                    Active
                  </div>
                )}
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider mb-1 uppercase ${rowTypeMeta.color}`}>
                  {rowTypeMeta.label}
                </span>
                <h3 className={`text-xs sm:text-sm font-bold leading-tight ${isActiveRow ? 'text-emerald-300' : 'text-zinc-100'}`}>
                  {row.shortName}
                </h3>
                <p className="hidden md:block text-[10px] text-zinc-400 mt-1 line-clamp-1">
                  {row.description}
                </p>
              </div>

              {/* 4 Cells for this Row */}
              {colCategories.map((col, cIdx) => {
                const cell = cells[rIdx][cIdx];
                const canPlayGuess = !cell.isCorrect && !cell.isBurnt && !isGameOver;
                const isCurrentActive = activeCell?.row === rIdx && activeCell?.col === cIdx;

                return (
                  <button
                    key={`${rIdx}-${cIdx}`}
                    onClick={() => onCellClick(rIdx, cIdx)}
                    className={`relative flex flex-col items-center justify-center p-2.5 rounded-xl border min-h-[105px] transition-all duration-150 select-none ${
                      isCurrentActive
                        ? 'border-emerald-400 bg-emerald-500/20 ring-2 ring-emerald-400/60 scale-[1.03] shadow-xl shadow-emerald-500/20 z-10'
                        : cell.isCorrect
                        ? 'bg-emerald-950/30 border-emerald-500/50 hover:border-emerald-400 cursor-pointer'
                        : cell.isBurnt
                        ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-400 cursor-pointer'
                        : canPlayGuess
                        ? 'bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-800/80 hover:border-emerald-500/60 cursor-pointer shadow-sm active:scale-[0.98]'
                        : isGameOver
                        ? 'bg-zinc-900/40 border-zinc-800 hover:border-cyan-500/50 cursor-pointer'
                        : 'bg-zinc-950/40 border-zinc-900 cursor-not-allowed opacity-50'
                    }`}
                  >
                    {cell.isCorrect && cell.athlete ? (
                      (() => {
                        const tier = getRarityTier(cell.rarity);
                        return (
                          <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-90 duration-300">
                            {/* Athlete Name */}
                            <span className="font-extrabold text-xs sm:text-sm text-zinc-50 leading-snug line-clamp-1">
                              {cell.athlete.name}
                            </span>

                            {/* Sport Badges */}
                            <div className="flex flex-wrap justify-center gap-1 mt-1">
                              {cell.athlete.sports.map((sport) => {
                                const style = SPORT_COLORS[sport];
                                return (
                                  <span
                                    key={sport}
                                    className={`rounded px-1.5 py-0.2 text-[9px] font-bold border ${style.bg} ${style.text} ${style.border}`}
                                  >
                                    {sport}
                                  </span>
                                );
                              })}
                            </div>

                            {/* Dynamic Rarity Tier Pill */}
                            <span
                              title={`${tier.label} (${cell.rarity?.toFixed(1)}% pick rate)`}
                              className={`mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border flex items-center gap-1 ${tier.badgeClass}`}
                            >
                              {tier.prefixIcon && <span>{tier.prefixIcon}</span>}
                              <span>{cell.rarity?.toFixed(1)}%</span>
                            </span>
                          </div>
                        );
                      })()
                    ) : cell.isBurnt ? (
                      <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in-90 duration-300">
                        <span className="text-2xl font-black text-rose-500/80">✕</span>
                        <span className="text-[10px] font-bold tracking-wider text-rose-400/80 uppercase mt-0.5">
                          BURNT
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-zinc-600 transition group-hover:text-zinc-400">
                        <span className="text-xl font-light">+</span>
                        <span className="text-[10px] font-medium tracking-wide uppercase mt-0.5 text-zinc-500">
                          Select
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
