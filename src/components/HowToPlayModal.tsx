'use client';

import React from 'react';
import { X, Trophy, Flame, HelpCircle, Layers, Sparkles } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-2 sm:p-4 backdrop-blur-sm">
      <div className="relative max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6 text-zinc-100 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 sm:right-4 sm:top-4 rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
          <div className="rounded-xl bg-amber-500/10 p-2 text-amber-400">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">How to Play KnowBall</h2>
            <p className="text-sm text-zinc-400">The 4×4 Multi-Sport Trivia Challenge</p>
          </div>
        </div>

        <div className="mt-5 space-y-5 text-sm leading-relaxed text-zinc-300">
          <section className="space-y-2">
            <h3 className="flex items-center gap-2 font-semibold text-white">
              <Layers className="h-4 w-4 text-emerald-400" /> 1. The 4×4 Board
            </h3>
            <p>
              Match athletes who satisfy <strong>both</strong> the intersecting Row criteria and Column criteria.
              Each athlete can only be guessed <strong>once per game</strong>.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="flex items-center gap-2 font-semibold text-white">
              <Sparkles className="h-4 w-4 text-cyan-400" /> 2. Cross-Sport Stat Homonyms
            </h3>
            <p>
              Certain stats share the same name across sports. You can answer using athletes from <strong>either sport</strong>:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5">
                <span className="font-bold text-amber-300">Steals:</span> MLB Stolen Bases or NBA Steals
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5">
                <span className="font-bold text-blue-300">Assists:</span> NBA or NHL Assists
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5">
                <span className="font-bold text-emerald-300">Hits:</span> MLB Base Hits or NHL Body Checks
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5">
                <span className="font-bold text-purple-300">Saves:</span> MLB Relief Saves or NHL Saves
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5">
                <span className="font-bold text-rose-300">Points:</span> NBA Points or NHL Points (G+A)
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5">
                <span className="font-bold text-orange-300">Turnovers:</span> NFL INTs/Fumbles or NBA Turnovers
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="flex items-center gap-2 font-semibold text-white">
              <Flame className="h-4 w-4 text-orange-400" /> 3. Playstyle Modes
            </h3>
            <ul className="list-inside list-disc space-y-1 text-zinc-400">
              <li>
                <strong className="text-zinc-200">Ball Knower (Official):</strong> 16 total guesses for 16 cells. Every incorrect guess permanently burns that cell with an <span className="font-bold text-rose-400">X</span>. Official ranked results can be shared with friends!
              </li>
              <li>
                <strong className="text-zinc-200">Unlimited (Practice):</strong> Take unlimited guesses to test wild hunches and obscure players. Cells never burn, so you can guess until you solve the board. (Results cannot be shared).
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="flex items-center gap-2 font-semibold text-white">
              <Trophy className="h-4 w-4 text-amber-400" /> 4. The Grand Slam Diversity Bonus
            </h3>
            <p>
              If your final 16 answers include at least 1 athlete from <strong>4 different sports</strong> (e.g. NFL, NBA, MLB, NHL), you earn the <strong>Grand Slam Badge</strong> and receive a <strong>25% deduction</strong> on your Rarity Score (lower is better!).
            </p>
          </section>
        </div>

        <div className="mt-6 border-t border-zinc-800 pt-4 text-right">
          <button
            onClick={onClose}
            className="rounded-xl bg-emerald-500 px-5 py-2 font-semibold text-black transition hover:bg-emerald-400"
          >
            Got it, Let’s Play!
          </button>
        </div>
      </div>
    </div>
  );
};
