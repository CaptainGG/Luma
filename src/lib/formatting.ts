import { format } from "date-fns";

export function formatMetric(value: number, unit: string) {
  return `${Math.round(value)}${unit}`;
}

export function formatComfortScore(score: number) {
  return `${Math.round(score)}/100`;
}

export function formatTimestamp(timestamp: Date | string, pattern = "EEE d MMM, HH:mm") {
  return format(new Date(timestamp), pattern);
}

export function formatRelativeRange(range: "24h" | "7d") {
  return range === "24h" ? "Last 24 hours" : "Last 7 days";
}

export function statusLabel(isPositive: boolean) {
  return isPositive ? "Stable" : "Needs attention";
}


