/* ────────────────────────────────────────────────────────────
   Pure time-bucketing logic for the admin analytics charts.

   Deliberately free of React/recharts imports so it can be
   reasoned about and tested in isolation — the date grouping
   is the part most prone to off-by-one errors.
   ──────────────────────────────────────────────────────────── */

export type AnalyticsPeriod = "week" | "month" | "year" | "all";

/** Minimal shape we need — both Volunteer and Donation satisfy this. */
export interface TimeStamped {
  createdAt?: string;
  deleted?: boolean;
  amount?: number | string;
}

export interface Bucket {
  key: string;
  label: string;
  fullLabel: string;
  value: number;
}

export interface Series {
  data: Bucket[];
  total: number;
  grouping: "day" | "month" | "year";
}

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const toDate = (raw?: string): Date | null => {
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
};

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** Local-time day key. Avoids toISOString(), which shifts to UTC and can bucket a record into the wrong day. */
const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const yearKey = (d: Date) => String(d.getFullYear());

/**
 * Builds zero-filled time buckets for `period`, then fills them from `records`.
 *
 * Buckets are pre-seeded so gaps render as real zeros rather than the line
 * skipping across missing days. `valueOf` lets donations sum amounts while
 * volunteers/internships count records.
 *
 * `now` is injectable purely so the behaviour is testable at a fixed date.
 */
export function buildSeries(
  records: TimeStamped[],
  period: AnalyticsPeriod,
  valueOf: (r: TimeStamped) => number,
  now: Date = new Date()
): Series {
  const dated = records
    .filter(r => !r.deleted)
    .map(r => ({ r, d: toDate(r.createdAt) }))
    .filter((x): x is { r: TimeStamped; d: Date } => x.d !== null);

  const buckets = new Map<string, Bucket>();
  let grouping: Series["grouping"] = "day";
  let keyFor: (d: Date) => string = dayKey;

  const add = (key: string, label: string, fullLabel: string) =>
    buckets.set(key, { key, label, fullLabel, value: 0 });

  const longDate = (d: Date) =>
    d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

  if (period === "week") {
    // Trailing 7 days, inclusive of today.
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      add(dayKey(d), `${MONTHS[d.getMonth()]} ${d.getDate()}`, longDate(d));
    }
  } else if (period === "month") {
    // Every day of the current calendar month.
    const y = now.getFullYear();
    const m = now.getMonth();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(y, m, day);
      add(dayKey(d), String(day), longDate(d));
    }
  } else if (period === "year") {
    // Twelve months of the current calendar year.
    grouping = "month";
    keyFor = monthKey;
    const y = now.getFullYear();
    for (let m = 0; m < 12; m++) {
      add(monthKey(new Date(y, m, 1)), MONTHS[m], `${MONTHS[m]} ${y}`);
    }
  } else {
    // All time — choose a grouping that keeps the axis readable across
    // however much history exists, so no records are ever dropped.
    if (dated.length === 0) return { data: [], total: 0, grouping: "day" };

    const times = dated.map(x => x.d.getTime());
    const min = new Date(Math.min(...times));
    const max = new Date(Math.max(...times));
    const spanDays = (startOfDay(max).getTime() - startOfDay(min).getTime()) / 86_400_000;

    if (spanDays <= 60) {
      const cursor = startOfDay(min);
      const end = startOfDay(max);
      while (cursor <= end) {
        add(dayKey(cursor), `${MONTHS[cursor.getMonth()]} ${cursor.getDate()}`, longDate(cursor));
        cursor.setDate(cursor.getDate() + 1);
      }
    } else if (spanDays <= 365 * 3) {
      grouping = "month";
      keyFor = monthKey;
      const cursor = new Date(min.getFullYear(), min.getMonth(), 1);
      const end = new Date(max.getFullYear(), max.getMonth(), 1);
      while (cursor <= end) {
        add(
          monthKey(cursor),
          `${MONTHS[cursor.getMonth()]} '${String(cursor.getFullYear()).slice(2)}`,
          `${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`
        );
        cursor.setMonth(cursor.getMonth() + 1);
      }
    } else {
      grouping = "year";
      keyFor = yearKey;
      for (let y = min.getFullYear(); y <= max.getFullYear(); y++) add(String(y), String(y), String(y));
    }
  }

  // Fill buckets. Records outside a bounded window are simply not shown;
  // "All Time" always spans the full data range, so nothing is lost.
  let total = 0;
  for (const { r, d } of dated) {
    const bucket = buckets.get(keyFor(d));
    if (!bucket) continue;
    const v = valueOf(r);
    bucket.value += v;
    total += v;
  }

  return { data: Array.from(buckets.values()), total, grouping };
}
