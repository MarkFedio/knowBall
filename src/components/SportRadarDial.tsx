'use client';

import React from 'react';
import { Sport, VisualTheme } from '@/types';

interface SportRadarDialProps {
  sportsUsed?: Set<Sport>;
  theme?: VisualTheme;
  onClick?: () => void;
}

export const SportRadarDial: React.FC<SportRadarDialProps> = ({
  sportsUsed = new Set<Sport>(),
  theme = 'SCOREBOARD',
  onClick,
}) => {
  const isNflUsed = sportsUsed.has('NFL');
  const isNbaUsed = sportsUsed.has('NBA');
  const isMlbUsed = sportsUsed.has('MLB');
  const isNhlUsed = sportsUsed.has('NHL');

  const isScoreboard = theme === 'SCOREBOARD';
  const isNeon = theme === 'NEON';

  const ringBorder = isScoreboard
    ? 'border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.25)] bg-[#0d1017]'
    : isNeon
    ? 'border-[#00e5a3]/70 shadow-[0_0_15px_rgba(0,229,163,0.3)] bg-[#07131e]/90'
    : 'border-zinc-700 bg-zinc-900';

  const tickColor = isScoreboard ? '#f59e0b' : isNeon ? '#00e5a3' : '#71717a';
  const tickFaint = isScoreboard ? 'rgba(245, 158, 11, 0.35)' : isNeon ? 'rgba(0, 229, 163, 0.4)' : '#3f3f46';
  const dividerBorder = isScoreboard ? 'border-amber-500/30' : isNeon ? 'border-[#00e5a3]/40' : 'border-zinc-800';

  return (
    <div
      onClick={onClick}
      title="Grand Slam Radar: 4 Major Sports (NFL, NBA, MLB, NHL)"
      className="relative flex items-center justify-center w-full h-full min-h-[95px] sm:min-h-[105px] p-2 select-none group cursor-default"
    >
      {/* Outer Dial Container */}
      <div
        className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 border-2 transition-all duration-300 flex items-center justify-center ${ringBorder}`}
      >
        {/* Radar Compass Circular SVG with Ticks & Dividers */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Compass Tick Marks around perimeter */}
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i * 360) / 24;
            const isCardinal = i % 6 === 0;
            const r1 = 46;
            const r2 = isCardinal ? 39 : 42;
            const rad = (angle * Math.PI) / 180;
            const x1 = 50 + r1 * Math.cos(rad);
            const y1 = 50 + r1 * Math.sin(rad);
            const x2 = 50 + r2 * Math.cos(rad);
            const y2 = 50 + r2 * Math.sin(rad);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isCardinal ? tickColor : tickFaint}
                strokeWidth={isCardinal ? '1.8' : '0.9'}
              />
            );
          })}

          {/* Inner ring guideline */}
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            stroke={tickFaint}
            strokeWidth="1"
          />

          {/* Crosshairs */}
          <line
            x1="50"
            y1="12"
            x2="50"
            y2="88"
            stroke={tickColor}
            strokeWidth="1.2"
            strokeDasharray="2 1"
          />
          <line
            x1="12"
            y1="50"
            x2="88"
            y2="50"
            stroke={tickColor}
            strokeWidth="1.2"
            strokeDasharray="2 1"
          />
        </svg>

        {/* 4 Quadrants Grid */}
        <div className="relative w-[70px] h-[70px] sm:w-[78px] sm:h-[78px] rounded-full overflow-hidden grid grid-cols-2 grid-rows-2">
          {/* Top-Left Quadrant: NFL */}
          <div
            className={`flex flex-col items-center justify-center transition-colors duration-300 border-r border-b ${dividerBorder} ${
              isNflUsed
                ? 'bg-[#1e3a8a] text-blue-100 shadow-[inset_0_0_8px_rgba(59,130,246,0.7)]'
                : 'bg-[#101928] text-blue-300/60 hover:bg-[#162a4d]'
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 mb-0.5" fill="none">
              <path
                d="M12 2L19 4.5V12C19 17 12 22 12 22C12 22 5 17 5 12V4.5L12 2Z"
                fill={isNflUsed ? '#2563eb' : '#1e293b'}
                stroke={isNflUsed ? '#93c5fd' : '#475569'}
                strokeWidth="1.2"
              />
              <ellipse
                cx="12"
                cy="14"
                rx="3.5"
                ry="5"
                transform="rotate(30 12 14)"
                fill={isNflUsed ? '#991b1b' : '#334155'}
              />
            </svg>
            <span
              className={`text-[9px] sm:text-[10px] font-black tracking-tight leading-none drop-shadow ${
                isNflUsed ? 'text-white' : 'text-zinc-500'
              }`}
            >
              NFL
            </span>
          </div>

          {/* Top-Right Quadrant: NBA */}
          <div
            className={`flex flex-col items-center justify-center transition-colors duration-300 border-b ${dividerBorder} ${
              isNbaUsed
                ? 'bg-[#b45309] text-amber-100 shadow-[inset_0_0_8px_rgba(245,158,11,0.7)]'
                : 'bg-[#221606] text-amber-300/60 hover:bg-[#311f07]'
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 mb-0.5" fill="none">
              <circle
                cx="12"
                cy="12"
                r="9"
                fill={isNbaUsed ? '#d97706' : '#27272a'}
                stroke={isNbaUsed ? '#fbbf24' : '#52525b'}
                strokeWidth="1"
              />
              <path
                d="M12 3V21M3 12H21M5 5C9 8 9 16 5 19M19 5C15 8 15 16 19 19"
                stroke={isNbaUsed ? '#78350f' : '#18181b'}
                strokeWidth="0.8"
              />
            </svg>
            <span
              className={`text-[9px] sm:text-[10px] font-black tracking-tight leading-none drop-shadow ${
                isNbaUsed ? 'text-white' : 'text-zinc-500'
              }`}
            >
              NBA
            </span>
          </div>

          {/* Bottom-Left Quadrant: MLB */}
          <div
            className={`flex flex-col items-center justify-center transition-colors duration-300 border-r ${dividerBorder} ${
              isMlbUsed
                ? 'bg-[#9f1239] text-rose-100 shadow-[inset_0_0_8px_rgba(225,29,72,0.7)]'
                : 'bg-[#250910] text-rose-300/60 hover:bg-[#340b15]'
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 mb-0.5" fill="none">
              <circle
                cx="12"
                cy="12"
                r="9"
                fill={isMlbUsed ? '#f8fafc' : '#27272a'}
                stroke={isMlbUsed ? '#dc2626' : '#52525b'}
                strokeWidth="1"
              />
              <path
                d="M7 5C9 9 9 15 7 19M17 5C15 9 15 15 17 19"
                stroke={isMlbUsed ? '#dc2626' : '#3f3f46'}
                strokeWidth="0.9"
                strokeDasharray="1 1"
              />
            </svg>
            <span
              className={`text-[9px] sm:text-[10px] font-black tracking-tight leading-none drop-shadow ${
                isMlbUsed ? 'text-white' : 'text-zinc-500'
              }`}
            >
              MLB
            </span>
          </div>

          {/* Bottom-Right Quadrant: NHL */}
          <div
            className={`flex flex-col items-center justify-center transition-colors duration-300 ${
              isNhlUsed
                ? 'bg-[#0e7490] text-cyan-100 shadow-[inset_0_0_8px_rgba(6,182,212,0.7)]'
                : 'bg-[#081a24] text-cyan-300/60 hover:bg-[#0c2738]'
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 mb-0.5" fill="none">
              <path
                d="M12 2L19 4.5V12C19 17 12 22 12 22C12 22 5 17 5 12V4.5L12 2Z"
                fill={isNhlUsed ? '#09090b' : '#1e293b'}
                stroke={isNhlUsed ? '#22d3ee' : '#475569'}
                strokeWidth="1.2"
              />
              <path d="M6 10L18 15L17 17L5 12L6 10Z" fill={isNhlUsed ? '#f97316' : '#475569'} />
            </svg>
            <span
              className={`text-[9px] sm:text-[10px] font-black tracking-tight leading-none drop-shadow ${
                isNhlUsed ? 'text-white' : 'text-zinc-500'
              }`}
            >
              NHL
            </span>
          </div>
        </div>

        {/* Center Crosshair Dot */}
        <div
          className={`absolute w-2 h-2 rounded-full pointer-events-none ${
            isScoreboard
              ? 'bg-amber-400 shadow-[0_0_6px_#f59e0b]'
              : isNeon
              ? 'bg-[#00f5b8] shadow-[0_0_6px_#00f5b8]'
              : 'bg-zinc-400'
          }`}
        />
      </div>
    </div>
  );
};
