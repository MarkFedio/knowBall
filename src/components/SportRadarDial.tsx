'use client';

import React from 'react';
import { Sport } from '@/types';

interface SportRadarDialProps {
  sportsUsed?: Set<Sport>;
  onClick?: () => void;
}

export const SportRadarDial: React.FC<SportRadarDialProps> = ({
  sportsUsed = new Set<Sport>(),
  onClick,
}) => {
  const isNflUsed = sportsUsed.has('NFL');
  const isNbaUsed = sportsUsed.has('NBA');
  const isMlbUsed = sportsUsed.has('MLB');
  const isNhlUsed = sportsUsed.has('NHL');

  return (
    <div
      onClick={onClick}
      title="All-Sports Radar: 4 Leagues (NFL, NBA, MLB, NHL)"
      className="relative flex items-center justify-center w-full h-full min-h-[105px] p-2 select-none group cursor-default"
    >
      {/* Outer Dial Container */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 border-2 border-[#00e5a3]/70 shadow-[0_0_15px_rgba(0,229,163,0.3)] bg-[#07131e]/90 flex items-center justify-center transition-all duration-300 group-hover:border-[#00f5b8] group-hover:shadow-[0_0_20px_rgba(0,245,184,0.45)]">
        {/* Radar Compass Circular SVG with Ticks & Dividers */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
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
                stroke={isCardinal ? '#00e5a3' : 'rgba(0, 229, 163, 0.4)'}
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
            stroke="rgba(0, 229, 163, 0.35)"
            strokeWidth="1"
          />

          {/* Crosshairs */}
          <line
            x1="50"
            y1="12"
            x2="50"
            y2="88"
            stroke="#00e5a3"
            strokeWidth="1.2"
            strokeDasharray="2 1"
          />
          <line
            x1="12"
            y1="50"
            x2="88"
            y2="50"
            stroke="#00e5a3"
            strokeWidth="1.2"
            strokeDasharray="2 1"
          />
        </svg>

        {/* 4 Quadrants Grid */}
        <div className="relative w-[70px] h-[70px] sm:w-[78px] sm:h-[78px] rounded-full overflow-hidden grid grid-cols-2 grid-rows-2">
          {/* Top-Left Quadrant: NFL */}
          <div
            className={`flex flex-col items-center justify-center transition-colors duration-300 border-r border-b border-[#00e5a3]/40 ${
              isNflUsed
                ? 'bg-[#1e3a8a] text-blue-100 shadow-[inset_0_0_8px_rgba(59,130,246,0.6)]'
                : 'bg-[#102038] text-blue-300/80 hover:bg-[#162a4d]'
            }`}
          >
            {/* Mini NFL Shield */}
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 mb-0.5" fill="none">
              <path
                d="M12 2L19 4.5V12C19 17 12 22 12 22C12 22 5 17 5 12V4.5L12 2Z"
                fill="#1e3a8a"
                stroke="#60a5fa"
                strokeWidth="1.2"
              />
              <ellipse
                cx="12"
                cy="14"
                rx="3.5"
                ry="5"
                transform="rotate(30 12 14)"
                fill="#991b1b"
              />
            </svg>
            <span className="text-[9px] sm:text-[10px] font-black tracking-tight leading-none text-white drop-shadow">
              NFL
            </span>
          </div>

          {/* Top-Right Quadrant: NBA */}
          <div
            className={`flex flex-col items-center justify-center transition-colors duration-300 border-b border-[#00e5a3]/40 ${
              isNbaUsed
                ? 'bg-[#b45309] text-amber-100 shadow-[inset_0_0_8px_rgba(245,158,11,0.6)]'
                : 'bg-[#311f07] text-amber-300/80 hover:bg-[#3f2709]'
            }`}
          >
            {/* Mini Basketball */}
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 mb-0.5" fill="none">
              <circle cx="12" cy="12" r="9" fill="#d97706" stroke="#fbbf24" strokeWidth="1" />
              <path d="M12 3V21M3 12H21M5 5C9 8 9 16 5 19M19 5C15 8 15 16 19 19" stroke="#78350f" strokeWidth="0.8" />
            </svg>
            <span className="text-[9px] sm:text-[10px] font-black tracking-tight leading-none text-white drop-shadow">
              NBA
            </span>
          </div>

          {/* Bottom-Left Quadrant: MLB */}
          <div
            className={`flex flex-col items-center justify-center transition-colors duration-300 border-r border-[#00e5a3]/40 ${
              isMlbUsed
                ? 'bg-[#9f1239] text-rose-100 shadow-[inset_0_0_8px_rgba(225,29,72,0.6)]'
                : 'bg-[#310b14] text-rose-300/80 hover:bg-[#3f0f1b]'
            }`}
          >
            {/* Mini Baseball */}
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 mb-0.5" fill="none">
              <circle cx="12" cy="12" r="9" fill="#f8fafc" stroke="#dc2626" strokeWidth="1" />
              <path d="M7 5C9 9 9 15 7 19M17 5C15 9 15 15 17 19" stroke="#dc2626" strokeWidth="0.9" strokeDasharray="1 1" />
            </svg>
            <span className="text-[9px] sm:text-[10px] font-black tracking-tight leading-none text-white drop-shadow">
              MLB
            </span>
          </div>

          {/* Bottom-Right Quadrant: NHL */}
          <div
            className={`flex flex-col items-center justify-center transition-colors duration-300 ${
              isNhlUsed
                ? 'bg-[#0e7490] text-cyan-100 shadow-[inset_0_0_8px_rgba(6,182,212,0.6)]'
                : 'bg-[#06242f] text-cyan-300/80 hover:bg-[#09303e]'
            }`}
          >
            {/* Mini Puck / NHL */}
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 mb-0.5" fill="none">
              <path
                d="M12 2L19 4.5V12C19 17 12 22 12 22C12 22 5 17 5 12V4.5L12 2Z"
                fill="#09090b"
                stroke="#22d3ee"
                strokeWidth="1.2"
              />
              <path d="M6 10L18 15L17 17L5 12L6 10Z" fill="#f97316" />
            </svg>
            <span className="text-[9px] sm:text-[10px] font-black tracking-tight leading-none text-white drop-shadow">
              NHL
            </span>
          </div>
        </div>

        {/* Center Crosshair Dot */}
        <div className="absolute w-2 h-2 rounded-full bg-[#00f5b8] shadow-[0_0_6px_#00f5b8] pointer-events-none" />
      </div>
    </div>
  );
};
