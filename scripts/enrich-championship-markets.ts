import fs from 'fs';
import path from 'path';

// -------------------------------------------------------------
// 1. NBA CHAMPIONS & MARKETS
// -------------------------------------------------------------
const NBA_CHAMPIONS: Record<number, string[]> = {
  1947: ['PHW'], 1948: ['BLB'], 1949: ['MNL'], 1950: ['MNL'],
  1951: ['ROC'], 1952: ['MNL'], 1953: ['MNL'], 1954: ['MNL'], 1955: ['SYR'],
  1956: ['PHW'], 1957: ['BOS'], 1958: ['STL'], 1959: ['BOS'], 1960: ['BOS'],
  1961: ['BOS'], 1962: ['BOS'], 1963: ['BOS'], 1964: ['BOS'], 1965: ['BOS'],
  1966: ['BOS'], 1967: ['PHI'], 1968: ['BOS', 'PIT'], 1969: ['BOS', 'OAK'], 1970: ['NYK', 'IND'],
  1971: ['MIL', 'UTA'], 1972: ['LAL', 'IND'], 1973: ['NYK', 'IND'], 1974: ['BOS', 'NYA'], 1975: ['GSW', 'KEN'],
  1976: ['BOS', 'NYA'], 1977: ['POR'], 1978: ['WSB'], 1979: ['SEA'], 1980: ['LAL'],
  1981: ['BOS'], 1982: ['LAL'], 1983: ['PHI'], 1984: ['BOS'], 1985: ['LAL'],
  1986: ['BOS'], 1987: ['LAL'], 1988: ['LAL'], 1989: ['DET'], 1990: ['DET'],
  1991: ['CHI'], 1992: ['CHI'], 1993: ['CHI'], 1994: ['HOU'], 1995: ['HOU'],
  1996: ['CHI'], 1997: ['CHI'], 1998: ['CHI'], 1999: ['SAS'], 2000: ['LAL'],
  2001: ['LAL'], 2002: ['LAL'], 2003: ['SAS'], 2004: ['DET'], 2005: ['SAS'],
  2006: ['MIA'], 2007: ['SAS'], 2008: ['BOS'], 2009: ['LAL'], 2010: ['LAL'],
  2011: ['DAL'], 2012: ['MIA'], 2013: ['MIA'], 2014: ['SAS'], 2015: ['GSW'],
  2016: ['CLE'], 2017: ['GSW'], 2018: ['GSW'], 2019: ['TOR'], 2020: ['LAL'],
  2021: ['MIL'], 2022: ['GSW'], 2023: ['DEN'], 2024: ['BOS'],
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
  KEN: 'KEN', PIT: 'PIT', CAR: 'CAR', VIR: 'VIR', MNL: 'MIN', BLB: 'WAS'
};

// -------------------------------------------------------------
// 2. MLB MARKETS
// -------------------------------------------------------------
const MLB_MARKETS: Record<string, string> = {
  NYA: 'NY', NYY: 'NY', NYN: 'NY', NYM: 'NY', BRO: 'NY', NYG: 'NY',
  BOS: 'BOS', BSN: 'BOS', CHN: 'CHI', CHC: 'CHI', CHA: 'CHI', CHW: 'CHI',
  LAN: 'LA', LAD: 'LA', LAA: 'LA', ANA: 'LA', CAL: 'LA',
  SFN: 'BAY', SFG: 'BAY', OAK: 'BAY', PHA: 'PHI', PHI: 'PHI',
  DET: 'DET', HOU: 'HOU', TEX: 'DAL', TOR: 'TOR', BAL: 'BAL',
  WAS: 'WAS', WSN: 'WAS', MON: 'WAS', ATL: 'ATL', MLN: 'ATL',
  SLN: 'STL', STL: 'STL', PIT: 'PIT', CIN: 'CIN', CLE: 'CLE',
  MIN: 'MIN', FLO: 'FLA', MIA: 'FLA', TBA: 'FLA', TBR: 'FLA',
  SDN: 'SD', SDP: 'SD', COL: 'DEN', KCA: 'KC', KCR: 'KC',
  MIL: 'MIL', ML4: 'MIL', ARI: 'PHX', SEA: 'SEA'
};

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
  2021: ['LAR', 'LA'], 2022: ['KC'], 2023: ['KC'], 2024: ['KC'],
};

const NFL_MARKETS: Record<string, string> = {
  NYG: 'NY', NYJ: 'NY', BUF: 'NY', NE: 'BOS', NWE: 'BOS',
  CHI: 'CHI', LAR: 'LA', LAC: 'LA', LA: 'LA', RAM: 'LA',
  SF: 'BAY', OAK: 'BAY', LV: 'BAY', PHI: 'PHI', DET: 'DET',
  MIA: 'FLA', TB: 'FLA', JAX: 'FLA', DAL: 'DAL', HOU: 'HOU',
  CLE: 'CLE', CIN: 'CIN', WAS: 'WAS', BAL: 'BAL', PIT: 'PIT',
  GB: 'GB', KC: 'KC', DEN: 'DEN', IND: 'IND', NO: 'NO', SEA: 'SEA',
  ARI: 'PHX', PHX: 'PHX', ATL: 'ATL', CAR: 'CAR', MIN: 'MIN',
  TEN: 'TEN', OTL: 'TEN'
};

const NFL_MVP_MARKETS: Record<string, string> = {
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
  2024: ['FLA'],
};

