import { sumWithProrating, type Answer, type Likert6, type ScaleScore } from "./types";

/**
 * WHO-5 Well-Being Index. Free to use.
 * Raw score 0–25, reported as a percentage (raw × 4). Higher means better wellbeing.
 * ≤ 50 suggests poor wellbeing; ≤ 28 suggests likely depression and warrants follow-up.
 */
export const WHO5_LENGTH = 5;

export type Who5Band = "good" | "low" | "very_low";

export function who5Band(percent: number): Who5Band {
  if (percent <= 28) return "very_low";
  if (percent <= 50) return "low";
  return "good";
}

/** `total` is the 0–100 percentage score. */
export function scoreWho5(items: readonly Answer<Likert6>[]): ScaleScore<Who5Band> {
  const { total: raw, answered, prorated } = sumWithProrating(items, WHO5_LENGTH, 1);
  const total = raw === null ? null : raw * 4;
  return { total, band: total === null ? null : who5Band(total), answered, prorated };
}
