import { subDays, subHours } from "date-fns";

export type RangeKey = "24h" | "7d";

export function resolveRangeStart(range: RangeKey) {
  const now = new Date();
  return range === "24h" ? subHours(now, 24) : subDays(now, 7);
}

export function bucketLabel(range: RangeKey) {
  return range === "24h" ? "30m" : "2h";
}


