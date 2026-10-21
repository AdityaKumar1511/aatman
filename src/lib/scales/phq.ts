import { sumWithProrating, type Answer, type Likert4, type ScaleScore } from "./types";

/**
 * PHQ-9 (Kroenke, Spitzer & Williams, 2001). Free to use.
 * PHQ-2 is items 1–2 of PHQ-9, so a tier-1 check-in fills the same array and
 * the full PHQ-9 only asks the remaining items.
 *
 * Item 9 (index 8) is the self-harm item. It is ALWAYS asked, even in tier 1,
 * and the safety logic reads it separately (see `safety/triage.ts`).
 */
export const PHQ9_LENGTH = 9;
export const PHQ9_SAFETY_ITEM_INDEX = 8;

/** Band codes are internal. Students never see diagnostic labels; UI copy maps these to neutral wording. */
export type Phq9Band = "minimal" | "mild" | "moderate" | "moderately_severe" | "severe";

export function phq9Band(total: number): Phq9Band {
  if (total <= 4) return "minimal";
  if (total <= 9) return "mild";
  if (total <= 14) return "moderate";
  if (total <= 19) return "moderately_severe";
  return "severe";
}

/** One missing item may be prorated; more makes the result incomplete. */
export function scorePhq9(items: readonly Answer<Likert4>[]): ScaleScore<Phq9Band> {
  const { total, answered, prorated } = sumWithProrating(items, PHQ9_LENGTH, 1);
  return { total, band: total === null ? null : phq9Band(total), answered, prorated };
}

/** PHQ-2 positive screen is a total ≥ 3 (Kroenke et al., 2003). */
export const PHQ2_POSITIVE_CUTOFF = 3;

export type ScreenBand = "negative" | "positive";

/** Both items are required: a 2-item screen can't be prorated. */
export function scorePhq2(phq9Items: readonly Answer<Likert4>[]): ScaleScore<ScreenBand> {
  const { total, answered } = sumWithProrating(phq9Items.slice(0, 2), 2, 0);
  return {
    total,
    band: total === null ? null : total >= PHQ2_POSITIVE_CUTOFF ? "positive" : "negative",
    answered,
    prorated: false,
  };
}
