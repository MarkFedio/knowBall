import { Category } from '@/types';

export const CATEGORIES: Record<string, Category> = {
  // ==========================================
  // 1. CROSS-SPORT STAT HOMONYMS
  // ==========================================
  STAT_STEALS_500: {
    id: 'stat_steals_500',
    name: '500+ Career Steals (MLB/NBA)',
    shortName: '500+ Steals',
    type: 'CROSS_STAT',
    description: '500+ career stolen bases (MLB) or 500+ defensive steals (NBA)',
    matches: (a) => (a.stats.steals ?? 0) >= 500,
  },
  STAT_ASSISTS_1000: {
    id: 'stat_assists_1000',
    name: '1,000+ Career Assists (NBA/NHL/Soccer)',
    shortName: '1,000+ Assists',
    type: 'CROSS_STAT',
    description: '1,000+ career assists in NBA, NHL, or top-flight soccer',
    matches: (a) => (a.stats.assists ?? 0) >= 1000,
  },
  STAT_POINTS_10K: {
    id: 'stat_points_10k',
    name: '10,000+ Career Points (NBA/NHL)',
    shortName: '10K+ Points',
    type: 'CROSS_STAT',
    description: '10,000+ points scored in NBA (or 1,000+ in NHL)',
    matches: (a) => {
      if (a.sports.includes('NHL')) {
        return (a.stats.points ?? 0) >= 1000;
      }
      return (a.stats.points ?? 0) >= 10000;
    },
  },
  STAT_HITS_3000: {
    id: 'stat_hits_3000',
    name: '3,000+ Career Hits (MLB/NHL)',
    shortName: '3,000+ Hits',
    type: 'CROSS_STAT',
    description: '3,000+ base hits (MLB) or 3,000+ body checks/hits (NHL)',
    matches: (a) => (a.stats.hits ?? 0) >= 3000,
  },
  STAT_SAVES_300: {
    id: 'stat_saves_300',
    name: '300+ Career Saves (MLB/NHL/Soccer)',
    shortName: '300+ Saves',
    type: 'CROSS_STAT',
    description: '300+ relief pitching saves (MLB) or 300+ goalie saves (NHL/Soccer)',
    matches: (a) => (a.stats.saves ?? 0) >= 300,
  },
  STAT_TURNOVERS_150: {
    id: 'stat_turnovers_150',
    name: '150+ Career Turnovers (NFL/NBA)',
    shortName: '150+ Turnovers',
    type: 'CROSS_STAT',
    description: '150+ career turnovers (NFL INTs/fumbles lost, or NBA turnovers)',
    matches: (a) => (a.stats.turnovers ?? 0) >= 150,
  },

  // ==========================================
  // 2. LEAGUE / SPORT
  // ==========================================
  SPORT_NFL: {
    id: 'sport_nfl',
    name: 'Played in the NFL',
    shortName: 'Played in NFL',
    type: 'SPORT',
    description: 'Appeared in at least 1 regular-season or playoff NFL game',
    matches: (a) => a.sports.includes('NFL'),
  },
  SPORT_NBA: {
    id: 'sport_nba',
    name: 'Played in the NBA',
    shortName: 'Played in NBA',
    type: 'SPORT',
    description: 'Appeared in at least 1 regular-season or playoff NBA game',
    matches: (a) => a.sports.includes('NBA'),
  },
  SPORT_MLB: {
    id: 'sport_mlb',
    name: 'Played in the MLB',
    shortName: 'Played in MLB',
    type: 'SPORT',
    description: 'Appeared in at least 1 regular-season or playoff MLB game',
    matches: (a) => a.sports.includes('MLB'),
  },
  SPORT_NHL: {
    id: 'sport_nhl',
    name: 'Played in the NHL',
    shortName: 'Played in NHL',
    type: 'SPORT',
    description: 'Appeared in at least 1 regular-season or playoff NHL game',
    matches: (a) => a.sports.includes('NHL'),
  },

  // ==========================================
  // 3. METRO / MARKET
  // ==========================================
  METRO_BOSTON: {
    id: 'metro_boston',
    name: 'Played for a Boston/NE Team',
    shortName: 'Played in Boston',
    type: 'METRO',
    description: 'Patriots, Celtics, Red Sox, or Bruins',
    matches: (a) => a.markets.includes('BOS'),
  },
  METRO_CHICAGO: {
    id: 'metro_chicago',
    name: 'Played for a Chicago Team',
    shortName: 'Played in Chicago',
    type: 'METRO',
    description: 'Bulls, Bears, Cubs, White Sox, or Blackhawks',
    matches: (a) => a.markets.includes('CHI'),
  },
  METRO_NY: {
    id: 'metro_ny',
    name: 'Played for a NY/NJ Team',
    shortName: 'Played in NY / NJ',
    type: 'METRO',
    description: 'Yankees, Mets, Giants, Jets, Knicks, Nets, Rangers, Islanders, Devils',
    matches: (a) => a.markets.includes('NY'),
  },
  METRO_LA: {
    id: 'metro_la',
    name: 'Played for a Los Angeles Team',
    shortName: 'Played in LA',
    type: 'METRO',
    description: 'Lakers, Clippers, Dodgers, Angels, Rams, Chargers, Kings',
    matches: (a) => a.markets.includes('LA'),
  },
  METRO_BAY_AREA: {
    id: 'metro_bay_area',
    name: 'Played in the SF Bay Area',
    shortName: 'Bay Area Team',
    type: 'METRO',
    description: '49ers, Raiders (Oakland), Warriors, Giants, A’s, Sharks',
    matches: (a) => a.markets.includes('BAY'),
  },
  METRO_PHILLY: {
    id: 'metro_philly',
    name: 'Played for a Philadelphia Team',
    shortName: 'Played in Philly',
    type: 'METRO',
    description: 'Eagles, 76ers, Phillies, or Flyers',
    matches: (a) => a.markets.includes('PHI'),
  },
  METRO_DETROIT: {
    id: 'metro_detroit',
    name: 'Played for a Detroit Team',
    shortName: 'Played in Detroit',
    type: 'METRO',
    description: 'Lions, Pistons, Tigers, or Red Wings',
    matches: (a) => a.markets.includes('DET'),
  },
  METRO_FLORIDA: {
    id: 'metro_florida',
    name: 'Played for a Florida Team',
    shortName: 'Played in Florida',
    type: 'METRO',
    description: 'Dolphins, Bucs, Jags, Heat, Magic, Marlins, Rays, Lightning, Panthers',
    matches: (a) => a.markets.includes('FLA') || a.markets.includes('MIA') || a.markets.includes('TB'),
  },
  METRO_TEXAS: {
    id: 'metro_texas',
    name: 'Played for a Texas Team',
    shortName: 'Played in Texas',
    type: 'METRO',
    description: 'Cowboys, Texans, Oilers, Rockets, Spurs, Mavericks, Rangers, Astros, Stars',
    matches: (a) => a.markets.includes('DAL') || a.markets.includes('HOU') || a.markets.includes('SA'),
  },

  // ==========================================
  // 4. ACCOLADES & MILESTONES
  // ==========================================
  ACCOLADE_CHAMPION: {
    id: 'accolade_champion',
    name: 'Won a World Title / Ring',
    shortName: 'Won Championship',
    type: 'ACCOLADE',
    description: 'Won Super Bowl, NBA Finals, World Series, Stanley Cup, etc.',
    matches: (a) => a.championships > 0,
  },
  ACCOLADE_MULTI_CHAMP: {
    id: 'accolade_multi_champ',
    name: 'Won 3+ Championships',
    shortName: '3+ Championships',
    type: 'ACCOLADE',
    description: 'Won 3 or more World Championships across their pro career',
    matches: (a) => a.championships >= 3,
  },
  ACCOLADE_MVP: {
    id: 'accolade_mvp',
    name: 'Won League MVP / Ballon d’Or',
    shortName: 'League MVP',
    type: 'ACCOLADE',
    description: 'Won an official regular season MVP award in their sport',
    matches: (a) => a.mvps > 0,
  },
  ACCOLADE_HOF: {
    id: 'accolade_hof',
    name: 'Hall of Fame Inductee',
    shortName: 'Hall of Fame',
    type: 'ACCOLADE',
    description: 'Inducted into their respective sport’s Hall of Fame',
    matches: (a) => a.hallOfFame,
  },
  ACCOLADE_ROOKIE_OF_YEAR: {
    id: 'accolade_rookie_of_year',
    name: 'Won Rookie of the Year',
    shortName: 'Rookie of the Year',
    type: 'ACCOLADE',
    description: 'Named Rookie of the Year in their primary league',
    matches: (a) => a.rookieOfTheYear,
  },
  DRAFT_FIRST_OVERALL: {
    id: 'draft_first_overall',
    name: 'Selected #1 Overall in Draft',
    shortName: '#1 Overall Pick',
    type: 'BACKGROUND',
    description: 'Selected 1st overall in NFL, NBA, MLB, or NHL Draft',
    matches: (a) => a.draftPick === 1,
  },

  // ==========================================
  // 5. BACKGROUND & COLLEGES
  // ==========================================
  COLLEGE_SEC: {
    id: 'college_sec',
    name: 'Attended an SEC School',
    shortName: 'SEC School',
    type: 'BACKGROUND',
    description: 'Attended an SEC member school (LSU, Alabama, Florida, Georgia, Kentucky, Auburn, Tennessee, etc.)',
    matches: (a) => a.collegeConference === 'SEC',
  },
  COLLEGE_BIG_TEN: {
    id: 'college_big_ten',
    name: 'Attended a Big Ten School',
    shortName: 'Big Ten School',
    type: 'BACKGROUND',
    description: 'Attended Michigan, Ohio State, Penn State, Indiana, Wisconsin, Illinois, etc.',
    matches: (a) => a.collegeConference === 'Big Ten',
  },
  COLLEGE_ACC: {
    id: 'college_acc',
    name: 'Attended an ACC School',
    shortName: 'ACC School',
    type: 'BACKGROUND',
    description: 'Attended North Carolina, Duke, Florida State, Miami, Virginia, Wake Forest, etc.',
    matches: (a) => a.collegeConference === 'ACC',
  },

  // ==========================================
  // 6. NUMBERS & ERAS
  // ==========================================
  NUMBER_23_OR_24: {
    id: 'number_23_or_24',
    name: 'Wore #23 or #24 in Pros',
    shortName: 'Wore #23 or #24',
    type: 'NUMBER_ERA',
    description: 'Wore jersey number 23 or 24 for at least one pro season',
    matches: (a) => a.jerseyNumbers.includes(23) || a.jerseyNumbers.includes(24),
  },
  NUMBER_SINGLE_DIGIT: {
    id: 'number_single_digit',
    name: 'Wore Single Digit Number (#1-#9)',
    shortName: 'Wore #1–#9',
    type: 'NUMBER_ERA',
    description: 'Wore a single digit jersey number (1 through 9)',
    matches: (a) => a.jerseyNumbers.some((n) => n >= 1 && n <= 9),
  },
  ERA_ACTIVE_2020S: {
    id: 'era_active_2020s',
    name: 'Active in 2020s',
    shortName: 'Active in 2020s',
    type: 'NUMBER_ERA',
    description: 'Played at least one regular-season or playoff game in 2020 or later',
    matches: (a) => a.activeYears[1] >= 2020,
  },
  ERA_15_SEASONS: {
    id: 'era_15_seasons',
    name: 'Played 15+ Seasons',
    shortName: '15+ Seasons',
    type: 'NUMBER_ERA',
    description: 'Career spanned 15 or more calendar years at the pro level',
    matches: (a) => a.activeYears[1] - a.activeYears[0] >= 14,
  },
};
