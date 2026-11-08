'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { X, Search, AlertCircle, CornerDownLeft, Sparkles } from 'lucide-react';
import { Athlete, Category, Sport } from '@/types';
import { ATHLETES } from '@/data/athletes';
import { validateGuess } from '@/data/puzzles';
import {
  normalizeSearchString,
  resolveAlias,
  getHighlightedSegments,
} from '@/lib/searchUtils';

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
};

// Pre-index normalized athlete names once to ensure sub-millisecond search performance
interface IndexedAthlete {
  athlete: Athlete;
  normName: string;
  tokens: string[];
}

const SEARCH_INDEX: IndexedAthlete[] = ATHLETES.map((a) => {
  const normName = normalizeSearchString(a.name);
  return {
    athlete: a,
    normName,
    tokens: normName.split(' '),
  };
});

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
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLButtonElement>(null);

  // Auto-focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setErrorMessage(null);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Search logic with alias resolution and diacritics stripping
  const { filteredAthletes, matchedQuery } = useMemo(() => {
    if (!query.trim()) {
      // Suggest top legendary / household name athletes when query is empty
      const topAthletes = [...ATHLETES]
        .filter((a) => !guessedAthleteIds.has(a.id))
        .sort((a, b) => (b.popularityScore || 50) - (a.popularityScore || 50))
        .slice(0, 10);
      return { filteredAthletes: topAthletes, matchedQuery: '' };
    }

    // Resolve common sports nicknames (e.g. "Steph Curry" -> "Stephen Curry")
    const resolved = resolveAlias(query);
    const qNorm = normalizeSearchString(resolved);
    const scoredMatches: { athlete: Athlete; score: number }[] = [];

    for (let i = 0; i < SEARCH_INDEX.length; i++) {
      const item = SEARCH_INDEX[i];
      if (guessedAthleteIds.has(item.athlete.id)) continue;

      let matchScore = 0;
      if (item.normName === qNorm) {
        matchScore = 2000; // Exact match
      } else if (item.normName.startsWith(qNorm)) {
        matchScore = 1000; // Full name starts with query
      } else {
        // Check if any word/last name starts with query
        const wordMatch = item.tokens.some((token) => token.startsWith(qNorm));
        if (wordMatch) {
          matchScore = 700;
        } else if (item.normName.includes(qNorm)) {
          matchScore = 300;
        }
      }

      if (matchScore > 0) {
        // Boost by athlete popularity weight so household names appear near top
        const totalScore = matchScore + (item.athlete.popularityScore || 50);
        scoredMatches.push({ athlete: item.athlete, score: totalScore });
      }
    }

    const sorted = scoredMatches
      .sort((a, b) => b.score - a.score)
      .slice(0, 15)
      .map((m) => m.athlete);

    return { filteredAthletes: sorted, matchedQuery: resolved };
  }, [query, guessedAthleteIds]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Auto-scroll selected item into view
  useEffect(() => {
    if (selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [selectedIndex]);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, Math.max(0, filteredAthletes.length - 1)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredAthletes.length > 0 && filteredAthletes[selectedIndex]) {
        handleSelectAthlete(filteredAthletes[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px] transition-opacity duration-200">
      <div className="relative flex max-h-[85vh] w-full max-w-xl flex-col rounded-2xl border border-zinc-700/80 bg-zinc-950/95 p-6 shadow-2xl backdrop-blur-md">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header criteria reminder */}
        <div className="mb-4 pr-10">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Selecting answer for:
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs sm:text-sm font-semibold text-emerald-300 shadow-sm">
              {rowCategory.name}
            </span>
            <span className="text-zinc-500 font-bold">×</span>
            <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs sm:text-sm font-semibold text-emerald-300 shadow-sm">
              {colCategory.name}
            </span>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-zinc-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onKeyDown={handleKeyDown}
            onChange={(e) => {
              setQuery(e.target.value);
              setErrorMessage(null);
            }}
            placeholder="Type player name (e.g. Jordan, Brady, Jeter, Gretzky)..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 py-3 pl-11 pr-24 text-base text-zinc-100 placeholder-zinc-500 outline-none ring-emerald-500/50 transition focus:border-emerald-500 focus:ring-2"
          />
          <div className="pointer-events-none absolute right-3.5 top-3.5 hidden sm:flex items-center gap-1 text-[11px] font-mono text-zinc-500">
            <span>↑↓</span>
            <span>navigate</span>
          </div>
        </div>

        {/* Error Feedback */}
        {errorMessage && (
          <div className="mb-3 flex items-start gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300 animate-shake">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
            <div>
              <p className="font-semibold">Incorrect Guess</p>
              <p className="mt-0.5 text-rose-300/90">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Athlete Candidates List */}
        <div ref={listRef} className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[50vh]">
          {filteredAthletes.length === 0 ? (
            <div className="py-12 text-center text-sm text-zinc-500">
              No matching athletes found for &quot;{query}&quot;. Try searching another spelling or surname.
            </div>
          ) : (
            filteredAthletes.map((athlete, idx) => {
              const isSelected = idx === selectedIndex;
              const hasNameDuplicate = filteredAthletes.some(
                (other) => other.id !== athlete.id && other.name === athlete.name
              );

              // Substring highlighting
              const segments = getHighlightedSegments(athlete.name, matchedQuery || query);

              return (
                <button
                  key={athlete.id}
                  ref={isSelected ? selectedItemRef : null}
                  onClick={() => handleSelectAthlete(athlete)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`group flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-left transition duration-100 select-none ${
                    isSelected
                      ? 'border-emerald-500/70 bg-zinc-800/90 ring-1 ring-emerald-500/40 shadow-sm'
                      : 'border-zinc-800/80 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-semibold text-zinc-100 group-hover:text-emerald-300 transition text-sm truncate">
                      {segments.map((seg, sIdx) =>
                        seg.isMatch ? (
                          <strong key={sIdx} className="text-emerald-400 font-extrabold underline decoration-emerald-500/50">
                            {seg.text}
                          </strong>
                        ) : (
                          <span key={sIdx}>{seg.text}</span>
                        )
                      )}
                    </span>

                    {/* Disambiguation years only when exact duplicate names exist in results */}
                    {hasNameDuplicate && (
                      <span className="text-xs text-zinc-500 font-mono shrink-0">
                        ({athlete.activeYears[0]}–{athlete.activeYears[1] >= 2026 ? 'Pres' : athlete.activeYears[1]})
                      </span>
                    )}

                    {/* Multi-sport / Single-sport badges */}
                    <div className="flex gap-1 shrink-0">
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

                  {/* Press Enter indicator on selected candidate */}
                  {isSelected && (
                    <div className="hidden sm:flex items-center gap-1 rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-mono text-emerald-400 shrink-0">
                      <span>Enter</span>
                      <CornerDownLeft className="h-3 w-3" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
