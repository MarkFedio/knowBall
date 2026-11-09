import fs from 'fs';
import path from 'path';

// -------------------------------------------------------------
// 1. NBA CHAMPIONS & MARKETS (NBA + ABA)
// -------------------------------------------------------------
const NBA_CHAMPIONS: Record<number, string[]> = {
  1947: ['PHW'], 1948: ['BLB'], 1949: ['MNL'], 1950: ['MNL'],
  1951: ['ROC'], 1952: ['MNL'], 1953: ['MNL'], 1954: ['MNL'], 1955: ['SYR'],
  1956: ['PHW'], 1957: ['BOS'], 1958: ['STL'], 1959: ['BOS'], 1960: ['BOS'],
  1961: ['BOS'], 1962: ['BOS'], 1963: ['BOS'], 1964: ['BOS'], 1965: ['BOS'],
  1966: ['BOS'], 1967: ['PHI'], 1968: ['BOS', 'PIT', 'PTP'], 1969: ['BOS', 'OAK'], 1970: ['NYK', 'IND', 'INA'],
  1971: ['MIL', 'UTA'], 1972: ['LAL', 'IND', 'INA'], 1973: ['NYK', 'IND', 'INA'], 1974: ['BOS', 'NYA'], 1975: ['GSW', 'KEN'],
  1976: ['BOS', 'NYA'], 1977: ['POR'], 1978: ['WSB'], 1979: ['SEA'], 1980: ['LAL'],
  1981: ['BOS'], 1982: ['LAL'], 1983: ['PHI'], 1984: ['BOS'], 1985: ['LAL'],
  1986: ['BOS'], 1987: ['LAL'], 1988: ['LAL'], 1989: ['DET'], 1990: ['DET'],
  1991: ['CHI'], 1992: ['CHI'], 1993: ['CHI'], 1994: ['HOU'], 1995: ['HOU'],
  1996: ['CHI'], 1997: ['CHI'], 1998: ['CHI'], 1999: ['SAS'], 2000: ['LAL'],
  2001: ['LAL'], 2002: ['LAL'], 2003: ['SAS'], 2004: ['DET'], 2005: ['SAS'],
  2006: ['MIA'], 2007: ['SAS'], 2008: ['BOS'], 2009: ['LAL'], 2010: ['LAL'],
  2011: ['DAL'], 2012: ['MIA'], 2013: ['MIA'], 2014: ['SAS'], 2015: ['GSW'],
  2016: ['CLE'], 2017: ['GSW'], 2018: ['GSW'], 2019: ['TOR'], 2020: ['LAL'],
  2021: ['MIL'], 2022: ['GSW'], 2023: ['DEN'], 2024: ['BOS'], 2025: ['BOS'], 2026: ['NYK'],
};

const NBA_MARKETS: Record<string, string> = {
  BOS: 'BOS', NYK: 'NY', BRK: 'NY', BKN: 'NY', NJN: 'NY', NYA: 'NY', NYN: 'NY',
  CHI: 'CHI', CHS: 'CHI', CHP: 'CHI', CHZ: 'CHI',
  LAL: 'LA', LAC: 'LA', SDC: 'LA', BUF: 'LA', ANA: 'LA',
  GSW: 'BAY', SFW: 'BAY', OAK: 'BAY',
  PHI: 'PHI', PHW: 'PHI', SYR: 'PHI',
  DET: 'DET', FTW: 'DET', DTF: 'DET',
  MIA: 'FLA', FLO: 'FLA', ORL: 'FLA',
  DAL: 'DAL', TEX: 'DAL', HOU: 'HOU', SDR: 'HOU',
  SAS: 'SA', SAA: 'SA',
  TOR: 'TOR', TRH: 'TOR',
  PHX: 'PHX', PHO: 'PHX',
  DEN: 'DEN', DNA: 'DEN', DNR: 'DEN', DNN: 'DEN',
  MIL: 'MIL', MLH: 'MIL',
  ATL: 'ATL', STL: 'ATL', STB: 'STL', SSL: 'STL',
  CLE: 'CLE', IND: 'IND', INA: 'IND',
  POR: 'POR', SAC: 'SAC', KCK: 'SAC', KCO: 'SAC', CIN: 'SAC', ROR: 'SAC', ROC: 'SAC',
  WAS: 'WAS', WSB: 'WAS', CAP: 'WAS', BAL: 'WAS',
  MIN: 'MIN', MEM: 'MEM', VAN: 'MEM', NOP: 'NO', NOH: 'NO', NOK: 'NO',
  CHA: 'CHA', CHH: 'CHA', CHO: 'CHA', OKC: 'OKC', SEA: 'SEA',
  UTA: 'UTA', NOJ: 'UTA',
  KEN: 'KEN', PIT: 'PIT', PTP: 'PIT', CAR: 'CAR', VIR: 'VIR', MNL: 'MIN', BLB: 'WAS',
};

