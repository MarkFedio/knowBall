import fs from 'fs';
import path from 'path';
import { Athlete } from '../src/types';

// Complete mapping of all historical MLB team codes to metro market codes
const MLB_TEAM_TO_MARKET: Record<string, string> = {
  // New York / New Jersey
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
};

// Complete mapping of historical NBA/ABA teams
const NBA_TEAM_TO_MARKET: Record<string, string> = {
  NJA: 'NY',   // New Jersey Americans (Nets)
  NJN: 'NY',   // New Jersey Nets
  BKN: 'NY',   // Brooklyn Nets
  NYK: 'NY',   // New York Knicks
  LAS: 'LA',   // Los Angeles Stars
  HSM: 'HOU',  // Houston Mavericks (Texas)
  DLC: 'DAL',  // Dallas Chaparrals (Texas)
  TRI: 'CHI',  // Tri-Cities Blackhawks
  SDA: 'SD',   // San Diego Conquistadors / Sails
  SDS: 'SD',
  NOB: 'NO',   // New Orleans Buccaneers
  MMF: 'MEM',  // Memphis Sounds
  MMT: 'MEM',  // Memphis Tams
  MMP: 'MEM',  // Memphis Pros
  MMS: 'MEM',  // Memphis Sounds
};

// Complete mapping of historical NHL teams
const NHL_TEAM_TO_MARKET: Record<string, string> = {
  CLE: 'CLE',  // Cleveland Barons (Ohio)
  QUA: 'PHI',  // Philadelphia Quakers (Philadelphia)
  DCG: 'DET',  // Detroit Cougars (Detroit)
  DFL: 'DET',  // Detroit Falcons (Detroit)
  TSP: 'TOR',  // Toronto St. Patricks (Canada)
  TAN: 'TOR',  // Toronto Arenas (Canada)
  PIR: 'PIT',  // Pittsburgh Pirates (Pittsburgh)
  MWN: 'MTL',  // Montreal Wanderers (Canada)
  QBD: 'CAN',  // Quebec Bulldogs (Canada)
};

// NFL MVPs missing mvpMarkets
const NFL_MVP_MARKET_FIXES: Record<string, string[]> = {
  ath_nfl_unitas_johnny: ['BAL'],       // Johnny Unitas: 1959, 1964, 1967 Baltimore Colts
  ath_nfl_starr_bart: ['GB', 'MIL'],    // Bart Starr: 1966 Green Bay Packers
  ath_nfl_tittle_ya: ['NY'],            // Y.A. Tittle: 1963 New York Giants
  ath_nfl_graham_otto: ['CLE'],         // Otto Graham: 1951, 1953, 1955 Cleveland Browns
  ath_nfl_vanbrocklin_norm: ['PHI'],    // Norm Van Brocklin: 1960 Philadelphia Eagles
  ath_nfl_brodie_john: ['BAY'],         // John Brodie: 1970 San Francisco 49ers
  ath_nfl_kemp_jack: ['BUF', 'NY'],     // Jack Kemp: 1965 Buffalo Bills (AFL MVP)
};

function fixDatasetMarkets(
  filePath: string,
  mapping: Record<string, string>,
  sportName: string
) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const athletes: Athlete[] = JSON.parse(raw);
  let updatedCount = 0;
  let addedMarketsTotal = 0;

  for (const a of athletes) {
    if (!a.markets) a.markets = [];
    const marketSet = new Set(a.markets);
    const initialSize = marketSet.size;

    for (const t of a.teams || []) {
      const m = mapping[t];
      if (m) {
        marketSet.add(m);
      }
    }

    if (marketSet.size > initialSize) {
      a.markets = Array.from(marketSet).sort();
      updatedCount++;
      addedMarketsTotal += (marketSet.size - initialSize);
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(athletes, null, 2), 'utf-8');
  console.log(`[${sportName}] Updated ${updatedCount} athletes with ${addedMarketsTotal} added market associations.`);
}

function fixNflMvpMarkets(filePath: string) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const athletes: Athlete[] = JSON.parse(raw);
  let updatedCount = 0;

  for (const a of athletes) {
    const fix = NFL_MVP_MARKET_FIXES[a.id];
    if (fix) {
      a.mvpMarkets = fix;
      updatedCount++;
      console.log(`  Credited ${a.name} (${a.id}) with mvpMarkets:`, fix);
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(athletes, null, 2), 'utf-8');
  console.log(`[NFL] Updated ${updatedCount} MVP legends with verified mvpMarkets.`);
}

export function main() {
  console.log('======================================================');
  console.log('  FIXING UNMAPPED HISTORICAL FRANCHISE MARKETS');
  console.log('======================================================\n');

  const mlbPath = path.join(process.cwd(), 'src', 'data', 'athletes-mlb.json');
  const nbaPath = path.join(process.cwd(), 'src', 'data', 'athletes-nba.json');
  const nhlPath = path.join(process.cwd(), 'src', 'data', 'athletes-nhl.json');
  const nflPath = path.join(process.cwd(), 'src', 'data', 'athletes-nfl.json');

  fixDatasetMarkets(mlbPath, MLB_TEAM_TO_MARKET, 'MLB');
  fixDatasetMarkets(nbaPath, NBA_TEAM_TO_MARKET, 'NBA');
  fixDatasetMarkets(nhlPath, NHL_TEAM_TO_MARKET, 'NHL');
  fixNflMvpMarkets(nflPath);
}

main();
