import type { LexiconEntry } from "./types";

// Romanised Hindi. DRAFT v1: the clinical lead must review this before the pilot.
// Spelling varies a lot ("maar"/"mar", "jaana"/"jana", "zindagi"/"jindgi"),
// so the patterns use optional letters instead of listing every variant.
export const HINGLISH_LEXICON: LexiconEntry[] = [
  // acute
  { id: "hinglish.khud_ko_maar", category: "acute", pattern: /\b(khud|apne\s*aap)\s*ko\s+(maa?r|khatam)/ },
  {
    id: "hinglish.mar_jaana_chahta",
    category: "acute",
    pattern: /\bma+r+\s*ja+(na|ne|u|un|oon)\s+(chahta|chahti|chahte|chahiye)/,
  },
  { id: "hinglish.marna_chahta", category: "acute", pattern: /\bma+r+na\s+(chahta|chahti|chahte|hai)\b/ },
  { id: "hinglish.atmahatya", category: "acute", pattern: /\ba+tma?h?a?t+ya\b/ },
  {
    id: "hinglish.jaan_de",
    category: "acute",
    pattern: /\bjaa?n\s+de\s*(dunga|dungi|du|doon|dun|dena|deni|dalunga|dalungi)\b/,
  },
  { id: "hinglish.fan_se_latak", category: "acute", pattern: /\b(fan|pankha|pankhe)\s+se\s+lata?k/ },
  { id: "hinglish.phaansi", category: "acute", pattern: /\bphaa?n?si\s+(laga|le|lunga|lungi|kha)/ },
  { id: "hinglish.zehar", category: "acute", pattern: /\b[zj][ae]h?[ae]?r\s+(kha|pee|pi)/ },
  {
    id: "hinglish.sab_khatam_kar",
    category: "acute",
    pattern: /\bsab\s*(kuch)?\s+khatam\s+kar\s*(dunga|dungi|du|doon|dun|lunga|lungi|deni|dena)\b/,
  },
  { id: "hinglish.zindagi_khatam_kar", category: "acute", pattern: /\b(zi|ji)n?d(a|e)?gi\s+khatam\s+kar/ },
  { id: "hinglish.nas_kaat", category: "acute", pattern: /\bnas\s+(kaa?t)/ },

  // self_harm
  {
    id: "hinglish.khud_ko_hurt",
    category: "self_harm",
    pattern: /\b(khud|apne\s*aap)\s*ko\s+(hurt|harm|chot|kaa?t|jala|saza|saja)/,
  },
  { id: "hinglish.haath_kaat", category: "self_harm", pattern: /\b(hath|haath|kalai)\s+(kaa?t)/ },

  // passive
  { id: "hinglish.jeene_ka_mann_nahi", category: "passive", pattern: /\bj(i|ee|e)ne\s+ka\s+(man+|dil)\s+nahi/ },
  { id: "hinglish.jeena_nahi_chahta", category: "passive", pattern: /\bj(i|ee|e)na\s+nahi\s+(chahta|chahti|chahte|hai)/ },
  // "main toh mar jaunga" is usually hyperbole about exams, so it's passive, not acute.
  { id: "hinglish.mar_jaunga", category: "passive", pattern: /\bma+r+\s*ja+(u|oo)n(ga|gi)\b/ },
  {
    id: "hinglish.mar_jaana_behtar",
    category: "passive",
    pattern: /\bma+r+\s*ja+(na|ne)\s+(hi\s+)?(behtar|accha|achha|acha|thik)/,
  },
  { id: "hinglish.zindagi_se_thak", category: "passive", pattern: /\b(zi|ji)n?d(a|e)?gi\s+(se\s+)?(thak|bekar|bekaar|bojh)/ },
  { id: "hinglish.sab_khatam_ho", category: "passive", pattern: /\bsab\s*(kuch)?\s+khatam\s+ho\s+(gaya|gya|chuka)/ },
  { id: "hinglish.koi_fayda_nahi", category: "passive", pattern: /\bkoi\s+(fayda|faida|matlab)\s+nahi\s+j(i|ee)ne/ },
  { id: "hinglish.gayab_ho_jana", category: "passive", pattern: /\bgaa?yab\s+ho\s+ja(a)?na\s+(chahta|chahti|hai)/ },

  // ragging
  {
    id: "hinglish.seniors_ne",
    category: "ragging",
    pattern: /\bseniors?\s+ne\s+(maara|mara|peeta|pita|pareshan|torture|tang)/,
  },
];
