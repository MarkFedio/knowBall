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
  'earvin johnson': 'magic johnson',
  'earvin magic johnson': 'magic johnson',
  'magic': 'magic johnson',
  'penny hardaway': 'anfernee hardaway',
  'penny': 'anfernee hardaway',
  'mitchell richmond': 'mitch richmond',
  'ron artest': 'metta world peace',
  'metta sandiford-artest': 'metta world peace',
  'metta sandiford artest': 'metta world peace',
  'world peace': 'metta world peace',
  'kareem': 'kareem abdul-jabbar',
  'lew alcindor': 'kareem abdul-jabbar',
  'giannis': 'giannis antetokounmpo',
  'the greek freak': 'giannis antetokounmpo',
  'wemby': 'victor wembanyama',
  'brooke lopez': 'brook lopez',
  'king james': 'lebron james',
  'bron': 'lebron james',
  'spida': 'donovan mitchell',
  'boogie cousins': 'demarcus cousins',
  'boogie': 'demarcus cousins',
  'shai': 'shai gilgeous-alexander',
  'sga': 'shai gilgeous-alexander',
  'kat': 'karl-anthony towns',
  'edrice adebayo': 'bam adebayo',
  'edrice femi adebayo': 'bam adebayo',
  'bam': 'bam adebayo',
  'grand theft alvarado': 'jose alvarado',
  'alvarado': 'jose alvarado',
  'enes kanter': 'enes freedom',
  'kanter': 'enes freedom',
  'sviatoslav mykhailiuk': 'svi mykhailiuk',
  'svi': 'svi mykhailiuk',
  'ishmael smith': 'ish smith',
  'walter frazier': 'walt frazier',
  'clyde frazier': 'walt frazier',
  'clyde': 'walt frazier',
  'peter maravich': 'pete maravich',
  'pistol pete': 'pete maravich',
  'pistol': 'pete maravich',
  'harold greer': 'hal greer',
  'nathaniel thurmond': 'nate thurmond',
  'nate archibald': 'tiny archibald',
  'nathaniel archibald': 'tiny archibald',
  'tiny': 'tiny archibald',
  'world b free': 'world b. free',
  'cj mccollum': 'c.j. mccollum',
  'pj tucker': 'p.j. tucker',
  'tj mcconnell': 't.j. mcconnell',
  'tj warren': 't.j. warren',
  'jj redick': 'j.j. redick',
  'jr smith': 'j.r. smith',

  // Baseball
  'cal ripken jr': 'cal ripken',
  'cal ripken jr.': 'cal ripken',
  'the iron man': 'cal ripken',
  'iron man': 'cal ripken',
  'ronald acuna jr': 'ronald acuna',
  'ronald acuna jr.': 'ronald acuna',
  'ronald acuña': 'ronald acuna',
  'ronald acuña jr': 'ronald acuna',
  'ronald acuña jr.': 'ronald acuna',
  'vladimir guerrero jr': 'vladimir guerrero jr.',
  'vlad jr': 'vladimir guerrero jr.',
  'vladito': 'vladimir guerrero jr.',
  'bobby witt jr': 'bobby witt jr.',
  'fernando tatis jr': 'fernando tatis jr.',
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
  'ferguson jenkins': 'fergie jenkins',
  'fergie': 'fergie jenkins',
  'peter rose': 'pete rose',
  'charlie hustle': 'pete rose',
  'chourio': 'jackson chourio',
  'yelich': 'christian yelich',
  'kike hernandez': 'enrique hernandez',
  'kike': 'enrique hernandez',
  'kiké hernandez': 'enrique hernandez',
  'kiké': 'enrique hernandez',
  'a-rod': 'alex rodriguez',
  'arod': 'alex rodriguez',
  'markus betts': 'mookie betts',
  'markus lynn betts': 'mookie betts',
  'mookie': 'mookie betts',
  'ken griffey': 'ken griffey',
  'ken griffey jr': 'ken griffey',
  'junior': 'ken griffey',
  'shohei': 'shohei ohtani',
  'sho': 'shohei ohtani',
  'pudge rodriguez': 'ivan rodriguez',
  'pudge': 'ivan rodriguez',
  'larry jones': 'chipper jones',
  'larry wayne jones': 'chipper jones',
  'chipper': 'chipper jones',
  'covelli crisp': 'coco crisp',
  'covelli loyce crisp': 'coco crisp',
  'coco': 'coco crisp',
  'gerald posey': 'buster posey',
  'gerald dempsey posey': 'buster posey',
  'buster': 'buster posey',
  'big papi': 'david ortiz',
  'the kid': 'ted williams',
  'the say hey kid': 'willie mays',

  // Football
  'diggs': 'stefon diggs',
  'saquon': 'saquon barkley',
  'kamren curl': 'kam curl',
  'lloyd cushenberry': 'lloyd cushenberry iii',
  'carlton davis': 'carlton davis iii',
  'willie gay': 'willie gay jr',
  'charbonnet': 'zach charbonnet',
  'patrick surtain ii': 'pat surtain ii',
  'patrick surtain jr': 'pat surtain ii',
  'marvin harrison jr': 'marvin harrison jr.',
  'marv jr': 'marvin harrison jr.',
  'mitch trubisky': 'mitchell trubisky',
  'chad ochocinco': 'chad johnson',
  'ochocinco': 'chad johnson',
  'megatron': 'calvin johnson',
  'beast mode': 'marshawn lynch',
  'sweetness': 'walter payton',
  'prime time': 'deion sanders',
  'neon deion': 'deion sanders',
  'vincent edward jackson': 'bo jackson',
  'bo': 'bo jackson',
  'az hamilton': "al'zillion hamilton",
  'rg3': 'robert griffin',
  'rgiii': 'robert griffin',
  'edoo': 'edgerrin james',
  'butkus': 'dick butkus',
  'slingin sammy': 'sammy baugh',
  'slingin sammy baugh': 'sammy baugh',
  'the kansas comet': 'gale sayers',
  'night train': 'night train lane',
  'dick lane': 'night train lane',
  'the galloping ghost': 'red grange',
  'concrete charlie': 'chuck bednarik',
  'crazylegs': 'elroy hirsch',
  'crazy legs': 'elroy hirsch',
  'crazy legs hirsch': 'elroy hirsch',
  'crazylegs hirsch': 'elroy hirsch',
  'john mcnally': 'johnny blood',
  'charlie trippi': 'charley trippi',
  'anthony munoz': 'anthony munoz',
  'anthony muñoz': 'anthony munoz',
  'oj simpson': 'o.j. simpson',
  'o j simpson': 'o.j. simpson',
  'ya tittle': 'y.a. tittle',
  'y a tittle': 'y.a. tittle',

  // Hockey
  'derek engelland': 'deryk engelland',
  'alexander ovechkin': 'alex ovechkin',
  'ovi': 'alex ovechkin',
  'ovie': 'alex ovechkin',
  'great 8': 'alex ovechkin',
  'the great eight': 'alex ovechkin',
  'alexander barkov': 'aleksander barkov',
  'sasha barkov': 'aleksander barkov',
  'korpisalo': 'joonas korpisalo',
  'the great one': 'wayne gretzky',
  'super mario': 'mario lemieux',
  'sid the kid': 'sidney crosby',
  'breadman': 'artemi panarin',
  'teemu': 'teemu selanne',
  'the finnish flash': 'teemu selanne',
  'aurele joliat': 'aurel joliat',
  'ching johnson': 'ivan johnson',
  'ivan ching johnson': 'ivan johnson',
  'emile bouchard': 'butch bouchard',
  'bryan hextall': 'bryan hextall sr.',
  'fernie flaman': 'fern flaman',
  'bullet joe simpson': 'joe simpson',
  'black jack stewart': 'jack stewart',
  'harry p watson': 'harry watson',
  'bun cook': 'fred cook',
  'frederick cook': 'fred cook',
  'buck boucher': 'george boucher',
  'hughie lehman': 'hugh lehman',
  'aubrey clapper': 'dit clapper',
  'francis clancy': 'king clancy',
  'walter broda': 'turk broda',
  'cecil thompson': 'tiny thompson',
  'lorne worsley': 'gump worsley',
  'hector blake': 'toe blake',
  'albert siebert': 'babe siebert',
  'walter pratt': 'babe pratt',
  'harvey jackson': 'busher jackson',
  'david schriner': 'sweeney schriner',
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
