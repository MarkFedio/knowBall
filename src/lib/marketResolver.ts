import { Athlete } from '@/types';

/**
 * Master Team-to-Metro-Market Resolver
 * Comprehensive mapping across MLB, NBA, NFL, and NHL (both historical and modern).
 */
export const MASTER_TEAM_TO_MARKET: Record<string, string> = {
  // ==========================================
  // MLB FRANCHISES & HISTORICAL CODES
  // ==========================================
  // New York / NJ
  NYA: 'NY', NYY: 'NY', NYN: 'NY', NYM: 'NY',
  NY1: 'NY', NY2: 'NY', NY3: 'NY', NY4: 'NY', NYP: 'NY',
  BRO: 'NY', BR1: 'NY', BR2: 'NY', BR3: 'NY', BR4: 'NY', BRP: 'NY', BRF: 'NY',
  NEW: 'NY', ELI: 'NY',

  // Boston / New England
  BOS: 'BOS', BSN: 'BOS', BS1: 'BOS', BS2: 'BOS', BSU: 'BOS', BSP: 'BOS',
  WOR: 'BOS', MID: 'BOS', HR1: 'BOS', HAR: 'BOS', NH1: 'BOS', PRO: 'BOS',

  // Philadelphia
  PHI: 'PHI', PHA: 'PHI', PH1: 'PHI', PH2: 'PHI', PH3: 'PHI', PH4: 'PHI',
  PHN: 'PHI', PHP: 'PHI', PHU: 'PHI', WIL: 'PHI',

  // Chicago
  CHN: 'CHI', CHC: 'CHI', CHA: 'CHI', CHW: 'CHI',
  CH1: 'CHI', CH2: 'CHI', CHF: 'CHI', CHP: 'CHI', CHU: 'CHI', RC1: 'CHI',

  // Washington / Baltimore (metro_dc_baltimore)
  BAL: 'BAL', BLA: 'BAL', BLN: 'BAL', BL1: 'BAL', BL2: 'BAL', BL3: 'BAL', BL4: 'BAL', BLF: 'BAL', BLU: 'BAL',
  WAS: 'WAS', WSN: 'WAS', WS1: 'WAS', WS2: 'WAS', WS3: 'WAS', WS4: 'WAS', WS5: 'WAS', WS6: 'WAS', WS7: 'WAS', WS8: 'WAS', WS9: 'WAS', WSU: 'WAS',

  // Ohio (Cleveland / Cincinnati)
  CLE: 'CLE', CL1: 'CLE', CL2: 'CLE', CL3: 'CLE', CL4: 'CLE', CLP: 'CLE', CL5: 'CLE', CL6: 'CLE',
  CIN: 'CIN', CN1: 'CIN', CN2: 'CIN', CN3: 'CIN', CNU: 'CIN',
  TL1: 'CLE', TL2: 'CLE',

  // Detroit
  DET: 'DET', DTN: 'DET',

  // Bay Area
  SFN: 'BAY', SFG: 'BAY', OAK: 'BAY', ATH: 'BAY',

  // Los Angeles
  LAN: 'LA', LAD: 'LA', LAA: 'LA', CAL: 'LA', ANA: 'LA',

  // Florida
  FLO: 'FLA', MIA: 'FLA', TBA: 'FLA', TBR: 'FLA',

  // Texas
  HOU: 'HOU', TEX: 'DAL',

  // Canada
  TOR: 'TOR', MON: 'MTL',

  // St. Louis
  SLN: 'STL', STL: 'STL', SLA: 'STL', SL1: 'STL', SL2: 'STL', SL3: 'STL', SL4: 'STL', SL5: 'STL', SLF: 'STL', SLU: 'STL',

  // Pittsburgh
  PIT: 'PIT', PT1: 'PIT', PTF: 'PIT', PTP: 'PIT', ALT: 'PIT',

  // Kansas City
  KCA: 'KC', KCR: 'KC', KC1: 'KC', KC2: 'KC', KCF: 'KC', KCN: 'KC', KCU: 'KC',

  // Milwaukee
  MIL: 'MIL', ML1: 'MIL', ML2: 'MIL', ML3: 'MIL', ML4: 'MIL', MLA: 'MIL', MLU: 'MIL',

  // Minnesota
  MIN: 'MIN', SPU: 'MIN',

  // San Diego
  SDN: 'SD', SDP: 'SD',

  // Seattle
  SEA: 'SEA', SE1: 'SEA',

  // Colorado
  COL: 'DEN',

  // Arizona
  ARI: 'PHX',

  // Atlanta
  ATL: 'ATL',

  // Buffalo / Upstate NY
  BFN: 'BUF', BFP: 'BUF', BUF: 'BUF', SR1: 'BUF', SR2: 'BUF', RC2: 'BUF', TRO: 'BUF', TRN: 'BUF',

  // Indianapolis / Indiana
  IND: 'IND', IN1: 'IND', IN2: 'IND', IN3: 'IND', FW1: 'IND',

  // Louisville / Kentucky
  LS1: 'KEN', LS2: 'KEN', LS3: 'KEN',

  // Richmond
  RIC: 'WAS',

  // ==========================================
  // NBA / ABA FRANCHISES & HISTORICAL CODES
  // ==========================================
  NYK: 'NY', BKN: 'NY', NJN: 'NY', NJA: 'NY',
  BOS_NBA: 'BOS',
  CHI_NBA: 'CHI', CHZ: 'CHI', CHP_NBA: 'CHI', TRI: 'CHI',
  LAL: 'LA', LAC: 'LA', SDC: 'SD', BUF_NBA: 'BUF', LAS: 'LA',
  GSW: 'BAY', SFW: 'BAY', PHW: 'PHI',
  PHI_NBA: 'PHI', SYR: 'BUF',
  DET_NBA: 'DET', FTW: 'IND',
  MIA_NBA: 'FLA', ORL: 'FLA',
  DAL_NBA: 'DAL', DLC: 'DAL', HOU_NBA: 'HOU', HSM: 'HOU', SAS: 'SA', TEX_ABA: 'DAL',
  CLE_NBA: 'CLE', CIN_NBA: 'CIN', ROR: 'BUF',
  WAS_NBA: 'WAS', BAL_NBA: 'BAL', CAP: 'WAS', CHS: 'CHI',
  TOR_NBA: 'TOR', VAN_NBA: 'VAN',
  MIL_NBA: 'MIL', MIN_NBA: 'MIN', PHO: 'PHX', PHX_NBA: 'PHX',
  POR: 'POR', SAC: 'SAC', KCK: 'KC', KCO: 'KC', CIN_ROYALS: 'CIN',
  UTA: 'UTA', NOJ: 'NO', NOH: 'NO', NOK: 'NO', NOP: 'NO', NOB: 'NO',
  MEM: 'MEM', VAN_GRIZZLIES: 'VAN', MMF: 'MEM', MMT: 'MEM', MMP: 'MEM', MMS: 'MEM',
  OKC: 'OKC', SEA_NBA: 'SEA',
  DEN_NBA: 'DEN', DNA: 'DEN',
  ATL_NBA: 'ATL', STL_HAWKS: 'STL', MLH: 'MIL',
  CHA_NBA: 'CAR', CHH: 'CAR',
  IND_NBA: 'IND', INA: 'IND',
  SDA: 'SD', SDS: 'SD',
  VIR: 'WAS', CAR_COUGARS: 'CAR',

  // ==========================================
  // NFL / AFL FRANCHISES & HISTORICAL CODES
  // ==========================================
  NYG: 'NY', NYJ: 'NY',
  NE: 'BOS', BOS_NFL: 'BOS',
  CHI_NFL: 'CHI', CRD: 'CHI', CHC_NFL: 'CHI',
  LAR: 'LA', LAC_NFL: 'LA', RAM: 'LA', SD_NFL: 'SD',
  SF: 'BAY', OAK_NFL: 'BAY', RAI: 'BAY', LV: 'LV',
  PHI_NFL: 'PHI',
  DET_NFL: 'DET', POR_NFL: 'DET',
  MIA_NFL: 'FLA', TB: 'FLA', TBL_NFL: 'FLA', JAX: 'FLA',
  DAL_NFL: 'DAL', HOU_NFL: 'HOU', HST: 'HOU', TEX_NFL: 'DAL',
  CLE_NFL: 'CLE', CIN_NFL: 'CIN',
  WAS_NFL: 'WAS', BAL_NFL: 'BAL', BLT: 'BAL',
  BUF_NFL: 'BUF',
  GB: 'GB',
  IND_NFL: 'IND',
  KC_NFL: 'KC',
  DEN_NFL: 'DEN',
  SEA_NFL: 'SEA',
  ARI_NFL: 'PHX', ARZ: 'PHX', PHO_NFL: 'PHX',
  MIN_NFL: 'MIN',
  ATL_NFL: 'ATL',
  CAR_NFL: 'CAR',
  NO_NFL: 'NO',
  PIT_NFL: 'PIT',
  TEN: 'TEN', OTL: 'TEN',

  // ==========================================
  // NHL / WHA FRANCHISES & HISTORICAL CODES
  // ==========================================
  NYR: 'NY', NYI: 'NY', NJD: 'NY',
  BOS_NHL: 'BOS',
  CHI_NHL: 'CHI',
  LAK: 'LA', ANA_NHL: 'LA',
  SJS: 'BAY', OAK_NHL: 'BAY',
  PHI_NHL: 'PHI', QUA: 'PHI',
  DET_NHL: 'DET', DCG: 'DET', DFL: 'DET',
  FLA_NHL: 'FLA', TBL: 'FLA',
  DAL_NHL: 'DAL',
  CBJ: 'CLE', CLE_NHL: 'CLE',
  WSH: 'WAS',
  TOR_NHL: 'TOR', TSP: 'TOR', TAN: 'TOR',
  MTL_NHL: 'MTL', MWN: 'MTL',
  VAN_NHL: 'VAN',
  CGY: 'CGY', CAL_NHL: 'CGY',
  EDM: 'EDM',
  OTT: 'OTT', SEN: 'OTT',
  WPG: 'WPG',
  COL_NHL: 'DEN', CLR: 'DEN',
  VGK: 'LV',
  SEA_NHL: 'SEA',
  ARI_NHL: 'PHX', PHX_NHL: 'PHX',
  MIN_NHL: 'MIN', MNS: 'MIN',
  NSH: 'TEN',
  CAR_NHL: 'CAR', HFD: 'BOS',
  STL_NHL: 'STL',
  PIT_NHL: 'PIT', PIR: 'PIT',
  BUF_NHL: 'BUF',
  UTA_NHL: 'UTA',
  QBD: 'CAN',
};

