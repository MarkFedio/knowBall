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
  theme = 'NEON',
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
      className="relative flex items-center justify-center w-full h-full min-h-[64px] sm:min-h-[105px] p-0.5 sm:p-1 select-none group cursor-pointer"
    >
      {/* Outer Rounded-Square Card Container */}
      <div
        className={`relative w-full max-w-[76px] sm:max-w-[115px] aspect-square rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 p-0.5 sm:p-1 ${
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
            {/* Symmetrical curved text arc paths placing text halfway between ball and quadrant edge */}
            {/* NFL (Top-Left): Clockwise along R=89 (baseline at R=89, ascenders outward to R=104) */}
            <path id="arc-nfl" d="M 64.03 126.97 A 89 89 0 0 1 126.97 64.03" fill="none" />
            {/* NBA (Top-Right): Clockwise along R=89 (baseline at R=89, ascenders outward to R=104) */}
            <path id="arc-nba" d="M 173.03 64.03 A 89 89 0 0 1 235.97 126.97" fill="none" />
            {/* MLB (Bottom-Left): Counter-Clockwise along R=104 (baseline at R=104, ascenders inward to R=89) */}
            <path id="arc-mlb" d="M 49.54 176.92 A 104 104 0 0 0 123.08 250.46" fill="none" />
            {/* NHL (Bottom-Right): Counter-Clockwise along R=104 (baseline at R=104, ascenders inward to R=89) */}
            <path id="arc-nhl" d="M 176.92 250.46 A 104 104 0 0 0 250.46 176.92" fill="none" />

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
              <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#1e40af" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="nbaHoverGlow" cx="75%" cy="25%" r="70%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#c2410c" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="mlbHoverGlow" cx="25%" cy="75%" r="70%">
              <stop offset="0%" stopColor="#fca5a5" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#991b1b" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="nhlHoverGlow" cx="75%" cy="75%" r="70%">
              <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.45" />
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
          {/* TOP-LEFT: NFL (DEEP BLUE)                                 */}
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
                  ? 'drop-shadow(0 0 10px rgba(37, 99, 235, 0.8)) brightness(1.08)'
                  : 'none',
            }}
          >
            {/* Wedge Background: High contrast between vibrant Used (#2563eb) and dimmed Unused (#17345d) */}
            <path
              d="M 150 150 L 30 150 A 120 120 0 0 1 150 30 Z"
              fill={
                hoveredSport === 'NFL'
                  ? '#3b82f6'
                  : isNflUsed
                  ? '#2563eb'
                  : '#17345d'
              }
              stroke="#0a0c10"
              strokeWidth="1"
              className="transition-colors duration-200"
            />
            {/* Active Outer Neon Rim when Used */}
            {isNflUsed && (
              <path
                d="M 30 150 A 120 120 0 0 1 150 30"
                fill="none"
                stroke="#60a5fa"
                strokeWidth="4"
                filter="drop-shadow(0 0 8px #3b82f6)"
                pointerEvents="none"
              />
            )}
            {/* Radiant Hover Beam */}
            {hoveredSport === 'NFL' && (
              <path
                d="M 150 150 L 30 150 A 120 120 0 0 1 150 30 Z"
                fill="url(#nflHoverGlow)"
                pointerEvents="none"
              />
            )}

            {/* NFL Text: Always crisp bold white with varsity font */}
            <text
              fill="#FFFFFF"
              className="font-varsity font-black select-none pointer-events-none"
              style={{
                fontFamily: "'Graduate', 'Bebas Neue', Impact, 'Arial Black', sans-serif",
                fontSize: '21px',
                fontWeight: 900,
                letterSpacing: '0.06em',
                filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.9))',
              }}
            >
              <textPath href="#arc-nfl" startOffset="50%" textAnchor="middle">
                NFL
              </textPath>
            </text>

            {/* Football Icon: Strictly in Top-Left Quadrant */}
            <g
              transform={`translate(109, 109) rotate(-38) scale(${hoveredSport === 'NFL' ? 1.14 : 1})`}
              className="transition-transform duration-200"
            >
              {/* Ball Body */}
              <ellipse
                cx="0"
                cy="0"
                rx="23"
                ry="13.5"
                fill="#7e3f1b"
                stroke="#180b04"
                strokeWidth="2.2"
              />
              {/* Left End White Stripe */}
              <path
                d="M -14 -9.5 Q -11 0 -14 9.5"
                stroke="#FFFFFF"
                strokeWidth="2.8"
                fill="none"
                strokeLinecap="round"
              />
              {/* Right End White Stripe */}
              <path
                d="M 14 -9.5 Q 11 0 14 9.5"
                stroke="#FFFFFF"
                strokeWidth="2.8"
                fill="none"
                strokeLinecap="round"
              />
              {/* Center White Laces */}
              <line x1="-8" y1="0" x2="8" y2="0" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="-6" y1="-3.5" x2="-6" y2="3.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="-3" y1="-3.5" x2="-3" y2="3.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="0" y1="-3.5" x2="0" y2="3.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="3" y1="-3.5" x2="3" y2="3.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="6" y1="-3.5" x2="6" y2="3.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
            </g>

            {/* Prominent Glowing Checkmark Badge when Used */}
            {isNflUsed && (
              <g
                transform="translate(126, 126)"
                style={{ filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.95))' }}
                pointerEvents="none"
              >
                <circle cx="0" cy="0" r="9" fill="#10b981" stroke="#34d399" strokeWidth="1.6" />
                <path
                  d="M -3.5 0 L -1 2.5 L 3.5 -2.5"
                  stroke="#FFFFFF"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </g>
            )}
          </g>

          {/* -------------------------------------------------------- */}
          {/* TOP-RIGHT: NBA (VIBRANT BASKETBALL ORANGE)                 */}
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
                  ? 'drop-shadow(0 0 10px rgba(234, 88, 12, 0.8)) brightness(1.08)'
                  : 'none',
            }}
          >
            {/* Wedge Background: High contrast between vibrant Used (#f97316) and dimmed Unused (#78350c) */}
            <path
              d="M 150 150 L 150 30 A 120 120 0 0 1 270 150 Z"
              fill={
                hoveredSport === 'NBA'
                  ? '#fb923c'
                  : isNbaUsed
                  ? '#f97316'
                  : '#78350c'
              }
              stroke="#0a0c10"
              strokeWidth="1"
              className="transition-colors duration-200"
            />
            {/* Active Outer Neon Rim when Used */}
            {isNbaUsed && (
              <path
                d="M 150 30 A 120 120 0 0 1 270 150"
                fill="none"
                stroke="#fde047"
                strokeWidth="4"
                filter="drop-shadow(0 0 8px #f59e0b)"
                pointerEvents="none"
              />
            )}
            {/* Radiant Hover Beam */}
            {hoveredSport === 'NBA' && (
              <path
                d="M 150 150 L 150 30 A 120 120 0 0 1 270 150 Z"
                fill="url(#nbaHoverGlow)"
                pointerEvents="none"
              />
            )}

            {/* NBA Text: Always crisp bold white with varsity font */}
            <text
              fill="#FFFFFF"
              className="font-varsity font-black select-none pointer-events-none"
              style={{
                fontFamily: "'Graduate', 'Bebas Neue', Impact, 'Arial Black', sans-serif",
                fontSize: '21px',
                fontWeight: 900,
                letterSpacing: '0.06em',
                filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.9))',
              }}
            >
              <textPath href="#arc-nba" startOffset="50%" textAnchor="middle">
                NBA
              </textPath>
            </text>

            {/* Basketball Icon: Strictly in Top-Right Quadrant */}
            <g
              transform={`translate(189, 111) scale(${hoveredSport === 'NBA' ? 1.14 : 1})`}
              className="transition-transform duration-200"
            >
              {/* Ball Body */}
              <circle cx="0" cy="0" r="18" fill="#e86c1f" stroke="#120c07" strokeWidth="2.2" />
              {/* Seam Cross Lines */}
              <line x1="-18" y1="0" x2="18" y2="0" stroke="#120c07" strokeWidth="2" />
              <line x1="0" y1="-18" x2="0" y2="18" stroke="#120c07" strokeWidth="2" />
              {/* Opposing Curved Ribs */}
              <path d="M -9 -15.5 C -3 -7 -3 7 -9 15.5" stroke="#120c07" strokeWidth="1.8" fill="none" />
              <path d="M 9 -15.5 C 3 -7 3 7 9 15.5" stroke="#120c07" strokeWidth="1.8" fill="none" />
            </g>

            {/* Prominent Glowing Checkmark Badge when Used */}
            {isNbaUsed && (
              <g
                transform="translate(174, 126)"
                style={{ filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.95))' }}
                pointerEvents="none"
              >
                <circle cx="0" cy="0" r="9" fill="#10b981" stroke="#34d399" strokeWidth="1.6" />
                <path
                  d="M -3.5 0 L -1 2.5 L 3.5 -2.5"
                  stroke="#FFFFFF"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </g>
            )}
          </g>

          {/* -------------------------------------------------------- */}
          {/* BOTTOM-LEFT: MLB (CRIMSON BASEBALL RED)                   */}
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
                  ? 'drop-shadow(0 0 10px rgba(220, 38, 38, 0.8)) brightness(1.08)'
                  : 'none',
            }}
          >
            {/* Wedge Background: High contrast between vibrant Used (#dc2626) and dimmed Unused (#701a26) */}
            <path
              d="M 150 150 L 150 270 A 120 120 0 0 1 30 150 Z"
              fill={
                hoveredSport === 'MLB'
                  ? '#ef4444'
                  : isMlbUsed
                  ? '#dc2626'
                  : '#701a26'
              }
              stroke="#0a0c10"
              strokeWidth="1"
              className="transition-colors duration-200"
            />
            {/* Active Outer Neon Rim when Used */}
            {isMlbUsed && (
              <path
                d="M 30 150 A 120 120 0 0 0 150 270"
                fill="none"
                stroke="#fca5a5"
                strokeWidth="4"
                filter="drop-shadow(0 0 8px #ef4444)"
                pointerEvents="none"
              />
            )}
            {/* Radiant Hover Beam */}
            {hoveredSport === 'MLB' && (
              <path
                d="M 150 150 L 150 270 A 120 120 0 0 1 30 150 Z"
                fill="url(#mlbHoverGlow)"
                pointerEvents="none"
              />
            )}

            {/* MLB Text: Always crisp bold white with varsity font */}
            <text
              fill="#FFFFFF"
              className="font-varsity font-black select-none pointer-events-none"
              style={{
                fontFamily: "'Graduate', 'Bebas Neue', Impact, 'Arial Black', sans-serif",
                fontSize: '21px',
                fontWeight: 900,
                letterSpacing: '0.06em',
                filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.9))',
              }}
            >
              <textPath href="#arc-mlb" startOffset="50%" textAnchor="middle">
                MLB
              </textPath>
            </text>

            {/* Baseball Icon: Strictly in Bottom-Left Quadrant */}
            <g
              transform={`translate(111, 189) scale(${hoveredSport === 'MLB' ? 1.14 : 1})`}
              className="transition-transform duration-200"
            >
              {/* Ball Body: Pure crisp white */}
              <circle cx="0" cy="0" r="18" fill="#f8fafc" stroke="#181c22" strokeWidth="2.2" />
              {/* Red Curved Seams */}
              <path d="M -7.5 -16 C -14 -7 -14 7 -7.5 16" stroke="#c52834" strokeWidth="1.8" fill="none" />
              <path d="M 7.5 -16 C 14 -7 14 7 7.5 16" stroke="#c52834" strokeWidth="1.8" fill="none" />
              {/* Chevron Stitches Left */}
              <line x1="-12" y1="-10" x2="-9" y2="-12" stroke="#c52834" strokeWidth="1.3" />
              <line x1="-14" y1="-5" x2="-10" y2="-6.5" stroke="#c52834" strokeWidth="1.3" />
              <line x1="-14.5" y1="0" x2="-10.5" y2="0" stroke="#c52834" strokeWidth="1.3" />
              <line x1="-14" y1="5" x2="-10" y2="6.5" stroke="#c52834" strokeWidth="1.3" />
              <line x1="-12" y1="10" x2="-9" y2="12" stroke="#c52834" strokeWidth="1.3" />
              {/* Chevron Stitches Right */}
              <line x1="12" y1="-10" x2="9" y2="-12" stroke="#c52834" strokeWidth="1.3" />
              <line x1="14" y1="-5" x2="10" y2="-6.5" stroke="#c52834" strokeWidth="1.3" />
              <line x1="14.5" y1="0" x2="10.5" y2="0" stroke="#c52834" strokeWidth="1.3" />
              <line x1="14" y1="5" x2="10" y2="6.5" stroke="#c52834" strokeWidth="1.3" />
              <line x1="12" y1="10" x2="9" y2="12" stroke="#c52834" strokeWidth="1.3" />
            </g>

            {/* Prominent Glowing Checkmark Badge when Used */}
            {isMlbUsed && (
              <g
                transform="translate(126, 174)"
                style={{ filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.95))' }}
                pointerEvents="none"
              >
                <circle cx="0" cy="0" r="9" fill="#10b981" stroke="#34d399" strokeWidth="1.6" />
                <path
                  d="M -3.5 0 L -1 2.5 L 3.5 -2.5"
                  stroke="#FFFFFF"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </g>
            )}
          </g>

          {/* -------------------------------------------------------- */}
          {/* BOTTOM-RIGHT: NHL (STEEL SLATE BLUE-GRAY)                 */}
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
                  ? 'drop-shadow(0 0 10px rgba(14, 165, 233, 0.8)) brightness(1.08)'
                  : 'none',
            }}
          >
            {/* Wedge Background: High contrast between vibrant Used (#0284c7) and dimmed Unused (#243340) */}
            <path
              d="M 150 150 L 270 150 A 120 120 0 0 1 150 270 Z"
              fill={
                hoveredSport === 'NHL'
                  ? '#38bdf8'
                  : isNhlUsed
                  ? '#0284c7'
                  : '#243340'
              }
              stroke="#0a0c10"
              strokeWidth="1"
              className="transition-colors duration-200"
            />
            {/* Active Outer Neon Rim when Used */}
            {isNhlUsed && (
              <path
                d="M 150 270 A 120 120 0 0 0 270 150"
                fill="none"
                stroke="#7dd3fc"
                strokeWidth="4"
                filter="drop-shadow(0 0 8px #0ea5e9)"
                pointerEvents="none"
              />
            )}
            {/* Radiant Hover Beam */}
            {hoveredSport === 'NHL' && (
              <path
                d="M 150 150 L 270 150 A 120 120 0 0 1 150 270 Z"
                fill="url(#nhlHoverGlow)"
                pointerEvents="none"
              />
            )}

            {/* NHL Text: Always crisp bold white with varsity font */}
            <text
              fill="#FFFFFF"
              className="font-varsity font-black select-none pointer-events-none"
              style={{
                fontFamily: "'Graduate', 'Bebas Neue', Impact, 'Arial Black', sans-serif",
                fontSize: '21px',
                fontWeight: 900,
                letterSpacing: '0.06em',
                filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.9))',
              }}
            >
              <textPath href="#arc-nhl" startOffset="50%" textAnchor="middle">
                NHL
              </textPath>
            </text>

            {/* Hockey Puck Icon: Strictly in Bottom-Right Quadrant */}
            <g
              transform={`translate(187, 187) rotate(-28) scale(${hoveredSport === 'NHL' ? 1.14 : 1})`}
              className="transition-transform duration-200"
            >
              {/* Cylindrical Side Wall */}
              <path
                d="M -17 2 L -17 10 C -17 16 17 16 17 10 L 17 2 Z"
                fill="#161b22"
                stroke="#0b0e12"
                strokeWidth="2.2"
              />
              {/* Top Elliptical Surface */}
              <ellipse
                cx="0"
                cy="2"
                rx="17"
                ry="8.5"
                fill="#2c3540"
                stroke="#0b0e12"
                strokeWidth="2.2"
              />
              {/* Top Surface Highlight */}
              <ellipse cx="-2" cy="0.5" rx="12" ry="5.5" fill="rgba(255,255,255,0.08)" />
            </g>

            {/* Prominent Glowing Checkmark Badge when Used */}
            {isNhlUsed && (
              <g
                transform="translate(174, 174)"
                style={{ filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.95))' }}
                pointerEvents="none"
              >
                <circle cx="0" cy="0" r="9" fill="#10b981" stroke="#34d399" strokeWidth="1.6" />
                <path
                  d="M -3.5 0 L -1 2.5 L 3.5 -2.5"
                  stroke="#FFFFFF"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </g>
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
