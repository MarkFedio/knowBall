'use client';

import React, { useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Building2,
  Trophy,
  Calendar,
  Shuffle,
  Hash,
  Target,
  Flame,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { Category, Sport } from '@/types';
import { CategoryIcon } from './CategoryIcon';

interface CategoryInfoModalProps {
  category: Category | null;
  onClose: () => void;
}

const SPORT_TAGS: Record<Sport, { bg: string; text: string; border: string }> = {
  NFL: { bg: 'bg-blue-500/15', text: 'text-blue-300', border: 'border-blue-500/30' },
  NBA: { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30' },
  MLB: { bg: 'bg-rose-500/15', text: 'text-rose-300', border: 'border-rose-500/30' },
  NHL: { bg: 'bg-cyan-500/15', text: 'text-cyan-300', border: 'border-cyan-500/30' },
};

// Qualifying teams for each metropolitan market
const METRO_TEAMS: Record<string, { league: Sport; team: string }[]> = {
  metro_ny: [
    { league: 'MLB', team: 'New York Yankees' },
    { league: 'MLB', team: 'New York Mets' },
    { league: 'NFL', team: 'New York Giants' },
    { league: 'NFL', team: 'New York Jets' },
    { league: 'NBA', team: 'New York Knicks' },
    { league: 'NBA', team: 'Brooklyn / NJ Nets' },
    { league: 'NHL', team: 'New York Rangers' },
    { league: 'NHL', team: 'New York Islanders' },
    { league: 'NHL', team: 'New Jersey Devils' },
  ],
  metro_boston: [
    { league: 'NFL', team: 'New England Patriots' },
    { league: 'NBA', team: 'Boston Celtics' },
    { league: 'MLB', team: 'Boston Red Sox' },
    { league: 'NHL', team: 'Boston Bruins' },
  ],
  metro_chicago: [
    { league: 'NFL', team: 'Chicago Bears' },
    { league: 'NBA', team: 'Chicago Bulls' },
    { league: 'MLB', team: 'Chicago Cubs' },
    { league: 'MLB', team: 'Chicago White Sox' },
    { league: 'NHL', team: 'Chicago Blackhawks' },
  ],
  metro_la: [
    { league: 'NBA', team: 'Los Angeles Lakers' },
    { league: 'NBA', team: 'Los Angeles Clippers' },
    { league: 'MLB', team: 'Los Angeles Dodgers' },
    { league: 'MLB', team: 'Los Angeles Angels' },
    { league: 'NFL', team: 'Los Angeles Rams' },
    { league: 'NFL', team: 'Los Angeles Chargers' },
    { league: 'NHL', team: 'Los Angeles Kings' },
    { league: 'NHL', team: 'Anaheim Ducks' },
  ],
  metro_bay_area: [
    { league: 'NFL', team: 'San Francisco 49ers' },
    { league: 'NFL', team: 'Oakland Raiders' },
    { league: 'NBA', team: 'Golden State Warriors' },
    { league: 'MLB', team: 'San Francisco Giants' },
    { league: 'MLB', team: 'Oakland Athletics' },
    { league: 'NHL', team: 'San Jose Sharks' },
  ],
  metro_philly: [
    { league: 'NFL', team: 'Philadelphia Eagles' },
    { league: 'NBA', team: 'Philadelphia 76ers' },
    { league: 'MLB', team: 'Philadelphia Phillies' },
    { league: 'NHL', team: 'Philadelphia Flyers' },
  ],
  metro_detroit: [
    { league: 'NFL', team: 'Detroit Lions' },
    { league: 'NBA', team: 'Detroit Pistons' },
    { league: 'MLB', team: 'Detroit Tigers' },
    { league: 'NHL', team: 'Detroit Red Wings' },
  ],
  metro_florida: [
    { league: 'NFL', team: 'Miami Dolphins' },
    { league: 'NFL', team: 'Tampa Bay Buccaneers' },
    { league: 'NFL', team: 'Jacksonville Jaguars' },
    { league: 'NBA', team: 'Miami Heat' },
    { league: 'NBA', team: 'Orlando Magic' },
    { league: 'MLB', team: 'Miami Marlins' },
    { league: 'MLB', team: 'Tampa Bay Rays' },
    { league: 'NHL', team: 'Tampa Bay Lightning' },
    { league: 'NHL', team: 'Florida Panthers' },
  ],
  metro_texas: [
    { league: 'NFL', team: 'Dallas Cowboys' },
    { league: 'NFL', team: 'Houston Texans / Oilers' },
    { league: 'NBA', team: 'Houston Rockets' },
    { league: 'NBA', team: 'San Antonio Spurs' },
    { league: 'NBA', team: 'Dallas Mavericks' },
    { league: 'MLB', team: 'Texas Rangers' },
    { league: 'MLB', team: 'Houston Astros' },
    { league: 'NHL', team: 'Dallas Stars' },
  ],
  metro_ohio: [
    { league: 'NFL', team: 'Cleveland Browns' },
    { league: 'NFL', team: 'Cincinnati Bengals' },
    { league: 'NBA', team: 'Cleveland Cavaliers' },
    { league: 'MLB', team: 'Cincinnati Reds' },
    { league: 'MLB', team: 'Cleveland Guardians / Indians' },
    { league: 'NHL', team: 'Columbus Blue Jackets' },
  ],
  metro_dc_baltimore: [
    { league: 'NFL', team: 'Washington Commanders / Redskins' },
    { league: 'NFL', team: 'Baltimore Ravens' },
    { league: 'NBA', team: 'Washington Wizards / Bullets' },
    { league: 'MLB', team: 'Baltimore Orioles' },
    { league: 'MLB', team: 'Washington Nationals / Expos' },
    { league: 'NHL', team: 'Washington Capitals' },
  ],
  metro_canada: [
    { league: 'NBA', team: 'Toronto Raptors' },
    { league: 'MLB', team: 'Toronto Blue Jays' },
    { league: 'NHL', team: 'Toronto Maple Leafs' },
    { league: 'NHL', team: 'Montreal Canadiens' },
    { league: 'NHL', team: 'Vancouver Canucks' },
    { league: 'NHL', team: 'Calgary Flames' },
    { league: 'NHL', team: 'Edmonton Oilers' },
    { league: 'NHL', team: 'Ottawa Senators' },
    { league: 'NHL', team: 'Winnipeg Jets' },
  ],
};

// Accolade criteria breakdowns
const ACCOLADE_CRITERIA: Record<string, { award: string; leagues: string; notes: string }> = {
  accolade_champion: {
    award: 'World Championship Ring / Trophy',
    leagues: 'Super Bowl (NFL), NBA Finals, World Series (MLB), Stanley Cup (NHL)',
    notes: 'Won at least 1 official World Championship in their pro career.',
  },
  accolade_multi_champ_2: {
    award: '2+ World Championship Titles',
    leagues: 'Super Bowl (NFL), NBA Finals, World Series (MLB), Stanley Cup (NHL)',
    notes: 'Won 2 or more championship rings across their professional career.',
  },
  accolade_multi_champ: {
    award: '3+ World Championship Titles',
    leagues: 'Super Bowl (NFL), NBA Finals, World Series (MLB), Stanley Cup (NHL)',
    notes: 'Won 3 or more championship rings across their professional career.',
  },
  accolade_multi_champ_4: {
    award: '4+ World Championship Titles',
    leagues: 'Super Bowl (NFL), NBA Finals, World Series (MLB), Stanley Cup (NHL)',
    notes: 'Won 4 or more championship rings across their professional career.',
  },
  accolade_mvp: {
    award: 'League Most Valuable Player (MVP)',
    leagues: 'NFL AP MVP, NBA MVP, MLB AL or NL MVP, NHL Hart Memorial Trophy',
    notes: 'Won an official regular-season MVP award in their primary league (Finals MVP alone does not qualify).',
  },
  accolade_hof: {
    award: 'Official Sport Hall of Fame',
    leagues: 'Pro Football HOF (Canton), Basketball HOF (Springfield), Baseball HOF (Cooperstown), Hockey HOF (Toronto)',
    notes: 'Formally inducted into the official major league Hall of Fame for their sport.',
  },
  accolade_rookie_of_year: {
    award: 'Rookie of the Year (ROTY)',
    leagues: 'NFL AP OROY/DROY, NBA ROTY, MLB Rookie of the Year, NHL Calder Memorial Trophy',
    notes: 'Awarded official Rookie of the Year honors in their debut season.',
  },
};

// Cross-Sport Stat criteria breakdowns
const STAT_CRITERIA: Record<string, { statName: string; breakdown: string; rule: string }> = {
  stat_steals_100: {
    statName: '100+ Career Steals',
    breakdown: 'MLB Stolen Bases (100+) OR NBA Defensive Steals (100+)',
    rule: 'Achieved at least 100 stolen bases in MLB or 100 steals in the NBA.',
  },
  stat_steals_250: {
    statName: '250+ Career Steals',
    breakdown: 'MLB Stolen Bases (250+) OR NBA Defensive Steals (250+)',
    rule: 'Achieved at least 250 stolen bases in MLB or 250 steals in the NBA.',
  },
  stat_steals_500: {
    statName: '500+ Career Steals',
    breakdown: 'MLB Stolen Bases (500+) OR NBA Defensive Steals (500+)',
    rule: 'Achieved at least 500 stolen bases in MLB or 500 steals in the NBA.',
  },
  stat_assists_250: {
    statName: '250+ Career Assists',
    breakdown: 'NBA Assists (250+) OR NHL Assists (250+)',
    rule: 'Recorded at least 250 career assists on the court or on the ice.',
  },
  stat_assists_500: {
    statName: '500+ Career Assists',
    breakdown: 'NBA Assists (500+) OR NHL Assists (500+)',
    rule: 'Recorded at least 500 career assists on the court or on the ice.',
  },
  stat_assists_1000: {
    statName: '1,000+ Career Assists',
    breakdown: 'NBA Assists (1,000+) OR NHL Assists (1,000+)',
    rule: 'Recorded at least 1,000 career assists on the court or on the ice.',
  },
  stat_assists_2500: {
    statName: '2,500+ Career Assists',
    breakdown: 'NBA Assists (2,500+) OR NHL Assists (2,500+)',
    rule: 'Recorded at least 2,500 career assists on the court or on the ice.',
  },
  stat_points_1k: {
    statName: '1,000+ Career Points (or 100+ NHL Points)',
    breakdown: 'NBA: 1,000+ points | NHL: 100+ points (Goals + Assists)',
    rule: 'Scored 1,000+ career points in basketball, or 100+ points in hockey.',
  },
  stat_points_5k: {
    statName: '5,000+ Career Points (or 500+ NHL Points)',
    breakdown: 'NBA: 5,000+ points | NHL: 500+ points (Goals + Assists)',
    rule: 'Scored 5,000+ career points in basketball, or 500+ points in hockey.',
  },
  stat_points_10k: {
    statName: '10,000+ Career Points (or 1,000+ NHL Points)',
    breakdown: 'NBA: 10,000+ points | NHL: 1,000+ points (Goals + Assists)',
    rule: 'Scored 10,000+ career points in basketball, or reached the elite 1,000-point plateau in hockey.',
  },
  stat_points_15k: {
    statName: '15,000+ Career Points (or 1,200+ NHL Points)',
    breakdown: 'NBA: 15,000+ points | NHL: 1,200+ points (Goals + Assists)',
    rule: 'Scored 15,000+ career points in basketball, or 1,200+ points in hockey.',
  },
  stat_turnovers_100: {
    statName: '100+ Career Turnovers',
    breakdown: 'NFL: 100+ Turnovers (INTs thrown + Fumbles lost) | NBA: 100+ Turnovers committed',
    rule: 'Recorded 100+ total career turnovers in the NFL or NBA.',
  },
  stat_turnovers_150: {
    statName: '150+ Career Turnovers',
    breakdown: 'NFL: 150+ Turnovers (INTs thrown + Fumbles lost) | NBA: 150+ Turnovers committed',
    rule: 'Recorded 150+ total career turnovers in the NFL or NBA.',
  },
  stat_turnovers_250: {
    statName: '250+ Career Turnovers',
    breakdown: 'NFL: 250+ Turnovers (INTs thrown + Fumbles lost) | NBA: 250+ Turnovers committed',
    rule: 'Recorded 250+ total career turnovers in the NFL or NBA.',
  },
  stat_hits_1000: {
    statName: '1,000+ Career Hits',
    breakdown: 'MLB: 1,000+ Base Hits | NHL: 1,000+ Body Checks / Hits',
    rule: 'Recorded 1,000+ base hits in baseball or 1,000+ hits in the NHL.',
  },
  stat_hits_2000: {
    statName: '2,000+ Career Hits',
    breakdown: 'MLB: 2,000+ Base Hits | NHL: 2,000+ Body Checks / Hits',
    rule: 'Recorded 2,000+ base hits in baseball or 2,000+ hits in the NHL.',
  },
  stat_hits_3000: {
    statName: '3,000+ Career Hits',
    breakdown: 'MLB: 3,000+ Base Hits | NHL: 3,000+ Body Checks / Hits',
    rule: 'Member of the 3,000 Hit Club in baseball or recorded 3,000+ hits in the NHL.',
  },
  stat_saves_100: {
    statName: '100+ Career Saves',
    breakdown: 'MLB: 100+ Relief Pitching Saves | NHL: 100+ Goalie Saves',
    rule: 'Recorded 100+ saves on the mound (MLB closers) or 100+ saves in net (NHL goalies).',
  },
  stat_saves_200: {
    statName: '200+ Career Saves',
    breakdown: 'MLB: 200+ Relief Pitching Saves | NHL: 200+ Goalie Saves',
    rule: 'Recorded 200+ saves on the mound (MLB closers) or 200+ saves in net (NHL goalies).',
  },
  stat_saves_300: {
    statName: '300+ Career Saves',
    breakdown: 'MLB: 300+ Relief Pitching Saves | NHL: 300+ Goalie Saves',
    rule: 'Recorded 300+ saves on the mound (MLB closers) or 300+ saves in net (NHL goalies).',
  },
  number_single_digit: {
    statName: 'Wore Single Digit Number (#1–#9)',
    breakdown: 'Jersey Numbers 1 through 9',
    rule: 'Wore any single-digit number (1, 2, 3, 4, 5, 6, 7, 8, or 9) during their pro career.',
  },
  number_teens: {
    statName: 'Wore a Teen Jersey Number (#10–#19)',
    breakdown: 'Jersey Numbers 10 through 19',
    rule: 'Wore a jersey number in the teens (10, 11, 12, 13, 14, 15, 16, 17, 18, or 19) in pro games.',
  },
  number_twenties: {
    statName: 'Wore a 20s Jersey Number (#20–#29)',
    breakdown: 'Jersey Numbers 20 through 29',
    rule: 'Wore a jersey number in the twenties (20 through 29) during pro regular season games.',
  },
  number_thirties: {
    statName: 'Wore a 30s Jersey Number (#30–#39)',
    breakdown: 'Jersey Numbers 30 through 39',
    rule: 'Wore a jersey number in the thirties (30 through 39) during pro regular season games.',
  },
  number_forties: {
    statName: 'Wore a 40s Jersey Number (#40–#49)',
    breakdown: 'Jersey Numbers 40 through 49',
    rule: 'Wore a jersey number in the forties (40 through 49) during pro regular season games.',
  },
  number_fifties: {
    statName: 'Wore a 50s Jersey Number (#50–#59)',
    breakdown: 'Jersey Numbers 50 through 59',
    rule: 'Wore a jersey number in the fifties (50 through 59) during pro regular season games.',
  },
  number_sixty_plus: {
    statName: 'Wore 60s/70s Jersey Number (#60–#79)',
    breakdown: 'Jersey Numbers 60 through 79',
    rule: 'Wore a jersey number between 60 and 79 during their major league career.',
  },
  number_eighty_plus: {
    statName: 'Wore High Jersey Number (#80–#99)',
    breakdown: 'Jersey Numbers 80 through 99',
    rule: 'Wore a high jersey number between 80 and 99 during their major league career.',
  },
  number_23_or_24: {
    statName: 'Wore Iconic #23 or #24 in Pros',
    breakdown: 'Jersey #23 or #24',
    rule: 'Wore number 23 or 24 for at least one official regular season game in NFL, NBA, MLB, or NHL.',
  },
  number_33_or_34: {
    statName: 'Wore Legendary #33 or #34 in Pros',
    breakdown: 'Jersey #33 or #34',
    rule: 'Wore number 33 or 34 for at least one official regular season game in NFL, NBA, MLB, or NHL.',
  },
  number_0_or_99: {
    statName: 'Wore #0, #00, or #99 in Pros',
    breakdown: 'Jersey #0, #00, or #99',
    rule: 'Wore jersey number 0, 00, or 99 during their pro regular season career.',
  },
};

// Era / Longevity breakdowns
const ERA_CRITERIA: Record<string, { label: string; rule: string }> = {
  era_active_2020s: {
    label: 'Active in the 2020s',
    rule: 'Appeared in at least one pro regular-season or playoff game in 2020 or later (including the 2024–2026 seasons).',
  },
  era_2010s: {
    label: 'Active in the 2010s',
    rule: 'Appeared in at least one pro game between January 1, 2010 and December 31, 2019.',
  },
  era_2000s: {
    label: 'Active in the 2000s',
    rule: 'Appeared in at least one pro game between January 1, 2000 and December 31, 2009.',
  },
  era_1990s: {
    label: 'Active in the 1990s',
    rule: 'Appeared in at least one pro game between January 1, 1990 and December 31, 1999.',
  },
  era_1980s: {
    label: 'Active in the 1980s',
    rule: 'Appeared in at least one pro game between January 1, 1980 and December 31, 1989.',
  },
  era_8_seasons: {
    label: 'Played 8+ Seasons',
    rule: 'Career spanned 8 or more calendar years at the major league level (active years difference >= 7).',
  },
  era_10_seasons: {
    label: 'Played 10+ Seasons',
    rule: 'Career spanned 10 or more calendar years at the major league level (active years difference >= 9).',
  },
  era_12_seasons: {
    label: 'Played 12+ Seasons',
    rule: 'Career spanned 12 or more calendar years at the major league level (active years difference >= 11).',
  },
  era_15_seasons: {
    label: 'Played 15+ Seasons',
    rule: 'Career spanned 15 or more calendar years at the major league level (active years difference >= 14).',
  },
  era_18_seasons: {
    label: 'Played 18+ Seasons',
    rule: 'Career spanned 18 or more calendar years at the major league level (active years difference >= 17).',
  },
};

// Franchise / Journey breakdowns
const FRANCHISE_CRITERIA: Record<string, { label: string; rule: string }> = {
  career_2_teams: {
    label: 'Played for 2+ Franchises',
    rule: 'Appeared in official regular-season or playoff games for at least 2 distinct pro franchises.',
  },
  career_3_teams: {
    label: 'Played for 3+ Franchises',
    rule: 'Appeared in official regular-season or playoff games for at least 3 distinct pro franchises.',
  },
  career_4_teams: {
    label: 'Played for 4+ Franchises',
    rule: 'Appeared in official regular-season or playoff games for at least 4 distinct pro franchises.',
  },
  career_5_teams: {
    label: 'Played for 5+ Franchises',
    rule: 'Appeared in official regular-season or playoff games for at least 5 distinct pro franchises.',
  },
  career_6_teams: {
    label: 'Played for 6+ Franchises',
    rule: 'Appeared in official regular-season or playoff games for at least 6 distinct pro franchises.',
  },
  career_one_franchise: {
    label: 'One-Franchise Legend (8+ Yrs)',
    rule: 'Spent entire professional career (spanning 8 or more seasons) with a single franchise without ever appearing for another team.',
  },
};

export const CategoryInfoModal: React.FC<CategoryInfoModalProps> = ({ category, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!category) return null;

  const catId = category.id.toLowerCase();
  const metroTeams = METRO_TEAMS[catId];
  const accoladeInfo = ACCOLADE_CRITERIA[catId];
  const statInfo = STAT_CRITERIA[catId];
  const eraInfo = ERA_CRITERIA[catId];
  const franchiseInfo = FRANCHISE_CRITERIA[catId];

  // Category badge type label
  let typeLabel = 'CATEGORY CRITERIA';
  if (category.type === 'METRO') typeLabel = 'GEOGRAPHIC METRO MARKET';
  else if (category.type === 'ACCOLADE') typeLabel = 'CHAMPIONSHIPS & AWARDS';
  else if (category.type === 'CROSS_STAT') typeLabel = 'CROSS-SPORT STAT';
  else if (category.type === 'NUMBER_ERA') typeLabel = 'ERA, LONGEVITY & JERSEYS';
  else if (category.type === 'BACKGROUND') typeLabel = 'CAREER & FRANCHISES';
  else if (category.type === 'SPORT') typeLabel = 'LEAGUE / SPORT';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-md flex-col rounded-2xl border border-[#00e5a3]/50 bg-[#091524]/95 p-5 sm:p-6 shadow-[0_0_40px_rgba(0,229,163,0.18)] backdrop-blur-md overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glowing Top Neon Rim */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00f5b8] via-[#22d3ee] to-[#00f5b8]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3.5 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
          title="Close (Esc)"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Category Header */}
        <div className="flex items-start gap-3.5 pb-4 border-b border-zinc-800/80">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#0e2133] border border-[#00e5a3]/40 flex items-center justify-center shadow-[0_0_12px_rgba(0,229,163,0.2)]">
            <CategoryIcon category={category} className="w-7 h-7" />
          </div>
          <div className="pr-6">
            <span className="text-[10px] font-black tracking-widest uppercase text-[#00f5b8]">
              {typeLabel}
            </span>
            <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
              {category.shortName}
            </h2>
            <p className="text-xs text-zinc-300 mt-0.5 font-medium">{category.name}</p>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1 scrollbar-thin text-zinc-200">
          {/* 1. Primary Rule Requirement */}
          <div className="rounded-xl border border-cyan-500/30 bg-[#0c1c2b]/90 p-3.5 shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#00f5b8]" />
              <span className="text-xs font-black uppercase tracking-wider text-cyan-200">
                Exact Requirement
              </span>
            </div>
            <p className="text-sm font-normal text-zinc-100 leading-relaxed">
              {statInfo?.rule ||
                eraInfo?.rule ||
                franchiseInfo?.rule ||
                accoladeInfo?.notes ||
                category.description}
            </p>
          </div>

          {/* 2. Metro Teams List (if Metro) */}
          {metroTeams && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                  Qualifying Teams ({metroTeams.length})
                </span>
                <span className="text-[10px] text-zinc-400">Regular season or playoffs</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {metroTeams.map(({ league, team }) => {
                  const tag = SPORT_TAGS[league];
                  return (
                    <div
                      key={team}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs"
                    >
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${tag.bg} ${tag.text} ${tag.border}`}
                      >
                        {league}
                      </span>
                      <span className="text-zinc-200 font-medium truncate">{team}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Accolade Breakdown (if Accolade) */}
          {accoladeInfo && (
            <div className="rounded-xl border border-amber-500/30 bg-[#1f1707]/60 p-3 space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 text-amber-300 font-black uppercase text-[11px]">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                Qualifying Honors
              </div>
              <p className="text-zinc-300">
                <strong className="text-white">Eligible Leagues:</strong> {accoladeInfo.leagues}
              </p>
            </div>
          )}

          {/* 4. Stat Breakdown (if Cross-Stat) */}
          {statInfo && (
            <div className="rounded-xl border border-emerald-500/30 bg-[#071c14]/60 p-3 space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-300 font-black uppercase text-[11px]">
                <Target className="w-3.5 h-3.5 text-[#00f5b8]" />
                Sport Equivalency
              </div>
              <p className="text-zinc-300">
                <strong className="text-white">Breakdown:</strong> {statInfo.breakdown}
              </p>
            </div>
          )}

          {/* 5. General Pair-Programming Tip */}
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 text-[11px] text-zinc-400">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <span>
              Players who played across multiple eras, teams, or sports qualify as long as they met
              this criteria at any point during their career.
            </span>
          </div>
        </div>

        {/* Footer Dismiss Button */}
        <div className="pt-3 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gradient-to-r from-[#00f5b8] to-[#22d3ee] text-[#091524] font-black text-xs uppercase tracking-wider hover:opacity-95 shadow-[0_0_15px_rgba(0,245,184,0.3)] transition active:scale-[0.98]"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
