import { EN_LEXICON } from "./lexicon/en";
import { HI_LEXICON } from "./lexicon/hi";
import { HINGLISH_LEXICON } from "./lexicon/hinglish";
import type { LexiconCategory, LexiconEntry } from "./lexicon/types";

/**
 * Deterministic crisis-language detector. It runs on the client (works offline) and
 * again on the server, BEFORE any text can reach an LLM. It favours recall over
 * precision: a false positive shows support resources, a false negative can cost a life.
 */

export type CrisisLevel = "none" | "passive" | "self_harm" | "acute";

export interface CrisisDetection {
  level: CrisisLevel;
  /** Lexicon ids that matched, for audit and tests. Never log the text itself. */
  matchedIds: string[];
  ragging: boolean;
}

const LEXICON: readonly LexiconEntry[] = [...EN_LEXICON, ...HINGLISH_LEXICON, ...HI_LEXICON];

const LEVEL_RANK: Record<CrisisLevel, number> = { none: 0, passive: 1, self_harm: 2, acute: 3 };

export function maxCrisisLevel(a: CrisisLevel, b: CrisisLevel): CrisisLevel {
  return LEVEL_RANK[a] >= LEVEL_RANK[b] ? a : b;
}

/**
 * Lowercases text and folds away spelling noise so one pattern covers many surface forms:
 * - Latin diacritics and Devanagari nukta removed (ज़िंदगी → जिंदगी)
 * - chandrabindu → anusvara (फाँसी → फांसी)
 * - zero-width joiners removed (they otherwise split Devanagari words)
 * - apostrophes dropped (can't → cant), other punctuation → single space
 */
export function normalizeForMatching(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[​-‍﻿]/g, "")
    .replace(/[̀-ͯ]/g, "")
    .replace(/़/g, "")
    .replace(/ँ/g, "ं")
    .normalize("NFC")
    .toLowerCase()
    .replace(/['’‘`]/g, "")
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, " ")
    .trim();
}

export function detectCrisis(text: string): CrisisDetection {
  const normalized = normalizeForMatching(text);
  let level: CrisisLevel = "none";
  let ragging = false;
  const matchedIds: string[] = [];

  for (const entry of LEXICON) {
    if (!entry.pattern.test(normalized)) continue;
    matchedIds.push(entry.id);
    if (entry.category === "ragging") ragging = true;
    else level = maxCrisisLevel(level, entry.category satisfies Exclude<LexiconCategory, "ragging">);
  }

  return { level, matchedIds, ragging };
}

export function detectCrisisInAll(texts: readonly string[]): CrisisDetection {
  return texts.map(detectCrisis).reduce<CrisisDetection>(
    (acc, d) => ({
      level: maxCrisisLevel(acc.level, d.level),
      matchedIds: [...acc.matchedIds, ...d.matchedIds],
      ragging: acc.ragging || d.ragging,
    }),
    { level: "none", matchedIds: [], ragging: false },
  );
}
