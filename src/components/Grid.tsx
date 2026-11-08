'use client';

import React from 'react';
import { Category, CellState, Sport } from '@/types';
import { getRarityTier } from '@/lib/rarityUtils';
import { SportRadarDial } from './SportRadarDial';
import { CategoryIcon } from './CategoryIcon';
import { LeagueIcon } from './LeagueIcon';

interface GridProps {
  rowCategories: Category[];
  colCategories: Category[];
  cells: CellState[][];
  onCellClick: (row: number, col: number) => void;
  isGameOver: boolean;
  activeCell?: { row: number; col: number } | null;
  sportsUsed?: Set<Sport>;
}

// Helper to format player name into 2 lines (First / Last) like the mockup
function splitPlayerName(fullName: string): { first: string; last: string } {
  const parts = fullName.trim().split(' ');
  if (parts.length <= 1) {
    return { first: fullName, last: '' };
  }
  return {
    first: parts[0],
    last: parts.slice(1).join(' '),
  };
}

export const Grid: React.FC<GridProps> = ({
  rowCategories,
  colCategories,
  cells,
  onCellClick,
  isGameOver,
  activeCell,
  sportsUsed = new Set<Sport>(),
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto overflow-x-auto pb-4 scrollbar-thin">
      {/* Outer Stadium Matrix Frame with Glowing Neon Border */}
      <div className="p-2 sm:p-3 rounded-2xl border border-[#00e5a3]/40 bg-[#08121f]/85 shadow-[0_0_30px_rgba(0,229,163,0.1)] backdrop-blur-md min-w-[540px] sm:min-w-[660px]">
        {/* 5x5 Grid: 1 for Row headers + 4 for Columns */}
        <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
          {/* ======================================================== */}
          {/* (0,0) TOP-LEFT CORNER: 4-SPORT RADAR COMPASS DIAL        */}
          {/* ======================================================== */}
          <div className="flex items-center justify-center rounded-xl border border-[#00e5a3]/40 bg-[#091524]/90 p-1 min-h-[95px] sm:min-h-[105px]">
            <SportRadarDial sportsUsed={sportsUsed} />
          </div>

          {/* ======================================================== */}
          {/* COLUMN HEADERS (Col 1 to 4)                               */}
          {/* ======================================================== */}
          {colCategories.map((col, cIdx) => {
            const isActiveCol = activeCell?.col === cIdx;

            return (
              <div
                key={col.id}
                title={col.description}
                className={`relative flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all duration-200 min-h-[95px] sm:min-h-[105px] select-none ${
                  isActiveCol
                    ? 'bg-[#0f2436] border-[#00f5b8] shadow-[0_0_15px_rgba(0,245,184,0.3)] ring-1 ring-[#00f5b8]/50'
                    : 'bg-[#0b1726]/90 border-[#00e5a3]/35 hover:border-[#00e5a3]/70 hover:bg-[#0e1d30]'
                }`}
              >
                {/* Centered Category Icon */}
                <div className="mb-1.5 flex items-center justify-center">
                  <CategoryIcon category={col} className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>

                {/* Bold Category Name */}
                <h3 className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-white leading-tight">
                  {col.shortName}
                </h3>
              </div>
            );
          })}

          {/* ======================================================== */}
          {/* 4 ROWS OF TILES                                           */}
          {/* ======================================================== */}
          {rowCategories.map((row, rIdx) => {
            const isActiveRow = activeCell?.row === rIdx;

            return (
              <React.Fragment key={row.id}>
                {/* ROW HEADER (Col 0) */}
                <div
                  title={row.description}
                  className={`relative flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all duration-200 min-h-[95px] sm:min-h-[110px] select-none ${
                    isActiveRow
                      ? 'bg-[#0f2436] border-[#00f5b8] shadow-[0_0_15px_rgba(0,245,184,0.3)] ring-1 ring-[#00f5b8]/50'
                      : 'bg-[#0b1726]/90 border-[#00e5a3]/35 hover:border-[#00e5a3]/70 hover:bg-[#0e1d30]'
                  }`}
                >
                  {/* Centered Category Icon */}
                  <div className="mb-1.5 flex items-center justify-center">
                    <CategoryIcon category={row} className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>

                  {/* Bold Category Name */}
                  <h3 className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-white leading-tight">
                    {row.shortName}
                  </h3>
                </div>

                {/* 4 PLAY CELLS FOR THIS ROW */}
                {colCategories.map((col, cIdx) => {
                  const cell = cells[rIdx][cIdx];
                  const isCurrentActive = activeCell?.row === rIdx && activeCell?.col === cIdx;
                  const canPlay = !cell.isCorrect && !cell.isBurnt && !isGameOver;

                  return (
                    <button
                      key={`${rIdx}-${cIdx}`}
                      onClick={() => onCellClick(rIdx, cIdx)}
                      className={`relative flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-xl border min-h-[95px] sm:min-h-[110px] transition-all duration-200 select-none cell-sheen ${
                        isCurrentActive
                          ? 'border-[#00f5b8] bg-[#0c2435] ring-2 ring-[#00f5b8]/60 shadow-[0_0_20px_rgba(0,245,184,0.4)] scale-[1.02] z-10'
                          : cell.isCorrect
                          ? 'border-[#00e5a3]/50 bg-[#091b2c]/90 hover:border-[#00e5a3] shadow-[0_0_12px_rgba(0,229,163,0.15)] cursor-pointer'
                          : cell.isBurnt
                          ? 'border-rose-500/50 bg-[#240a12]/80 hover:border-rose-400 cursor-pointer shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                          : canPlay
                          ? 'border-[#17283c]/80 bg-[#071320]/80 hover:border-[#00e5a3]/60 hover:bg-[#0c1f33] cursor-pointer shadow-sm active:scale-[0.98]'
                          : isGameOver
                          ? 'border-zinc-800 bg-[#071320]/60 hover:border-cyan-500/50 cursor-pointer'
                          : 'border-zinc-900 bg-[#050c14]/40 cursor-not-allowed opacity-40'
                      }`}
                    >
                      {/* ======================================================== */}
                      {/* 1. SOLVED STATE (Matches Tom Brady / Curry mockup)       */}
                      {/* ======================================================== */}
                      {cell.isCorrect && cell.athlete ? (
                        (() => {
                          const tier = getRarityTier(cell.rarity);
                          const primarySport = cell.athlete.sports[0];
                          const { first, last } = splitPlayerName(cell.athlete.name);

                          return (
                            <div className="flex flex-col items-center justify-between w-full h-full py-1 animate-in fade-in zoom-in-95 duration-200">
                              {/* Top Row: League Badge on left + Player Name on right */}
                              <div className="flex items-center gap-2 w-full justify-start px-1">
                                <LeagueIcon
                                  sport={primarySport}
                                  size="sm"
                                  variant="badge"
                                />
                                <div className="flex flex-col text-left leading-[1.15] overflow-hidden">
                                  <span className="font-extrabold text-[11px] sm:text-xs text-white drop-shadow truncate">
                                    {first}
                                  </span>
                                  {last && (
                                    <span className="font-extrabold text-[11px] sm:text-xs text-white drop-shadow truncate">
                                      {last}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Bottom: Rarity Pill matching image e.g. "0.4% MYTHIC", "1.2% RARE" */}
                              <div className="mt-1.5 flex justify-center w-full">
                                <span className={tier.pillClass}>
                                  {cell.rarity !== undefined ? `${cell.rarity.toFixed(1)}% ` : ''}
                                  {tier.label}
                                </span>
                              </div>
                            </div>
                          );
                        })()
                      ) : cell.isBurnt ? (
                        /* ======================================================== */
                        /* 2. BURNT (INCORRECT) STATE                              */
                        /* ======================================================== */
                        <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in-90 duration-200">
                          <span className="text-2xl font-black text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]">
                            ✕
                          </span>
                          <span className="text-[10px] font-black tracking-widest text-rose-400 uppercase mt-0.5">
                            BURNT
                          </span>
                        </div>
                      ) : (
                        /* ======================================================== */
                        /* 3. EMPTY STATE (Subtle Crosshair matching mockup)        */
                        /* ======================================================== */
                        <div className="flex flex-col items-center justify-center text-zinc-600 transition group-hover:text-zinc-400">
                          <span className="text-xl sm:text-2xl font-light text-zinc-500/60 leading-none">
                            +
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
    </div>
  );
};
