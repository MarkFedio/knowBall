/**
 * Universal Multi-Sport 2024-2026 Augmentation Engine
 *
 * Ingests recent trades, free agency signings, and championship victories across
 * NFL, NBA, and NHL from 2024 through 2026.
 *
 * Guarantees that active athletes carry all current franchises, accurate market tags,
 * latest uniform numbers, and up-to-date championship accolades.
 */

import fs from 'fs';
import path from 'path';
import { Athlete } from '../src/types';
import { MASTER_TEAM_TO_MARKET } from '../src/lib/marketResolver';

const NFL_PATH = path.join(process.cwd(), 'src', 'data', 'athletes-nfl.json');
const NBA_PATH = path.join(process.cwd(), 'src', 'data', 'athletes-nba.json');
const NHL_PATH = path.join(process.cwd(), 'src', 'data', 'athletes-nhl.json');

interface AthleteAugment {
  name: string;
  addTeams?: string[];
  addTeamNames?: string[];
  addJerseys?: number[];
  addChampionships?: number;
  addChampionshipMarkets?: string[];
  activeThrough?: number;
  boostPopularity?: number;
}

// ============================================================
// 1. NFL 2024-2026 ROSTER & TRANSACTION REGISTRY
// ============================================================
const NFL_AUGMENTS: AthleteAugment[] = [
  { name: 'Stefon Diggs', addTeams: ['NE', 'HOU', 'WAS'], addTeamNames: ['New England Patriots', 'Houston Texans', 'Washington Commanders'], addJerseys: [8, 1, 14], activeThrough: 2026, boostPopularity: 100 },
  { name: 'Kirk Cousins', addTeams: ['ATL'], addTeamNames: ['Atlanta Falcons'], addJerseys: [18], activeThrough: 2026, boostPopularity: 80 },
  { name: 'Justin Fields', addTeams: ['PIT'], addTeamNames: ['Pittsburgh Steelers'], addJerseys: [2], activeThrough: 2026, boostPopularity: 85 },
  { name: 'Russell Wilson', addTeams: ['PIT', 'NYG'], addTeamNames: ['Pittsburgh Steelers', 'New York Giants'], addJerseys: [3], activeThrough: 2026, boostPopularity: 90 },
  { name: 'Saquon Barkley', addTeams: ['PHI'], addTeamNames: ['Philadelphia Eagles'], addJerseys: [26], activeThrough: 2026, boostPopularity: 95 },
  { name: 'Derrick Henry', addTeams: ['BAL'], addTeamNames: ['Baltimore Ravens'], addJerseys: [22], activeThrough: 2026, boostPopularity: 95 },
  { name: 'Davante Adams', addTeams: ['NYJ', 'LAR'], addTeamNames: ['New York Jets', 'Los Angeles Rams'], addJerseys: [17], activeThrough: 2026, boostPopularity: 90 },
  { name: 'Amari Cooper', addTeams: ['BUF'], addTeamNames: ['Buffalo Bills'], addJerseys: [18], activeThrough: 2026, boostPopularity: 85 },
  { name: 'DeAndre Hopkins', addTeams: ['KC', 'BAL'], addTeamNames: ['Kansas City Chiefs', 'Baltimore Ravens'], addJerseys: [8], activeThrough: 2026, boostPopularity: 85 },
  { name: 'Keenan Allen', addTeams: ['CHI'], addTeamNames: ['Chicago Bears'], addJerseys: [13], activeThrough: 2026, boostPopularity: 80 },
  { name: 'Brian Burns', addTeams: ['NYG'], addTeamNames: ['New York Giants'], addJerseys: [0], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Danielle Hunter', addTeams: ['HOU'], addTeamNames: ['Houston Texans'], addJerseys: [55], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Christian Wilkins', addTeams: ['LV'], addTeamNames: ['Las Vegas Raiders'], addJerseys: [94], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Patrick Queen', addTeams: ['PIT'], addTeamNames: ['Pittsburgh Steelers'], addJerseys: [6], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Calvin Ridley', addTeams: ['TEN'], addTeamNames: ['Tennessee Titans'], addJerseys: [0], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Gabe Davis', addTeams: ['JAX'], addTeamNames: ['Jacksonville Jaguars'], addJerseys: [0], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Jerry Jeudy', addTeams: ['CLE'], addTeamNames: ['Cleveland Browns'], addJerseys: [3], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Diontae Johnson', addTeams: ['CAR', 'BAL'], addTeamNames: ['Carolina Panthers', 'Baltimore Ravens'], addJerseys: [5, 18], activeThrough: 2026, boostPopularity: 75 },
  { name: 'L\'Jarius Sneed', addTeams: ['TEN'], addTeamNames: ['Tennessee Titans'], addJerseys: [38], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Haason Reddick', addTeams: ['NYJ'], addTeamNames: ['New York Jets'], addJerseys: [7], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Matthew Judon', addTeams: ['ATL'], addTeamNames: ['Atlanta Falcons'], addJerseys: [9], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Gardner Minshew', addTeams: ['LV'], addTeamNames: ['Las Vegas Raiders'], addJerseys: [15], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Jameis Winston', addTeams: ['CLE'], addTeamNames: ['Cleveland Browns'], addJerseys: [5], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Joe Flacco', addTeams: ['IND'], addTeamNames: ['Indianapolis Colts'], addJerseys: [15], activeThrough: 2026, boostPopularity: 80 },
  { name: 'Jacoby Brissett', addTeams: ['NE'], addTeamNames: ['New England Patriots'], addJerseys: [7], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Sam Darnold', addTeams: ['MIN'], addTeamNames: ['Minnesota Vikings'], addJerseys: [14], activeThrough: 2026, boostPopularity: 80 },
  { name: 'Austin Ekeler', addTeams: ['WAS'], addTeamNames: ['Washington Commanders'], addJerseys: [30], activeThrough: 2026, boostPopularity: 80 },
  { name: 'Aaron Jones', addTeams: ['MIN'], addTeamNames: ['Minnesota Vikings'], addJerseys: [33], activeThrough: 2026, boostPopularity: 80 },
  { name: 'Joe Mixon', addTeams: ['HOU'], addTeamNames: ['Houston Texans'], addJerseys: [28], activeThrough: 2026, boostPopularity: 80 },
  { name: 'Tony Pollard', addTeams: ['TEN'], addTeamNames: ['Tennessee Titans'], addJerseys: [20], activeThrough: 2026, boostPopularity: 80 },
  { name: 'D\'Andre Swift', addTeams: ['CHI'], addTeamNames: ['Chicago Bears'], addJerseys: [4], activeThrough: 2026, boostPopularity: 80 },
  { name: 'Marquise Brown', addTeams: ['KC'], addTeamNames: ['Kansas City Chiefs'], addJerseys: [5], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Mike Williams', addTeams: ['NYJ', 'PIT'], addTeamNames: ['New York Jets', 'Pittsburgh Steelers'], addJerseys: [18], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Curtis Samuel', addTeams: ['BUF'], addTeamNames: ['Buffalo Bills'], addJerseys: [1], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Darnell Mooney', addTeams: ['ATL'], addTeamNames: ['Atlanta Falcons'], addJerseys: [1], activeThrough: 2026, boostPopularity: 70 },
  { name: 'K.J. Osborn', addTeams: ['NE'], addTeamNames: ['New England Patriots'], addJerseys: [10], activeThrough: 2026, boostPopularity: 65 },
  { name: 'Gerald Everett', addTeams: ['CHI'], addTeamNames: ['Chicago Bears'], addJerseys: [14], activeThrough: 2026, boostPopularity: 65 },
  { name: 'Jonnu Smith', addTeams: ['MIA'], addTeamNames: ['Miami Dolphins'], addJerseys: [9], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Mike Gesicki', addTeams: ['CIN'], addTeamNames: ['Cincinnati Bengals'], addJerseys: [88], activeThrough: 2026, boostPopularity: 70 },
];

// ============================================================
// 2. NBA 2024-2026 ROSTER & TRANSACTION REGISTRY
// ============================================================
const NBA_AUGMENTS: AthleteAugment[] = [
  // 2024 Celtics Champions
  { name: 'Jayson Tatum', addTeams: ['BOS'], addChampionships: 1, addChampionshipMarkets: ['BOS'], activeThrough: 2027, boostPopularity: 95 },
  { name: 'Jaylen Brown', addTeams: ['BOS'], addChampionships: 1, addChampionshipMarkets: ['BOS'], activeThrough: 2027, boostPopularity: 90 },
  { name: 'Jrue Holiday', addTeams: ['BOS'], addChampionships: 1, addChampionshipMarkets: ['BOS'], activeThrough: 2026, boostPopularity: 85 },
  { name: 'Derrick White', addTeams: ['BOS'], addChampionships: 1, addChampionshipMarkets: ['BOS'], activeThrough: 2027, boostPopularity: 85 },
  { name: 'Kristaps Porziņģis', addTeams: ['BOS'], addChampionships: 1, addChampionshipMarkets: ['BOS'], activeThrough: 2026, boostPopularity: 85 },
  { name: 'Al Horford', addTeams: ['BOS'], addChampionships: 1, addChampionshipMarkets: ['BOS'], activeThrough: 2026, boostPopularity: 85 },
  { name: 'Payton Pritchard', addTeams: ['BOS'], addChampionships: 1, addChampionshipMarkets: ['BOS'], activeThrough: 2027, boostPopularity: 70 },
  { name: 'Sam Hauser', addTeams: ['BOS'], addChampionships: 1, addChampionshipMarkets: ['BOS'], activeThrough: 2027, boostPopularity: 65 },
  { name: 'Luke Kornet', addTeams: ['BOS'], addChampionships: 1, addChampionshipMarkets: ['BOS'], activeThrough: 2026, boostPopularity: 60 },

  // 2026 Knicks Champions & Moves
  { name: 'Jalen Brunson', addTeams: ['NYK'], addChampionships: 1, addChampionshipMarkets: ['NY'], activeThrough: 2027, boostPopularity: 95 },
  { name: 'Karl-Anthony Towns', addTeams: ['NYK'], addTeamNames: ['New York Knicks'], addJerseys: [32], addChampionships: 1, addChampionshipMarkets: ['NY'], activeThrough: 2027, boostPopularity: 90 },
  { name: 'Mikal Bridges', addTeams: ['NYK'], addTeamNames: ['New York Knicks'], addJerseys: [25], addChampionships: 1, addChampionshipMarkets: ['NY'], activeThrough: 2027, boostPopularity: 85 },
  { name: 'OG Anunoby', addTeams: ['NYK'], addTeamNames: ['New York Knicks'], addJerseys: [8], addChampionships: 1, addChampionshipMarkets: ['NY'], activeThrough: 2027, boostPopularity: 85 },
  { name: 'Josh Hart', addTeams: ['NYK'], addChampionships: 1, addChampionshipMarkets: ['NY'], activeThrough: 2027, boostPopularity: 80 },
  { name: 'Mitchell Robinson', addTeams: ['NYK'], addChampionships: 1, addChampionshipMarkets: ['NY'], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Miles McBride', addTeams: ['NYK'], addChampionships: 1, addChampionshipMarkets: ['NY'], activeThrough: 2027, boostPopularity: 70 },
  { name: 'Jose Alvarado', addTeams: ['NYK'], addTeamNames: ['New York Knicks'], addJerseys: [15, 11], addChampionships: 1, addChampionshipMarkets: ['NY'], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Jordan Clarkson', addTeams: ['NYK'], addTeamNames: ['New York Knicks'], addJerseys: [0], addChampionships: 1, addChampionshipMarkets: ['NY'], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Jeremy Sochan', addTeams: ['NYK'], addTeamNames: ['New York Knicks'], addJerseys: [10], addChampionships: 1, addChampionshipMarkets: ['NY'], activeThrough: 2027, boostPopularity: 70 },
  { name: 'Donte DiVincenzo', addTeams: ['MIN'], addTeamNames: ['Minnesota Timberwolves'], addJerseys: [0], activeThrough: 2027, boostPopularity: 75 },

  // Other Major 2024-2026 Moves
  { name: 'Paul George', addTeams: ['PHI'], addTeamNames: ['Philadelphia 76ers'], addJerseys: [8], activeThrough: 2027, boostPopularity: 90 },
  { name: 'Klay Thompson', addTeams: ['DAL'], addTeamNames: ['Dallas Mavericks'], addJerseys: [31], activeThrough: 2027, boostPopularity: 90 },
  { name: 'Chris Paul', addTeams: ['SAS'], addTeamNames: ['San Antonio Spurs'], addJerseys: [3], activeThrough: 2026, boostPopularity: 90 },
  { name: 'DeMar DeRozan', addTeams: ['SAC'], addTeamNames: ['Sacramento Kings'], addJerseys: [10], activeThrough: 2027, boostPopularity: 85 },
  { name: 'Alex Caruso', addTeams: ['OKC'], addTeamNames: ['Oklahoma City Thunder'], addJerseys: [9], activeThrough: 2027, boostPopularity: 80 },
  { name: 'Josh Giddey', addTeams: ['CHI'], addTeamNames: ['Chicago Bulls'], addJerseys: [3], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Dejounte Murray', addTeams: ['NOP'], addTeamNames: ['New Orleans Pelicans'], addJerseys: [5], activeThrough: 2027, boostPopularity: 80 },
  { name: 'Kentavious Caldwell-Pope', addTeams: ['ORL'], addTeamNames: ['Orlando Magic'], addJerseys: [3], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Isaiah Hartenstein', addTeams: ['OKC'], addTeamNames: ['Oklahoma City Thunder'], addJerseys: [55], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Buddy Hield', addTeams: ['GSW'], addTeamNames: ['Golden State Warriors'], addJerseys: [7], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Kyle Anderson', addTeams: ['GSW'], addTeamNames: ['Golden State Warriors'], addJerseys: [1], activeThrough: 2027, boostPopularity: 70 },
  { name: 'Harrison Barnes', addTeams: ['SAS'], addTeamNames: ['San Antonio Spurs'], addJerseys: [40], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Russell Westbrook', addTeams: ['DEN'], addTeamNames: ['Denver Nuggets'], addJerseys: [4], activeThrough: 2026, boostPopularity: 90 },
  { name: 'Tyus Jones', addTeams: ['PHO'], addTeamNames: ['Phoenix Suns'], addJerseys: [21], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Gary Trent Jr.', addTeams: ['MIL'], addTeamNames: ['Milwaukee Bucks'], addJerseys: [5], activeThrough: 2027, boostPopularity: 70 },
  { name: 'Caleb Martin', addTeams: ['PHI'], addTeamNames: ['Philadelphia 76ers'], addJerseys: [16], activeThrough: 2027, boostPopularity: 70 },
  { name: 'Andre Drummond', addTeams: ['PHI'], addTeamNames: ['Philadelphia 76ers'], addJerseys: [5], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Eric Gordon', addTeams: ['PHI'], addTeamNames: ['Philadelphia 76ers'], addJerseys: [23], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Reggie Jackson', addTeams: ['PHI'], addTeamNames: ['Philadelphia 76ers'], addJerseys: [7], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Guerschon Yabusele', addTeams: ['PHI'], addTeamNames: ['Philadelphia 76ers'], addJerseys: [28], activeThrough: 2027, boostPopularity: 70 },
  { name: 'Jonas Valančiūnas', addTeams: ['WAS'], addTeamNames: ['Washington Wizards'], addJerseys: [17], activeThrough: 2027, boostPopularity: 80 },
];

// ============================================================
// 3. NHL 2024-2026 ROSTER & TRANSACTION REGISTRY
// ============================================================
const NHL_AUGMENTS: AthleteAugment[] = [
  // 2024 Panthers Champions
  { name: 'Aleksander Barkov', addTeams: ['FLA'], addChampionships: 1, addChampionshipMarkets: ['FLA'], activeThrough: 2027, boostPopularity: 90 },
  { name: 'Matthew Tkachuk', addTeams: ['FLA'], addChampionships: 1, addChampionshipMarkets: ['FLA'], activeThrough: 2027, boostPopularity: 95 },
  { name: 'Sam Reinhart', addTeams: ['FLA'], addChampionships: 1, addChampionshipMarkets: ['FLA'], activeThrough: 2027, boostPopularity: 85 },
  { name: 'Carter Verhaeghe', addTeams: ['FLA'], addChampionships: 1, addChampionshipMarkets: ['FLA'], activeThrough: 2027, boostPopularity: 80 },
  { name: 'Sam Bennett', addTeams: ['FLA'], addChampionships: 1, addChampionshipMarkets: ['FLA'], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Sergei Bobrovsky', addTeams: ['FLA'], addChampionships: 1, addChampionshipMarkets: ['FLA'], activeThrough: 2026, boostPopularity: 90 },
  { name: 'Aaron Ekblad', addTeams: ['FLA'], addChampionships: 1, addChampionshipMarkets: ['FLA'], activeThrough: 2027, boostPopularity: 85 },
  { name: 'Brandon Montour', addTeams: ['FLA', 'SEA'], addTeamNames: ['Florida Panthers', 'Seattle Kraken'], addJerseys: [62], addChampionships: 1, addChampionshipMarkets: ['FLA'], activeThrough: 2027, boostPopularity: 80 },
  { name: 'Gustav Forsling', addTeams: ['FLA'], addChampionships: 1, addChampionshipMarkets: ['FLA'], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Oliver Ekman-Larsson', addTeams: ['FLA', 'TOR'], addTeamNames: ['Florida Panthers', 'Toronto Maple Leafs'], addJerseys: [91], addChampionships: 1, addChampionshipMarkets: ['FLA'], activeThrough: 2027, boostPopularity: 80 },
  { name: 'Vladimir Tarasenko', addTeams: ['FLA', 'DET'], addTeamNames: ['Florida Panthers', 'Detroit Red Wings'], addJerseys: [11], addChampionships: 1, addChampionshipMarkets: ['FLA'], activeThrough: 2026, boostPopularity: 85 },
  { name: 'Kyle Okposo', addTeams: ['FLA'], addChampionships: 1, addChampionshipMarkets: ['FLA'], activeThrough: 2024, boostPopularity: 75 },
  { name: 'Evan Rodrigues', addTeams: ['FLA'], addChampionships: 1, addChampionshipMarkets: ['FLA'], activeThrough: 2027, boostPopularity: 70 },
  { name: 'Anthony Stolarz', addTeams: ['FLA', 'TOR'], addTeamNames: ['Florida Panthers', 'Toronto Maple Leafs'], addJerseys: [41], addChampionships: 1, addChampionshipMarkets: ['FLA'], activeThrough: 2027, boostPopularity: 70 },
  { name: 'Niko Mikkola', addTeams: ['FLA'], addChampionships: 1, addChampionshipMarkets: ['FLA'], activeThrough: 2027, boostPopularity: 70 },
  { name: 'Dmitry Kulikov', addTeams: ['FLA'], addChampionships: 1, addChampionshipMarkets: ['FLA'], activeThrough: 2027, boostPopularity: 70 },

  // Major 2024-2026 NHL Trades & Signings
  { name: 'Joonas Korpisalo', addTeams: ['NYR'], addTeamNames: ['New York Rangers'], addJerseys: [70], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Linus Ullmark', addTeams: ['OTT'], addTeamNames: ['Ottawa Senators'], addJerseys: [35], activeThrough: 2027, boostPopularity: 80 },
  { name: 'Elias Lindholm', addTeams: ['BOS'], addTeamNames: ['Boston Bruins'], addJerseys: [28], activeThrough: 2027, boostPopularity: 85 },
  { name: 'Nikita Zadorov', addTeams: ['BOS'], addTeamNames: ['Boston Bruins'], addJerseys: [91], activeThrough: 2027, boostPopularity: 80 },
  { name: 'Reilly Smith', addTeams: ['NYR'], addTeamNames: ['New York Rangers'], addJerseys: [91], activeThrough: 2025, boostPopularity: 75 },
  { name: 'Steven Stamkos', addTeams: ['NSH'], addTeamNames: ['Nashville Predators'], addJerseys: [91], activeThrough: 2027, boostPopularity: 95 },
  { name: 'Jonathan Marchessault', addTeams: ['NSH'], addTeamNames: ['Nashville Predators'], addJerseys: [81], activeThrough: 2027, boostPopularity: 85 },
  { name: 'Brady Skjei', addTeams: ['NSH'], addTeamNames: ['Nashville Predators'], addJerseys: [76], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Jake Guentzel', addTeams: ['TBL'], addTeamNames: ['Tampa Bay Lightning'], addJerseys: [59], activeThrough: 2027, boostPopularity: 85 },
  { name: 'Mikhail Sergachev', addTeams: ['UTA'], addTeamNames: ['Utah Hockey Club'], addJerseys: [98], activeThrough: 2027, boostPopularity: 80 },
  { name: 'Chandler Stephenson', addTeams: ['SEA'], addTeamNames: ['Seattle Kraken'], addJerseys: [9], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Sean Monahan', addTeams: ['CBJ'], addTeamNames: ['Columbus Blue Jackets'], addJerseys: [23], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Teuvo Teravainen', addTeams: ['CHI'], addTeamNames: ['Chicago Blackhawks'], addJerseys: [86], activeThrough: 2027, boostPopularity: 80 },
  { name: 'Tyler Bertuzzi', addTeams: ['CHI'], addTeamNames: ['Chicago Blackhawks'], addJerseys: [59], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Alec Martinez', addTeams: ['CHI'], addTeamNames: ['Chicago Blackhawks'], addJerseys: [23], activeThrough: 2025, boostPopularity: 75 },
  { name: 'Laurent Brossoit', addTeams: ['CHI'], addTeamNames: ['Chicago Blackhawks'], addJerseys: [39], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Ilya Samsonov', addTeams: ['VGK'], addTeamNames: ['Vegas Golden Knights'], addJerseys: [35], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Chris Tanev', addTeams: ['TOR'], addTeamNames: ['Toronto Maple Leafs'], addJerseys: [8], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Jeff Skinner', addTeams: ['EDM'], addTeamNames: ['Edmonton Oilers'], addJerseys: [53], activeThrough: 2026, boostPopularity: 80 },
  { name: 'Viktor Arvidsson', addTeams: ['EDM'], addTeamNames: ['Edmonton Oilers'], addJerseys: [33], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Matt Roy', addTeams: ['WSH'], addTeamNames: ['Washington Capitals'], addJerseys: [3], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Jakob Chychrun', addTeams: ['WSH'], addTeamNames: ['Washington Capitals'], addJerseys: [6], activeThrough: 2027, boostPopularity: 80 },
  { name: 'Logan Thompson', addTeams: ['WSH'], addTeamNames: ['Washington Capitals'], addJerseys: [48], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Darcy Kuemper', addTeams: ['LAK'], addTeamNames: ['Los Angeles Kings'], addJerseys: [35], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Warren Foegele', addTeams: ['LAK'], addTeamNames: ['Los Angeles Kings'], addJerseys: [37], activeThrough: 2027, boostPopularity: 70 },
  { name: 'Cam Talbot', addTeams: ['DET'], addTeamNames: ['Detroit Red Wings'], addJerseys: [39], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Erik Gustafsson', addTeams: ['DET'], addTeamNames: ['Detroit Red Wings'], addJerseys: [56], activeThrough: 2026, boostPopularity: 70 },
];

function applyAugments(filePath: string, augments: AthleteAugment[], sportLabel: string) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const athletes: Athlete[] = JSON.parse(raw);
  let matchedCount = 0;

  for (const aug of augments) {
    const targetNorm = aug.name.toLowerCase().replace(/[\s.'"-]+/g, '');
    const found = athletes.find((a) => a.name.toLowerCase().replace(/[\s.'"-]+/g, '') === targetNorm);

    if (found) {
      matchedCount++;

      // 1. Teams
      if (aug.addTeams) {
        for (const t of aug.addTeams) {
          if (!found.teams.includes(t)) found.teams.push(t);
          const m = MASTER_TEAM_TO_MARKET[t];
          if (m && !found.markets.includes(m)) found.markets.push(m);
        }
      }

      // 2. Team Names
      if (aug.addTeamNames) {
        if (!found.teamNames) found.teamNames = [];
        for (const tn of aug.addTeamNames) {
          if (!found.teamNames.includes(tn)) found.teamNames.push(tn);
        }
      }

      // 3. Jersey Numbers
      if (aug.addJerseys) {
        if (!found.jerseyNumbers) found.jerseyNumbers = [];
        for (const j of aug.addJerseys) {
          if (!found.jerseyNumbers.includes(j)) found.jerseyNumbers.push(j);
        }
        found.jerseyNumbers.sort((a, b) => a - b);
      }

      // 4. Championships
      if (aug.addChampionships) {
        found.championships = Math.max(found.championships || 0, aug.addChampionships);
      }
      if (aug.addChampionshipMarkets) {
        if (!found.championshipMarkets) found.championshipMarkets = [];
        for (const cm of aug.addChampionshipMarkets) {
          if (!found.championshipMarkets.includes(cm)) found.championshipMarkets.push(cm);
        }
      }

      // 5. Active Years
      if (aug.activeThrough) {
        if (!found.activeYears) {
          found.activeYears = [aug.activeThrough, aug.activeThrough];
        } else {
          found.activeYears[1] = Math.max(found.activeYears[1], aug.activeThrough);
        }
      }

      // 6. Popularity
      if (aug.boostPopularity) {
        found.popularityScore = Math.max(found.popularityScore || 0, aug.boostPopularity);
      }
    } else {
      console.warn(`[${sportLabel}] Athlete not found for augmentation: ${aug.name}`);
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(athletes, null, 2), 'utf-8');
  console.log(`[${sportLabel}] Successfully applied 2024-2026 augments to ${matchedCount} / ${augments.length} athletes.`);
}

export function main() {
  console.log('======================================================');
  console.log(' UNIVERSAL 2024-2026 MULTI-SPORT AUGMENTATION PIPELINE');
  console.log('======================================================\n');

  applyAugments(NFL_PATH, NFL_AUGMENTS, 'NFL');
  applyAugments(NBA_PATH, NBA_AUGMENTS, 'NBA');
  applyAugments(NHL_PATH, NHL_AUGMENTS, 'NHL');
}

main();
