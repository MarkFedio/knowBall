import React from 'react';
import { Sport } from '@/types';

interface LeagueIconProps {
  sport: Sport;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'circle' | 'badge';
  active?: boolean;
}

export const LeagueIcon: React.FC<LeagueIconProps> = ({
  sport,
  size = 'md',
  variant = 'badge',
  active = false,
}) => {
  // Dimension classes
  const sizeClasses = {
    xs: 'w-3.5 h-3.5 sm:w-4 sm:h-4 text-[7px]',
    sm: 'w-4 h-4 sm:w-6 sm:h-6 text-[8px] sm:text-[9px]',
    md: 'w-6 h-6 sm:w-8 sm:h-8 text-[10px] sm:text-[11px]',
    lg: 'w-8 h-8 sm:w-10 sm:h-10 text-xs',
  }[size];

  // Colors per sport
  const sportConfigs: Record<
    Sport,
    {
      glow: string;
      activeBorder: string;
      inactiveBorder: string;
      activeBg: string;
      inactiveBg: string;
      renderIcon: () => React.ReactNode;
    }
  > = {
    NFL: {
      glow: 'shadow-[0_0_12px_rgba(59,130,246,0.8)]',
      activeBorder: 'border-blue-400',
      inactiveBorder: 'border-blue-900/50',
      activeBg: 'bg-[#0f1d38]',
      inactiveBg: 'bg-[#0a1222]/80',
      renderIcon: () => (
        <svg viewBox="0 0 32 32" className="w-full h-full p-1" fill="none">
          {/* Shield Outline */}
          <path
            d="M16 3L26 6V16C26 22.5 16 29 16 29C16 29 6 22.5 6 16V6L16 3Z"
            fill="#1e3a8a"
            stroke="#60a5fa"
            strokeWidth="1.5"
          />
          {/* Top dark banner with stars */}
          <path d="M6.5 6.5L16 3.8L25.5 6.5V12H6.5V6.5Z" fill="#172554" />
          <circle cx="11" cy="9.5" r="1" fill="#ffffff" />
          <circle cx="16" cy="8.5" r="1" fill="#ffffff" />
          <circle cx="21" cy="9.5" r="1" fill="#ffffff" />
          {/* Football shape */}
          <ellipse
            cx="16"
            cy="19"
            rx="4.5"
            ry="6.5"
            transform="rotate(35 16 19)"
            fill="#991b1b"
            stroke="#ffffff"
            strokeWidth="0.8"
          />
          <line x1="13.5" y1="16.5" x2="18.5" y2="21.5" stroke="#ffffff" strokeWidth="0.8" />
          <text
            x="16"
            y="26"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="5"
            fontWeight="900"
            fontFamily="sans-serif"
          >
            NFL
          </text>
        </svg>
      ),
    },
    NBA: {
      glow: 'shadow-[0_0_14px_rgba(245,158,11,0.9)]',
      activeBorder: 'border-amber-400',
      inactiveBorder: 'border-amber-900/50',
      activeBg: 'bg-[#2a1a08]',
      inactiveBg: 'bg-[#150d04]/80',
      renderIcon: () => (
        <svg viewBox="0 0 32 32" className="w-full h-full p-1" fill="none">
          {/* Rounded vertical pill / split background */}
          <rect x="7" y="4" width="9" height="24" rx="2" fill="#1d4ed8" />
          <rect x="16" y="4" width="9" height="24" rx="2" fill="#dc2626" />
          {/* Jerry West dribbling silhouette */}
          <path
            d="M17.5 7.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-2.8 3.2c-.4.2-.9.5-1.1.9l-1.8 3.5c-.3.6-.1 1.3.5 1.6.6.3 1.3.1 1.6-.5l1.2-2.3v3.8l-2.6 6.5c-.2.6.1 1.3.7 1.5.6.2 1.3-.1 1.5-.7l2.1-5.3 1.9 5.3c.2.6.9.9 1.5.7.6-.2.9-.9.7-1.5l-2.4-6.7v-4.2l1.6 1.8c.4.5 1.2.5 1.7.1.5-.4.5-1.2.1-1.7l-2.5-2.8c-.8-.9-1.9-1.2-2.9-.8z"
            fill="#ffffff"
          />
          {/* Basketball */}
          <circle cx="21.5" cy="19.5" r="2.2" fill="#f59e0b" stroke="#ffffff" strokeWidth="0.6" />
        </svg>
      ),
    },
    MLB: {
      glow: 'shadow-[0_0_14px_rgba(225,29,72,0.9)]',
      activeBorder: 'border-rose-400',
      inactiveBorder: 'border-rose-900/50',
      activeBg: 'bg-[#2a0e14]',
      inactiveBg: 'bg-[#18060a]/80',
      renderIcon: () => (
        <svg viewBox="0 0 32 32" className="w-full h-full p-1" fill="none">
          {/* Horizontal split pill */}
          <rect x="4" y="8" width="12" height="16" rx="2" fill="#1e40af" />
          <rect x="16" y="8" width="12" height="16" rx="2" fill="#dc2626" />
          {/* Batter silhouette */}
          <path
            d="M13 11a1.4 1.4 0 1 0 0-2.8 1.4 1.4 0 0 0 0 2.8zm2.8 2.2l-3.2-1.2c-.6-.2-1.3.1-1.5.7l-1 2.5c-.2.6.1 1.2.7 1.5.6.2 1.2-.1 1.5-.7l.5-1.3 1.2.5-2 6.5c-.2.6.1 1.3.7 1.5.6.2 1.3-.1 1.5-.7l1.7-5.5 1.5 5.5c.2.6.9.9 1.5.7.6-.2.9-.9.7-1.5l-1.9-6.8 1.5-1.2 3.8-3.2c.5-.4.5-1.2.1-1.7-.4-.5-1.2-.5-1.7-.1l-3.9 3.3z"
            fill="#ffffff"
          />
          {/* Baseball */}
          <circle cx="22" cy="13.5" r="2" fill="#ffffff" stroke="#dc2626" strokeWidth="0.5" />
        </svg>
      ),
    },
    NHL: {
      glow: 'shadow-[0_0_14px_rgba(6,182,212,0.9)]',
      activeBorder: 'border-cyan-400',
      inactiveBorder: 'border-cyan-900/50',
      activeBg: 'bg-[#09222c]',
      inactiveBg: 'bg-[#05131a]/80',
      renderIcon: () => (
        <svg viewBox="0 0 32 32" className="w-full h-full p-1" fill="none">
          {/* NHL Classic Shield */}
          <path
            d="M16 4L26 7.5V17.5C26 23 16 28 16 28C16 28 6 23 6 17.5V7.5L16 4Z"
            fill="#09090b"
            stroke="#22d3ee"
            strokeWidth="1.5"
          />
          {/* Diagonal Orange/Silver Stripe */}
          <path d="M7 11L25 18L24 21L6 14L7 11Z" fill="#f97316" />
          {/* NHL text diagonally */}
          <text
            x="16"
            y="17"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="7"
            fontWeight="900"
            fontFamily="sans-serif"
            fontStyle="italic"
            transform="rotate(18 16 16)"
          >
            NHL
          </text>
        </svg>
      ),
    },
  };

  const config = sportConfigs[sport];

  if (variant === 'circle') {
    return (
      <div
        title={`${sport} ${active ? '(Used on board)' : '(Not yet used)'}`}
        className={`flex items-center justify-center rounded-full transition-all duration-300 relative ${sizeClasses} ${
          active
            ? `${config.activeBg} border-2 ${config.activeBorder} ${config.glow} scale-105`
            : `${config.inactiveBg} border ${config.inactiveBorder} opacity-60 hover:opacity-100`
        }`}
      >
        {config.renderIcon()}
      </div>
    );
  }

  // Rectangular badge format (for solved grid cells)
  return (
    <div
      title={sport}
      className={`flex items-center justify-center rounded-lg border transition-all shrink-0 ${sizeClasses} ${
        active
          ? `${config.activeBg} ${config.activeBorder} ${config.glow}`
          : `${config.activeBg} ${config.activeBorder}`
      }`}
    >
      {config.renderIcon()}
    </div>
  );
};