// -------------------------------------------------------------
// 2. MLB MARKETS
// -------------------------------------------------------------
const MLB_MARKETS: Record<string, string> = {
  NYA: 'NY', NYY: 'NY', NYN: 'NY', NYM: 'NY', BRO: 'NY', NYG: 'NY', NY1: 'NY',
  BOS: 'BOS', BSN: 'BOS', CHN: 'CHI', CHC: 'CHI', CHA: 'CHI', CHW: 'CHI',
  LAN: 'LA', LAD: 'LA', LAA: 'LA', ANA: 'LA', CAL: 'LA',
  SFN: 'BAY', SFG: 'BAY', OAK: 'BAY', ATH: 'BAY', PHA: 'PHI', PHI: 'PHI',
  DET: 'DET', DTN: 'DET', HOU: 'HOU', TEX: 'DAL', TOR: 'TOR', BAL: 'BAL',
  WAS: 'WAS', WSN: 'WAS', MON: 'WAS', WS1: 'WAS', ATL: 'ATL', MLN: 'ATL',
  ML1: 'MIL', MIL: 'MIL', ML4: 'MIL',
  SLN: 'STL', STL: 'STL', SL4: 'STL', SLA: 'STL',
  PIT: 'PIT', CIN: 'CIN', CLE: 'CLE',
  MIN: 'MIN', FLO: 'FLA', MIA: 'FLA', TBA: 'FLA', TBR: 'FLA',
  SDN: 'SD', SDP: 'SD', COL: 'DEN', KCA: 'KC', KCR: 'KC',
  ARI: 'PHX', SEA: 'SEA', PRO: 'BOS',
};

// Modern MLB champions (2022-2024 not in older Lahman cuts)
const MLB_RECENT_CHAMPS: Record<string, string[]> = {
  // 2022 Houston Astros -> HOU
  HOU_2022: [
    'ath_mlb_altuvjo01', 'ath_mlb_bregmal01', 'ath_mlb_alvaryo01', 'ath_mlb_tuckeky01',
    'ath_mlb_penaje01', 'ath_mlb_mccorch01', 'ath_mlb_maldoma01', 'ath_mlb_vazquch01',
    'ath_mlb_gurriyu01', 'ath_mlb_diazal01', 'ath_mlb_dubonma01', 'ath_mlb_henslda01',
    'ath_mlb_mancitr01', 'ath_mlb_verlaju01', 'ath_mlb_valdefr01', 'ath_mlb_javiecr01',
    'ath_mlb_mcculla02', 'ath_mlb_abreubr01', 'ath_mlb_montura01', 'ath_mlb_pressry01',
    'ath_mlb_stanery01', 'ath_mlb_nerishe01', 'ath_mlb_brownhu01', 'ath_mlb_garcilu05',
    'ath_mlb_urquijo01',
  ],
  // 2023 Texas Rangers -> DAL
  DAL_2023: [
    'ath_mlb_seagely01', 'ath_mlb_semiema01', 'ath_mlb_garciad02', 'ath_mlb_carteev01',
    'ath_mlb_jungjo01', 'ath_mlb_heimjo01', 'ath_mlb_lowena01', 'ath_mlb_taverle01',
    'ath_mlb_garvemi01', 'ath_mlb_jankotr01', 'ath_mlb_smithjo10', 'ath_mlb_hedgeau01',
    'ath_mlb_eovalna01', 'ath_mlb_montgjo01', 'ath_mlb_heanean01', 'ath_mlb_dunnida01',
    'ath_mlb_bradall01', 'ath_mlb_leclejo01', 'ath_mlb_sborzjo01', 'ath_mlb_chapmar01',
    'ath_mlb_stratch01', 'ath_mlb_perezma02', 'ath_mlb_burkbr01', 'ath_mlb_duraez01',
    'ath_mlb_grossro01',
  ],
  // 2024 Los Angeles Dodgers -> LA
  LA_2024: [
    'ath_mlb_ohtansh01', 'ath_mlb_freemfr01', 'ath_mlb_bettsmo01', 'ath_mlb_hernate01',
    'ath_mlb_edmanto01', 'ath_mlb_muncima01', 'ath_mlb_smithwi05', 'ath_mlb_luxga01',
    'ath_mlb_hernaen02', 'ath_mlb_rojasmi01', 'ath_mlb_tayloch01', 'ath_mlb_barneau01',
    'ath_mlb_pagesan01', 'ath_mlb_yamamy01', 'ath_mlb_flaheja01', 'ath_mlb_buehlwa01',
    'ath_mlb_bandaan01', 'ath_mlb_vesiaal01', 'ath_mlb_kopecmi01', 'ath_mlb_treinbl01',
    'ath_mlb_hudsoda01', 'ath_mlb_brasiry01', 'ath_mlb_honeybr01', 'ath_mlb_knackla01',
    'ath_mlb_caspabe01', 'ath_mlb_henried01', 'ath_mlb_wroblju01', 'ath_mlb_glasnty01',
  ],
};

