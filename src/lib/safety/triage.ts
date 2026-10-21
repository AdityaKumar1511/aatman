import {
  GAD7_LENGTH,
  PHQ9_LENGTH,
  PHQ9_SAFETY_ITEM_INDEX,
  scoreCssrs,
  scoreGad2,
  scoreGad7,
  scorePhq2,
  scorePhq9,
  scoreWho5,
  WHO5_LENGTH,
  type Answer,
  type CssrsAnswers,
  type CssrsRisk,
  type Likert4,
  type Likert6,
} from "@/lib/scales";
import { detectCrisisInAll, type CrisisDetection } from "./crisisDetector";

/**
 * Safety gate. Pure and synchronous, with no network and no LLM, so it gives the same
 * answer on a phone with no signal and on the server, which re-runs it before saving.
 *
 * DRAFT thresholds: the clinical lead must sign off before the pilot.
 */

/** Ordered from lowest to highest. */
export const TIERS = ["mild", "moderate", "elevated", "urgent", "crisis"] as const;
export type Tier = (typeof TIERS)[number];

export function tierRank(t: Tier): number {
  return TIERS.indexOf(t);
}

function maxTier(a: Tier, b: Tier): Tier {
  return tierRank(a) >= tierRank(b) ? a : b;
}

export interface CheckinAnswers {
  /** Always length 9. A tier-1 check-in fills items 1, 2 and 9 (the safety item); the rest are null. */
  phq9: Answer<Likert4>[];
  /** Always length 7. A tier-1 check-in fills items 1 and 2. */
  gad7: Answer<Likert4>[];
  who5?: Answer<Likert6>[];
  /** Present once the C-SSRS screener has been shown (only after item 9 > 0). */
  cssrs?: CssrsAnswers;
  /** Optional free-text answers. They're scanned here and never stored with identity. */
  freeText?: string[];
}

export type TriageReason =
  | "cssrs_high"
  | "cssrs_moderate"
  | "cssrs_active_thoughts"
  | "cssrs_passive_wish"
  | "cssrs_incomplete"
  | "cssrs_pending"
  | "safety_item_positive"
  | "safety_item_skipped"
  | "text_acute"
  | "text_self_harm"
  | "text_passive"
  | "phq9_moderate_plus"
  | "gad7_moderate_plus"
  | "phq2_positive"
  | "gad2_positive"
  | "who5_very_low";

export interface TriageResult {
  tier: Tier;
  /** Why the tier was chosen. Codes only, safe to store and aggregate. */
  reasons: TriageReason[];
  scores: {
    phq2: ReturnType<typeof scorePhq2>;
    gad2: ReturnType<typeof scoreGad2>;
    phq9: ReturnType<typeof scorePhq9>;
    gad7: ReturnType<typeof scoreGad7>;
    who5: ReturnType<typeof scoreWho5> | null;
    cssrs: CssrsRisk | null;
  };
  /** The UI must show the C-SSRS screener next. Until it's answered, the tier is provisional (urgent). */
  cssrsRequired: boolean;
  /** Offer the full scale (not forced) because the 2-item screen is positive and the full scale isn't done. */
  offerFullPhq9: boolean;
  offerFullGad7: boolean;
  /** Show anti-ragging resources; keep that text away from the LLM. */
  ragging: boolean;
  /**
   * Whether a scores-only LLM summary may be generated. Only for mild/moderate:
   * higher tiers get pre-written, clinician-approved copy.
   */
  llmAllowed: boolean;
  textDetection: CrisisDetection;
}

/**
 * Maps C-SSRS screener risk to a tier. This is deliberately more conservative than
 * Columbia's low/moderate/high: active thoughts without a method are `urgent`, not low.
 */
function cssrsTier(risk: CssrsRisk, answers: CssrsAnswers): { tier: Tier; reason: TriageReason } {
  switch (risk) {
    case "high":
      return { tier: "crisis", reason: "cssrs_high" };
    case "moderate":
      return { tier: "urgent", reason: "cssrs_moderate" };
    case "incomplete":
      return { tier: "urgent", reason: "cssrs_incomplete" };
    case "low":
      return answers.activeThoughts
        ? { tier: "urgent", reason: "cssrs_active_thoughts" }
        : { tier: "elevated", reason: "cssrs_passive_wish" };
    case "none":
      // Item 9 was positive, so support stays visible even if the screener is all "no".
      return { tier: "elevated", reason: "safety_item_positive" };
  }
}

export function triage(answers: CheckinAnswers): TriageResult {
  if (answers.phq9.length !== PHQ9_LENGTH || answers.gad7.length !== GAD7_LENGTH) {
    throw new Error("phq9 must have 9 items and gad7 must have 7 (use null for unasked items)");
  }
  if (answers.who5 && answers.who5.length !== WHO5_LENGTH) {
    throw new Error("who5 must have 5 items");
  }

  const reasons: TriageReason[] = [];
  let tier: Tier = "mild";
  const raise = (t: Tier, reason: TriageReason) => {
    tier = maxTier(tier, t);
    reasons.push(reason);
  };

  const phq2 = scorePhq2(answers.phq9);
  const gad2 = scoreGad2(answers.gad7);
  const phq9 = scorePhq9(answers.phq9);
  const gad7 = scoreGad7(answers.gad7);
  const who5 = answers.who5 ? scoreWho5(answers.who5) : null;

  // 1. Self-harm item (asked of everyone, including tier 1).
  const item9 = answers.phq9[PHQ9_SAFETY_ITEM_INDEX];
  let cssrs: CssrsRisk | null = null;
  let cssrsRequired = false;
  if (item9 === null) {
    // Can't rule risk out. Show gentle support, don't alarm.
    raise("elevated", "safety_item_skipped");
  } else if (item9 > 0) {
    if (answers.cssrs) {
      cssrs = scoreCssrs(answers.cssrs);
      const t = cssrsTier(cssrs, answers.cssrs);
      raise(t.tier, t.reason);
    } else {
      cssrsRequired = true;
      raise("urgent", "cssrs_pending");
    }
  }

  // 2. Free text.
  const textDetection = detectCrisisInAll(answers.freeText ?? []);
  if (textDetection.level === "acute") raise("crisis", "text_acute");
  else if (textDetection.level === "self_harm") raise("urgent", "text_self_harm");
  else if (textDetection.level === "passive") raise("elevated", "text_passive");

  // 3. Symptom load. A completed full scale overrides its 2-item screen.
  if (phq9.total !== null) {
    if (phq9.total >= 10) raise("moderate", "phq9_moderate_plus");
  } else if (phq2.band === "positive") {
    raise("moderate", "phq2_positive");
  }
  if (gad7.total !== null) {
    if (gad7.total >= 10) raise("moderate", "gad7_moderate_plus");
  } else if (gad2.band === "positive") {
    raise("moderate", "gad2_positive");
  }
  if (who5?.band === "very_low") raise("moderate", "who5_very_low");

  return {
    tier,
    reasons,
    scores: { phq2, gad2, phq9, gad7, who5, cssrs },
    cssrsRequired,
    offerFullPhq9: phq2.band === "positive" && phq9.total === null,
    offerFullGad7: gad2.band === "positive" && gad7.total === null,
    ragging: textDetection.ragging,
    llmAllowed: tierRank(tier) <= tierRank("moderate") && !textDetection.ragging,
    textDetection,
  };
}
