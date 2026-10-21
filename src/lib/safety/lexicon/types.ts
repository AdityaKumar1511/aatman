/**
 * acute     → explicit suicidal intent, plan or method
 * self_harm → non-suicidal self-injury
 * passive   → passive death wish / hopelessness about living
 * ragging   → not a risk level; routes to anti-ragging resources and keeps the text away from the LLM
 */
export type LexiconCategory = "acute" | "self_harm" | "passive" | "ragging";

export interface LexiconEntry {
  /** `<lang>.<slug>`, stable so test failures and audit logs can name the rule. */
  id: string;
  category: LexiconCategory;
  /** Runs against `normalizeForMatching` output: lowercase, no apostrophes, punctuation collapsed to single spaces. */
  pattern: RegExp;
}