// Normalized metro code mapping for Category matching
const METRO_TO_CODES: Record<string, string[]> = {
  metro_ny: ['NY'],
  metro_boston: ['BOS'],
  metro_chicago: ['CHI'],
  metro_la: ['LA'],
  metro_bay_area: ['BAY'],
  metro_philly: ['PHI'],
  metro_detroit: ['DET'],
  metro_florida: ['FLA', 'MIA', 'TB'],
  metro_texas: ['DAL', 'HOU', 'SA'],
  metro_ohio: ['CLE', 'CIN'],
  metro_dc_baltimore: ['WAS', 'BAL'],
  metro_canada: ['TOR', 'MTL', 'VAN', 'CAL', 'CGY', 'EDM', 'OTT', 'WPG', 'CAN'],
};

// Text keywords in teamNames that definitively identify the metro area
const METRO_KEYWORDS: Record<string, string[]> = {
  NY: ['new york', 'brooklyn', 'new jersey', 'yankees', 'mets', 'giants', 'jets', 'knicks', 'nets', 'rangers', 'islanders', 'devils'],
  BOS: ['boston', 'new england', 'red sox', 'celtics', 'patriots', 'bruins'],
  CHI: ['chicago', 'cubs', 'white sox', 'bulls', 'bears', 'blackhawks'],
  LA: ['los angeles', 'anaheim', 'dodgers', 'angels', 'lakers', 'clippers', 'rams', 'chargers', 'kings', 'ducks'],
  BAY: ['san francisco', 'oakland', 'golden state', 'san jose', 'giants', 'athletics', 'warriors', '49ers', 'raiders', 'sharks'],
  PHI: ['philadelphia', 'phillies', '76ers', 'sixers', 'eagles', 'flyers'],
  DET: ['detroit', 'tigers', 'pistons', 'lions', 'red wings'],
  FLA: ['florida', 'miami', 'tampa', 'tampa bay', 'orlando', 'jacksonville', 'marlins', 'rays', 'heat', 'magic', 'dolphins', 'buccaneers', 'jaguars', 'panthers', 'lightning'],
  TEX: ['texas', 'dallas', 'houston', 'san antonio', 'rangers', 'astros', 'mavericks', 'rockets', 'spurs', 'cowboys', 'texans', 'stars'],
  OHIO: ['cleveland', 'cincinnati', 'columbus', 'guardians', 'indians', 'reds', 'cavaliers', 'browns', 'bengals', 'blue jackets'],
  DC_BAL: ['washington', 'baltimore', 'nationals', 'orioles', 'wizards', 'bullets', 'commanders', 'redskins', 'ravens', 'capitals'],
  CAN: ['toronto', 'montreal', 'vancouver', 'calgary', 'edmonton', 'ottawa', 'winnipeg', 'blue jays', 'expos', 'raptors', 'maple leafs', 'canadiens', 'canucks', 'flames', 'oilers', 'senators', 'jets'],
};

