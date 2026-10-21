/**
 * Columbia Suicide Severity Rating Scale, screener version (past month).
 * Asked only after PHQ-9 item 9 is above 0.
 *
 * Q1 wish to be dead · Q2 active suicidal thoughts. If Q2 is yes, also ask:
 * Q3 thought about how (method) · Q4 intent to act · Q5 worked out a plan with intent.
 * Q6 suicidal behaviour (ever), with timing.
 */
export interface CssrsAnswers {
  wishToBeDead: boolean | null;
  activeThoughts: boolean | null;
  /** Q3–Q5 are only asked when `activeThoughts` is true. */
  method?: boolean | null;
  intent?: boolean | null;
  planWithIntent?: boolean | null;
  behavior: "never" | "over_3_months_ago" | "within_3_months" | null;
}

/**
 * Columbia's published triage levels:
 * high = Q4 or Q5 yes, or behaviour within 3 months
 * moderate = Q3 yes, or behaviour more than 3 months ago
 * low = Q1 or Q2 yes only
 * `incomplete` means a required answer was skipped, so risk can't be ruled out.
 */
export type CssrsRisk = "none" | "low" | "moderate" | "high" | "incomplete";

export function scoreCssrs(a: CssrsAnswers): CssrsRisk {
  // A "yes" on any high-risk item is decisive even if other answers are missing.
  if (a.intent === true || a.planWithIntent === true || a.behavior === "within_3_months") {
    return "high";
  }

  const followUpsMissing =
    a.activeThoughts === true && (a.method == null || a.intent == null || a.planWithIntent == null);
  if (a.wishToBeDead === null || a.activeThoughts === null || a.behavior === null || followUpsMissing) {
    return "incomplete";
  }

  if (a.method === true || a.behavior === "over_3_months_ago") return "moderate";
  if (a.wishToBeDead || a.activeThoughts) return "low";
  return "none";
}
