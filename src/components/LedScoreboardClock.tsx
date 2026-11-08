'use client';

import React from 'react';
import { VisualTheme } from '@/types';

interface LedScoreboardClockProps {
  timeStr?: string; // Format "HH:MM:SS"
  theme?: VisualTheme;
}

// 7-segment encoding: [a(top), b(top-right), c(bottom-right), d(bottom), e(bottom-left), f(top-left), g(middle)]
const SEGMENT_MAP: Record<string, boolean[]> = {
  '0': [true, true, true, true, true, true, false],
  '1': [false, true, true, false, false, false, false],
  '2': [true, true, false, true, true, false, true],
  '3': [true, true, true, true, false, false, true],
  '4': [false, true, true, false, false, true, true],
  '5': [true, false, true, true, false, true, true],
  '6': [true, false, true, true, true, true, true],
  '7': [true, true, true, false, false, false, false],
  '8': [true, true, true, true, true, true, true],
  '9': [true, true, true, true, false, true, true],
};

const LedDigit: React.FC<{ char: string; theme?: VisualTheme }> = ({ char, theme = 'NEON' }) => {
  const segments = SEGMENT_MAP[char] || [false, false, false, false, false, false, false];

  const litColor = theme === 'SCOREBOARD' ? '#fbbf24' : theme === 'NEON' ? '#67e8f9' : '#e4e4e7';
  const unlitColor = theme === 'SCOREBOARD' ? '#221506' : theme === 'NEON' ? '#101c2a' : '#18181b';
  const glowFilter =
    theme === 'SCOREBOARD'
      ? 'drop-shadow(0 0 3px #f59e0b)'
      : theme === 'NEON'
      ? 'drop-shadow(0 0 2px #22d3ee)'
      : undefined;

  return (
    <svg viewBox="0 0 20 32" className="w-3.5 h-6 sm:w-4 sm:h-7" fill="none">
      {/* a: Top */}
      <polygon
        points="3,3 17,3 15,5 5,5"
        fill={segments[0] ? litColor : unlitColor}
        style={segments[0] && glowFilter ? { filter: glowFilter } : undefined}
      />
      {/* b: Top-Right */}
      <polygon
        points="17,3 17,15 15,14 15,5"
        fill={segments[1] ? litColor : unlitColor}
        style={segments[1] && glowFilter ? { filter: glowFilter } : undefined}
      />
      {/* c: Bottom-Right */}
      <polygon
        points="17,17 17,29 15,27 15,18"
        fill={segments[2] ? litColor : unlitColor}
        style={segments[2] && glowFilter ? { filter: glowFilter } : undefined}
      />
      {/* d: Bottom */}
      <polygon
        points="3,29 17,29 15,27 5,27"
        fill={segments[3] ? litColor : unlitColor}
        style={segments[3] && glowFilter ? { filter: glowFilter } : undefined}
      />
      {/* e: Bottom-Left */}
      <polygon
        points="3,17 3,29 5,27 5,18"
        fill={segments[4] ? litColor : unlitColor}
        style={segments[4] && glowFilter ? { filter: glowFilter } : undefined}
      />
      {/* f: Top-Left */}
      <polygon
        points="3,3 3,15 5,14 5,5"
        fill={segments[5] ? litColor : unlitColor}
        style={segments[5] && glowFilter ? { filter: glowFilter } : undefined}
      />
      {/* g: Middle */}
      <polygon
        points="4,16 6,15 14,15 16,16 14,17 6,17"
        fill={segments[6] ? litColor : unlitColor}
        style={segments[6] && glowFilter ? { filter: glowFilter } : undefined}
      />
    </svg>
  );
};

const LedColon: React.FC<{ theme?: VisualTheme }> = ({ theme = 'NEON' }) => {
  const litColor = theme === 'SCOREBOARD' ? '#fbbf24' : theme === 'NEON' ? '#67e8f9' : '#e4e4e7';
  const glowFilter =
    theme === 'SCOREBOARD'
      ? 'drop-shadow(0 0 3px #f59e0b)'
      : theme === 'NEON'
      ? 'drop-shadow(0 0 2px #22d3ee)'
      : undefined;

  return (
    <svg viewBox="0 0 8 32" className="w-1.5 h-6 sm:w-2 sm:h-7" fill="none">
      <circle cx="4" cy="10" r="1.5" fill={litColor} style={glowFilter ? { filter: glowFilter } : undefined} />
      <circle cx="4" cy="22" r="1.5" fill={litColor} style={glowFilter ? { filter: glowFilter } : undefined} />
    </svg>
  );
};

export const LedScoreboardClock: React.FC<LedScoreboardClockProps> = ({
  timeStr = '00:00:10',
  theme = 'NEON',
}) => {
  return (
    <div
      title="Daily KnowBall Countdown Clock"
      className={`rounded-xl px-2.5 py-1 sm:px-3 sm:py-1.5 flex items-center justify-center gap-0.5 sm:gap-1 select-none ${
        theme === 'NEON'
          ? 'bg-[#091524] border border-cyan-500/40 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
          : 'scoreboard-bezel shadow-inner'
      }`}
    >
      {timeStr.split('').map((char, index) => {
        if (char === ':') {
          return <LedColon key={`colon-${index}`} theme={theme} />;
        }
        return <LedDigit key={`digit-${index}`} char={char} theme={theme} />;
      })}
    </div>
  );
};
