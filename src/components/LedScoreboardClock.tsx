'use client';

import React from 'react';

interface LedScoreboardClockProps {
  timeStr?: string; // Format "HH:MM:SS"
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

const LedDigit: React.FC<{ char: string }> = ({ char }) => {
  const segments = SEGMENT_MAP[char] || [false, false, false, false, false, false, false];

  return (
    <svg viewBox="0 0 20 32" className="w-3.5 h-6 sm:w-4 sm:h-7" fill="none">
      {/* a: Top */}
      <polygon
        points="3,3 17,3 15,5 5,5"
        fill={segments[0] ? '#67e8f9' : '#101c2a'}
        filter={segments[0] ? 'drop-shadow(0 0 2px #22d3ee)' : undefined}
      />
      {/* b: Top-Right */}
      <polygon
        points="17,3 17,15 15,14 15,5"
        fill={segments[1] ? '#67e8f9' : '#101c2a'}
        filter={segments[1] ? 'drop-shadow(0 0 2px #22d3ee)' : undefined}
      />
      {/* c: Bottom-Right */}
      <polygon
        points="17,17 17,29 15,27 15,18"
        fill={segments[2] ? '#67e8f9' : '#101c2a'}
        filter={segments[2] ? 'drop-shadow(0 0 2px #22d3ee)' : undefined}
      />
      {/* d: Bottom */}
      <polygon
        points="3,29 17,29 15,27 5,27"
        fill={segments[3] ? '#67e8f9' : '#101c2a'}
        filter={segments[3] ? 'drop-shadow(0 0 2px #22d3ee)' : undefined}
      />
      {/* e: Bottom-Left */}
      <polygon
        points="3,17 3,29 5,27 5,18"
        fill={segments[4] ? '#67e8f9' : '#101c2a'}
        filter={segments[4] ? 'drop-shadow(0 0 2px #22d3ee)' : undefined}
      />
      {/* f: Top-Left */}
      <polygon
        points="3,3 3,15 5,14 5,5"
        fill={segments[5] ? '#67e8f9' : '#101c2a'}
        filter={segments[5] ? 'drop-shadow(0 0 2px #22d3ee)' : undefined}
      />
      {/* g: Middle */}
      <polygon
        points="4,16 6,15 14,15 16,16 14,17 6,17"
        fill={segments[6] ? '#67e8f9' : '#101c2a'}
        filter={segments[6] ? 'drop-shadow(0 0 2px #22d3ee)' : undefined}
      />
    </svg>
  );
};

const LedColon: React.FC = () => (
  <svg viewBox="0 0 8 32" className="w-1.5 h-6 sm:w-2 sm:h-7" fill="none">
    <circle cx="4" cy="10" r="1.5" fill="#67e8f9" filter="drop-shadow(0 0 2px #22d3ee)" />
    <circle cx="4" cy="22" r="1.5" fill="#67e8f9" filter="drop-shadow(0 0 2px #22d3ee)" />
  </svg>
);

export const LedScoreboardClock: React.FC<LedScoreboardClockProps> = ({
  timeStr = '00:00:10',
}) => {
  return (
    <div
      title="Daily SportsGrid Countdown Clock"
      className="scoreboard-bezel rounded-xl px-2.5 py-1 sm:px-3 sm:py-1.5 flex items-center justify-center gap-0.5 sm:gap-1 shadow-inner select-none"
    >
      {timeStr.split('').map((char, index) => {
        if (char === ':') {
          return <LedColon key={`colon-${index}`} />;
        }
        return <LedDigit key={`digit-${index}`} char={char} />;
      })}
    </div>
  );
};
