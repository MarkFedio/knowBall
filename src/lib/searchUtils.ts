/**
 * Search Utilities: Diacritics Normalization, Punctuation Stripping, Common Nicknames, and Highlighting
 */

// Common sports nicknames & aliases mapped to canonical search terms
export const NICKNAME_ALIASES: Record<string, string> = {
  // Basketball
  'porzingis': 'kristaps porzingis',
  'tingus pingus': 'kristaps porzingis',
  'aunonoby': 'og anunoby',
  'og aunonoby': 'og anunoby',
  'the joker': 'nikola jokic',
  'jokic': 'nikola jokic',
  'luka': 'luka doncic',
  'luka magic': 'luka doncic',
  'ant': 'anthony edwards',
  'ant-man': 'anthony edwards',
  'ant man': 'anthony edwards',
  'chet': 'chet holmgren',
  'steph curry': 'stephen curry',
  'magic johnson': 'earvin johnson',
  'magic': 'earvin johnson',
  'penny hardaway': 'anfernee hardaway',
  'penny': 'anfernee hardaway',
  'mitch richmond': 'mitchell richmond',
  'ron artest': 'metta sandiford-artest',
  'metta world peace': 'metta sandiford-artest',
  'world peace': 'metta sandiford-artest',
  'kareem': 'kareem abdul-jabbar',
  'lew alcindor': 'kareem abdul-jabbar',
  'giannis': 'giannis antetokounmpo',
  'the greek freak': 'giannis antetokounmpo',
  'wemby': 'victor wembanyama',
  'king james': 'lebron james',
  'bron': 'lebron james',
  'spida': 'donovan mitchell',
  'boogie cousins': 'demarcus cousins',
  'boogie': 'demarcus cousins',
  'shai': 'shai gilgeous-alexander',
  'sga': 'shai gilgeous-alexander',
  'kat': 'karl-anthony towns',
  'bam adebayo': 'edrice adebayo',
  'grand theft alvarado': 'jose alvarado',
  'alvarado': 'jose alvarado',
  'enes kanter': 'enes freedom',
  'kanter': 'enes freedom',
  'svi mykhailiuk': 'sviatoslav mykhailiuk',
  'svi': 'sviatoslav mykhailiuk',
  'ish smith': 'ishmael smith',
  'walt frazier': 'walter frazier',
  'clyde': 'walter frazier',
  'pete maravich': 'peter maravich',
  'pistol pete': 'peter maravich',
  'hal greer': 'harold greer',
  'nate thurmond': 'nathaniel thurmond',
  'tiny archibald': 'nate archibald',
  'world b free': 'world b. free',
  'cj mccollum': 'c.j. mccollum',
  'pj tucker': 'p.j. tucker',
  'tj mcconnell': 't.j. mcconnell',
  'tj warren': 't.j. warren',
  'jj redick': 'j.j. redick',
  'jr smith': 'j.r. smith',

  // Baseball
  'r.a. dickey': 'r. a. dickey',
  'ra dickey': 'r. a. dickey',
  'a.j. pierzynski': 'a. j. pierzynski',
  'aj pierzynski': 'a. j. pierzynski',
  'j.d. drew': 'j. d. drew',
  'jd drew': 'j. d. drew',
  'j.t. snow': 'j. t. snow',
  'jt snow': 'j. t. snow',
  'b.j. surhoff': 'b. j. surhoff',
  'bj surhoff': 'b. j. surhoff',
  'cj cron': 'c.j. cron',
  'pete rose': 'peter rose',
  'chourio': 'jackson chourio',
  'yelich': 'christian yelich',
  'kike hernandez': 'enrique hernandez',
  'kike': 'enrique hernandez',
  'kiké hernandez': 'enrique hernandez',
  'kiké': 'enrique hernandez',
  'a-rod': 'alex rodriguez',
  'arod': 'alex rodriguez',
  'mookie betts': 'markus betts',
  'mookie': 'markus betts',
  'ken griffey': 'ken griffey',
  'ken griffey jr': 'ken griffey',
  'junior': 'ken griffey',
  'shohei': 'shohei ohtani',
  'sho': 'shohei ohtani',
  'pudge rodriguez': 'ivan rodriguez',
  'pudge': 'ivan rodriguez',
  'chipper jones': 'larry jones',
  'chipper': 'larry jones',
  'coco crisp': 'covelli crisp',
  'buster posey': 'gerald posey',
  'buster': 'gerald posey',
  'big papi': 'david ortiz',
  'the kid': 'ted williams',
  'the say hey kid': 'willie mays',

  // Football
  'saquon': 'saquon barkley',
  'charbonnet': 'zach charbonnet',
  'mitch trubisky': 'mitchell trubisky',
  'chad ochocinco': 'chad johnson',
  'ochocinco': 'chad johnson',
  'megatron': 'calvin johnson',
  'beast mode': 'marshawn lynch',
  'sweetness': 'walter payton',
  'prime time': 'deion sanders',
  'neon deion': 'deion sanders',
  'bo jackson': 'vincent jackson',
  'rg3': 'robert griffin',
  'rgiii': 'robert griffin',
  'edoo': 'edgerrin james',

  // Hockey
  'korpisalo': 'joonas korpisalo',
  'ovi': 'alexander ovechkin',
  'ovie': 'alexander ovechkin',
  'the great one': 'wayne gretzky',
  'super mario': 'mario lemieux',
  'sid the kid': 'sidney crosby',
  'breadman': 'artemi panarin',
  'teemu': 'teemu selanne',
  'the finnish flash': 'teemu selanne',
};

/**
 * Normalizes a string by stripping accents/diacritics, lowercase, and removing punctuation.
 */
export function normalizeSearchString(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Strip diacritics / accents
    .replace(/ø/g, 'o')
    .replace(/æ/g, 'ae')
    .replace(/ð/g, 'd')
    .replace(/þ/g, 'th')
    .replace(/ß/g, 'ss')
    .toLowerCase()
    .replace(/[-_/]/g, ' ') // replace hyphens and slashes with space
    .replace(/[.'’`]/g, '') // remove dots and apostrophes (e.g. T.J. -> TJ, O'Neal -> ONeal)
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Resolves potential nicknames/aliases to canonical name search terms.
 */
export function resolveAlias(rawQuery: string): string {
  const normalized = normalizeSearchString(rawQuery);
  return NICKNAME_ALIASES[normalized] || rawQuery;
}

/**
 * Splits text into highlighted matched chunks for rendering.
 */
export function getHighlightedSegments(
  text: string,
  query: string
): { text: string; isMatch: boolean }[] {
  if (!query.trim()) {
    return [{ text, isMatch: false }];
  }

  const normText = normalizeSearchString(text);
  const normQuery = normalizeSearchString(query);

  if (!normQuery) {
    return [{ text, isMatch: false }];
  }

  // Find start index of match in normalized string
  const matchIndex = normText.indexOf(normQuery);
  if (matchIndex === -1) {
    return [{ text, isMatch: false }];
  }

  // Map normalized index back to approximate original text
  // Because normalized text has punctuation stripped, we approximate the length
  const before = text.slice(0, matchIndex);
  const match = text.slice(matchIndex, matchIndex + query.length);
  const after = text.slice(matchIndex + query.length);

  const segments: { text: string; isMatch: boolean }[] = [];
  if (before) segments.push({ text: before, isMatch: false });
  if (match) segments.push({ text: match, isMatch: true });
  if (after) segments.push({ text: after, isMatch: false });

  return segments;
}