const MLB_MANUAL_MVPS: Record<string, string[]> = {
  ath_mlb_judgeaa01: ['NY'],          // Aaron Judge (2022, 2024 NYY)
  ath_mlb_ohtansh01: ['LA'],          // Shohei Ohtani (2021, 2023 LAA; 2024 LAD)
  ath_mlb_live_660670: ['ATL'],       // Ronald Acuña Jr. (2023 ATL)
  ath_mlb_acunaro01: ['ATL'],         // Ronald Acuna
  ath_mlb_goldspa01: ['STL'],         // Paul Goldschmidt (2022 STL)
  ath_mlb_live_547989: ['CHI'],       // José Abreu (2020 CWS)
  ath_mlb_abreuor01: ['CHI'],
  ath_mlb_aaronha01: ['MIL'],         // Hank Aaron (1957 Milwaukee Braves)
  ath_mlb_hubbeca01: ['NY'],          // Carl Hubbell (1933, 1936 New York Giants)
  ath_mlb_johnswa01: ['WAS'],         // Walter Johnson (1913, 1924 Washington Senators)
  ath_mlb_peckiro01: ['WAS'],         // Roger Peckinpaugh (1925 Washington Senators)
  ath_mlb_sislege01: ['STL'],         // George Sisler (1922 St. Louis Browns)
  ath_mlb_doylela01: ['NY'],          // Larry Doyle (1912 New York Giants)
};

// Players erroneously given championships: 1 in MLB who never won a World Series
const MLB_FALSE_CHAMPIONS = new Set([
  'ath_mlb_ashbyaa01', 'ath_mlb_bauerja01', 'ath_mlb_live_694192', 'ath_mlb_live_686617',
  'ath_mlb_live_668930', 'ath_mlb_live_682842', 'ath_mlb_live_688107', 'ath_mlb_live_669003',
  'ath_mlb_woodrbr01', 'ath_mlb_yelicch01', 'ath_mlb_megiltr01', 'ath_mlb_romerjo02',
  'ath_mlb_senzaan01', 'ath_mlb_vaughan01', 'ath_mlb_halldl01', 'ath_mlb_ortizjo01',
  'ath_mlb_hamilda03', 'ath_mlb_harriky01', 'ath_mlb_sanchga02', 'ath_mlb_rortvbe01',
  'ath_mlb_callal01', 'ath_mlb_snellbl01', 'ath_mlb_live_680777', 'ath_mlb_live_676475',
  'ath_mlb_live_687922', 'ath_mlb_live_694973', 'ath_mlb_live_683068', 'ath_mlb_live_694212',
  'ath_mlb_live_695503', 'ath_mlb_live_701538', 'ath_mlb_live_669203', 'ath_mlb_live_696100',
  'ath_mlb_live_682626',
]);

// -------------------------------------------------------------
// 3. NFL MARKETS & SUPER BOWL WINNERS
// -------------------------------------------------------------
const SUPER_BOWL_WINNERS: Record<number, string[]> = {
  1966: ['GB'], 1967: ['GB'], 1968: ['NYJ'], 1969: ['KC'], 1970: ['BAL', 'IND'],
  1971: ['DAL'], 1972: ['MIA'], 1973: ['MIA'], 1974: ['PIT'], 1975: ['PIT'],
  1976: ['OAK', 'LV'], 1977: ['DAL'], 1978: ['PIT'], 1979: ['PIT'], 1980: ['OAK', 'LV'],
  1981: ['SF'], 1982: ['WAS'], 1983: ['LA', 'RAI', 'OAK', 'LV'], 1984: ['SF'], 1985: ['CHI'],
  1986: ['NYG'], 1987: ['WAS'], 1988: ['SF'], 1989: ['SF'], 1990: ['NYG'],
  1991: ['WAS'], 1992: ['DAL'], 1993: ['DAL'], 1994: ['SF'], 1995: ['DAL'],
  1996: ['GB'], 1997: ['DEN'], 1998: ['DEN'], 1999: ['STL', 'RAM', 'LAR', 'LA'], 2000: ['BAL'],
  2001: ['NE', 'NWE'], 2002: ['TB'], 2003: ['NE', 'NWE'], 2004: ['NE', 'NWE'], 2005: ['PIT'],
  2006: ['IND'], 2007: ['NYG'], 2008: ['PIT'], 2009: ['NO'], 2010: ['GB'],
  2011: ['NYG'], 2012: ['BAL'], 2013: ['SEA'], 2014: ['NE', 'NWE'], 2015: ['DEN'],
  2016: ['NE', 'NWE'], 2017: ['PHI'], 2018: ['NE', 'NWE'], 2019: ['KC'], 2020: ['TB'],
  2021: ['LAR', 'LA'], 2022: ['KC'], 2023: ['KC'], 2024: ['KC'], 2025: ['PHI', 'KC'],
};

