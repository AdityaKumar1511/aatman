/** PHQ/GAD response: 0 = Not at all, 1 = Several days, 2 = More than half the days, 3 = Nearly every day. */
export type Likert4 = 0 | 1 | 2 | 3;

/** WHO-5 response: 0 = At no time … 5 = All of the time. */
export type Likert6 = 0 | 1 | 2 | 3 | 4 | 5;

/** A skipped item is `null`. Scales are scored only when enough items are answered. */
export type Answer<T> = T | null;

export interface ScaleScore<Band extends string> {
  /** Total score, prorated when a scale allows a missing item. `null` when too many items are missing. */
  total: number | null;
  band: Band | null;
  answered: number;
  prorated: boolean;
}

/**
 * Sum `items`, prorating when at most `maxMissing` are skipped.
 * Prorating follows common PHQ/GAD practice: total = round(sum × n / answered).
 */
export function sumWithProrating(
  items: readonly Answer<number>[],
  expectedLength: number,
  maxMissing: number,
): { total: number | null; answered: number; prorated: boolean } {
  if (items.length !== expectedLength) {
    throw new Error(`Expected ${expectedLength} items, got ${items.length}`);
  }
  const answeredItems = items.filter((v): v is number => v !== null);
  const answered = answeredItems.length;
  const missing = expectedLength - answered;
  if (answered === 0 || missing > maxMissing) {
    return { total: null, answered, prorated: false };
  }
  const sum = answeredItems.reduce((a, b) => a + b, 0);
  if (missing === 0) return { total: sum, answered, prorated: false };
  return { total: Math.round((sum * expectedLength) / answered), answered, prorated: true };
}
