import { describe, expect, it } from "vitest";
import type { Answer, CssrsAnswers, Likert4 } from "@/lib/scales";
import { tierRank, triage, type CheckinAnswers } from "@/lib/safety";

const nulls = (n: number): null[] => Array.from({ length: n }, () => null);

/** A tier-1 check-in: PHQ-2 + GAD-2 + item 9. */
function tier1(phq2: [Likert4, Likert4], gad2: [Likert4, Likert4], item9: Answer<Likert4>): CheckinAnswers {
  return {
    phq9: [...phq2, ...nulls(6), item9],
    gad7: [...gad2, ...nulls(5)],
  };
}

const allNo: CssrsAnswers = { wishToBeDead: false, activeThoughts: false, behavior: "never" };

describe("tier-1 check-in", () => {
  it("is mild with low scores and item 9 = 0", () => {
    const r = triage(tier1([0, 1], [1, 0], 0));
    expect(r).toMatchObject({ tier: "mild", reasons: [], cssrsRequired: false, llmAllowed: true });
  });

  it("offers the full scale on a positive PHQ-2 / GAD-2 and rates it moderate", () => {
    const r = triage(tier1([2, 1], [0, 3], 0));
    expect(r.tier).toBe("moderate");
    expect(r.reasons).toEqual(["phq2_positive", "gad2_positive"]);
    expect(r.offerFullPhq9).toBe(true);
    expect(r.offerFullGad7).toBe(true);
  });

  it("treats a skipped safety item as elevated", () => {
    const r = triage(tier1([0, 0], [0, 0], null));
    expect(r.tier).toBe("elevated");
    expect(r.reasons).toContain("safety_item_skipped");
    expect(r.llmAllowed).toBe(false);
  });
});

describe("item 9 → C-SSRS path (every item-9 value)", () => {
  it("item 9 = 0 never requires the screener", () => {
    expect(triage(tier1([0, 0], [0, 0], 0)).cssrsRequired).toBe(false);
  });

  it.each([1, 2, 3] as const)("item 9 = %i requires the screener and is provisionally urgent", (v) => {
    const r = triage(tier1([0, 0], [0, 0], v));
    expect(r).toMatchObject({ tier: "urgent", cssrsRequired: true, llmAllowed: false });
    expect(r.reasons).toContain("cssrs_pending");
  });

  const active = { ...allNo, activeThoughts: true, method: false, intent: false, planWithIntent: false };
  it.each<[string, CssrsAnswers, string]>([
    ["screener all no", allNo, "elevated"],
    ["passive wish only", { ...allNo, wishToBeDead: true }, "elevated"],
    ["active thoughts, no method", active, "urgent"],
    ["method", { ...active, method: true }, "urgent"],
    ["past behaviour", { ...allNo, behavior: "over_3_months_ago" }, "urgent"],
    ["screener skipped", { ...allNo, behavior: null }, "urgent"],
    ["intent", { ...active, intent: true }, "crisis"],
    ["plan with intent", { ...active, planWithIntent: true }, "crisis"],
    ["recent behaviour", { ...allNo, behavior: "within_3_months" }, "crisis"],
  ])("item 9 > 0, %s → %s", (_, cssrs, tier) => {
    for (const item9 of [1, 2, 3] as const) {
      const r = triage({ ...tier1([0, 0], [0, 0], item9), cssrs });
      expect(r.tier).toBe(tier);
      expect(r.cssrsRequired).toBe(false);
    }
  });

  it("never drops below elevated once item 9 is positive, whatever the other scores", () => {
    const r = triage({ ...tier1([0, 0], [0, 0], 1), cssrs: allNo });
    expect(tierRank(r.tier)).toBeGreaterThanOrEqual(tierRank("elevated"));
  });
});

describe("full scales", () => {
  it("a completed PHQ-9 below 10 overrides a positive PHQ-2", () => {
    const r = triage({ phq9: [2, 1, 1, 1, 1, 1, 0, 0, 0], gad7: [0, 0, ...nulls(5)] });
    expect(r.scores.phq9.total).toBe(7);
    expect(r).toMatchObject({ tier: "mild", offerFullPhq9: false });
  });

  it("PHQ-9 ≥ 10 is moderate", () => {
    const r = triage({ phq9: [2, 2, 2, 2, 1, 1, 0, 0, 0], gad7: [0, 0, ...nulls(5)] });
    expect(r).toMatchObject({ tier: "moderate", reasons: ["phq9_moderate_plus"], llmAllowed: true });
  });

  it("GAD-7 ≥ 10 is moderate", () => {
    const r = triage({ phq9: [0, 0, ...nulls(6), 0], gad7: [2, 2, 2, 2, 1, 1, 0] });
    expect(r.reasons).toEqual(["gad7_moderate_plus"]);
  });

  it("very low WHO-5 is moderate", () => {
    const r = triage({ ...tier1([0, 0], [0, 0], 0), who5: [1, 1, 1, 1, 1] });
    expect(r).toMatchObject({ tier: "moderate", reasons: ["who5_very_low"] });
  });

  it("symptom scores alone never exceed moderate", () => {
    const r = triage({ phq9: [3, 3, 3, 3, 3, 3, 3, 3, 0], gad7: [3, 3, 3, 3, 3, 3, 3], who5: [0, 0, 0, 0, 0] });
    expect(r.tier).toBe("moderate");
  });
});

describe("free text", () => {
  it("acute language → crisis, even with otherwise low scores", () => {
    const r = triage({ ...tier1([0, 0], [0, 0], 0), freeText: ["khud ko khatam kar lunga"] });
    expect(r).toMatchObject({ tier: "crisis", llmAllowed: false });
    expect(r.reasons).toContain("text_acute");
  });

  it("self-harm language → urgent", () => {
    expect(triage({ ...tier1([0, 0], [0, 0], 0), freeText: ["I cut myself"] }).tier).toBe("urgent");
  });

  it("passive language → elevated", () => {
    expect(triage({ ...tier1([0, 0], [0, 0], 0), freeText: ["jeene ka mann nahi"] }).tier).toBe("elevated");
  });

  it("ragging blocks the LLM without raising the tier", () => {
    const r = triage({ ...tier1([0, 0], [0, 0], 0), freeText: ["seniors are ragging us"] });
    expect(r).toMatchObject({ tier: "mild", ragging: true, llmAllowed: false });
  });
});

describe("input validation", () => {
  it("rejects wrong-length arrays", () => {
    expect(() => triage({ phq9: [0, 0], gad7: nulls(7) })).toThrow();
    expect(() => triage({ ...tier1([0, 0], [0, 0], 0), who5: [1, 1] })).toThrow();
  });
});
