/**
 * Universal Multi-Sport 2024-2026 Augmentation Engine
 *
 * Ingests recent trades, free agency signings, roster movements, and championship victories across
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
// 1. NFL 2024-2026 ROSTER & TRANSACTION REGISTRY (155+ Players)
// ============================================================
const NFL_AUGMENTS: AthleteAugment[] = [
  // AFC East
  { name: 'Stefon Diggs', addTeams: ['NE', 'HOU', 'WAS'], addTeamNames: ['New England Patriots', 'Houston Texans', 'Washington Commanders'], addJerseys: [8, 1, 14], activeThrough: 2026, boostPopularity: 100 },
  { name: 'Jacoby Brissett', addTeams: ['NE'], addTeamNames: ['New England Patriots'], addJerseys: [7], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Antonio Gibson', addTeams: ['NE'], addTeamNames: ['New England Patriots'], addJerseys: [21], activeThrough: 2026, boostPopularity: 75 },
  { name: 'K.J. Osborn', addTeams: ['NE'], addTeamNames: ['New England Patriots'], addJerseys: [10], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Austin Hooper', addTeams: ['NE'], addTeamNames: ['New England Patriots'], addJerseys: [81], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Amari Cooper', addTeams: ['BUF'], addTeamNames: ['Buffalo Bills'], addJerseys: [18], activeThrough: 2026, boostPopularity: 85 },
  { name: 'Curtis Samuel', addTeams: ['BUF'], addTeamNames: ['Buffalo Bills'], addJerseys: [1], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Mack Hollins', addTeams: ['BUF'], addTeamNames: ['Buffalo Bills'], addJerseys: [13], activeThrough: 2026, boostPopularity: 65 },
  { name: 'Marquez Valdes-Scantling', addTeams: ['BUF', 'NO'], addTeamNames: ['Buffalo Bills', 'New Orleans Saints'], addJerseys: [11, 17], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Davante Adams', addTeams: ['NYJ', 'LAR'], addTeamNames: ['New York Jets', 'Los Angeles Rams'], addJerseys: [17], activeThrough: 2026, boostPopularity: 90 },
  { name: 'Haason Reddick', addTeams: ['NYJ'], addTeamNames: ['New York Jets'], addJerseys: [7], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Mike Williams', addTeams: ['NYJ', 'PIT'], addTeamNames: ['New York Jets', 'Pittsburgh Steelers'], addJerseys: [18, 84], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Tyrod Taylor', addTeams: ['NYJ'], addTeamNames: ['New York Jets'], addJerseys: [2], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Javon Kinlaw', addTeams: ['NYJ'], addTeamNames: ['New York Jets'], addJerseys: [94], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Jordan Poyer', addTeams: ['MIA'], addTeamNames: ['Miami Dolphins'], addJerseys: [21], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Kendall Fuller', addTeams: ['MIA'], addTeamNames: ['Miami Dolphins'], addJerseys: [22], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Jordyn Brooks', addTeams: ['MIA'], addTeamNames: ['Miami Dolphins'], addJerseys: [56], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Jonnu Smith', addTeams: ['MIA'], addTeamNames: ['Miami Dolphins'], addJerseys: [9], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Odell Beckham Jr.', addTeams: ['MIA'], addTeamNames: ['Miami Dolphins'], addJerseys: [3], activeThrough: 2026, boostPopularity: 90 },

  // AFC North
  { name: 'Russell Wilson', addTeams: ['PIT', 'NYG'], addTeamNames: ['Pittsburgh Steelers', 'New York Giants'], addJerseys: [3], activeThrough: 2026, boostPopularity: 90 },
  { name: 'Justin Fields', addTeams: ['PIT'], addTeamNames: ['Pittsburgh Steelers'], addJerseys: [2], activeThrough: 2026, boostPopularity: 85 },
  { name: 'Patrick Queen', addTeams: ['PIT'], addTeamNames: ['Pittsburgh Steelers'], addJerseys: [6], activeThrough: 2026, boostPopularity: 75 },
  { name: 'DeShon Elliott', addTeams: ['PIT'], addTeamNames: ['Pittsburgh Steelers'], addJerseys: [25], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Donte Jackson', addTeams: ['PIT'], addTeamNames: ['Pittsburgh Steelers'], addJerseys: [26], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Cordarrelle Patterson', addTeams: ['PIT'], addTeamNames: ['Pittsburgh Steelers'], addJerseys: [84], activeThrough: 2026, boostPopularity: 80 },
  { name: 'Van Jefferson', addTeams: ['PIT'], addTeamNames: ['Pittsburgh Steelers'], addJerseys: [11], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Derrick Henry', addTeams: ['BAL'], addTeamNames: ['Baltimore Ravens'], addJerseys: [22], activeThrough: 2026, boostPopularity: 95 },
  { name: 'Diontae Johnson', addTeams: ['CAR', 'BAL'], addTeamNames: ['Carolina Panthers', 'Baltimore Ravens'], addJerseys: [5, 18], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Eddie Jackson', addTeams: ['BAL'], addTeamNames: ['Baltimore Ravens'], addJerseys: [39], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Jerry Jeudy', addTeams: ['CLE'], addTeamNames: ['Cleveland Browns'], addJerseys: [3], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Jameis Winston', addTeams: ['CLE'], addTeamNames: ['Cleveland Browns'], addJerseys: [5], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Jordan Hicks', addTeams: ['CLE'], addTeamNames: ['Cleveland Browns'], addJerseys: [58], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Quinton Jefferson', addTeams: ['CLE'], addTeamNames: ['Cleveland Browns'], addJerseys: [98], activeThrough: 2026, boostPopularity: 65 },
  { name: 'D\'Onta Foreman', addTeams: ['CLE'], addTeamNames: ['Cleveland Browns'], addJerseys: [27], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Nyheim Hines', addTeams: ['CLE'], addTeamNames: ['Cleveland Browns'], addJerseys: [22], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Devin Bush', addTeams: ['CLE'], addTeamNames: ['Cleveland Browns'], addJerseys: [30], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Zack Moss', addTeams: ['CIN'], addTeamNames: ['Cincinnati Bengals'], addJerseys: [31], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Sheldon Rankins', addTeams: ['CIN'], addTeamNames: ['Cincinnati Bengals'], addJerseys: [98], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Geno Stone', addTeams: ['CIN'], addTeamNames: ['Cincinnati Bengals'], addJerseys: [22], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Trent Brown', addTeams: ['CIN'], addTeamNames: ['Cincinnati Bengals'], addJerseys: [77], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Mike Gesicki', addTeams: ['CIN'], addTeamNames: ['Cincinnati Bengals'], addJerseys: [88], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Vonn Bell', addTeams: ['CIN'], addTeamNames: ['Cincinnati Bengals'], addJerseys: [24], activeThrough: 2026, boostPopularity: 75 },

  // AFC South
  { name: 'Joe Mixon', addTeams: ['HOU'], addTeamNames: ['Houston Texans'], addJerseys: [28], activeThrough: 2026, boostPopularity: 85 },
  { name: 'Danielle Hunter', addTeams: ['HOU'], addTeamNames: ['Houston Texans'], addJerseys: [55], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Azeez Al-Shaair', addTeams: ['HOU'], addTeamNames: ['Houston Texans'], addJerseys: [0], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Denico Autry', addTeams: ['HOU'], addTeamNames: ['Houston Texans'], addJerseys: [96], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Foley Fatukasi', addTeams: ['HOU'], addTeamNames: ['Houston Texans'], addJerseys: [95], activeThrough: 2026, boostPopularity: 65 },
  { name: 'Cam Akers', addTeams: ['HOU', 'MIN'], addTeamNames: ['Houston Texans', 'Minnesota Vikings'], addJerseys: [22, 23], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Joe Flacco', addTeams: ['IND'], addTeamNames: ['Indianapolis Colts'], addJerseys: [15], activeThrough: 2026, boostPopularity: 80 },
  { name: 'Gabe Davis', addTeams: ['JAX'], addTeamNames: ['Jacksonville Jaguars'], addJerseys: [0], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Arik Armstead', addTeams: ['JAX'], addTeamNames: ['Jacksonville Jaguars'], addJerseys: [91], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Mitch Morse', addTeams: ['JAX'], addTeamNames: ['Jacksonville Jaguars'], addJerseys: [65], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Darnell Savage', addTeams: ['JAX'], addTeamNames: ['Jacksonville Jaguars'], addJerseys: [6], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Ronald Darby', addTeams: ['JAX'], addTeamNames: ['Jacksonville Jaguars'], addJerseys: [25], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Mac Jones', addTeams: ['JAX'], addTeamNames: ['Jacksonville Jaguars'], addJerseys: [10], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Devin Duvernay', addTeams: ['JAX'], addTeamNames: ['Jacksonville Jaguars'], addJerseys: [1], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Calvin Ridley', addTeams: ['TEN'], addTeamNames: ['Tennessee Titans'], addJerseys: [0], activeThrough: 2026, boostPopularity: 75 },
  { name: 'L\'Jarius Sneed', addTeams: ['TEN'], addTeamNames: ['Tennessee Titans'], addJerseys: [38], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Tony Pollard', addTeams: ['TEN'], addTeamNames: ['Tennessee Titans'], addJerseys: [20], activeThrough: 2026, boostPopularity: 80 },
  { name: 'Lloyd Cushenberry III', addTeams: ['TEN'], addTeamNames: ['Tennessee Titans'], addJerseys: [79], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Chidobe Awuzie', addTeams: ['TEN'], addTeamNames: ['Tennessee Titans'], addJerseys: [24], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Kenneth Murray, Jr.', addTeams: ['TEN'], addTeamNames: ['Tennessee Titans'], addJerseys: [56], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Sebastian Joseph-Day', addTeams: ['TEN'], addTeamNames: ['Tennessee Titans'], addJerseys: [93], activeThrough: 2026, boostPopularity: 65 },
  { name: 'Ernest Jones', addTeams: ['TEN', 'SEA'], addTeamNames: ['Tennessee Titans', 'Seattle Seahawks'], addJerseys: [53], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Mason Rudolph', addTeams: ['TEN'], addTeamNames: ['Tennessee Titans'], addJerseys: [11], activeThrough: 2026, boostPopularity: 65 },

  // AFC West
  { name: 'DeAndre Hopkins', addTeams: ['KC', 'BAL'], addTeamNames: ['Kansas City Chiefs', 'Baltimore Ravens'], addJerseys: [8], activeThrough: 2026, boostPopularity: 85 },
  { name: 'Marquise Brown', addTeams: ['KC'], addTeamNames: ['Kansas City Chiefs'], addJerseys: [5], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Carson Wentz', addTeams: ['KC'], addTeamNames: ['Kansas City Chiefs'], addJerseys: [11], activeThrough: 2026, boostPopularity: 75 },
  { name: 'JuJu Smith-Schuster', addTeams: ['KC'], addTeamNames: ['Kansas City Chiefs'], addJerseys: [9], activeThrough: 2026, boostPopularity: 80 },
  { name: 'Kareem Hunt', addTeams: ['KC'], addTeamNames: ['Kansas City Chiefs'], addJerseys: [29], activeThrough: 2026, boostPopularity: 80 },
  { name: 'Christian Wilkins', addTeams: ['LV'], addTeamNames: ['Las Vegas Raiders'], addJerseys: [94], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Gardner Minshew', addTeams: ['LV'], addTeamNames: ['Las Vegas Raiders'], addJerseys: [15], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Alexander Mattison', addTeams: ['LV'], addTeamNames: ['Las Vegas Raiders'], addJerseys: [22], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Desmond Ridder', addTeams: ['ARI', 'LV'], addTeamNames: ['Arizona Cardinals', 'Las Vegas Raiders'], addJerseys: [9], activeThrough: 2026, boostPopularity: 65 },
  { name: 'J.K. Dobbins', addTeams: ['LAC'], addTeamNames: ['Los Angeles Chargers'], addJerseys: [27], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Gus Edwards', addTeams: ['LAC'], addTeamNames: ['Los Angeles Chargers'], addJerseys: [4], activeThrough: 2026, boostPopularity: 70 },
  { name: 'DJ Chark', addTeams: ['LAC'], addTeamNames: ['Los Angeles Chargers'], addJerseys: [17], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Will Dissly', addTeams: ['LAC'], addTeamNames: ['Los Angeles Chargers'], addJerseys: [81], activeThrough: 2026, boostPopularity: 65 },
  { name: 'Hayden Hurst', addTeams: ['LAC'], addTeamNames: ['Los Angeles Chargers'], addJerseys: [88], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Zach Wilson', addTeams: ['DEN'], addTeamNames: ['Denver Broncos'], addJerseys: [10], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Josh Reynolds', addTeams: ['DEN'], addTeamNames: ['Denver Broncos'], addJerseys: [11], activeThrough: 2026, boostPopularity: 70 },
  { name: 'John Franklin-Myers', addTeams: ['DEN'], addTeamNames: ['Denver Broncos'], addJerseys: [94], activeThrough: 2026, boostPopularity: 70 },

  // NFC East
  { name: 'Saquon Barkley', addTeams: ['PHI'], addTeamNames: ['Philadelphia Eagles'], addJerseys: [26], addChampionships: 1, activeThrough: 2026, boostPopularity: 95 },
  { name: 'Bryce Huff', addTeams: ['PHI'], addTeamNames: ['Philadelphia Eagles'], addJerseys: [0], activeThrough: 2026, boostPopularity: 70 },
  { name: 'C.J. Gardner-Johnson', addTeams: ['PHI'], addTeamNames: ['Philadelphia Eagles'], addJerseys: [8], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Kenny Pickett', addTeams: ['PHI'], addTeamNames: ['Philadelphia Eagles'], addJerseys: [7], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Jahan Dotson', addTeams: ['PHI'], addTeamNames: ['Philadelphia Eagles'], addJerseys: [14], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Zack Baun', addTeams: ['PHI'], addTeamNames: ['Philadelphia Eagles'], addJerseys: [53], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Brian Burns', addTeams: ['NYG'], addTeamNames: ['New York Giants'], addJerseys: [0], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Devin Singletary', addTeams: ['NYG'], addTeamNames: ['New York Giants'], addJerseys: [26], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Drew Lock', addTeams: ['NYG'], addTeamNames: ['New York Giants'], addJerseys: [2], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Ezekiel Elliott', addTeams: ['DAL'], addTeamNames: ['Dallas Cowboys'], addJerseys: [15], activeThrough: 2026, boostPopularity: 85 },
  { name: 'Eric Kendricks', addTeams: ['DAL'], addTeamNames: ['Dallas Cowboys'], addJerseys: [50], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Dalvin Cook', addTeams: ['DAL'], addTeamNames: ['Dallas Cowboys'], addJerseys: [20], activeThrough: 2026, boostPopularity: 80 },
  { name: 'Royce Freeman', addTeams: ['DAL'], addTeamNames: ['Dallas Cowboys'], addJerseys: [24], activeThrough: 2026, boostPopularity: 65 },
  { name: 'Austin Ekeler', addTeams: ['WAS'], addTeamNames: ['Washington Commanders'], addJerseys: [30], activeThrough: 2026, boostPopularity: 80 },
  { name: 'Frankie Luvu', addTeams: ['WAS'], addTeamNames: ['Washington Commanders'], addJerseys: [4], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Bobby Wagner', addTeams: ['WAS'], addTeamNames: ['Washington Commanders'], addJerseys: [54], activeThrough: 2026, boostPopularity: 85 },
  { name: 'Dorance Armstrong', addTeams: ['WAS'], addTeamNames: ['Washington Commanders'], addJerseys: [92], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Tyler Biadasz', addTeams: ['WAS'], addTeamNames: ['Washington Commanders'], addJerseys: [63], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Zach Ertz', addTeams: ['WAS'], addTeamNames: ['Washington Commanders'], addJerseys: [86], activeThrough: 2026, boostPopularity: 80 },
  { name: 'Marcus Mariota', addTeams: ['WAS'], addTeamNames: ['Washington Commanders'], addJerseys: [0], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Jeremy Chinn', addTeams: ['WAS'], addTeamNames: ['Washington Commanders'], addJerseys: [11], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Dante Fowler Jr.', addTeams: ['WAS'], addTeamNames: ['Washington Commanders'], addJerseys: [6], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Marshon Lattimore', addTeams: ['WAS'], addTeamNames: ['Washington Commanders'], addJerseys: [23], activeThrough: 2026, boostPopularity: 80 },

  // NFC North
  { name: 'Keenan Allen', addTeams: ['CHI'], addTeamNames: ['Chicago Bears'], addJerseys: [13], activeThrough: 2026, boostPopularity: 80 },
  { name: 'D\'Andre Swift', addTeams: ['CHI'], addTeamNames: ['Chicago Bears'], addJerseys: [4], activeThrough: 2026, boostPopularity: 80 },
  { name: 'Gerald Everett', addTeams: ['CHI'], addTeamNames: ['Chicago Bears'], addJerseys: [81], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Kevin Byard', addTeams: ['CHI'], addTeamNames: ['Chicago Bears'], addJerseys: [31], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Sam Darnold', addTeams: ['MIN'], addTeamNames: ['Minnesota Vikings'], addJerseys: [14], activeThrough: 2026, boostPopularity: 80 },
  { name: 'Aaron Jones', addTeams: ['MIN'], addTeamNames: ['Minnesota Vikings'], addJerseys: [33], activeThrough: 2026, boostPopularity: 85 },
  { name: 'Jonathan Greenard', addTeams: ['MIN'], addTeamNames: ['Minnesota Vikings'], addJerseys: [58], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Andrew Van Ginkel', addTeams: ['MIN'], addTeamNames: ['Minnesota Vikings'], addJerseys: [43], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Blake Cashman', addTeams: ['MIN'], addTeamNames: ['Minnesota Vikings'], addJerseys: [51], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Stephon Gilmore', addTeams: ['MIN'], addTeamNames: ['Minnesota Vikings'], addJerseys: [23], activeThrough: 2026, boostPopularity: 80 },
  { name: 'Shaquill Griffin', addTeams: ['MIN'], addTeamNames: ['Minnesota Vikings'], addJerseys: [2], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Josh Jacobs', addTeams: ['GB'], addTeamNames: ['Green Bay Packers'], addJerseys: [8], activeThrough: 2026, boostPopularity: 85 },
  { name: 'Xavier McKinney', addTeams: ['GB'], addTeamNames: ['Green Bay Packers'], addJerseys: [29], activeThrough: 2026, boostPopularity: 80 },
  { name: 'Carlton Davis III', addTeams: ['DET'], addTeamNames: ['Detroit Lions'], addJerseys: [23], activeThrough: 2026, boostPopularity: 75 },
  { name: 'DJ Reader', addTeams: ['DET'], addTeamNames: ['Detroit Lions'], addJerseys: [98], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Marcus Davenport', addTeams: ['DET'], addTeamNames: ['Detroit Lions'], addJerseys: [6], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Amik Robertson', addTeams: ['DET'], addTeamNames: ['Detroit Lions'], addJerseys: [21], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Kevin Zeitler', addTeams: ['DET'], addTeamNames: ['Detroit Lions'], addJerseys: [70], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Tim Patrick', addTeams: ['DET'], addTeamNames: ['Detroit Lions'], addJerseys: [81], activeThrough: 2026, boostPopularity: 65 },

  // NFC South
  { name: 'Kirk Cousins', addTeams: ['ATL'], addTeamNames: ['Atlanta Falcons'], addJerseys: [18], activeThrough: 2026, boostPopularity: 80 },
  { name: 'Matthew Judon', addTeams: ['ATL'], addTeamNames: ['Atlanta Falcons'], addJerseys: [9], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Justin Simmons', addTeams: ['ATL'], addTeamNames: ['Atlanta Falcons'], addJerseys: [31], activeThrough: 2026, boostPopularity: 80 },
  { name: 'Darnell Mooney', addTeams: ['ATL'], addTeamNames: ['Atlanta Falcons'], addJerseys: [1], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Ray-Ray McCloud', addTeams: ['ATL'], addTeamNames: ['Atlanta Falcons'], addJerseys: [34], activeThrough: 2026, boostPopularity: 65 },
  { name: 'Robert Hunt', addTeams: ['CAR'], addTeamNames: ['Carolina Panthers'], addJerseys: [68], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Damien Lewis', addTeams: ['CAR'], addTeamNames: ['Carolina Panthers'], addJerseys: [65], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Jadeveon Clowney', addTeams: ['CAR'], addTeamNames: ['Carolina Panthers'], addJerseys: [90], activeThrough: 2026, boostPopularity: 80 },
  { name: 'Josey Jewell', addTeams: ['CAR'], addTeamNames: ['Carolina Panthers'], addJerseys: [54], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Chase Young', addTeams: ['NO'], addTeamNames: ['New Orleans Saints'], addJerseys: [99], activeThrough: 2026, boostPopularity: 80 },
  { name: 'Willie Gay Jr.', addTeams: ['NO'], addTeamNames: ['New Orleans Saints'], addJerseys: [50], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Jordan Whitehead', addTeams: ['TB'], addTeamNames: ['Tampa Bay Buccaneers'], addJerseys: [3], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Sterling Shepard', addTeams: ['TB'], addTeamNames: ['Tampa Bay Buccaneers'], addJerseys: [17], activeThrough: 2026, boostPopularity: 70 },

  // NFC West
  { name: 'Jonah Williams', addTeams: ['ARI'], addTeamNames: ['Arizona Cardinals'], addJerseys: [71], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Sean Murphy-Bunting', addTeams: ['ARI'], addTeamNames: ['Arizona Cardinals'], addJerseys: [0], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Justin Jones', addTeams: ['ARI'], addTeamNames: ['Arizona Cardinals'], addJerseys: [93], activeThrough: 2026, boostPopularity: 65 },
  { name: 'Bilal Nichols', addTeams: ['ARI'], addTeamNames: ['Arizona Cardinals'], addJerseys: [91], activeThrough: 2026, boostPopularity: 65 },
  { name: 'Zay Jones', addTeams: ['ARI'], addTeamNames: ['Arizona Cardinals'], addJerseys: [12], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Jonah Jackson', addTeams: ['LAR'], addTeamNames: ['Los Angeles Rams'], addJerseys: [73], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Colby Parkinson', addTeams: ['LAR'], addTeamNames: ['Los Angeles Rams'], addJerseys: [84], activeThrough: 2026, boostPopularity: 65 },
  { name: 'Tre\'Davious White', addTeams: ['LAR', 'BAL'], addTeamNames: ['Los Angeles Rams', 'Baltimore Ravens'], addJerseys: [27], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Kam Curl', addTeams: ['LAR'], addTeamNames: ['Los Angeles Rams'], addJerseys: [3], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Darious Williams', addTeams: ['LAR'], addTeamNames: ['Los Angeles Rams'], addJerseys: [31], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Jimmy Garoppolo', addTeams: ['LAR'], addTeamNames: ['Los Angeles Rams'], addJerseys: [11], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Leonard Floyd', addTeams: ['SF'], addTeamNames: ['San Francisco 49ers'], addJerseys: [54], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Maliek Collins', addTeams: ['SF'], addTeamNames: ['San Francisco 49ers'], addJerseys: [90], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Joshua Dobbs', addTeams: ['SF'], addTeamNames: ['San Francisco 49ers'], addJerseys: [11], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Sam Howell', addTeams: ['SEA'], addTeamNames: ['Seattle Seahawks'], addJerseys: [6], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Tyrel Dodson', addTeams: ['SEA', 'MIA'], addTeamNames: ['Seattle Seahawks', 'Miami Dolphins'], addJerseys: [0], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Jerome Baker', addTeams: ['SEA', 'TEN'], addTeamNames: ['Seattle Seahawks', 'Tennessee Titans'], addJerseys: [17], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Rayshawn Jenkins', addTeams: ['SEA'], addTeamNames: ['Seattle Seahawks'], addJerseys: [2], activeThrough: 2026, boostPopularity: 70 },
];

// ============================================================
// 2. NBA 2024-2026 ROSTER & TRANSACTION REGISTRY (100+ Players)
// ============================================================
const NBA_AUGMENTS: AthleteAugment[] = [
  // 2026 World Champion New York Knicks Full Playoff Roster
  { name: 'Jose Alvarado', addTeams: ['NYK'], addTeamNames: ['New York Knicks'], addJerseys: [11], addChampionships: 1, addChampionshipMarkets: ['NY'], activeThrough: 2027, boostPopularity: 80 },
  { name: 'Karl-Anthony Towns', addTeams: ['NYK'], addTeamNames: ['New York Knicks'], addJerseys: [32], addChampionships: 1, addChampionshipMarkets: ['NY'], activeThrough: 2027, boostPopularity: 95 },
  { name: 'Mikal Bridges', addTeams: ['NYK'], addTeamNames: ['New York Knicks'], addJerseys: [25], addChampionships: 1, addChampionshipMarkets: ['NY'], activeThrough: 2027, boostPopularity: 85 },
  { name: 'OG Anunoby', addTeams: ['NYK'], addTeamNames: ['New York Knicks'], addJerseys: [8], addChampionships: 2, addChampionshipMarkets: ['TOR', 'NY'], activeThrough: 2027, boostPopularity: 85 },
  { name: 'Jalen Brunson', addTeams: ['NYK'], addTeamNames: ['New York Knicks'], addJerseys: [11], addChampionships: 1, addChampionshipMarkets: ['NY'], activeThrough: 2027, boostPopularity: 95 },
  { name: 'Josh Hart', addTeams: ['NYK'], addTeamNames: ['New York Knicks'], addJerseys: [3], addChampionships: 1, addChampionshipMarkets: ['NY'], activeThrough: 2027, boostPopularity: 80 },
  { name: 'Mitchell Robinson', addTeams: ['NYK'], addTeamNames: ['New York Knicks'], addJerseys: [23], addChampionships: 1, addChampionshipMarkets: ['NY'], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Miles McBride', addTeams: ['NYK'], addTeamNames: ['New York Knicks'], addJerseys: [2], addChampionships: 1, addChampionshipMarkets: ['NY'], activeThrough: 2027, boostPopularity: 70 },
  { name: 'Jordan Clarkson', addTeams: ['NYK'], addTeamNames: ['New York Knicks'], addJerseys: [0], addChampionships: 1, addChampionshipMarkets: ['NY'], activeThrough: 2027, boostPopularity: 80 },
  { name: 'Jeremy Sochan', addTeams: ['NYK'], addTeamNames: ['New York Knicks'], addJerseys: [10], addChampionships: 1, addChampionshipMarkets: ['NY'], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Landry Shamet', addTeams: ['NYK'], addTeamNames: ['New York Knicks'], addJerseys: [20], addChampionships: 1, addChampionshipMarkets: ['NY'], activeThrough: 2027, boostPopularity: 70 },
  { name: 'Tyler Kolek', addTeams: ['NYK'], addTeamNames: ['New York Knicks'], addJerseys: [8], addChampionships: 1, addChampionshipMarkets: ['NY'], activeThrough: 2027, boostPopularity: 65 },
  { name: 'Guerschon Yabusele', addTeams: ['NYK', 'PHI'], addTeamNames: ['New York Knicks', 'Philadelphia 76ers'], addJerseys: [28], addChampionships: 1, addChampionshipMarkets: ['NY'], activeThrough: 2027, boostPopularity: 70 },
  { name: 'Ariel Hukporti', addTeams: ['NYK'], addTeamNames: ['New York Knicks'], addJerseys: [55], addChampionships: 1, addChampionshipMarkets: ['NY'], activeThrough: 2027, boostPopularity: 60 },
  { name: 'Pacôme Dadiet', addTeams: ['NYK'], addTeamNames: ['New York Knicks'], addJerseys: [4], addChampionships: 1, addChampionshipMarkets: ['NY'], activeThrough: 2027, boostPopularity: 60 },
  { name: 'Precious Achiuwa', addTeams: ['NYK', 'SAC'], addTeamNames: ['New York Knicks', 'Sacramento Kings'], addJerseys: [5], addChampionships: 1, addChampionshipMarkets: ['NY'], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Cameron Payne', addTeams: ['NYK'], addTeamNames: ['New York Knicks'], addJerseys: [1], addChampionships: 1, addChampionshipMarkets: ['NY'], activeThrough: 2026, boostPopularity: 75 },

  // 2024 World Champion Boston Celtics
  { name: 'Jayson Tatum', addTeams: ['BOS'], addTeamNames: ['Boston Celtics'], addJerseys: [0], addChampionships: 1, addChampionshipMarkets: ['BOS'], activeThrough: 2027, boostPopularity: 98 },
  { name: 'Jaylen Brown', addTeams: ['BOS'], addTeamNames: ['Boston Celtics'], addJerseys: [7], addChampionships: 1, addChampionshipMarkets: ['BOS'], activeThrough: 2027, boostPopularity: 95 },
  { name: 'Jrue Holiday', addTeams: ['BOS'], addTeamNames: ['Boston Celtics'], addJerseys: [4], addChampionships: 2, addChampionshipMarkets: ['MIL', 'BOS'], activeThrough: 2027, boostPopularity: 90 },
  { name: 'Derrick White', addTeams: ['BOS'], addTeamNames: ['Boston Celtics'], addJerseys: [9], addChampionships: 1, addChampionshipMarkets: ['BOS'], activeThrough: 2027, boostPopularity: 90 },
  { name: 'Kristaps Porziņģis', addTeams: ['BOS'], addTeamNames: ['Boston Celtics'], addJerseys: [8], addChampionships: 1, addChampionshipMarkets: ['BOS'], activeThrough: 2027, boostPopularity: 90 },
  { name: 'Al Horford', addTeams: ['BOS'], addTeamNames: ['Boston Celtics'], addJerseys: [42], addChampionships: 1, addChampionshipMarkets: ['BOS'], activeThrough: 2027, boostPopularity: 85 },
  { name: 'Payton Pritchard', addTeams: ['BOS'], addTeamNames: ['Boston Celtics'], addJerseys: [11], addChampionships: 1, addChampionshipMarkets: ['BOS'], activeThrough: 2027, boostPopularity: 80 },
  { name: 'Sam Hauser', addTeams: ['BOS'], addTeamNames: ['Boston Celtics'], addJerseys: [30], addChampionships: 1, addChampionshipMarkets: ['BOS'], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Luke Kornet', addTeams: ['BOS'], addTeamNames: ['Boston Celtics'], addJerseys: [40], addChampionships: 1, addChampionshipMarkets: ['BOS'], activeThrough: 2027, boostPopularity: 70 },
  { name: 'Neemias Queta', addTeams: ['BOS'], addTeamNames: ['Boston Celtics'], addJerseys: [88], addChampionships: 1, addChampionshipMarkets: ['BOS'], activeThrough: 2027, boostPopularity: 65 },
  { name: 'Xavier Tillman Sr.', addTeams: ['BOS'], addTeamNames: ['Boston Celtics'], addJerseys: [26], addChampionships: 1, addChampionshipMarkets: ['BOS'], activeThrough: 2027, boostPopularity: 65 },
  { name: 'Oshae Brissett', addTeams: ['BOS'], addTeamNames: ['Boston Celtics'], addJerseys: [12], addChampionships: 1, addChampionshipMarkets: ['BOS'], activeThrough: 2025, boostPopularity: 65 },
  { name: 'Svi Mykhailiuk', addTeams: ['BOS', 'UTA'], addTeamNames: ['Boston Celtics', 'Utah Jazz'], addJerseys: [50, 19], addChampionships: 1, addChampionshipMarkets: ['BOS'], activeThrough: 2027, boostPopularity: 70 },

  // Major 2024-2026 NBA Moves Across All Teams
  { name: 'Paul George', addTeams: ['PHI'], addTeamNames: ['Philadelphia 76ers'], addJerseys: [8], activeThrough: 2027, boostPopularity: 95 },
  { name: 'Caleb Martin', addTeams: ['PHI'], addTeamNames: ['Philadelphia 76ers'], addJerseys: [16], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Andre Drummond', addTeams: ['PHI'], addTeamNames: ['Philadelphia 76ers'], addJerseys: [5], activeThrough: 2026, boostPopularity: 80 },
  { name: 'Eric Gordon', addTeams: ['PHI'], addTeamNames: ['Philadelphia 76ers'], addJerseys: [23], activeThrough: 2026, boostPopularity: 80 },
  { name: 'Reggie Jackson', addTeams: ['PHI'], addTeamNames: ['Philadelphia 76ers'], addJerseys: [7], activeThrough: 2025, boostPopularity: 75 },
  { name: 'Klay Thompson', addTeams: ['DAL'], addTeamNames: ['Dallas Mavericks'], addJerseys: [31], activeThrough: 2027, boostPopularity: 95 },
  { name: 'Naji Marshall', addTeams: ['DAL'], addTeamNames: ['Dallas Mavericks'], addJerseys: [13], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Spencer Dinwiddie', addTeams: ['DAL'], addTeamNames: ['Dallas Mavericks'], addJerseys: [26], activeThrough: 2025, boostPopularity: 75 },
  { name: 'Quentin Grimes', addTeams: ['DAL'], addTeamNames: ['Dallas Mavericks'], addJerseys: [5], activeThrough: 2025, boostPopularity: 75 },
  { name: 'DeMar DeRozan', addTeams: ['SAC'], addTeamNames: ['Sacramento Kings'], addJerseys: [10], activeThrough: 2027, boostPopularity: 95 },
  { name: 'Jordan McLaughlin', addTeams: ['SAC'], addTeamNames: ['Sacramento Kings'], addJerseys: [6], activeThrough: 2025, boostPopularity: 65 },
  { name: 'Jalen McDaniels', addTeams: ['SAC'], addTeamNames: ['Sacramento Kings'], addJerseys: [2], activeThrough: 2025, boostPopularity: 65 },
  { name: 'Chris Paul', addTeams: ['SAS'], addTeamNames: ['San Antonio Spurs'], addJerseys: [3], activeThrough: 2025, boostPopularity: 95 },
  { name: 'Harrison Barnes', addTeams: ['SAS'], addTeamNames: ['San Antonio Spurs'], addJerseys: [40], activeThrough: 2026, boostPopularity: 80 },
  { name: 'Russell Westbrook', addTeams: ['DEN'], addTeamNames: ['Denver Nuggets'], addJerseys: [4], activeThrough: 2026, boostPopularity: 95 },
  { name: 'Dario Šarić', addTeams: ['DEN'], addTeamNames: ['Denver Nuggets'], addJerseys: [9], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Kentavious Caldwell-Pope', addTeams: ['ORL'], addTeamNames: ['Orlando Magic'], addJerseys: [3], activeThrough: 2027, boostPopularity: 80 },
  { name: 'Alex Caruso', addTeams: ['OKC'], addTeamNames: ['Oklahoma City Thunder'], addJerseys: [9], activeThrough: 2027, boostPopularity: 85 },
  { name: 'Isaiah Hartenstein', addTeams: ['OKC'], addTeamNames: ['Oklahoma City Thunder'], addJerseys: [55], activeThrough: 2027, boostPopularity: 80 },
  { name: 'Gordon Hayward', addTeams: ['OKC'], addTeamNames: ['Oklahoma City Thunder'], addJerseys: [33], activeThrough: 2024, boostPopularity: 80 },
  { name: 'Dejounte Murray', addTeams: ['NOP'], addTeamNames: ['New Orleans Pelicans'], addJerseys: [5], activeThrough: 2027, boostPopularity: 85 },
  { name: 'Daniel Theis', addTeams: ['NOP'], addTeamNames: ['New Orleans Pelicans'], addJerseys: [27], activeThrough: 2025, boostPopularity: 70 },
  { name: 'Javonte Green', addTeams: ['NOP'], addTeamNames: ['New Orleans Pelicans'], addJerseys: [24], activeThrough: 2025, boostPopularity: 70 },
  { name: 'Jonas Valančiūnas', addTeams: ['WAS'], addTeamNames: ['Washington Wizards'], addJerseys: [17], activeThrough: 2027, boostPopularity: 80 },
  { name: 'Malcolm Brogdon', addTeams: ['WAS'], addTeamNames: ['Washington Wizards'], addJerseys: [15], activeThrough: 2026, boostPopularity: 80 },
  { name: 'Saddiq Bey', addTeams: ['WAS'], addTeamNames: ['Washington Wizards'], addJerseys: [41], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Buddy Hield', addTeams: ['PHI', 'GSW'], addTeamNames: ['Philadelphia 76ers', 'Golden State Warriors'], addJerseys: [17, 7], activeThrough: 2027, boostPopularity: 85 },
  { name: 'Kyle Anderson', addTeams: ['GSW'], addTeamNames: ['Golden State Warriors'], addJerseys: [1], activeThrough: 2027, boostPopularity: 75 },
  { name: 'De\'Anthony Melton', addTeams: ['GSW'], addTeamNames: ['Golden State Warriors'], addJerseys: [8], activeThrough: 2025, boostPopularity: 75 },
  { name: 'Tyus Jones', addTeams: ['PHX'], addTeamNames: ['Phoenix Suns'], addJerseys: [21], activeThrough: 2025, boostPopularity: 75 },
  { name: 'Monte Morris', addTeams: ['PHX'], addTeamNames: ['Phoenix Suns'], addJerseys: [23], activeThrough: 2025, boostPopularity: 70 },
  { name: 'Mason Plumlee', addTeams: ['PHX'], addTeamNames: ['Phoenix Suns'], addJerseys: [44], activeThrough: 2025, boostPopularity: 75 },
  { name: 'Derrick Jones Jr.', addTeams: ['LAC'], addTeamNames: ['Los Angeles Clippers'], addJerseys: [55], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Kris Dunn', addTeams: ['LAC'], addTeamNames: ['Los Angeles Clippers'], addJerseys: [8], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Kevin Porter Jr.', addTeams: ['LAC'], addTeamNames: ['Los Angeles Clippers'], addJerseys: [77], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Mo Bamba', addTeams: ['LAC'], addTeamNames: ['Los Angeles Clippers'], addJerseys: [11], activeThrough: 2025, boostPopularity: 70 },
  { name: 'Nicolas Batum', addTeams: ['LAC'], addTeamNames: ['Los Angeles Clippers'], addJerseys: [33], activeThrough: 2026, boostPopularity: 80 },
  { name: 'P.J. Tucker', addTeams: ['LAC'], addTeamNames: ['Los Angeles Clippers'], addJerseys: [17], activeThrough: 2025, boostPopularity: 80 },
  { name: 'Gary Trent Jr.', addTeams: ['MIL'], addTeamNames: ['Milwaukee Bucks'], addJerseys: [5], activeThrough: 2025, boostPopularity: 75 },
  { name: 'Taurean Prince', addTeams: ['MIL'], addTeamNames: ['Milwaukee Bucks'], addJerseys: [12], activeThrough: 2025, boostPopularity: 70 },
  { name: 'Delon Wright', addTeams: ['MIL'], addTeamNames: ['Milwaukee Bucks'], addJerseys: [55], activeThrough: 2025, boostPopularity: 70 },
  { name: 'Dennis Schröder', addTeams: ['BKN'], addTeamNames: ['Brooklyn Nets'], addJerseys: [17], activeThrough: 2025, boostPopularity: 80 },
  { name: 'Bojan Bogdanović', addTeams: ['NYK', 'BKN'], addTeamNames: ['New York Knicks', 'Brooklyn Nets'], addJerseys: [44], activeThrough: 2025, boostPopularity: 80 },
  { name: 'Ziaire Williams', addTeams: ['BKN'], addTeamNames: ['Brooklyn Nets'], addJerseys: [8], activeThrough: 2025, boostPopularity: 70 },
  { name: 'Shake Milton', addTeams: ['BKN'], addTeamNames: ['Brooklyn Nets'], addJerseys: [7], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Josh Giddey', addTeams: ['CHI'], addTeamNames: ['Chicago Bulls'], addJerseys: [3], activeThrough: 2025, boostPopularity: 80 },
  { name: 'Jalen Smith', addTeams: ['CHI'], addTeamNames: ['Chicago Bulls'], addJerseys: [25], activeThrough: 2027, boostPopularity: 70 },
  { name: 'Chris Duarte', addTeams: ['CHI'], addTeamNames: ['Chicago Bulls'], addJerseys: [27], activeThrough: 2025, boostPopularity: 70 },
  { name: 'Larry Nance Jr.', addTeams: ['ATL'], addTeamNames: ['Atlanta Hawks'], addJerseys: [22], activeThrough: 2025, boostPopularity: 75 },
  { name: 'Dyson Daniels', addTeams: ['ATL'], addTeamNames: ['Atlanta Hawks'], addJerseys: [4], activeThrough: 2026, boostPopularity: 75 },
  { name: 'David Roddy', addTeams: ['ATL'], addTeamNames: ['Atlanta Hawks'], addJerseys: [21], activeThrough: 2026, boostPopularity: 65 },
  { name: 'Cody Zeller', addTeams: ['ATL'], addTeamNames: ['Atlanta Hawks'], addJerseys: [40], activeThrough: 2025, boostPopularity: 70 },
  { name: 'Josh Green', addTeams: ['CHA'], addTeamNames: ['Charlotte Hornets'], addJerseys: [10], activeThrough: 2027, boostPopularity: 70 },
  { name: 'Taj Gibson', addTeams: ['CHA'], addTeamNames: ['Charlotte Hornets'], addJerseys: [67], activeThrough: 2025, boostPopularity: 75 },
  { name: 'Seth Curry', addTeams: ['CHA'], addTeamNames: ['Charlotte Hornets'], addJerseys: [30], activeThrough: 2025, boostPopularity: 80 },
  { name: 'James Wiseman', addTeams: ['IND'], addTeamNames: ['Indiana Pacers'], addJerseys: [13], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Tobias Harris', addTeams: ['DET'], addTeamNames: ['Detroit Pistons'], addJerseys: [12], activeThrough: 2026, boostPopularity: 85 },
  { name: 'Tim Hardaway Jr.', addTeams: ['DET'], addTeamNames: ['Detroit Pistons'], addJerseys: [5], activeThrough: 2025, boostPopularity: 80 },
  { name: 'Malik Beasley', addTeams: ['DET'], addTeamNames: ['Detroit Pistons'], addJerseys: [5], activeThrough: 2025, boostPopularity: 75 },
  { name: 'Paul Reed', addTeams: ['DET'], addTeamNames: ['Detroit Pistons'], addJerseys: [7], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Wendell Moore Jr.', addTeams: ['DET'], addTeamNames: ['Detroit Pistons'], addJerseys: [14], activeThrough: 2025, boostPopularity: 65 },
  { name: 'Davion Mitchell', addTeams: ['TOR'], addTeamNames: ['Toronto Raptors'], addJerseys: [45], activeThrough: 2025, boostPopularity: 70 },
  { name: 'Bruno Fernando', addTeams: ['TOR'], addTeamNames: ['Toronto Raptors'], addJerseys: [20], activeThrough: 2025, boostPopularity: 65 },
  { name: 'Patty Mills', addTeams: ['UTA'], addTeamNames: ['Utah Jazz'], addJerseys: [8], activeThrough: 2025, boostPopularity: 75 },
  { name: 'Drew Eubanks', addTeams: ['UTA'], addTeamNames: ['Utah Jazz'], addJerseys: [14], activeThrough: 2026, boostPopularity: 65 },
  { name: 'Alec Burks', addTeams: ['NYK', 'MIA'], addTeamNames: ['New York Knicks', 'Miami Heat'], addJerseys: [18, 14], activeThrough: 2025, boostPopularity: 75 },
];

// ============================================================
// 3. NHL 2024-2026 ROSTER & TRANSACTION REGISTRY (134+ Players)
// ============================================================
const NHL_AUGMENTS: AthleteAugment[] = [
  // 2024 Stanley Cup Champion Florida Panthers
  { name: 'Aleksander Barkov', addTeams: ['FLA'], addTeamNames: ['Florida Panthers'], addJerseys: [16], addChampionships: 1, addChampionshipMarkets: ['FLA'], activeThrough: 2027, boostPopularity: 95 },
  { name: 'Matthew Tkachuk', addTeams: ['FLA'], addTeamNames: ['Florida Panthers'], addJerseys: [19], addChampionships: 1, addChampionshipMarkets: ['FLA'], activeThrough: 2027, boostPopularity: 95 },
  { name: 'Sam Reinhart', addTeams: ['FLA'], addTeamNames: ['Florida Panthers'], addJerseys: [13], addChampionships: 1, addChampionshipMarkets: ['FLA'], activeThrough: 2027, boostPopularity: 90 },
  { name: 'Sergei Bobrovsky', addTeams: ['FLA'], addTeamNames: ['Florida Panthers'], addJerseys: [72], addChampionships: 1, addChampionshipMarkets: ['FLA'], activeThrough: 2027, boostPopularity: 95 },
  { name: 'Carter Verhaeghe', addTeams: ['FLA'], addTeamNames: ['Florida Panthers'], addJerseys: [23], addChampionships: 2, addChampionshipMarkets: ['FLA'], activeThrough: 2027, boostPopularity: 85 },
  { name: 'Sam Bennett', addTeams: ['FLA'], addTeamNames: ['Florida Panthers'], addJerseys: [9], addChampionships: 1, addChampionshipMarkets: ['FLA'], activeThrough: 2027, boostPopularity: 80 },
  { name: 'Aaron Ekblad', addTeams: ['FLA'], addTeamNames: ['Florida Panthers'], addJerseys: [5], addChampionships: 1, addChampionshipMarkets: ['FLA'], activeThrough: 2027, boostPopularity: 85 },
  { name: 'Gustav Forsling', addTeams: ['FLA'], addTeamNames: ['Florida Panthers'], addJerseys: [42], addChampionships: 1, addChampionshipMarkets: ['FLA'], activeThrough: 2027, boostPopularity: 80 },
  { name: 'Evan Rodrigues', addTeams: ['FLA'], addTeamNames: ['Florida Panthers'], addJerseys: [17], addChampionships: 1, addChampionshipMarkets: ['FLA'], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Eetu Luostarinen', addTeams: ['FLA'], addTeamNames: ['Florida Panthers'], addJerseys: [27], addChampionships: 1, addChampionshipMarkets: ['FLA'], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Anton Lundell', addTeams: ['FLA'], addTeamNames: ['Florida Panthers'], addJerseys: [15], addChampionships: 1, addChampionshipMarkets: ['FLA'], activeThrough: 2027, boostPopularity: 80 },
  { name: 'Dmitry Kulikov', addTeams: ['FLA'], addTeamNames: ['Florida Panthers'], addJerseys: [7], addChampionships: 1, addChampionshipMarkets: ['FLA'], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Niko Mikkola', addTeams: ['FLA'], addTeamNames: ['Florida Panthers'], addJerseys: [77], addChampionships: 1, addChampionshipMarkets: ['FLA'], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Oliver Ekman-Larsson', addTeams: ['FLA', 'TOR'], addTeamNames: ['Florida Panthers', 'Toronto Maple Leafs'], addJerseys: [91, 22], addChampionships: 1, addChampionshipMarkets: ['FLA'], activeThrough: 2027, boostPopularity: 85 },
  { name: 'Brandon Montour', addTeams: ['FLA', 'SEA'], addTeamNames: ['Florida Panthers', 'Seattle Kraken'], addJerseys: [62], addChampionships: 1, addChampionshipMarkets: ['FLA'], activeThrough: 2027, boostPopularity: 85 },
  { name: 'Ryan Lomberg', addTeams: ['FLA', 'CGY'], addTeamNames: ['Florida Panthers', 'Calgary Flames'], addJerseys: [94], addChampionships: 1, addChampionshipMarkets: ['FLA'], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Steven Lorentz', addTeams: ['FLA', 'TOR'], addTeamNames: ['Florida Panthers', 'Toronto Maple Leafs'], addJerseys: [18], addChampionships: 1, addChampionshipMarkets: ['FLA'], activeThrough: 2025, boostPopularity: 70 },
  { name: 'Anthony Stolarz', addTeams: ['FLA', 'TOR'], addTeamNames: ['Florida Panthers', 'Toronto Maple Leafs'], addJerseys: [41], addChampionships: 1, addChampionshipMarkets: ['FLA'], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Nate Schmidt', addTeams: ['FLA'], addTeamNames: ['Florida Panthers'], addJerseys: [88], activeThrough: 2025, boostPopularity: 75 },
  { name: 'Tomas Nosek', addTeams: ['FLA'], addTeamNames: ['Florida Panthers'], addJerseys: [12], activeThrough: 2025, boostPopularity: 70 },
  { name: 'Jesper Boqvist', addTeams: ['FLA'], addTeamNames: ['Florida Panthers'], addJerseys: [70], activeThrough: 2025, boostPopularity: 70 },
  { name: 'A.J. Greer', addTeams: ['FLA'], addTeamNames: ['Florida Panthers'], addJerseys: [10], activeThrough: 2026, boostPopularity: 65 },

  // Major 2024-2026 NHL Trades & Signings
  { name: 'Joonas Korpisalo', addTeams: ['NYR'], addTeamNames: ['New York Rangers'], addJerseys: [70], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Linus Ullmark', addTeams: ['OTT'], addTeamNames: ['Ottawa Senators'], addJerseys: [35], activeThrough: 2027, boostPopularity: 80 },
  { name: 'Elias Lindholm', addTeams: ['BOS'], addTeamNames: ['Boston Bruins'], addJerseys: [28], activeThrough: 2027, boostPopularity: 85 },
  { name: 'Nikita Zadorov', addTeams: ['BOS'], addTeamNames: ['Boston Bruins'], addJerseys: [91], activeThrough: 2027, boostPopularity: 80 },
  { name: 'Reilly Smith', addTeams: ['NYR'], addTeamNames: ['New York Rangers'], addJerseys: [91], activeThrough: 2025, boostPopularity: 75 },
  { name: 'Steven Stamkos', addTeams: ['NSH'], addTeamNames: ['Nashville Predators'], addJerseys: [91], activeThrough: 2027, boostPopularity: 95 },
  { name: 'Jonathan Marchessault', addTeams: ['NSH'], addTeamNames: ['Nashville Predators'], addJerseys: [81], activeThrough: 2027, boostPopularity: 85 },
  { name: 'Brady Skjei', addTeams: ['NSH'], addTeamNames: ['Nashville Predators'], addJerseys: [76], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Scott Wedgewood', addTeams: ['NSH'], addTeamNames: ['Nashville Predators'], addJerseys: [41], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Jake Guentzel', addTeams: ['TBL'], addTeamNames: ['Tampa Bay Lightning'], addJerseys: [59], activeThrough: 2027, boostPopularity: 85 },
  { name: 'Ryan McDonagh', addTeams: ['TBL'], addTeamNames: ['Tampa Bay Lightning'], addJerseys: [27], activeThrough: 2026, boostPopularity: 80 },
  { name: 'Cam Atkinson', addTeams: ['TBL'], addTeamNames: ['Tampa Bay Lightning'], addJerseys: [89], activeThrough: 2025, boostPopularity: 75 },
  { name: 'Mikhail Sergachev', addTeams: ['UTA'], addTeamNames: ['Utah Hockey Club'], addJerseys: [98], activeThrough: 2027, boostPopularity: 80 },
  { name: 'John Marino', addTeams: ['UTA'], addTeamNames: ['Utah Hockey Club'], addJerseys: [6], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Ian Cole', addTeams: ['UTA'], addTeamNames: ['Utah Hockey Club'], addJerseys: [28], activeThrough: 2025, boostPopularity: 75 },
  { name: 'Robert Bortuzzo', addTeams: ['UTA'], addTeamNames: ['Utah Hockey Club'], addJerseys: [41], activeThrough: 2025, boostPopularity: 70 },
  { name: 'Kevin Stenlund', addTeams: ['UTA'], addTeamNames: ['Utah Hockey Club'], addJerseys: [82], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Chandler Stephenson', addTeams: ['SEA'], addTeamNames: ['Seattle Kraken'], addJerseys: [9], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Sean Monahan', addTeams: ['CBJ'], addTeamNames: ['Columbus Blue Jackets'], addJerseys: [23], activeThrough: 2027, boostPopularity: 75 },
  { name: 'James van Riemsdyk', addTeams: ['CBJ'], addTeamNames: ['Columbus Blue Jackets'], addJerseys: [21], activeThrough: 2025, boostPopularity: 75 },
  { name: 'Jordan Harris', addTeams: ['CBJ'], addTeamNames: ['Columbus Blue Jackets'], addJerseys: [3], activeThrough: 2025, boostPopularity: 65 },
  { name: 'Zachary Aston-Reese', addTeams: ['CBJ'], addTeamNames: ['Columbus Blue Jackets'], addJerseys: [64], activeThrough: 2025, boostPopularity: 65 },
  { name: 'Teuvo Teravainen', addTeams: ['CHI'], addTeamNames: ['Chicago Blackhawks'], addJerseys: [86], activeThrough: 2027, boostPopularity: 80 },
  { name: 'Tyler Bertuzzi', addTeams: ['CHI'], addTeamNames: ['Chicago Blackhawks'], addJerseys: [59], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Alec Martinez', addTeams: ['CHI'], addTeamNames: ['Chicago Blackhawks'], addJerseys: [23], activeThrough: 2025, boostPopularity: 75 },
  { name: 'Laurent Brossoit', addTeams: ['CHI'], addTeamNames: ['Chicago Blackhawks'], addJerseys: [39], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Craig Smith', addTeams: ['CHI'], addTeamNames: ['Chicago Blackhawks'], addJerseys: [15], activeThrough: 2025, boostPopularity: 70 },
  { name: 'Patrick Maroon', addTeams: ['CHI'], addTeamNames: ['Chicago Blackhawks'], addJerseys: [17], activeThrough: 2025, boostPopularity: 75 },
  { name: 'Ilya Mikheyev', addTeams: ['CHI'], addTeamNames: ['Chicago Blackhawks'], addJerseys: [65], activeThrough: 2026, boostPopularity: 70 },
  { name: 'TJ Brodie', addTeams: ['CHI'], addTeamNames: ['Chicago Blackhawks'], addJerseys: [78], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Ilya Samsonov', addTeams: ['VGK'], addTeamNames: ['Vegas Golden Knights'], addJerseys: [35], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Noah Hanifin', addTeams: ['VGK'], addTeamNames: ['Vegas Golden Knights'], addJerseys: [15], activeThrough: 2027, boostPopularity: 85 },
  { name: 'Tomas Hertl', addTeams: ['VGK'], addTeamNames: ['Vegas Golden Knights'], addJerseys: [48], activeThrough: 2027, boostPopularity: 85 },
  { name: 'Alexander Holtz', addTeams: ['VGK'], addTeamNames: ['Vegas Golden Knights'], addJerseys: [10], activeThrough: 2025, boostPopularity: 70 },
  { name: 'Victor Olofsson', addTeams: ['VGK'], addTeamNames: ['Vegas Golden Knights'], addJerseys: [71], activeThrough: 2025, boostPopularity: 70 },
  { name: 'Chris Tanev', addTeams: ['TOR'], addTeamNames: ['Toronto Maple Leafs'], addJerseys: [8], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Max Pacioretty', addTeams: ['TOR'], addTeamNames: ['Toronto Maple Leafs'], addJerseys: [67], activeThrough: 2025, boostPopularity: 80 },
  { name: 'Jeff Skinner', addTeams: ['EDM'], addTeamNames: ['Edmonton Oilers'], addJerseys: [53], activeThrough: 2026, boostPopularity: 80 },
  { name: 'Viktor Arvidsson', addTeams: ['EDM'], addTeamNames: ['Edmonton Oilers'], addJerseys: [33], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Adam Henrique', addTeams: ['EDM'], addTeamNames: ['Edmonton Oilers'], addJerseys: [19], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Sam Carrick', addTeams: ['EDM', 'NYR'], addTeamNames: ['Edmonton Oilers', 'New York Rangers'], addJerseys: [39, 22], activeThrough: 2027, boostPopularity: 70 },
  { name: 'Ty Emberson', addTeams: ['EDM'], addTeamNames: ['Edmonton Oilers'], addJerseys: [49], activeThrough: 2025, boostPopularity: 65 },
  { name: 'Vasily Podkolzin', addTeams: ['EDM'], addTeamNames: ['Edmonton Oilers'], addJerseys: [92], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Matt Roy', addTeams: ['WSH'], addTeamNames: ['Washington Capitals'], addJerseys: [3], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Jakob Chychrun', addTeams: ['WSH'], addTeamNames: ['Washington Capitals'], addJerseys: [6], activeThrough: 2027, boostPopularity: 80 },
  { name: 'Logan Thompson', addTeams: ['WSH'], addTeamNames: ['Washington Capitals'], addJerseys: [48], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Pierre-Luc Dubois', addTeams: ['WSH'], addTeamNames: ['Washington Capitals'], addJerseys: [80], activeThrough: 2027, boostPopularity: 80 },
  { name: 'Andrew Mangiapane', addTeams: ['WSH'], addTeamNames: ['Washington Capitals'], addJerseys: [88], activeThrough: 2025, boostPopularity: 75 },
  { name: 'Brandon Duhaime', addTeams: ['WSH'], addTeamNames: ['Washington Capitals'], addJerseys: [22], activeThrough: 2026, boostPopularity: 65 },
  { name: 'Taylor Raddysh', addTeams: ['WSH'], addTeamNames: ['Washington Capitals'], addJerseys: [17], activeThrough: 2025, boostPopularity: 65 },
  { name: 'Darcy Kuemper', addTeams: ['LAK'], addTeamNames: ['Los Angeles Kings'], addJerseys: [35], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Warren Foegele', addTeams: ['LAK'], addTeamNames: ['Los Angeles Kings'], addJerseys: [37], activeThrough: 2027, boostPopularity: 70 },
  { name: 'Joel Edmundson', addTeams: ['LAK'], addTeamNames: ['Los Angeles Kings'], addJerseys: [6], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Tanner Jeannot', addTeams: ['LAK'], addTeamNames: ['Los Angeles Kings'], addJerseys: [84], activeThrough: 2025, boostPopularity: 70 },
  { name: 'Cam Talbot', addTeams: ['DET'], addTeamNames: ['Detroit Red Wings'], addJerseys: [39], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Vladimir Tarasenko', addTeams: ['DET'], addTeamNames: ['Detroit Red Wings'], addJerseys: [11], addChampionships: 2, addChampionshipMarkets: ['STL', 'FLA'], activeThrough: 2026, boostPopularity: 85 },
  { name: 'Erik Gustafsson', addTeams: ['DET'], addTeamNames: ['Detroit Red Wings'], addJerseys: [56], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Tyler Motte', addTeams: ['DET'], addTeamNames: ['Detroit Red Wings'], addJerseys: [14], activeThrough: 2025, boostPopularity: 65 },
  { name: 'Christian Fischer', addTeams: ['DET'], addTeamNames: ['Detroit Red Wings'], addJerseys: [36], activeThrough: 2025, boostPopularity: 65 },
  { name: 'Anthony Duclair', addTeams: ['NYI'], addTeamNames: ['New York Islanders'], addJerseys: [11], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Jacob Markstrom', addTeams: ['NJD'], addTeamNames: ['New Jersey Devils'], addJerseys: [25], activeThrough: 2026, boostPopularity: 80 },
  { name: 'Brett Pesce', addTeams: ['NJD'], addTeamNames: ['New Jersey Devils'], addJerseys: [22], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Brenden Dillon', addTeams: ['NJD'], addTeamNames: ['New Jersey Devils'], addJerseys: [5], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Stefan Noesen', addTeams: ['NJD'], addTeamNames: ['New Jersey Devils'], addJerseys: [11], activeThrough: 2027, boostPopularity: 70 },
  { name: 'Tomas Tatar', addTeams: ['NJD'], addTeamNames: ['New Jersey Devils'], addJerseys: [90], activeThrough: 2025, boostPopularity: 75 },
  { name: 'Paul Cotter', addTeams: ['NJD'], addTeamNames: ['New Jersey Devils'], addJerseys: [47], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Cody Glass', addTeams: ['NJD', 'PIT'], addTeamNames: ['New Jersey Devils', 'Pittsburgh Penguins'], addJerseys: [19], activeThrough: 2025, boostPopularity: 70 },
  { name: 'Patrik Laine', addTeams: ['MTL'], addTeamNames: ['Montreal Canadiens'], addJerseys: [92], activeThrough: 2026, boostPopularity: 85 },
  { name: 'Kevin Hayes', addTeams: ['PIT'], addTeamNames: ['Pittsburgh Penguins'], addJerseys: [13], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Anthony Beauvillier', addTeams: ['PIT'], addTeamNames: ['Pittsburgh Penguins'], addJerseys: [72], activeThrough: 2025, boostPopularity: 70 },
  { name: 'Blake Lizotte', addTeams: ['PIT'], addTeamNames: ['Pittsburgh Penguins'], addJerseys: [46], activeThrough: 2026, boostPopularity: 65 },
  { name: 'Matt Grzelcyk', addTeams: ['PIT'], addTeamNames: ['Pittsburgh Penguins'], addJerseys: [24], activeThrough: 2025, boostPopularity: 70 },
  { name: 'Tyler Toffoli', addTeams: ['SJS'], addTeamNames: ['San Jose Sharks'], addJerseys: [73], activeThrough: 2027, boostPopularity: 80 },
  { name: 'Alexander Wennberg', addTeams: ['SJS'], addTeamNames: ['San Jose Sharks'], addJerseys: [21], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Barclay Goodrow', addTeams: ['SJS'], addTeamNames: ['San Jose Sharks'], addJerseys: [21], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Cody Ceci', addTeams: ['SJS'], addTeamNames: ['San Jose Sharks'], addJerseys: [5], activeThrough: 2025, boostPopularity: 70 },
  { name: 'Jake Walman', addTeams: ['SJS'], addTeamNames: ['San Jose Sharks'], addJerseys: [96], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Dylan Holloway', addTeams: ['STL'], addTeamNames: ['St. Louis Blues'], addJerseys: [81], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Philip Broberg', addTeams: ['STL'], addTeamNames: ['St. Louis Blues'], addJerseys: [6], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Mathieu Joseph', addTeams: ['STL'], addTeamNames: ['St. Louis Blues'], addJerseys: [71], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Radek Faksa', addTeams: ['STL'], addTeamNames: ['St. Louis Blues'], addJerseys: [12], activeThrough: 2025, boostPopularity: 70 },
  { name: 'Alexandre Texier', addTeams: ['STL'], addTeamNames: ['St. Louis Blues'], addJerseys: [9], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Jake DeBrusk', addTeams: ['VAN'], addTeamNames: ['Vancouver Canucks'], addJerseys: [74], activeThrough: 2027, boostPopularity: 80 },
  { name: 'Danton Heinen', addTeams: ['VAN'], addTeamNames: ['Vancouver Canucks'], addJerseys: [43], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Kiefer Sherwood', addTeams: ['VAN'], addTeamNames: ['Vancouver Canucks'], addJerseys: [44], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Derek Forbort', addTeams: ['VAN'], addTeamNames: ['Vancouver Canucks'], addJerseys: [24], activeThrough: 2025, boostPopularity: 70 },
  { name: 'Vincent Desharnais', addTeams: ['VAN'], addTeamNames: ['Vancouver Canucks'], addJerseys: [2], activeThrough: 2026, boostPopularity: 65 },
  { name: 'Daniel Sprong', addTeams: ['VAN'], addTeamNames: ['Vancouver Canucks'], addJerseys: [17], activeThrough: 2025, boostPopularity: 70 },
  { name: 'Kevin Lankinen', addTeams: ['VAN'], addTeamNames: ['Vancouver Canucks'], addJerseys: [32], activeThrough: 2025, boostPopularity: 70 },
  { name: 'Colin Miller', addTeams: ['WPG'], addTeamNames: ['Winnipeg Jets'], addJerseys: [6], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Eric Comrie', addTeams: ['WPG'], addTeamNames: ['Winnipeg Jets'], addJerseys: [1], activeThrough: 2026, boostPopularity: 65 },
  { name: 'Sean Walker', addTeams: ['CAR'], addTeamNames: ['Carolina Hurricanes'], addJerseys: [26], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Shayne Gostisbehere', addTeams: ['CAR'], addTeamNames: ['Carolina Hurricanes'], addJerseys: [41], activeThrough: 2027, boostPopularity: 80 },
  { name: 'Jack Roslovic', addTeams: ['CAR'], addTeamNames: ['Carolina Hurricanes'], addJerseys: [96], activeThrough: 2025, boostPopularity: 75 },
  { name: 'William Carrier', addTeams: ['CAR'], addTeamNames: ['Carolina Hurricanes'], addJerseys: [28], activeThrough: 2027, boostPopularity: 70 },
  { name: 'Tyson Jost', addTeams: ['CAR'], addTeamNames: ['Carolina Hurricanes'], addJerseys: [19], activeThrough: 2025, boostPopularity: 70 },
  { name: 'Eric Robinson', addTeams: ['CAR'], addTeamNames: ['Carolina Hurricanes'], addJerseys: [50], activeThrough: 2025, boostPopularity: 65 },
  { name: 'Jason Zucker', addTeams: ['BUF'], addTeamNames: ['Buffalo Sabres'], addJerseys: [17], activeThrough: 2025, boostPopularity: 75 },
  { name: 'Ryan McLeod', addTeams: ['BUF'], addTeamNames: ['Buffalo Sabres'], addJerseys: [71], activeThrough: 2025, boostPopularity: 70 },
  { name: 'Beck Malenstyn', addTeams: ['BUF'], addTeamNames: ['Buffalo Sabres'], addJerseys: [29], activeThrough: 2026, boostPopularity: 65 },
  { name: 'Sam Lafferty', addTeams: ['BUF'], addTeamNames: ['Buffalo Sabres'], addJerseys: [81], activeThrough: 2026, boostPopularity: 65 },
  { name: 'James Reimer', addTeams: ['BUF'], addTeamNames: ['Buffalo Sabres'], addJerseys: [47], activeThrough: 2025, boostPopularity: 75 },
  { name: 'Anthony Mantha', addTeams: ['CGY'], addTeamNames: ['Calgary Flames'], addJerseys: [39], activeThrough: 2025, boostPopularity: 75 },
  { name: 'Kevin Bahl', addTeams: ['CGY'], addTeamNames: ['Calgary Flames'], addJerseys: [88], activeThrough: 2025, boostPopularity: 65 },
  { name: 'Jake Bean', addTeams: ['CGY'], addTeamNames: ['Calgary Flames'], addJerseys: [24], activeThrough: 2026, boostPopularity: 65 },
  { name: 'Tyson Barrie', addTeams: ['CGY'], addTeamNames: ['Calgary Flames'], addJerseys: [4], activeThrough: 2025, boostPopularity: 75 },
  { name: 'Daniil Miromanov', addTeams: ['CGY'], addTeamNames: ['Calgary Flames'], addJerseys: [62], activeThrough: 2026, boostPopularity: 65 },
  { name: 'Casey Mittelstadt', addTeams: ['COL'], addTeamNames: ['Colorado Avalanche'], addJerseys: [37], activeThrough: 2027, boostPopularity: 75 },
  { name: 'Oliver Kylington', addTeams: ['COL'], addTeamNames: ['Colorado Avalanche'], addJerseys: [58], activeThrough: 2025, boostPopularity: 65 },
  { name: 'Calvin de Haan', addTeams: ['COL'], addTeamNames: ['Colorado Avalanche'], addJerseys: [44], activeThrough: 2025, boostPopularity: 70 },
  { name: 'Parker Kelly', addTeams: ['COL'], addTeamNames: ['Colorado Avalanche'], addJerseys: [41], activeThrough: 2026, boostPopularity: 65 },
  { name: 'Joel Kiviranta', addTeams: ['COL'], addTeamNames: ['Colorado Avalanche'], addJerseys: [94], activeThrough: 2025, boostPopularity: 65 },
  { name: 'Mathew Dumba', addTeams: ['DAL'], addTeamNames: ['Dallas Stars'], addJerseys: [5], activeThrough: 2026, boostPopularity: 75 },
  { name: 'Ilya Lyubushkin', addTeams: ['DAL'], addTeamNames: ['Dallas Stars'], addJerseys: [46], activeThrough: 2027, boostPopularity: 70 },
  { name: 'Casey DeSmith', addTeams: ['DAL'], addTeamNames: ['Dallas Stars'], addJerseys: [1], activeThrough: 2027, boostPopularity: 70 },
  { name: 'Brendan Smith', addTeams: ['DAL'], addTeamNames: ['Dallas Stars'], addJerseys: [2], activeThrough: 2025, boostPopularity: 70 },
  { name: 'Colin Blackwell', addTeams: ['DAL'], addTeamNames: ['Dallas Stars'], addJerseys: [15], activeThrough: 2025, boostPopularity: 65 },
  { name: 'Yakov Trenin', addTeams: ['MIN'], addTeamNames: ['Minnesota Wild'], addJerseys: [13], activeThrough: 2027, boostPopularity: 70 },
  { name: 'Jakub Lauko', addTeams: ['MIN'], addTeamNames: ['Minnesota Wild'], addJerseys: [94], activeThrough: 2025, boostPopularity: 65 },
  { name: 'David Perron', addTeams: ['OTT'], addTeamNames: ['Ottawa Senators'], addJerseys: [57], activeThrough: 2026, boostPopularity: 80 },
  { name: 'Michael Amadio', addTeams: ['OTT'], addTeamNames: ['Ottawa Senators'], addJerseys: [22], activeThrough: 2027, boostPopularity: 70 },
  { name: 'Nick Cousins', addTeams: ['OTT'], addTeamNames: ['Ottawa Senators'], addJerseys: [21], addChampionships: 1, addChampionshipMarkets: ['FLA'], activeThrough: 2025, boostPopularity: 75 },
  { name: 'Nick Jensen', addTeams: ['OTT'], addTeamNames: ['Ottawa Senators'], addJerseys: [3], activeThrough: 2026, boostPopularity: 70 },
  { name: 'Noah Gregor', addTeams: ['OTT'], addTeamNames: ['Ottawa Senators'], addJerseys: [73], activeThrough: 2025, boostPopularity: 65 },
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

      // 1. Teams & Metro Markets
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

      // 4. Championships & Championship Markets
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