const NFL_MARKETS: Record<string, string> = {
  NYG: 'NY', NYJ: 'NY', BUF: 'NY', NE: 'BOS', NWE: 'BOS',
  CHI: 'CHI', LAR: 'LA', LAC: 'LA', LA: 'LA', RAM: 'LA', RAI: 'LA',
  SF: 'BAY', OAK: 'BAY', LV: 'BAY', PHI: 'PHI', DET: 'DET',
  MIA: 'FLA', TB: 'FLA', JAX: 'FLA', DAL: 'DAL', HOU: 'HOU',
  CLE: 'CLE', CLV: 'CLE', CIN: 'CIN', WAS: 'WAS', BAL: 'BAL', PIT: 'PIT',
  GB: 'GB', KC: 'KC', DEN: 'DEN', IND: 'IND', NO: 'NO', SEA: 'SEA',
  ARI: 'PHX', PHX: 'PHX', ATL: 'ATL', CAR: 'CAR', MIN: 'MIN',
  TEN: 'TEN', OTL: 'TEN', STL: 'STL', SD: 'SD',
};

const NFL_MVP_MARKETS: Record<string, string> = {
  'otto graham': 'CLE',
  'jack kemp': 'NY',
  'jim brown': 'CLE',
  'johnny unitas': 'BAL',
  'norm van brocklin': 'PHI',
  'paul hornung': 'GB',
  'jim taylor': 'GB',
  'y.a. tittle': 'NY',
  'bart starr': 'GB',
  'earl morrall': 'BAL',
  'roman gabriel': 'LA',
  'john brodie': 'BAY',
  'alan page': 'MIN',
  'larry brown': 'WAS',
  'o.j. simpson': 'NY',
  'ken stabler': 'BAY',
  'fran tarkenton': 'MIN',
  'bert jones': 'BAL',
  'walter payton': 'CHI',
  'terry bradshaw': 'PIT',
  'earl campbell': 'HOU',
  'brian sipe': 'CLE',
  'ken anderson': 'CIN',
  'mark moseley': 'WAS',
  'joe theismann': 'WAS',
  'dan marino': 'FLA',
  'marcus allen': 'LA',
  'lawrence taylor': 'NY',
  'john elway': 'DEN',
  'boomer esiason': 'CIN',
  'joe montana': 'BAY',
  'thurman thomas': 'NY',
  'steve young': 'BAY',
  'emmitt smith': 'DAL',
  'brett favre': 'MIL',
  'barry sanders': 'DET',
  'terrell davis': 'DEN',
  'kurt warner': 'STL',
  'marshall faulk': 'STL',
  'rich gannon': 'BAY',
  'peyton manning': 'IND',
  'steve mcnair': 'TEN',
  'shaun alexander': 'SEA',
  'ladainian tomlinson': 'SD',
  'tom brady': 'BOS',
  'aaron rodgers': 'MIL',
  'adrian peterson': 'MIN',
  'cam newton': 'CAR',
  'matt ryan': 'ATL',
  'patrick mahomes': 'KC',
  'lamar jackson': 'BAL',
};

