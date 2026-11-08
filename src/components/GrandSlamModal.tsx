'use client';

import React, { useEffect } from 'react';
import { X, Sparkles, CheckCircle2, CircleDashed } from 'lucide-react';
import { Sport } from '@/types';
import { LeagueIcon } from './LeagueIcon';

interface GrandSlamModalProps {
  isOpen: boolean;
  onClose: () => void;
  sportsUsed: Set<Sport>;
  hasGrandSlam: boolean;
}

const ALL_SPORTS: { sport: Sport; name: string; icon: string }[] = [
  { sport: 'NFL', name: 'National Football League', icon: '🏈' },
  { sport: 'NBA', name: 'National Basketball Association', icon: '🏀' },
  { sport: 'MLB', name: 'Major League Baseball', icon: '⚾' },
  { sport: 'NHL', name: 'National Hockey League', icon: '🏒' },
];

export const GrandSlamModal: React.FC<GrandSlamModalProps> = ({
  isOpen,
  onClose,
  sportsUsed,
  hasGrandSlam,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-md flex-col rounded-2xl border border-amber-500/50 bg-[#091524]/95 p-5 sm:p-6 shadow-[0_0_40px_rgba(245,158,11,0.25)] backdrop-blur-md overflow-hidden animate-in zoom-in-95 duration-150 text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glowing Top Amber Neon Rim */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3.5 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
          title="Close (Esc)"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 pb-4 border-b border-zinc-800/80">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#1e1708] border border-amber-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
          </div>
          <div className="pr-6">
            <span className="text-[10px] font-black tracking-widest uppercase text-amber-400">
              SPECIAL ALL-SPORT BONUS
            </span>
            <h2 className="text-xl font-black text-white leading-tight flex items-center gap-2">
              GRAND SLAM
              {hasGrandSlam && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                  ACTIVE
                </span>
              )}
            </h2>
            <p className="text-xs text-zinc-300 mt-0.5">
              Represent all 4 major leagues to earn a 25% Rarity Score discount
            </p>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1 scrollbar-thin text-zinc-200">
          {/* 1. How It Works */}
          <div className="rounded-xl border border-amber-500/30 bg-[#161208]/80 p-3.5 shadow-sm space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 text-amber-300 font-black uppercase text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              How It Works
            </div>
            <p className="text-zinc-200 leading-relaxed">
              Correctly guess at least one athlete from each of the four major North American sports
              leagues (<strong>NFL</strong>, <strong>NBA</strong>, <strong>MLB</strong>, and{' '}
              <strong>NHL</strong>) anywhere on your completed 4×4 grid.
            </p>
          </div>

          {/* 2. The Reward */}
          <div className="rounded-xl border border-emerald-500/30 bg-[#071c14]/80 p-3.5 shadow-sm space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-300 font-black uppercase text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              The Reward: -25% Rarity Discount
            </div>
            <p className="text-zinc-200 leading-relaxed">
              When achieved, your entire final Rarity Score is multiplied by{' '}
              <strong className="text-emerald-300">0.75</strong> (a 25% reduction). In SportsGrid, a
              lower rarity score means rarer guesses and a higher leaderboard ranking!
            </p>
          </div>

          {/* 3. Live 4-Sport Progress Checklist */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-zinc-300">
              <span>Your Progress</span>
              <span className="font-mono text-amber-400">
                {sportsUsed.size}/4 Leagues Represented
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {ALL_SPORTS.map(({ sport, name, icon }) => {
                const isUsed = sportsUsed.has(sport);
                return (
                  <div
                    key={sport}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      isUsed
                        ? 'bg-[#0c1f15] border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                        : 'bg-zinc-900/80 border-zinc-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <LeagueIcon sport={sport} size="sm" variant="circle" active={isUsed} />
                      <div className="flex flex-col">
                        <span className="font-black text-xs text-white">{sport}</span>
                        <span className="text-[10px] text-zinc-400">
                          {isUsed ? 'Represented' : 'Pending'}
                        </span>
                      </div>
                    </div>
                    {isUsed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <CircleDashed className="w-4 h-4 text-zinc-500" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Dismiss Button */}
        <div className="pt-3 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-black text-xs uppercase tracking-wider hover:opacity-95 shadow-[0_0_15px_rgba(245,158,11,0.4)] transition active:scale-[0.98]"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