/**
 * Returns all unique metropolitan market codes for an athlete by dynamically
 * combining pre-computed athlete.markets, team abbreviation mapping, and team name analysis.
 */
export function getMarketsForAthlete(athlete: Athlete): Set<string> {
  const markets = new Set<string>(athlete.markets || []);

  // 1. Resolve all team abbreviations in athlete.teams
  for (const team of athlete.teams || []) {
    const directMarket = MASTER_TEAM_TO_MARKET[team];
    if (directMarket) {
      markets.add(directMarket);
    }
  }

  // 2. Fallback: Scan athlete.teamNames for explicit city/metro indicators
  for (const tName of athlete.teamNames || []) {
    const lower = tName.toLowerCase();
    for (const [metroKey, keywords] of Object.entries(METRO_KEYWORDS)) {
      if (keywords.some((kw) => lower.includes(kw))) {
        if (metroKey === 'OHIO') {
          markets.add('CLE');
          markets.add('CIN');
        } else if (metroKey === 'DC_BAL') {
          markets.add('WAS');
          markets.add('BAL');
        } else if (metroKey === 'TEX') {
          markets.add('DAL');
          markets.add('HOU');
          markets.add('SA');
        } else if (metroKey === 'FLA') {
          markets.add('FLA');
          markets.add('MIA');
          markets.add('TB');
        } else if (metroKey === 'CAN') {
          markets.add('CAN');
          markets.add('TOR');
        } else {
          markets.add(metroKey);
        }
      }
    }
  }

  return markets;
}

/**
 * Checks whether an athlete has ever played in a given metro market (e.g. 'NY', 'BOS').
 * Supports single code or list of synonymous codes (e.g. ['FLA', 'MIA', 'TB']).
 */
export function isAthleteInMarket(athlete: Athlete, targetMarket: string | string[]): boolean {
  const athleteMarkets = getMarketsForAthlete(athlete);
  const targets = Array.isArray(targetMarket) ? targetMarket : [targetMarket];
  return targets.some((t) => athleteMarkets.has(t));
}

/**
 * Checks whether an athlete matches a specific Metro category ID (e.g. 'metro_ny', 'metro_boston').
 */
export function isAthleteInMetroCategory(athlete: Athlete, categoryId: string): boolean {
  const codes = METRO_TO_CODES[categoryId.toLowerCase()];
  if (!codes) return false;
  return isAthleteInMarket(athlete, codes);
}