// -------------------------------------------------------------
// 4. NHL MARKETS & STANLEY CUPS
// -------------------------------------------------------------
const STANLEY_CUPS: Record<number, string[]> = {
  1918: ['TAN', 'TOR'], 1920: ['SEN'], 1921: ['SEN'], 1922: ['TSP', 'TOR'],
  1923: ['SEN'], 1924: ['MTL'], 1926: ['MMR'], 1927: ['SEN'],
  1928: ['NYR'], 1929: ['BOS'], 1930: ['MTL'], 1931: ['MTL'], 1932: ['TOR'],
  1933: ['NYR'], 1934: ['CHI'], 1935: ['MMR'], 1936: ['DET'], 1937: ['DET'],
  1938: ['CHI'], 1939: ['BOS'], 1940: ['NYR'], 1941: ['BOS'], 1942: ['TOR'],
  1943: ['DET'], 1944: ['MTL'], 1945: ['TOR'], 1946: ['MTL'], 1947: ['TOR'],
  1948: ['TOR'], 1949: ['TOR'], 1950: ['DET'], 1951: ['TOR'], 1952: ['DET'],
  1953: ['MTL'], 1954: ['DET'], 1955: ['DET'], 1956: ['MTL'], 1957: ['MTL'],
  1958: ['MTL'], 1959: ['MTL'], 1960: ['MTL'], 1961: ['CHI'], 1962: ['TOR'],
  1963: ['TOR'], 1964: ['TOR'], 1965: ['MTL'], 1966: ['MTL'], 1967: ['TOR'],
  1968: ['MTL'], 1969: ['MTL'], 1970: ['BOS'], 1971: ['MTL'], 1972: ['BOS'],
  1973: ['MTL'], 1974: ['PHI'], 1975: ['PHI'], 1976: ['MTL'], 1977: ['MTL'],
  1978: ['MTL'], 1979: ['MTL'], 1980: ['NYI'], 1981: ['NYI'], 1982: ['NYI'],
  1983: ['NYI'], 1984: ['EDM'], 1985: ['EDM'], 1986: ['MTL'], 1987: ['EDM'],
  1988: ['EDM'], 1989: ['CGY'], 1990: ['EDM'], 1991: ['PIT'], 1992: ['PIT'],
  1993: ['MTL'], 1994: ['NYR'], 1995: ['NJD'], 1996: ['COL'], 1997: ['DET'],
  1998: ['DET'], 1999: ['DAL'], 2000: ['NJD'], 2001: ['COL'], 2002: ['DET'],
  2003: ['NJD'], 2004: ['TBL'], 2006: ['CAR'], 2007: ['ANA'], 2008: ['DET'],
  2009: ['PIT'], 2010: ['CHI'], 2011: ['BOS'], 2012: ['LAK'], 2013: ['CHI'],
  2014: ['LAK'], 2015: ['CHI'], 2016: ['PIT'], 2017: ['PIT'], 2018: ['WSH'],
  2019: ['STL'], 2020: ['TBL'], 2021: ['TBL'], 2022: ['COL'], 2023: ['VGK'],
  2024: ['FLA'], 2025: ['FLA'],
};

const NHL_MARKETS: Record<string, string> = {
  NYR: 'NY', NYI: 'NY', NJD: 'NY', NYA: 'NY', BOS: 'BOS', CHI: 'CHI',
  LAK: 'LA', ANA: 'LA', SJS: 'BAY', PHI: 'PHI', DET: 'DET', DFL: 'DET', DCG: 'DET',
  TBL: 'FLA', FLA: 'FLA', DAL: 'DAL', TOR: 'TOR', TAN: 'TOR', TSP: 'TOR',
  MTL: 'CAN', EDM: 'CAN', CGY: 'CAN', SEN: 'CAN', MMR: 'CAN', HAM: 'CAN',
  WSH: 'WAS', PIT: 'PIT', PIR: 'PIT', COL: 'DEN', CAR: 'CAR', STL: 'STL',
  VGK: 'VGK', WPG: 'CAN', OTT: 'CAN', VAN: 'CAN', BUF: 'NY',
  MIN: 'MIN', CBJ: 'OHIO', NSH: 'TEN',
};

