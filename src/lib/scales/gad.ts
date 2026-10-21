import type { ScreenBand } from "./phq";
import { sumWithProrating, type Answer, type Likert4, type ScaleScore } from "./types";

/**
 * GAD-7 (Spitzer et al., 2006). Free to use.
 * GAD-2 is items 1–2 of GAD-7, filled in the same array.
 */
export const GAD7_LENGTH = 7;

export type Gad7Band = "minimal" | "mild" | "moderate" | "severe";

export function gad7Band(total: number): Gad7Band {
  if (total <= 4) return "minimal";
  if (total <= 9) return "mild";
  if (total <= 14) return "moderate";
  return "severe";
}

export function scoreGad7(items: readonly Answer<Likert4>[]): ScaleScore<Gad7Band> {
  const { total, answered, prorated } = sumWithProrating(items, GAD7_LENGTH, 1);
  return { total, band: total === null ? null : gad7Band(total), answered, prorated };
}

/** GAD-2 positive screen is a total ≥ 3 (Kroenke et al., 2007). */
export const GAD2_POSITIVE_CUTOFF = 3;

export function scoreGad2(gad7Items: readonly Answer<Likert4>[]): ScaleScore<ScreenBand> {
  const { total, answered } = sumWithProrating(gad7Items.slice(0, 2), 2, 0);
  return {
    total,
    band: total === null ? null : total >= GAD2_POSITIVE_CUTOFF ? "positive" : "negative",
    answered,
    prorated: false,
  };
}
