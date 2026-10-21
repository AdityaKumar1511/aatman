import type { LexiconEntry } from "./types";

// DRAFT v1: the clinical lead must review this before the pilot. Tuned for recall,
// so hyperbole and negation ("I would never kill myself") still match by design.
export const EN_LEXICON: LexiconEntry[] = [
  // acute
  { id: "en.kill_self", category: "acute", pattern: /\bkill(ing)?\s+my\s*self\b/ },
  { id: "en.end_life", category: "acute", pattern: /\b(end|ending|take|taking)\s+my\s+(own\s+)?life\b/ },
  { id: "en.end_it_all", category: "acute", pattern: /\bend(ing)?\s+it\s+all\b/ },
  // Covers common misspellings: sucide, suiside, suicidal, suicides.
  { id: "en.suicide", category: "acute", pattern: /\bsu+i?[cs]+i?de?s?\b|\bsuicid\w*/ },
  { id: "en.want_to_die", category: "acute", pattern: /\b(want|wanna|plan|planning|ready|decided)\s+(to\s+)?die\b/ },
  { id: "en.hang_self", category: "acute", pattern: /\bhang(ing)?\s+my\s*self\b/ },
  { id: "en.overdose", category: "acute", pattern: /\boverdos(e|ed|ing)\b/ },
  { id: "en.slit_wrists", category: "acute", pattern: /\bslit(ting)?\s+my\s+wrists?\b/ },
  {
    id: "en.jump_off",
    category: "acute",
    pattern: /\bjump(ing)?\s+(off|from)\s+(the\s+|a\s+)?(roof|terrace|building|bridge|hostel|balcony)\b/,
  },
  {
    id: "en.wont_be_alive",
    category: "acute",
    pattern: /\b(wont|will\s+not)\s+be\s+(alive|here|around)\s+(tomorrow|anymore|much\s+longer)\b/,
  },

  // self_harm
  {
    id: "en.harm_self",
    category: "self_harm",
    pattern: /\b(cut|cutting|hurt|hurting|harm|harming|burn|burning|punish|punishing)\s+my\s*self\b/,
  },
  { id: "en.self_harm", category: "self_harm", pattern: /\bself\s*harm\w*/ },

  // passive
  { id: "en.better_off_dead", category: "passive", pattern: /\bbetter\s+off\s+(dead|without\s+me)\b/ },
  {
    id: "en.no_reason_to_live",
    category: "passive",
    pattern: /\b(no|not\s+any|isnt\s+any)\s+(reason|point)\s+(to|in)\s+(live|living|go\s+on|going\s+on|being\s+alive)\b/,
  },
  { id: "en.wish_dead", category: "passive", pattern: /\bwish\s+i\s+(was|were)\s+(dead|never\s+born|not\s+alive|gone)\b/ },
  { id: "en.wish_could_die", category: "passive", pattern: /\bwish\s+i\s+could\s+(die|disappear)\b/ },
  { id: "en.cant_go_on", category: "passive", pattern: /\bcant\s+go\s+on\b/ },
  {
    id: "en.dont_want_to_live",
    category: "passive",
    pattern: /\b(dont|do\s+not)\s+want\s+to\s+(live|be\s+alive|exist|wake\s+up)\b/,
  },
  { id: "en.want_to_disappear", category: "passive", pattern: /\b(want|wish)\s+to\s+disappear\b/ },
  // "gonna die" is usually hyperbole, so it sits here rather than in acute.
  { id: "en.going_to_die", category: "passive", pattern: /\b(going|gonna)\s+(to\s+)?die\b/ },
  { id: "en.tired_of_living", category: "passive", pattern: /\btired\s+of\s+(living|life|being\s+alive)\b/ },

  // ragging
  { id: "en.ragging", category: "ragging", pattern: /\bragg?(ing|ed)\b/ },
  {
    id: "en.seniors_harass",
    category: "ragging",
    pattern: /\bseniors?\s+(harass|harassed|beat|hit|forced?|torture|tortured|bully|bullied)\b/,
  },
];