const NHL_MVP_MARKETS: Record<string, string[]> = {
  'wayne gretzky': ['CAN', 'LA'],
  'mario lemieux': ['PIT'],
  'bobby orr': ['BOS'],
  'gordie howe': ['DET'],
  'eddie shore': ['BOS'],
  'bobby clarke': ['PHI'],
  'alexander ovechkin': ['WAS'],
  'alex ovechkin': ['WAS'],
  'connor mcdavid': ['CAN'],
  'howie morenz': ['CAN'],
  'dominik hasek': ['NY'],
  'sidney crosby': ['PIT'],
  'mark messier': ['CAN', 'NY'],
  'phil esposito': ['BOS'],
  'stan mikita': ['CHI'],
  'bobby hull': ['CHI'],
  'jean beliveau': ['CAN'],
  'bill cowley': ['BOS'],
  'nels stewart': ['CAN'],
  'evgeni malkin': ['PIT'],
  'sergei fedorov': ['DET'],
  'eric lindros': ['PHI'],
  'jaromir jagr': ['PIT'],
  'chris pronger': ['STL'],
  'joe sakic': ['DEN'],
  'peter forsberg': ['DEN'],
  'martin st. louis': ['FLA'],
  'joe thornton': ['BOS', 'BAY'],
  'henrik sedin': ['CAN'],
  'corey perry': ['LA'],
  'patrick kane': ['CHI'],
  'taylor hall': ['NY'],
  'nikita kucherov': ['FLA'],
  'leon draisaitl': ['CAN'],
  'auston matthews': ['TOR', 'CAN'],
  'nathan mackinnon': ['DEN'],
  'carey price': ['CAN'],
  'jose theodore': ['CAN'],
  'brett hull': ['STL'],
  'max bentley': ['CHI'],
  'frank boucher': ['NY'],
  'billy burch': ['CAN'],
  'herb gardiner': ['CAN'],
  'ebbie goodfellow': ['DET'],
  'babe pratt': ['TOR', 'CAN'],
  'maurice richard': ['CAN'],
  'paul thompson': ['CHI'],
  'roy worters': ['NY'],
  'al rollins': ['CHI'],
  'jacques plante': ['CAN'],
  'frank brimsek': ['BOS'],
};