const NHL_MARKETS: Record<string, string> = {
  NYR: 'NY', NYI: 'NY', NJD: 'NY', BOS: 'BOS', CHI: 'CHI',
  LAK: 'LA', ANA: 'LA', SJS: 'BAY', PHI: 'PHI', DET: 'DET',
  TBL: 'FLA', FLA: 'FLA', DAL: 'DAL', TOR: 'TOR', MTL: 'CAN',
  EDM: 'CAN', CGY: 'CAN', WSH: 'WAS', PIT: 'PIT', COL: 'DEN',
  CAR: 'CAR', STL: 'STL', VGK: 'VGK', WPG: 'CAN', OTT: 'CAN',
  VAN: 'CAN', BUF: 'NY', MIN: 'MIN', CBJ: 'OHIO', NSH: 'TEN'
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
};

async function main() {
  console.log('=== Enriching Athlete Championship & MVP Markets ===');

  // 1. Process MLB
  console.log('Processing MLB...');
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

  // MLB MVPs
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
  mlbAthletes.forEach((a: any) => {
    const rawId = a.id.replace('ath_mlb_', '');
    const champSet = mlbChampsByPlayer.get(rawId);
    a.championshipMarkets = champSet && champSet.size > 0 ? Array.from(champSet) : [];

    const mvpSet = mlbMvpByPlayer.get(rawId);
    a.mvpMarkets = mvpSet && mvpSet.size > 0 ? Array.from(mvpSet) : [];
  });
  fs.writeFileSync(mlbFile, JSON.stringify(mlbAthletes, null, 2), 'utf-8');
  console.log(`Updated MLB athletes with championshipMarkets and mvpMarkets.`);

  // 2. Process NBA
  console.log('Processing NBA...');
  const nbaTotals = fs.readFileSync('.cache/nba/totals.csv', 'utf-8').split('\n');
  const nbaHeaders = nbaTotals[0].split(',');
  const pIdNbaIdx = nbaHeaders.indexOf('player_id');
  const sNbaIdx = nbaHeaders.indexOf('season');
  const tNbaIdx = nbaHeaders.indexOf('team');

  const nbaTeamMap = new Map<string, string>();
  const nbaChampsByPlayer = new Map<string, Set<string>>();
  for (let i = 1; i < nbaTotals.length; i++) {
    const line = nbaTotals[i];
    if (!line) continue;
    const parts = line.split(',');
    const pId = parts[pIdNbaIdx];
    const s = parseInt(parts[sNbaIdx], 10);
    const team = parts[tNbaIdx];
    nbaTeamMap.set(`${pId}-${s}`, team);

    const champs = NBA_CHAMPIONS[s];
    if (champs && champs.includes(team)) {
      const set = nbaChampsByPlayer.get(pId) || new Set();
      const market = NBA_MARKETS[team];
      if (market) set.add(market);
      nbaChampsByPlayer.set(pId, set);
    }
  }

  // NBA MVPs
  const nbaAwards = fs.readFileSync('.cache/nba/awards.csv', 'utf-8').split('\n');
  const aHeaders = nbaAwards[0].split(',');
  const aPIdIdx = aHeaders.indexOf('player_id');
  const aSeasonIdx = aHeaders.indexOf('season');
  const aAwardIdx = aHeaders.indexOf('award');
  const aWinnerIdx = aHeaders.indexOf('winner');

  const nbaMvpByPlayer = new Map<string, Set<string>>();
  for (let i = 1; i < nbaAwards.length; i++) {
    const parts = nbaAwards[i].split(',');
    const award = parts[aAwardIdx]?.toLowerCase();
    const winner = parts[aWinnerIdx];
    if (award && (award === 'nba mvp' || award === 'most valuable player') && winner === 'TRUE') {
      const pId = parts[aPIdIdx];
      const s = parseInt(parts[aSeasonIdx], 10);
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
  nbaAthletes.forEach((a: any) => {
    const rawId = a.id.replace('ath_nba_', '');
    const champSet = nbaChampsByPlayer.get(rawId);
    a.championshipMarkets = champSet && champSet.size > 0 ? Array.from(champSet) : [];

    const mvpSet = nbaMvpByPlayer.get(rawId);
    a.mvpMarkets = mvpSet && mvpSet.size > 0 ? Array.from(mvpSet) : [];
  });
  fs.writeFileSync(nbaFile, JSON.stringify(nbaAthletes, null, 2), 'utf-8');
  console.log(`Updated NBA athletes with championshipMarkets and mvpMarkets.`);

  // 3. Process NFL
  console.log('Processing NFL...');
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
  nflAthletes.forEach((a: any) => {
    const rawId = a.id.replace('ath_nfl_', '');
    const nameLower = a.name.toLowerCase();
    const champSet = nflChampsByPlayer.get(rawId) || nflChampsByPlayer.get(nameLower);
    a.championshipMarkets = champSet && champSet.size > 0 ? Array.from(champSet) : [];

    const mvpMarket = NFL_MVP_MARKETS[nameLower];
    a.mvpMarkets = mvpMarket ? [mvpMarket] : [];
  });
  fs.writeFileSync(nflFile, JSON.stringify(nflAthletes, null, 2), 'utf-8');
  console.log(`Updated NFL athletes with championshipMarkets and mvpMarkets.`);

  // 4. Process NHL
  console.log('Processing NHL...');
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
  nhlAthletes.forEach((a: any) => {
    const rawId = a.id.replace('ath_nhl_', '');
    const nameLower = a.name.toLowerCase();
    const champSet = nhlChampsByPlayer.get(rawId);
    a.championshipMarkets = champSet && champSet.size > 0 ? Array.from(champSet) : [];

    const mvpMarkets = NHL_MVP_MARKETS[nameLower];
    a.mvpMarkets = mvpMarkets ? mvpMarkets : [];
  });
  fs.writeFileSync(nhlFile, JSON.stringify(nhlAthletes, null, 2), 'utf-8');
  console.log(`Updated NHL athletes with championshipMarkets and mvpMarkets.`);

  console.log('=== All 4 Leagues Enriched Successfully! ===');
}

main().catch(console.error);
