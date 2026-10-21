import { describe, expect, it } from "vitest";
import { detectCrisis, detectCrisisInAll, maxCrisisLevel, normalizeForMatching } from "@/lib/safety";
import { ACCEPTED_FALSE_POSITIVES, MUST_DETECT, MUST_NOT_DETECT, RAGGING_TEXTS } from "./golden";

describe("normalizeForMatching", () => {
  it("folds case, apostrophes and punctuation", () => {
    expect(normalizeForMatching("I CAN'T go on!!!")).toBe("i cant go on");
    expect(normalizeForMatching("don’t…want")).toBe("dont want");
  });

  it("removes nukta and maps chandrabindu to anusvara", () => {
    expect(normalizeForMatching("ज़िंदगी")).toBe("जिंदगी");
    expect(normalizeForMatching("फाँसी")).toBe("फांसी");
  });

  it("removes zero-width joiners inside Devanagari words", () => {
    expect(normalizeForMatching("आत्म‍हत्या")).toBe("आत्महत्या");
  });
});

describe("crisis detector golden set", () => {
  it.each(MUST_DETECT)("detects $atLeast: $text", ({ text, atLeast }) => {
    const { level } = detectCrisis(text);
    expect(maxCrisisLevel(level, atLeast)).toBe(level);
  });

  it("has 100% recall on the golden set", () => {
    const missed = MUST_DETECT.filter(({ text, atLeast }) => {
      const { level } = detectCrisis(text);
      return maxCrisisLevel(level, atLeast) !== level;
    });
    expect(missed).toEqual([]);
  });

  it.each(MUST_NOT_DETECT)("ignores everyday language: %s", (text) => {
    expect(detectCrisis(text).level).toBe("none");
  });

  it.each(ACCEPTED_FALSE_POSITIVES)("over-detects by design: $text → $level", ({ text, level }) => {
    expect(detectCrisis(text).level).toBe(level);
  });
});

describe("ragging flag", () => {
  it.each(RAGGING_TEXTS)("flags: %s", (text) => {
    expect(detectCrisis(text).ragging).toBe(true);
  });

  it("does not raise the crisis level on its own", () => {
    expect(detectCrisis("seniors are ragging us").level).toBe("none");
  });
});

describe("detectCrisisInAll", () => {
  it("takes the highest level across answers", () => {
    const result = detectCrisisInAll(["exam stress", "jeene ka mann nahi", "I want to kill myself"]);
    expect(result.level).toBe("acute");
    expect(result.matchedIds).toEqual(expect.arrayContaining(["hinglish.jeene_ka_mann_nahi", "en.kill_self"]));
  });

  it("is none for no text", () => {
    expect(detectCrisisInAll([])).toEqual({ level: "none", matchedIds: [], ragging: false });
  });
});