async function main() {
  console.log('=== Comprehensive Athlete Championship & MVP Markets Enrichment ===');

  // -------------------------------------------------------------
  // 1. Process MLB
  // -------------------------------------------------------------
  console.log('\n--- Processing MLB ---');
  const mlbTeamsCsv = fs.readFileSync('.cache/mlb/teams.csv', 'utf-8').split('\n');
  const mlbTeamsHeaders = mlbTeamsCsv[0].split(',');
  const tIdIdx = mlbTeamsHeaders.indexOf('teamID');
  const yIdIdx = mlbTeamsHeaders.indexOf('yearID');
  const wsIdx = mlbTeamsHeaders.indexOf('WSWin');
  const wsWinners = new Set<string>();
  for (let i = 1; i < mlbTeamsCsv.length; i++) {
    const parts = mlbTeamsCsv[i].split(',');
    if (parts[wsIdx] === 'Y') wsWinners.add(`${parts[tIdIdx]}-${parts[yIdIdx]}`);
  }

  const mlbAppsCsv = fs.readFileSync('.cache/mlb/appearances.csv', 'utf-8').split('\n');
  const mlbAppMap = new Map<string, string>();
  const mlbChampsByPlayer = new Map<string, Set<string>>();

  for (let i = 1; i < mlbAppsCsv.length; i++) {
    const parts = mlbAppsCsv[i].split(',');
    if (parts.length >= 4) {
      const year = parts[0];
      const team = parts[1];
      const pId = parts[3];
      mlbAppMap.set(`${pId}-${year}`, team);

      if (wsWinners.has(`${team}-${year}`)) {
        const set = mlbChampsByPlayer.get(pId) || new Set();
        const market = MLB_MARKETS[team];
        if (market) set.add(market);
        mlbChampsByPlayer.set(pId, set);
      }
    }
  }

  // Process MLB recent champions (2022 HOU, 2023 DAL, 2024 LA)
  for (const [key, playerIds] of Object.entries(MLB_RECENT_CHAMPS)) {
    const market = key.split('_')[0];
    for (const rawId of playerIds) {
      const idClean = rawId.replace('ath_mlb_', '');
      const set = mlbChampsByPlayer.get(idClean) || new Set();
      set.add(market);
      mlbChampsByPlayer.set(idClean, set);
    }
  }

  // Process MLB MVPs
  const mlbAwardsCsv = fs.readFileSync('.cache/mlb/awards.csv', 'utf-8').split('\n');
  const mlbMvpByPlayer = new Map<string, Set<string>>();
  for (let i = 1; i < mlbAwardsCsv.length; i++) {
    const parts = mlbAwardsCsv[i].split(',');
    if (parts[1] === 'Most Valuable Player') {
      const pId = parts[0];
      const year = parts[2];
      const team = mlbAppMap.get(`${pId}-${year}`);
      if (team) {
        const market = MLB_MARKETS[team];
        const set = mlbMvpByPlayer.get(pId) || new Set();
        if (market) set.add(market);
        mlbMvpByPlayer.set(pId, set);
      }
    }
  }

  const mlbFile = 'src/data/athletes-mlb.json';
  const mlbAthletes = JSON.parse(fs.readFileSync(mlbFile, 'utf-8'));
  let mlbChampsUpdated = 0;
  let mlbMvpsUpdated = 0;

  mlbAthletes.forEach((a: any) => {
    // Correct false positive champions
    if (MLB_FALSE_CHAMPIONS.has(a.id)) {
      a.championships = 0;
      a.championshipMarkets = [];
      return;
    }

    const rawId = a.id.replace('ath_mlb_', '');
    const champSet = mlbChampsByPlayer.get(rawId);
    if (champSet && champSet.size > 0) {
      a.championshipMarkets = Array.from(champSet);
      mlbChampsUpdated++;
    } else if (a.championships > 0 && (!a.championshipMarkets || a.championshipMarkets.length === 0)) {
      // If player still has champ count but was on a champ team from their teams array
      for (const t of a.teams) {
        const m = MLB_MARKETS[t];
        if (m) {
          a.championshipMarkets = [m];
          break;
        }
      }
    }

    // MVPs
    const mvpSet = mlbMvpByPlayer.get(rawId);
    const manualMvps = MLB_MANUAL_MVPS[a.id];
    if (manualMvps) {
      a.mvpMarkets = manualMvps;
      mlbMvpsUpdated++;
    } else if (mvpSet && mvpSet.size > 0) {
      a.mvpMarkets = Array.from(mvpSet);
      mlbMvpsUpdated++;
    }
  });

  fs.writeFileSync(mlbFile, JSON.stringify(mlbAthletes, null, 2), 'utf-8');
  console.log(`Updated MLB: ${mlbChampsUpdated} champions with markets, ${mlbMvpsUpdated} MVPs with markets.`);

  // -------------------------------------------------------------
  // 2. Process NBA
  // -------------------------------------------------------------
  console.log('\n--- Processing NBA ---');
  const nbaTotals = fs.readFileSync('.cache/nba/totals.csv', 'utf-8').split('\n');
  const nbaTeamMap = new Map<string, string>();
  const nbaChampsByPlayer = new Map<string, Set<string>>();

  for (let i = 1; i < nbaTotals.length; i++) {
    const line = nbaTotals[i];
    if (!line) continue;
    const parts = line.split(',');
    const pId = parts[3];
    const s = parseInt(parts[0], 10);
    const team = parts[5];
    if (!pId || !s || !team) continue;
    nbaTeamMap.set(`${pId}-${s}`, team);

    const champs = NBA_CHAMPIONS[s];
    if (champs && champs.includes(team)) {
      const set = nbaChampsByPlayer.get(pId) || new Set();
      const market = NBA_MARKETS[team];
      if (market) set.add(market);
      nbaChampsByPlayer.set(pId, set);
    }
  }

  // NBA & ABA MVPs
  const nbaAwards = fs.readFileSync('.cache/nba/awards.csv', 'utf-8').split('\n');
  const nbaMvpByPlayer = new Map<string, Set<string>>();
  for (let i = 1; i < nbaAwards.length; i++) {
    const parts = nbaAwards[i].split(',');
    const award = parts[1]?.toLowerCase();
    const winner = parts[9];
    if (award && (award === 'nba mvp' || award === 'aba mvp' || award === 'most valuable player') && winner === 'TRUE') {
      const pId = parts[3];
      const s = parseInt(parts[0], 10);
      const team = nbaTeamMap.get(`${pId}-${s}`);
      if (team) {
        const market = NBA_MARKETS[team];
        const set = nbaMvpByPlayer.get(pId) || new Set();
        if (market) set.add(market);
        nbaMvpByPlayer.set(pId, set);
      }
    }
  }

  const nbaFile = 'src/data/athletes-nba.json';
  const nbaAthletes = JSON.parse(fs.readFileSync(nbaFile, 'utf-8'));
  let nbaChampsUpdated = 0;
  let nbaMvpsUpdated = 0;

  nbaAthletes.forEach((a: any) => {
    const rawId = a.id.replace('ath_nba_', '');
    const champSet = nbaChampsByPlayer.get(rawId);
    if (champSet && champSet.size > 0) {
      a.championshipMarkets = Array.from(champSet);
      nbaChampsUpdated++;
    }

    const mvpSet = nbaMvpByPlayer.get(rawId);
    if (mvpSet && mvpSet.size > 0) {
      a.mvpMarkets = Array.from(mvpSet);
      nbaMvpsUpdated++;
    }
  });

  fs.writeFileSync(nbaFile, JSON.stringify(nbaAthletes, null, 2), 'utf-8');
  console.log(`Updated NBA: ${nbaChampsUpdated} champions with markets, ${nbaMvpsUpdated} MVPs with markets.`);

  // -------------------------------------------------------------
  // 3. Process NFL
  // -------------------------------------------------------------
  console.log('\n--- Processing NFL ---');
  const nflChampsByPlayer = new Map<string, Set<string>>();
  for (let year = 1966; year <= 2024; year++) {
    const file = `.cache/nfl/roster_${year}.csv`;
    if (!fs.existsSync(file)) continue;
    const lines = fs.readFileSync(file, 'utf-8').split('\n');
    const headers = lines[0].split(',');
    const teamIdx = headers.indexOf('team');
    const pfrIdx = headers.indexOf('pfr_id');
    const gsisIdx = headers.indexOf('gsis_id');
    const nameIdx = headers.indexOf('full_name');
    const champs = SUPER_BOWL_WINNERS[year] || [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      const parts = line.split(',');
      const team = parts[teamIdx]?.trim();
      if (champs.includes(team)) {
        const keys = [parts[gsisIdx], parts[pfrIdx], parts[nameIdx]?.toLowerCase()].filter(Boolean);
        const market = NFL_MARKETS[team];
        for (const k of keys) {
          const set = nflChampsByPlayer.get(k) || new Set();
          if (market) set.add(market);
          nflChampsByPlayer.set(k, set);
        }
      }
    }
  }

  const nflFile = 'src/data/athletes-nfl.json';
  const nflAthletes = JSON.parse(fs.readFileSync(nflFile, 'utf-8'));
  let nflChampsUpdated = 0;

  nflAthletes.forEach((a: any) => {
    const rawId = a.id.replace('ath_nfl_', '');
    const nameLower = a.name.toLowerCase();
    const champSet = nflChampsByPlayer.get(rawId) || nflChampsByPlayer.get(nameLower);
    if (champSet && champSet.size > 0) {
      a.championshipMarkets = Array.from(champSet);
      nflChampsUpdated++;
    }

    const mvpMarket = NFL_MVP_MARKETS[nameLower];
    a.mvpMarkets = mvpMarket ? [mvpMarket] : [];
  });

  fs.writeFileSync(nflFile, JSON.stringify(nflAthletes, null, 2), 'utf-8');
  console.log(`Updated NFL: ${nflChampsUpdated} champions with markets.`);

  // -------------------------------------------------------------
  // 4. Process NHL
  // -------------------------------------------------------------
  console.log('\n--- Processing NHL ---');
  const nhlChampsByPlayer = new Map<string, Set<string>>();
  const nhlFiles = fs.readdirSync('.cache/nhl');

  for (const f of nhlFiles) {
    if (!f.endsWith('.json')) continue;
    const match = f.match(/(\d{4})(\d{4})/);
    if (!match) continue;
    const endYear = parseInt(match[2], 10);
    const champs = STANLEY_CUPS[endYear] || [];
    if (champs.length === 0) continue;

    const data = JSON.parse(fs.readFileSync(`.cache/nhl/${f}`, 'utf-8'));
    for (const row of (data.data || [])) {
      if (!row.playerId) continue;
      const abbrevs = (row.teamAbbrevs || '').split(',').map((s: string) => s.trim());
      for (const team of abbrevs) {
        if (champs.includes(team)) {
          const pId = String(row.playerId);
          const set = nhlChampsByPlayer.get(pId) || new Set();
          const market = NHL_MARKETS[team];
          if (market) set.add(market);
          nhlChampsByPlayer.set(pId, set);
        }
      }
    }
  }

  const nhlFile = 'src/data/athletes-nhl.json';
  const nhlAthletes = JSON.parse(fs.readFileSync(nhlFile, 'utf-8'));
  let nhlChampsUpdated = 0;

  nhlAthletes.forEach((a: any) => {
    // Correct modern Paul Thompson who was mistaken for 1930s player
    if (a.id === 'ath_nhl_8476251') {
      a.mvps = 0;
      a.mvpMarkets = [];
    }

    const rawId = a.id.replace('ath_nhl_', '');
    const nameLower = a.name.toLowerCase();
    const champSet = nhlChampsByPlayer.get(rawId);
    if (champSet && champSet.size > 0) {
      a.championshipMarkets = Array.from(champSet);
      nhlChampsUpdated++;
    }

    const mvpMarkets = NHL_MVP_MARKETS[nameLower];
    if (mvpMarkets && a.mvps > 0) {
      a.mvpMarkets = mvpMarkets;
    }
  });

  fs.writeFileSync(nhlFile, JSON.stringify(nhlAthletes, null, 2), 'utf-8');
  console.log(`Updated NHL: ${nhlChampsUpdated} champions with markets.`);

  console.log('\n=== All 4 Leagues Enriched Successfully! ===');
}

main().catch(console.error);
