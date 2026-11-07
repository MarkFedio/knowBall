'use client';

import React, { useState, useMemo } from 'react';
import { X, Search, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Athlete, Category, Sport } from '@/types';
import { ATHLETES } from '@/data/athletes';
import { validateGuess } from '@/data/puzzles';

interface SearchModalProps {
  isOpen: boolean;
  rowCategory: Category;
  colCategory: Category;
  guessedAthleteIds: Set<string>;
  onClose: () => void;
  onGuessSuccess: (athlete: Athlete, rarity: number) => void;
  onGuessFailure: (athlete: Athlete) => void;
}

const SPORT_COLORS: Record<Sport, { bg: string; text: string; border: string }> = {
  NFL: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  NBA: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  MLB: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  NHL: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  SOCCER: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
};

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  rowCategory,
  colCategory,
  guessedAthleteIds,
  onClose,
  onGuessSuccess,
  onGuessFailure,
}) => {
  const [query, setQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filteredAthletes = useMemo(() => {
    if (!query.trim()) {
      // Suggest top legendary/popular athletes when query is empty
      return [...ATHLETES]
        .filter((a) => !guessedAthleteIds.has(a.id))
        .sort((a, b) => (b.popularityScore || 50) - (a.popularityScore || 50))
        .slice(0, 10);
    }

    const q = query.toLowerCase().trim();
    const scoredMatches: { athlete: Athlete; score: number }[] = [];

    for (const a of ATHLETES) {
      if (guessedAthleteIds.has(a.id)) continue;

      const nameLower = a.name.toLowerCase();
      let matchScore = 0;

      if (nameLower === q) {
        matchScore = 1000;
      } else if (nameLower.startsWith(q)) {
        matchScore = 500;
      } else {
        const parts = nameLower.split(' ');
        if (parts.some((part) => part.startsWith(q))) {
          matchScore = 400; // Last name or first name starts with query
        } else if (nameLower.includes(q)) {
          matchScore = 200;
        } else if (a.teamNames.some((t) => t.toLowerCase().includes(q))) {
          matchScore = 60;
        } else if (a.college?.toLowerCase().includes(q)) {
          matchScore = 40;
        }
      }

      if (matchScore > 0) {
        // Boost by popularity score so legends/known stars show up first
        const totalScore = matchScore + (a.popularityScore || 50);
        scoredMatches.push({ athlete: a, score: totalScore });
      }
    }

    return scoredMatches
      .sort((a, b) => b.score - a.score)
      .slice(0, 15)
      .map((m) => m.athlete);
  }, [query, guessedAthleteIds]);

  if (!isOpen) return null;

  const handleSelectAthlete = (athlete: Athlete) => {
    const result = validateGuess(rowCategory, colCategory, athlete);

    if (result.isCorrect) {
      setErrorMessage(null);
      onGuessSuccess(athlete, result.rarityPercentage);
      onClose();
    } else {
      setErrorMessage(
        `${athlete.name} does not satisfy both "${rowCategory.shortName}" and "${colCategory.shortName}".`
      );
      onGuessFailure(athlete);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[85vh] w-full max-w-xl flex-col rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header criteria reminder */}
        <div className="mb-4 pr-10">
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Selecting for:</div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1 text-sm font-semibold text-zinc-200">
              {rowCategory.name}
            </span>
            <span className="text-zinc-500 font-bold">×</span>
            <span className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1 text-sm font-semibold text-zinc-200">
              {colCategory.name}
            </span>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-zinc-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setErrorMessage(null);
            }}
            placeholder="Search athlete by name, team, or college..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 py-3 pl-11 pr-4 text-base text-zinc-100 placeholder-zinc-500 outline-none ring-emerald-500/50 transition focus:border-emerald-500 focus:ring-2"
          />
        </div>

        {/* Error Feedback */}
        {errorMessage && (
          <div className="mb-3 flex items-start gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
            <div>
              <p className="font-semibold">Incorrect Guess</p>
              <p className="mt-0.5 text-rose-300/90">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Athlete Candidates List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredAthletes.length === 0 ? (
            <div className="py-12 text-center text-sm text-zinc-500">
              No matching athletes found for &quot;{query}&quot;. Try searching another name.
            </div>
          ) : (
            filteredAthletes.map((athlete) => (
              <button
                key={athlete.id}
                onClick={() => handleSelectAthlete(athlete)}
                className="group flex w-full items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-3 text-left transition hover:border-emerald-500/40 hover:bg-zinc-800/80"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-100 group-hover:text-emerald-300 transition">
                      {athlete.name}
                    </span>
                    <div className="flex gap-1">
                      {athlete.sports.map((sport) => {
                        const style = SPORT_COLORS[sport];
                        return (
                          <span
                            key={sport}
                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${style.bg} ${style.text} ${style.border}`}
                          >
                            {sport}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div className="text-xs text-zinc-400">
                    <span>{athlete.positions.join('/')}</span> •{' '}
                    <span>{athlete.teamNames.slice(0, 3).join(', ')}{athlete.teamNames.length > 3 ? '...' : ''}</span> •{' '}
                    <span className="text-zinc-500">
                      {athlete.activeYears[0]}–{athlete.activeYears[1] >= 2026 ? 'Pres' : athlete.activeYears[1]}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-zinc-500 font-mono">
                  {athlete.college ? athlete.college : `#${athlete.jerseyNumbers[0] ?? ''}`}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
