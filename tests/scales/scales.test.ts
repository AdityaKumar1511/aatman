import { describe, expect, it } from "vitest";
import {
  gad7Band,
  phq9Band,
  scoreCssrs,
  scoreGad2,
  scoreGad7,
  scorePhq2,
  scorePhq9,
  scoreWho5,
  who5Band,
  type Answer,
  type CssrsAnswers,
  type Likert4,
} from "@/lib/scales";

const fill = <T>(n: number, v: T): T[] => Array.from({ length: n }, () => v);

describe("PHQ-9 bands (published cutoffs 5/10/15/20)", () => {
  it.each([
    [0, "minimal"],
    [4, "minimal"],
    [5, "mild"],
    [9, "mild"],
    [10, "moderate"],
    [14, "moderate"],
    [15, "moderately_severe"],
    [19, "moderately_severe"],
    [20, "severe"],
    [27, "severe"],
  ])("%i → %s", (total, band) => expect(phq9Band(total)).toBe(band));
});

describe("GAD-7 bands (published cutoffs 5/10/15)", () => {
  it.each([
    [0, "minimal"],
    [4, "minimal"],
    [5, "mild"],
    [9, "mild"],
    [10, "moderate"],
    [14, "moderate"],
    [15, "severe"],
    [21, "severe"],
  ])("%i → %s", (total, band) => expect(gad7Band(total)).toBe(band));
});

describe("WHO-5 bands (percentage; ≤50 low, ≤28 very low)", () => {
  it.each([
    [0, "very_low"],
    [28, "very_low"],
    [32, "low"],
    [50, "low"],
    [52, "good"],
    [100, "good"],
  ])("%i → %s", (pct, band) => expect(who5Band(pct)).toBe(band));
});

describe("scorePhq9", () => {
  it("sums a complete scale", () => {
    expect(scorePhq9(fill<Likert4>(9, 3))).toEqual({ total: 27, band: "severe", answered: 9, prorated: false });
    expect(scorePhq9(fill<Likert4>(9, 0)).total).toBe(0);
  });

  it("prorates one missing item", () => {
    const items: Answer<Likert4>[] = [...fill<Likert4>(8, 2), null];
    // 16 × 9/8 = 18
    expect(scorePhq9(items)).toEqual({ total: 18, band: "moderately_severe", answered: 8, prorated: true });
  });

  it("is incomplete with two or more missing", () => {
    const items: Answer<Likert4>[] = [...fill<Likert4>(7, 3), null, null];
    expect(scorePhq9(items)).toMatchObject({ total: null, band: null, answered: 7 });
  });

  it("is incomplete for a tier-1 check-in (only items 1, 2, 9 answered)", () => {
    const items: Answer<Likert4>[] = [3, 3, null, null, null, null, null, null, 0];
    expect(scorePhq9(items).total).toBeNull();
  });

  it("rejects the wrong length", () => {
    expect(() => scorePhq9(fill<Likert4>(8, 0))).toThrow();
  });
});

describe("PHQ-2 / GAD-2 screens (positive at ≥3)", () => {
  it.each([
    [[1, 1], "negative"],
    [[1, 2], "positive"],
    [[3, 0], "positive"],
    [[0, 0], "negative"],
  ] as const)("%j → %s", (pair, band) => {
    const phq: Answer<Likert4>[] = [...pair, ...fill(7, null)];
    const gad: Answer<Likert4>[] = [...pair, ...fill(5, null)];
    expect(scorePhq2(phq).band).toBe(band);
    expect(scoreGad2(gad).band).toBe(band);
  });

  it("is never prorated: one missing item means no screen result", () => {
    const phq: Answer<Likert4>[] = [3, null, ...fill(7, null)];
    expect(scorePhq2(phq)).toMatchObject({ total: null, band: null });
  });
});

describe("scoreGad7 / scoreWho5", () => {
  it("scores GAD-7", () => {
    expect(scoreGad7([2, 2, 2, 2, 1, 1, 0])).toMatchObject({ total: 10, band: "moderate" });
  });

  it("reports WHO-5 as a percentage", () => {
    expect(scoreWho5([5, 5, 5, 5, 5])).toMatchObject({ total: 100, band: "good" });
    expect(scoreWho5([1, 1, 1, 2, 2])).toMatchObject({ total: 28, band: "very_low" });
  });
});

describe("C-SSRS screener", () => {
  const base: CssrsAnswers = { wishToBeDead: false, activeThoughts: false, behavior: "never" };
  const active = { ...base, activeThoughts: true, method: false, intent: false, planWithIntent: false };

  it.each<[string, CssrsAnswers, string]>([
    ["all no", base, "none"],
    ["passive wish only", { ...base, wishToBeDead: true }, "low"],
    ["active thoughts, no method", active, "low"],
    ["method", { ...active, method: true }, "moderate"],
    ["behaviour > 3 months ago", { ...base, behavior: "over_3_months_ago" }, "moderate"],
    ["intent", { ...active, intent: true }, "high"],
    ["plan with intent", { ...active, planWithIntent: true }, "high"],
    ["behaviour within 3 months", { ...base, behavior: "within_3_months" }, "high"],
    ["Q1 skipped", { ...base, wishToBeDead: null }, "incomplete"],
    ["Q6 skipped", { ...base, behavior: null }, "incomplete"],
    ["active thoughts, follow-ups skipped", { ...base, activeThoughts: true }, "incomplete"],
    ["intent yes even with other answers skipped", { ...base, activeThoughts: true, intent: true, wishToBeDead: null }, "high"],
  ])("%s → %s", (_, answers, risk) => expect(scoreCssrs(answers)).toBe(risk));
});
