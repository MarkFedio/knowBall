'use client';

import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { Category, CellState, Sport, VisualTheme } from '@/types';
import { getRarityTier } from '@/lib/rarityUtils';
import { SportRadarDial } from './SportRadarDial';
import { CategoryIcon } from './CategoryIcon';
import { LeagueIcon } from './LeagueIcon';
import { CategoryInfoModal } from './CategoryInfoModal';
import { GrandSlamModal } from './GrandSlamModal';

interface GridProps {
  rowCategories: Category[];
  colCategories: Category[];
  cells: CellState[][];
  onCellClick: (row: number, col: number) => void;
  isGameOver: boolean;
  activeCell?: { row: number; col: number } | null;
  sportsUsed?: Set<Sport>;
  theme?: VisualTheme;
}

// Helper to format player name into 2 lines (First / Last)
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
  theme = 'NEON',
}) => {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isGrandSlamOpen, setIsGrandSlamOpen] = useState(false);

  const isScoreboard = theme === 'SCOREBOARD';
  const isNeon = theme === 'NEON';

  // Highlight targets based on either active (clicked) cell or hovered cell
  const targetCol = activeCell?.col ?? hoveredCell?.col ?? null;
  const targetRow = activeCell?.row ?? hoveredCell?.row ?? null;

  return (
    <div className="w-full max-w-5xl mx-auto overflow-x-auto pb-4 scrollbar-thin">
      {/* Outer Stadium Matrix Frame */}
      <div
        className={`p-2 sm:p-3 rounded-2xl min-w-[540px] sm:min-w-[660px] transition-all duration-300 ${
          isScoreboard
            ? 'border border-amber-500/35 bg-[#0b0e14] shadow-[0_6px_30px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.06)]'
            : isNeon
            ? 'border border-[#00e5a3]/40 bg-[#08121f]/85 shadow-[0_0_30px_rgba(0,229,163,0.1)] backdrop-blur-md'
            : 'border border-zinc-800 bg-zinc-900/90'
        }`}
      >
        {/* 5x5 Grid: 1 for Row headers + 4 for Columns */}
        <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
          {/* ======================================================== */}
          {/* (0,0) TOP-LEFT CORNER: 4-SPORT RADAR COMPASS DIAL        */}
          {/* ======================================================== */}
          <div
            className={`flex items-center justify-center rounded-xl min-h-[95px] sm:min-h-[105px] border overflow-visible ${
              isScoreboard
                ? 'border-amber-500/30 bg-[#0c0f16] shadow-inner'
                : isNeon
                ? 'border-[#00e5a3]/30 bg-[#091524]/90'
                : 'border-zinc-800 bg-zinc-900'
            }`}
          >
            <SportRadarDial
              sportsUsed={sportsUsed}
              theme={theme}
              onClick={() => setIsGrandSlamOpen(true)}
            />
          </div>

          {/* ======================================================== */}
          {/* COLUMN HEADERS (Col 1 to 4)                               */}
          {/* ======================================================== */}
          {colCategories.map((col, cIdx) => {
            const isColHighlighted = targetCol === cIdx;

            return (
              <button
                key={col.id}
                type="button"
                onClick={() => setSelectedCategory(col)}
                title="Click to view exact criteria requirement"
                className={`group relative flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all duration-200 min-h-[95px] sm:min-h-[105px] select-none cursor-pointer ${
                  isColHighlighted
                    ? isScoreboard
                      ? 'bg-[#221a0d] border-amber-400 shadow-[0_0_14px_rgba(245,158,11,0.3)] ring-1 ring-amber-400/50 scale-[1.01]'
                      : isNeon
                      ? 'bg-[#0f2436] border-[#00f5b8] shadow-[0_0_15px_rgba(0,245,184,0.3)] ring-1 ring-[#00f5b8]/50 scale-[1.01]'
                      : 'bg-zinc-800 border-zinc-600 scale-[1.01]'
                    : isScoreboard
                    ? 'bg-[#121620] border-amber-500/25 hover:border-amber-400/60 hover:bg-[#161c28] hover:shadow-[0_0_12px_rgba(245,158,11,0.15)] active:scale-[0.98]'
                    : isNeon
                    ? 'bg-[#0b1726]/90 border-[#00e5a3]/35 hover:border-[#00f5b8] hover:bg-[#0e1d30] hover:shadow-[0_0_15px_rgba(0,245,184,0.2)] active:scale-[0.98]'
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-600 active:scale-[0.98]'
                }`}
              >
                {/* Help Hint Icon Indicator */}
                <span className="absolute top-1.5 right-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                  <HelpCircle className="w-3 h-3 text-cyan-400/80" />
                </span>

                {/* Centered Category Icon */}
                <div className="mb-1.5 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
                  <CategoryIcon category={col} className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>

                {/* Bold Category Name */}
                <h3
                  className={`text-[11px] sm:text-xs font-black uppercase tracking-wider leading-tight ${
                    isColHighlighted && isScoreboard
                      ? 'text-amber-300'
                      : isColHighlighted && isNeon
                      ? 'text-[#00f5b8]'
                      : 'text-zinc-100'
                  }`}
                >
                  {col.shortName}
                </h3>
              </button>
            );
          })}

          {/* ======================================================== */}
          {/* 4 ROWS OF TILES                                           */}
          {/* ======================================================== */}
          {rowCategories.map((row, rIdx) => {
            const isRowHighlighted = targetRow === rIdx;

            return (
              <React.Fragment key={row.id}>
                {/* ROW HEADER (Col 0) */}
                <button
                  type="button"
                  onClick={() => setSelectedCategory(row)}
                  title="Click to view exact criteria requirement"
                  className={`group relative flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all duration-200 min-h-[95px] sm:min-h-[110px] select-none cursor-pointer ${
                    isRowHighlighted
                      ? isScoreboard
                        ? 'bg-[#221a0d] border-amber-400 shadow-[0_0_14px_rgba(245,158,11,0.3)] ring-1 ring-amber-400/50 scale-[1.01]'
                        : isNeon
                        ? 'bg-[#0f2436] border-[#00f5b8] shadow-[0_0_15px_rgba(0,245,184,0.3)] ring-1 ring-[#00f5b8]/50 scale-[1.01]'
                        : 'bg-zinc-800 border-zinc-600 scale-[1.01]'
                      : isScoreboard
                      ? 'bg-[#121620] border-amber-500/25 hover:border-amber-400/60 hover:bg-[#161c28] hover:shadow-[0_0_12px_rgba(245,158,11,0.15)] active:scale-[0.98]'
                      : isNeon
                      ? 'bg-[#0b1726]/90 border-[#00e5a3]/35 hover:border-[#00f5b8] hover:bg-[#0e1d30] hover:shadow-[0_0_15px_rgba(0,245,184,0.2)] active:scale-[0.98]'
                      : 'bg-zinc-900 border-zinc-800 hover:border-zinc-600 active:scale-[0.98]'
                  }`}
                >
                  {/* Help Hint Icon Indicator */}
                  <span className="absolute top-1.5 right-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                    <HelpCircle className="w-3 h-3 text-cyan-400/80" />
                  </span>

                  {/* Centered Category Icon */}
                  <div className="mb-1.5 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
                    <CategoryIcon category={row} className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>

                  {/* Bold Category Name */}
                  <h3
                    className={`text-[11px] sm:text-xs font-black uppercase tracking-wider leading-tight ${
                      isRowHighlighted && isScoreboard
                        ? 'text-amber-300'
                        : isRowHighlighted && isNeon
                        ? 'text-[#00f5b8]'
                        : 'text-zinc-100'
                    }`}
                  >
                    {row.shortName}
                  </h3>
                </button>

                {/* 4 PLAY CELLS FOR THIS ROW */}
                {colCategories.map((col, cIdx) => {
                  const cell = cells[rIdx][cIdx];
                  const isCurrentActive = activeCell?.row === rIdx && activeCell?.col === cIdx;
                  const canPlay = !cell.isCorrect && !cell.isBurnt && !isGameOver;

                  return (
                    <button
                      key={`${rIdx}-${cIdx}`}
                      onClick={() => onCellClick(rIdx, cIdx)}
                      onMouseEnter={() => setHoveredCell({ row: rIdx, col: cIdx })}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`relative flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-xl border min-h-[95px] sm:min-h-[110px] transition-all duration-150 select-none ${
                        isCurrentActive
                          ? isScoreboard
                            ? 'border-amber-400 bg-amber-500/20 ring-2 ring-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.35)] scale-[1.03] z-10'
                            : isNeon
                            ? 'border-[#00f5b8] bg-[#0c2435] ring-2 ring-[#00f5b8]/60 shadow-[0_0_20px_rgba(0,245,184,0.4)] scale-[1.02] z-10'
                            : 'border-white bg-zinc-800 ring-2 ring-white scale-[1.02] z-10'
                          : cell.isCorrect
                          ? isScoreboard
                            ? 'border-amber-500/40 bg-[#141822] hover:border-amber-400 shadow-[0_2px_8px_rgba(0,0,0,0.5)] cursor-pointer'
                            : isNeon
                            ? 'border-[#00e5a3]/50 bg-[#091b2c]/90 hover:border-[#00e5a3] shadow-[0_0_12px_rgba(0,229,163,0.15)] cursor-pointer'
                            : 'border-emerald-600 bg-emerald-950/40 cursor-pointer'
                          : cell.isBurnt
                          ? 'border-rose-500/50 bg-[#240a12]/80 hover:border-rose-400 cursor-pointer shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                          : canPlay
                          ? isScoreboard
                            ? 'border-zinc-800 bg-[#0d1017] hover:border-amber-500/50 hover:bg-[#131722] cursor-pointer shadow-inner active:scale-[0.98]'
                            : isNeon
                            ? 'border-[#17283c]/80 bg-[#071320]/80 hover:border-[#00e5a3]/60 hover:bg-[#0c1f33] cursor-pointer shadow-sm active:scale-[0.98]'
                            : 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 cursor-pointer active:scale-[0.98]'
                          : isGameOver
                          ? 'border-zinc-800 bg-[#071320]/60 hover:border-amber-500/50 cursor-pointer'
                          : 'border-zinc-900 bg-[#050c14]/40 cursor-not-allowed opacity-40'
                      }`}
                    >
                      {/* ======================================================== */}
                      {/* 1. SOLVED STATE                                          */}
                      {/* ======================================================== */}
                      {cell.isCorrect && cell.athlete ? (
                        (() => {
                          const tier = getRarityTier(cell.rarity);
                          const primarySport = cell.athlete.sports[0];
                          const { first, last } = splitPlayerName(cell.athlete.name);

                          return (
                            <div className="flex flex-col items-center justify-between w-full h-full py-1 animate-in fade-in zoom-in-95 duration-200">
                              {/* Top Row: League Badge on left + Player Name on right */}
                              <div className="flex items-center gap-1.5 sm:gap-2 w-full justify-start px-1">
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
                        /* 2. BURNT (INCORRECT) STATE                               */
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
                        /* 3. EMPTY STATE (Subtle Crosshair)                        */
                        /* ======================================================== */
                        <div className="flex flex-col items-center justify-center text-zinc-600 transition group-hover:text-zinc-400">
                          <span
                            className={`text-xl sm:text-2xl font-light leading-none transition-colors ${
                              isScoreboard
                                ? 'text-amber-500/40 group-hover:text-amber-400'
                                : isNeon
                                ? 'text-zinc-500/60 group-hover:text-[#00e5a3]'
                                : 'text-zinc-600'
                            }`}
                          >
                            +
                          </span>
                          <span
                            className={`text-[9px] font-mono tracking-wider uppercase mt-0.5 transition-colors ${
                              isScoreboard
                                ? 'text-amber-500/30 group-hover:text-amber-400/70'
                                : 'text-zinc-600'
                            }`}
                          >
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

      {/* Category Criteria Detail Popup Modal */}
      <CategoryInfoModal
        category={selectedCategory}
        onClose={() => setSelectedCategory(null)}
      />

      {/* Grand Slam 4-Sport Diversity Bonus Explanation Modal */}
      <GrandSlamModal
        isOpen={isGrandSlamOpen}
        onClose={() => setIsGrandSlamOpen(false)}
        sportsUsed={sportsUsed}
        hasGrandSlam={sportsUsed.size >= 4}
      />
    </div>
  );
};
