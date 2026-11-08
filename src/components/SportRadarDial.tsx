'use client';

import React, { useState } from 'react';
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
  const [hoveredSport, setHoveredSport] = useState<Sport | null>(null);

  const isNflUsed = sportsUsed.has('NFL');
  const isNbaUsed = sportsUsed.has('NBA');
  const isMlbUsed = sportsUsed.has('MLB');
  const isNhlUsed = sportsUsed.has('NHL');
  const hasGrandSlam = sportsUsed.size >= 4;

  const isScoreboard = theme === 'SCOREBOARD';
  const isNeon = theme === 'NEON';

  // 60 tick marks around outer circular bezel (radius 120 to 138)
  const ticks = Array.from({ length: 60 }).map((_, i) => {
    const angle = (i * 360) / 60;
    const isMajor = i % 5 === 0;
    const isCardinal = i % 15 === 0;
    const rad = (angle * Math.PI) / 180;
    const r1 = 135;
    const r2 = isCardinal ? 123 : isMajor ? 126 : 128;
    const x1 = 150 + r1 * Math.cos(rad);
    const y1 = 150 + r1 * Math.sin(rad);
    const x2 = 150 + r2 * Math.cos(rad);
    const y2 = 150 + r2 * Math.sin(rad);

    return {
      x1: Number(x1.toFixed(2)),
      y1: Number(y1.toFixed(2)),
      x2: Number(x2.toFixed(2)),
      y2: Number(y2.toFixed(2)),
      isCardinal,
      isMajor,
    };
  });

  return (
    <div
      onClick={onClick}
      title="Grand Slam Radar: 4 Major Sports (NFL, NBA, MLB, NHL) • Click for Bonus details"
      className="relative flex items-center justify-center w-full h-full min-h-[95px] sm:min-h-[105px] p-1 select-none group cursor-pointer"
    >
      {/* Outer Rounded-Square Card Container */}
      <div
        className={`relative w-full max-w-[105px] sm:max-w-[115px] aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 p-1 ${
          hasGrandSlam
            ? 'shadow-[0_0_22px_rgba(245,158,11,0.5)] border border-amber-500/70 bg-[#12151b]'
            : isScoreboard
            ? 'shadow-[0_4px_18px_rgba(0,0,0,0.85)] border border-zinc-800/90 bg-[#12151b] hover:border-amber-500/50'
            : isNeon
            ? 'shadow-[0_4px_18px_rgba(0,0,0,0.85)] border border-zinc-800/90 bg-[#0e141f] hover:border-[#00e5a3]/50'
            : 'border border-zinc-800 bg-zinc-900'
        }`}
      >
        <svg
          viewBox="0 0 300 300"
          className="w-full h-full overflow-visible transition-transform duration-300 group-hover:scale-[1.02]"
        >
          <defs>
            {/* Symmetrical curved text arc paths centered at radius 101 */}
            {/* NFL (Top-Left): Clockwise from 200° to 250° */}
            <path id="arc-nfl" d="M 55.09 115.46 A 101 101 0 0 1 115.46 55.09" fill="none" />
            {/* NBA (Top-Right): Clockwise from 290° to 340° */}
            <path id="arc-nba" d="M 184.54 55.09 A 101 101 0 0 1 244.91 115.46" fill="none" />
            {/* MLB (Bottom-Left): Counter-Clockwise from 160° to 110° */}
            <path id="arc-mlb" d="M 55.09 184.54 A 101 101 0 0 0 115.46 244.91" fill="none" />
            {/* NHL (Bottom-Right): Counter-Clockwise from 70° to 20° */}
            <path id="arc-nhl" d="M 184.54 244.91 A 101 101 0 0 0 244.91 184.54" fill="none" />

            {/* Inset drop shadows and metallic gradients */}
            <radialGradient id="centerHubRecessed" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#222733" />
              <stop offset="65%" stopColor="#14171f" />
              <stop offset="100%" stopColor="#080a0d" />
            </radialGradient>

            <linearGradient id="bezelMetallic" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#252934" />
              <stop offset="50%" stopColor="#13161c" />
              <stop offset="100%" stopColor="#0d0f14" />
            </linearGradient>

            {/* Hover radial glow beams */}
            <radialGradient id="nflHoverGlow" cx="25%" cy="25%" r="70%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#1e40af" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="nbaHoverGlow" cx="75%" cy="25%" r="70%">
              <stop offset="0%" stopColor="#fde047" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#c2410c" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="mlbHoverGlow" cx="25%" cy="75%" r="70%">
              <stop offset="0%" stopColor="#fca5a5" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#991b1b" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="nhlHoverGlow" cx="75%" cy="75%" r="70%">
              <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* ======================================================== */}
          {/* 1. OUTER BEZEL & TICK MARKS                               */}
          {/* ======================================================== */}
          <circle cx="150" cy="150" r="138" fill="url(#bezelMetallic)" stroke="#222630" strokeWidth="2.5" />
          <circle cx="150" cy="150" r="120" fill="none" stroke="#0a0c10" strokeWidth="1.5" />

          {/* Perimeter tick marks */}
          {ticks.map((tick, i) => (
            <line
              key={i}
              x1={tick.x1}
              y1={tick.y1}
              x2={tick.x2}
              y2={tick.y2}
              stroke={
                hasGrandSlam
                  ? '#f59e0b'
                  : tick.isCardinal
                  ? '#cbd5e1'
                  : tick.isMajor
                  ? '#94a3b8'
                  : '#475569'
              }
              strokeWidth={tick.isCardinal ? '2' : tick.isMajor ? '1.4' : '0.9'}
              strokeLinecap="round"
              className={hasGrandSlam ? 'animate-pulse' : ''}
            />
          ))}

          {/* ======================================================== */}
          {/* 2. THE 4 QUADRANT WEDGES (WHEEL DIAL)                     */}
          {/* ======================================================== */}

          {/* -------------------------------------------------------- */}
          {/* TOP-LEFT: NFL                                             */}
          {/* -------------------------------------------------------- */}
          <g
            className="cursor-pointer transition-all duration-200"
            onMouseEnter={() => setHoveredSport('NFL')}
            onMouseLeave={() => setHoveredSport(null)}
            style={{
              filter:
                hoveredSport === 'NFL'
                  ? 'drop-shadow(0 0 16px rgba(59, 130, 246, 0.95)) brightness(1.2)'
                  : isNflUsed
                  ? 'drop-shadow(0 0 8px rgba(37, 99, 235, 0.7))'
                  : 'none',
            }}
          >
            {/* Wedge Background: High Contrast between Used (#1a498b) vs Unused (#0a1322) */}
            <path
              d="M 150 150 L 30 150 A 120 120 0 0 1 150 30 Z"
              fill={
                hoveredSport === 'NFL'
                  ? '#2563eb'
                  : isNflUsed
                  ? '#1a498b'
                  : '#0b1626'
              }
              stroke="#0a0c10"
              strokeWidth="1"
              className="transition-colors duration-200"
            />
            {/* Radiant Hover Beam */}
            {hoveredSport === 'NFL' && (
              <path
                d="M 150 150 L 30 150 A 120 120 0 0 1 150 30 Z"
                fill="url(#nflHoverGlow)"
                pointerEvents="none"
              />
            )}

            {/* NFL Text: Arched along outer perimeter in Varsity font */}
            <text
              fill={isNflUsed || hoveredSport === 'NFL' ? '#FFFFFF' : '#475569'}
              className="font-varsity font-black select-none pointer-events-none transition-colors duration-200"
              style={{
                fontFamily: "'Graduate', 'Bebas Neue', Impact, 'Arial Black', sans-serif",
                fontSize: '25px',
                fontWeight: 900,
                letterSpacing: '0.06em',
                filter:
                  isNflUsed || hoveredSport === 'NFL'
                    ? 'drop-shadow(0 1px 3px rgba(0,0,0,0.9))'
                    : 'none',
              }}
            >
              <textPath href="#arc-nfl" startOffset="50%" textAnchor="middle">
                NFL
              </textPath>
            </text>

            {/* Football Icon: Strictly in Top-Left Quadrant at (105, 105) */}
            <g
              transform={`translate(105, 105) rotate(-38) scale(${hoveredSport === 'NFL' ? 1.14 : 1})`}
              opacity={isNflUsed || hoveredSport === 'NFL' ? 1 : 0.4}
              className="transition-opacity duration-200"
            >
              {/* Ball Body */}
              <ellipse
                cx="0"
                cy="0"
                rx="23"
                ry="13.5"
                fill={isNflUsed || hoveredSport === 'NFL' ? '#7e3f1b' : '#3d2010'}
                stroke="#180b04"
                strokeWidth="2.2"
              />
              {/* Left End White Stripe */}
              <path
                d="M -14 -9.5 Q -11 0 -14 9.5"
                stroke={isNflUsed || hoveredSport === 'NFL' ? '#FFFFFF' : '#94a3b8'}
                strokeWidth="2.8"
                fill="none"
                strokeLinecap="round"
              />
              {/* Right End White Stripe */}
              <path
                d="M 14 -9.5 Q 11 0 14 9.5"
                stroke={isNflUsed || hoveredSport === 'NFL' ? '#FFFFFF' : '#94a3b8'}
                strokeWidth="2.8"
                fill="none"
                strokeLinecap="round"
              />
              {/* Center White Laces */}
              <line
                x1="-8"
                y1="0"
                x2="8"
                y2="0"
                stroke={isNflUsed || hoveredSport === 'NFL' ? '#FFFFFF' : '#94a3b8'}
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <line x1="-6" y1="-3.5" x2="-6" y2="3.5" stroke={isNflUsed || hoveredSport === 'NFL' ? '#FFFFFF' : '#94a3b8'} strokeWidth="1.8" strokeLinecap="round" />
              <line x1="-3" y1="-3.5" x2="-3" y2="3.5" stroke={isNflUsed || hoveredSport === 'NFL' ? '#FFFFFF' : '#94a3b8'} strokeWidth="1.8" strokeLinecap="round" />
              <line x1="0" y1="-3.5" x2="0" y2="3.5" stroke={isNflUsed || hoveredSport === 'NFL' ? '#FFFFFF' : '#94a3b8'} strokeWidth="1.8" strokeLinecap="round" />
              <line x1="3" y1="-3.5" x2="3" y2="3.5" stroke={isNflUsed || hoveredSport === 'NFL' ? '#FFFFFF' : '#94a3b8'} strokeWidth="1.8" strokeLinecap="round" />
              <line x1="6" y1="-3.5" x2="6" y2="3.5" stroke={isNflUsed || hoveredSport === 'NFL' ? '#FFFFFF' : '#94a3b8'} strokeWidth="1.8" strokeLinecap="round" />
            </g>

            {/* Used Status Indicator Dot */}
            {isNflUsed && (
              <circle cx="132" cy="132" r="3.5" fill="#38bdf8" filter="drop-shadow(0 0 4px #38bdf8)" />
            )}
          </g>

          {/* -------------------------------------------------------- */}
          {/* TOP-RIGHT: NBA                                            */}
          {/* -------------------------------------------------------- */}
          <g
            className="cursor-pointer transition-all duration-200"
            onMouseEnter={() => setHoveredSport('NBA')}
            onMouseLeave={() => setHoveredSport(null)}
            style={{
              filter:
                hoveredSport === 'NBA'
                  ? 'drop-shadow(0 0 16px rgba(249, 115, 22, 0.95)) brightness(1.2)'
                  : isNbaUsed
                  ? 'drop-shadow(0 0 8px rgba(234, 88, 12, 0.7))'
                  : 'none',
            }}
          >
            {/* Wedge Background: High Contrast between Used (#e86c1f) vs Unused (#1c0f05) */}
            <path
              d="M 150 150 L 150 30 A 120 120 0 0 1 270 150 Z"
              fill={
                hoveredSport === 'NBA'
                  ? '#f97316'
                  : isNbaUsed
                  ? '#e86c1f'
                  : '#1a1006'
              }
              stroke="#0a0c10"
              strokeWidth="1"
              className="transition-colors duration-200"
            />
            {/* Radiant Hover Beam */}
            {hoveredSport === 'NBA' && (
              <path
                d="M 150 150 L 150 30 A 120 120 0 0 1 270 150 Z"
                fill="url(#nbaHoverGlow)"
                pointerEvents="none"
              />
            )}

            {/* NBA Text: Arched along outer perimeter in Varsity font */}
            <text
              fill={isNbaUsed || hoveredSport === 'NBA' ? '#FFFFFF' : '#475569'}
              className="font-varsity font-black select-none pointer-events-none transition-colors duration-200"
              style={{
                fontFamily: "'Graduate', 'Bebas Neue', Impact, 'Arial Black', sans-serif",
                fontSize: '25px',
                fontWeight: 900,
                letterSpacing: '0.06em',
                filter:
                  isNbaUsed || hoveredSport === 'NBA'
                    ? 'drop-shadow(0 1px 3px rgba(0,0,0,0.9))'
                    : 'none',
              }}
            >
              <textPath href="#arc-nba" startOffset="50%" textAnchor="middle">
                NBA
              </textPath>
            </text>

            {/* Basketball Icon: Strictly in Top-Right Quadrant at (195, 105) */}
            <g
              transform={`translate(195, 105) scale(${hoveredSport === 'NBA' ? 1.14 : 1})`}
              opacity={isNbaUsed || hoveredSport === 'NBA' ? 1 : 0.4}
              className="transition-opacity duration-200"
            >
              {/* Ball Body */}
              <circle
                cx="0"
                cy="0"
                r="18"
                fill={isNbaUsed || hoveredSport === 'NBA' ? '#e86c1f' : '#6b3208'}
                stroke="#120c07"
                strokeWidth="2.2"
              />
              {/* Seam Cross Lines */}
              <line x1="-18" y1="0" x2="18" y2="0" stroke="#120c07" strokeWidth="2" />
              <line x1="0" y1="-18" x2="0" y2="18" stroke="#120c07" strokeWidth="2" />
              {/* Opposing Curved Ribs */}
              <path d="M -9 -15.5 C -3 -7 -3 7 -9 15.5" stroke="#120c07" strokeWidth="1.8" fill="none" />
              <path d="M 9 -15.5 C 3 -7 3 7 9 15.5" stroke="#120c07" strokeWidth="1.8" fill="none" />
            </g>

            {/* Used Status Indicator Dot */}
            {isNbaUsed && (
              <circle cx="168" cy="132" r="3.5" fill="#f59e0b" filter="drop-shadow(0 0 4px #f59e0b)" />
            )}
          </g>

          {/* -------------------------------------------------------- */}
          {/* BOTTOM-LEFT: MLB                                          */}
          {/* -------------------------------------------------------- */}
          <g
            className="cursor-pointer transition-all duration-200"
            onMouseEnter={() => setHoveredSport('MLB')}
            onMouseLeave={() => setHoveredSport(null)}
            style={{
              filter:
                hoveredSport === 'MLB'
                  ? 'drop-shadow(0 0 16px rgba(239, 68, 68, 0.95)) brightness(1.2)'
                  : isMlbUsed
                  ? 'drop-shadow(0 0 8px rgba(220, 38, 38, 0.7))'
                  : 'none',
            }}
          >
            {/* Wedge Background: High Contrast between Used (#c52834) vs Unused (#1a080c) */}
            <path
              d="M 150 150 L 150 270 A 120 120 0 0 1 30 150 Z"
              fill={
                hoveredSport === 'MLB'
                  ? '#dc2626'
                  : isMlbUsed
                  ? '#c52834'
                  : '#1a080c'
              }
              stroke="#0a0c10"
              strokeWidth="1"
              className="transition-colors duration-200"
            />
            {/* Radiant Hover Beam */}
            {hoveredSport === 'MLB' && (
              <path
                d="M 150 150 L 150 270 A 120 120 0 0 1 30 150 Z"
                fill="url(#mlbHoverGlow)"
                pointerEvents="none"
              />
            )}

            {/* MLB Text: Arched along outer perimeter in Varsity font */}
            <text
              fill={isMlbUsed || hoveredSport === 'MLB' ? '#FFFFFF' : '#475569'}
              className="font-varsity font-black select-none pointer-events-none transition-colors duration-200"
              style={{
                fontFamily: "'Graduate', 'Bebas Neue', Impact, 'Arial Black', sans-serif",
                fontSize: '25px',
                fontWeight: 900,
                letterSpacing: '0.06em',
                filter:
                  isMlbUsed || hoveredSport === 'MLB'
                    ? 'drop-shadow(0 1px 3px rgba(0,0,0,0.9))'
                    : 'none',
              }}
            >
              <textPath href="#arc-mlb" startOffset="50%" textAnchor="middle">
                MLB
              </textPath>
            </text>

            {/* Baseball Icon: Strictly in Bottom-Left Quadrant at (105, 195) */}
            <g
              transform={`translate(105, 195) scale(${hoveredSport === 'MLB' ? 1.14 : 1})`}
              opacity={isMlbUsed || hoveredSport === 'MLB' ? 1 : 0.4}
              className="transition-opacity duration-200"
            >
              {/* Ball Body */}
              <circle
                cx="0"
                cy="0"
                r="18"
                fill={isMlbUsed || hoveredSport === 'MLB' ? '#f8fafc' : '#71717a'}
                stroke="#181c22"
                strokeWidth="2.2"
              />
              {/* Red Curved Seams */}
              <path
                d="M -7.5 -16 C -14 -7 -14 7 -7.5 16"
                stroke={isMlbUsed || hoveredSport === 'MLB' ? '#c52834' : '#450a0a'}
                strokeWidth="1.8"
                fill="none"
              />
              <path
                d="M 7.5 -16 C 14 -7 14 7 7.5 16"
                stroke={isMlbUsed || hoveredSport === 'MLB' ? '#c52834' : '#450a0a'}
                strokeWidth="1.8"
                fill="none"
              />
              {/* Chevron Stitches Left */}
              <line x1="-12" y1="-10" x2="-9" y2="-12" stroke={isMlbUsed || hoveredSport === 'MLB' ? '#c52834' : '#450a0a'} strokeWidth="1.3" />
              <line x1="-14" y1="-5" x2="-10" y2="-6.5" stroke={isMlbUsed || hoveredSport === 'MLB' ? '#c52834' : '#450a0a'} strokeWidth="1.3" />
              <line x1="-14.5" y1="0" x2="-10.5" y2="0" stroke={isMlbUsed || hoveredSport === 'MLB' ? '#c52834' : '#450a0a'} strokeWidth="1.3" />
              <line x1="-14" y1="5" x2="-10" y2="6.5" stroke={isMlbUsed || hoveredSport === 'MLB' ? '#c52834' : '#450a0a'} strokeWidth="1.3" />
              <line x1="-12" y1="10" x2="-9" y2="12" stroke={isMlbUsed || hoveredSport === 'MLB' ? '#c52834' : '#450a0a'} strokeWidth="1.3" />
              {/* Chevron Stitches Right */}
              <line x1="12" y1="-10" x2="9" y2="-12" stroke={isMlbUsed || hoveredSport === 'MLB' ? '#c52834' : '#450a0a'} strokeWidth="1.3" />
              <line x1="14" y1="-5" x2="10" y2="-6.5" stroke={isMlbUsed || hoveredSport === 'MLB' ? '#c52834' : '#450a0a'} strokeWidth="1.3" />
              <line x1="14.5" y1="0" x2="10.5" y2="0" stroke={isMlbUsed || hoveredSport === 'MLB' ? '#c52834' : '#450a0a'} strokeWidth="1.3" />
              <line x1="14" y1="5" x2="10" y2="6.5" stroke={isMlbUsed || hoveredSport === 'MLB' ? '#c52834' : '#450a0a'} strokeWidth="1.3" />
              <line x1="12" y1="10" x2="9" y2="12" stroke={isMlbUsed || hoveredSport === 'MLB' ? '#c52834' : '#450a0a'} strokeWidth="1.3" />
            </g>

            {/* Used Status Indicator Dot */}
            {isMlbUsed && (
              <circle cx="132" cy="168" r="3.5" fill="#f43f5e" filter="drop-shadow(0 0 4px #f43f5e)" />
            )}
          </g>

          {/* -------------------------------------------------------- */}
          {/* BOTTOM-RIGHT: NHL                                         */}
          {/* -------------------------------------------------------- */}
          <g
            className="cursor-pointer transition-all duration-200"
            onMouseEnter={() => setHoveredSport('NHL')}
            onMouseLeave={() => setHoveredSport(null)}
            style={{
              filter:
                hoveredSport === 'NHL'
                  ? 'drop-shadow(0 0 16px rgba(56, 189, 248, 0.95)) brightness(1.25)'
                  : isNhlUsed
                  ? 'drop-shadow(0 0 8px rgba(14, 165, 233, 0.7))'
                  : 'none',
            }}
          >
            {/* Wedge Background: High Contrast between Used (#354b5e) vs Unused (#0f1720) */}
            <path
              d="M 150 150 L 270 150 A 120 120 0 0 1 150 270 Z"
              fill={
                hoveredSport === 'NHL'
                  ? '#0284c7'
                  : isNhlUsed
                  ? '#354b5e'
                  : '#0f1720'
              }
              stroke="#0a0c10"
              strokeWidth="1"
              className="transition-colors duration-200"
            />
            {/* Radiant Hover Beam */}
            {hoveredSport === 'NHL' && (
              <path
                d="M 150 150 L 270 150 A 120 120 0 0 1 150 270 Z"
                fill="url(#nhlHoverGlow)"
                pointerEvents="none"
              />
            )}

            {/* NHL Text: Arched along outer perimeter in Varsity font */}
            <text
              fill={isNhlUsed || hoveredSport === 'NHL' ? '#FFFFFF' : '#475569'}
              className="font-varsity font-black select-none pointer-events-none transition-colors duration-200"
              style={{
                fontFamily: "'Graduate', 'Bebas Neue', Impact, 'Arial Black', sans-serif",
                fontSize: '25px',
                fontWeight: 900,
                letterSpacing: '0.06em',
                filter:
                  isNhlUsed || hoveredSport === 'NHL'
                    ? 'drop-shadow(0 1px 3px rgba(0,0,0,0.9))'
                    : 'none',
              }}
            >
              <textPath href="#arc-nhl" startOffset="50%" textAnchor="middle">
                NHL
              </textPath>
            </text>

            {/* Hockey Puck Icon: Strictly in Bottom-Right Quadrant at (195, 195) */}
            <g
              transform={`translate(195, 195) rotate(-28) scale(${hoveredSport === 'NHL' ? 1.14 : 1})`}
              opacity={isNhlUsed || hoveredSport === 'NHL' ? 1 : 0.4}
              className="transition-opacity duration-200"
            >
              {/* Cylindrical Side Wall */}
              <path
                d="M -17 2 L -17 10 C -17 16 17 16 17 10 L 17 2 Z"
                fill={isNhlUsed || hoveredSport === 'NHL' ? '#161b22' : '#0d1014'}
                stroke="#0b0e12"
                strokeWidth="2.2"
              />
              {/* Top Elliptical Surface */}
              <ellipse
                cx="0"
                cy="2"
                rx="17"
                ry="8.5"
                fill={isNhlUsed || hoveredSport === 'NHL' ? '#2c3540' : '#1a1f26'}
                stroke="#0b0e12"
                strokeWidth="2.2"
              />
              {/* Top Surface Highlight */}
              <ellipse cx="-2" cy="0.5" rx="12" ry="5.5" fill="rgba(255,255,255,0.08)" />
            </g>

            {/* Used Status Indicator Dot */}
            {isNhlUsed && (
              <circle cx="168" cy="168" r="3.5" fill="#38bdf8" filter="drop-shadow(0 0 4px #38bdf8)" />
            )}
          </g>

          {/* ======================================================== */}
          {/* 3. SOLID CROSSHAIR DIVIDERS (BETWEEN QUADRANTS)          */}
          {/* ======================================================== */}
          <line x1="28" y1="150" x2="272" y2="150" stroke="#0a0c10" strokeWidth="4.5" />
          <line x1="150" y1="28" x2="150" y2="272" stroke="#0a0c10" strokeWidth="4.5" />

          {/* ======================================================== */}
          {/* 4. MECHANICAL CENTER HUB / APERTURE                      */}
          {/* ======================================================== */}
          {/* Outer Black Beveled Hub Ring */}
          <circle cx="150" cy="150" r="26" fill="#13161c" stroke="#2a303c" strokeWidth="2.8" />
          {/* Middle Metallic Bevel */}
          <circle cx="150" cy="150" r="19" fill="#1e232c" stroke="#0a0c10" strokeWidth="1.5" />
          {/* Recessed Dark Center Dimple */}
          <circle cx="150" cy="150" r="13" fill="url(#centerHubRecessed)" />
          {/* Metallic Inner Highlight Rim */}
          <circle cx="150" cy="150" r="13" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
          {/* Center Button Dot */}
          <circle
            cx="150"
            cy="150"
            r="6"
            fill={hasGrandSlam ? '#f59e0b' : '#0b0d11'}
            className={hasGrandSlam ? 'animate-pulse' : ''}
          />
        </svg>

        {/* Floating Mini Tooltip Badge on Quadrant Hover */}
        {hoveredSport && (
          <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap z-30 pointer-events-none px-2 py-0.5 rounded-md bg-zinc-900/95 border border-zinc-700 text-[10px] font-bold shadow-xl animate-in fade-in duration-150">
            <span
              className={
                hoveredSport === 'NFL'
                  ? 'text-blue-400'
                  : hoveredSport === 'NBA'
                  ? 'text-amber-400'
                  : hoveredSport === 'MLB'
                  ? 'text-rose-400'
                  : 'text-cyan-400'
              }
            >
              {hoveredSport}
            </span>
            <span className="text-zinc-400 ml-1">
              {hoveredSport === 'NFL'
                ? '• Football'
                : hoveredSport === 'NBA'
                ? '• Basketball'
                : hoveredSport === 'MLB'
                ? '• Baseball'
                : '• Hockey'}
            </span>
            <span className="ml-1.5 text-[9px]">
              {sportsUsed.has(hoveredSport) ? (
                <span className="text-emerald-400 font-extrabold">✓ Used</span>
              ) : (
                <span className="text-zinc-500">Unused</span>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
