'use client';

import React from 'react';
import { Category, CellState, Sport } from '@/types';

interface GridProps {
  rowCategories: Category[];
  colCategories: Category[];
  cells: CellState[][];
  onCellClick: (row: number, col: number) => void;
  isGameOver: boolean;
}

const SPORT_COLORS: Record<Sport, { bg: string; text: string; border: string }> = {
  NFL: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' },
  NBA: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
  MLB: { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30' },
  NHL: { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  SOCCER: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
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
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto overflow-x-auto pb-4">
      {/* 5 columns: 1 for Row headers + 4 for Columns */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3 min-w-[620px]">
        {/* Top Left Corner */}
        <div className="flex items-center justify-center p-2 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
          <span className="text-[11px] font-black uppercase tracking-widest text-zinc-500">
            4×4 MATRIX
          </span>
        </div>

        {/* Column Headers */}
        {colCategories.map((col, cIdx) => {
          const typeMeta = CATEGORY_TYPE_LABELS[col.type] || { label: col.type, color: 'text-zinc-400 bg-zinc-800' };
          return (
            <div
              key={col.id}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-center transition hover:border-zinc-700 min-h-[90px]"
            >
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider mb-1 uppercase ${typeMeta.color}`}>
                {typeMeta.label}
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-zinc-100 leading-tight">
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
          return (
            <React.Fragment key={row.id}>
              {/* Row Header */}
              <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-center transition hover:border-zinc-700 min-h-[105px]">
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider mb-1 uppercase ${rowTypeMeta.color}`}>
                  {rowTypeMeta.label}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-zinc-100 leading-tight">
                  {row.shortName}
                </h3>
                <p className="hidden md:block text-[10px] text-zinc-400 mt-1 line-clamp-1">
                  {row.description}
                </p>
              </div>

              {/* 4 Cells for this Row */}
              {colCategories.map((col, cIdx) => {
                const cell = cells[rIdx][cIdx];
                const canClick = !cell.isCorrect && !cell.isBurnt && !isGameOver;

                return (
                  <button
                    key={`${rIdx}-${cIdx}`}
                    disabled={!canClick}
                    onClick={() => onCellClick(rIdx, cIdx)}
                    className={`relative flex flex-col items-center justify-center p-2.5 rounded-xl border min-h-[105px] transition duration-150 select-none ${
                      cell.isCorrect
                        ? 'bg-emerald-950/30 border-emerald-500/50 hover:border-emerald-400'
                        : cell.isBurnt
                        ? 'bg-rose-950/20 border-rose-500/40 cursor-not-allowed'
                        : canClick
                        ? 'bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-800/80 hover:border-emerald-500/60 cursor-pointer shadow-sm active:scale-[0.98]'
                        : 'bg-zinc-950/40 border-zinc-900 cursor-not-allowed opacity-50'
                    }`}
                  >
                    {cell.isCorrect && cell.athlete ? (
                      <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
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

                        {/* Rarity Score Pill */}
                        <span className="mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          {cell.rarity?.toFixed(1)}% rarity
                        </span>
                      </div>
                    ) : cell.isBurnt ? (
                      <div className="flex flex-col items-center justify-center text-rose-500">
                        <span className="text-2xl font-black leading-none">✕</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400/80 mt-1">
                          Burnt
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-zinc-600 hover:text-emerald-400 transition">
                        <span className="text-lg font-light">+</span>
                        <span className="text-[9px] uppercase tracking-widest text-zinc-500 mt-0.5">
                          Guess
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
