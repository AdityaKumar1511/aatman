import type { LexiconEntry } from "./types";

// Devanagari. DRAFT v1: the clinical lead must review this before the pilot.
// Text is normalised first: nukta removed (ज़ → ज) and chandrabindu → anusvara (ँ → ं),
// so patterns are written without them. `\b` is ASCII-only in JS, so these are plain substrings.
export const HI_LEXICON: LexiconEntry[] = [
  // acute
  { id: "hi.atmahatya", category: "acute", pattern: /आत्महत्या/u },
  { id: "hi.khud_ko_maar", category: "acute", pattern: /(खुद|अपने आप)\s*को\s+(मार|खत्म)/u },
  { id: "hi.mar_jaana_chahta", category: "acute", pattern: /(मर\s*जाना|मरना)\s+चाहत/u },
  { id: "hi.jaan_de", category: "acute", pattern: /जान\s+दे\s+(द|दे)/u },
  { id: "hi.phaansi", category: "acute", pattern: /(फांसी|फंदा)\s+(लगा|ले|लगान|बना)/u },
  { id: "hi.zehar", category: "acute", pattern: /जहर\s+(खा|पी)/u },
  { id: "hi.zindagi_khatam_kar", category: "acute", pattern: /जि(ं|न्)दगी\s+खत्म\s+कर/u },
  { id: "hi.sab_khatam_kar", category: "acute", pattern: /सब\s*(कुछ)?\s+खत्म\s+कर\s+(द|ल)/u },
  { id: "hi.nas_kaat", category: "acute", pattern: /नस\s+काट/u },

  // self_harm
  { id: "hi.khud_ko_chot", category: "self_harm", pattern: /(खुद|अपने आप)\s*को\s+(चोट|काट|जला|सजा)/u },

  // passive
  { id: "hi.jeene_ka_mann_nahi", category: "passive", pattern: /जीने\s+का\s+(मन|दिल)\s+नहीं/u },
  { id: "hi.jeena_nahi_chahta", category: "passive", pattern: /जीना\s+नहीं\s+चाहत/u },
  { id: "hi.zindagi_se_thak", category: "passive", pattern: /जि(ं|न्)दगी\s+(से\s+)?(थक|बेकार|बोझ)/u },
  { id: "hi.sab_khatam_ho", category: "passive", pattern: /सब\s*(कुछ)?\s+खत्म\s+हो\s+(गया|चुका)/u },
  { id: "hi.mar_jaunga", category: "passive", pattern: /मर\s+जाऊं?(गा|गी)/u },
  { id: "hi.mar_jaana_behtar", category: "passive", pattern: /मर\s+जाना\s+(ही\s+)?(बेहतर|अच्छा)/u },

  // ragging
  { id: "hi.ragging", category: "ragging", pattern: /रैगिंग/u },
];
