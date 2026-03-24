import type { InsightFinding } from "./contracts";
import type { ThresholdProfile } from "./constants";
import { InsightType, type RoomType } from "./domain";
import { average, clamp, round } from "./utils";

export type ScoreBreakdown = {
  temperature: number;
  humidity: number;
  airQuality: number;
  light: number;
  noise: number;
};

type ComfortReading = {
  temperature: number;
  humidity: number;
  co2: number;
  light: number;
  noise: number;
};

type InsightReading = ComfortReading & {
  timestamp: Date | string;
  occupancy: number;
};

function scoreBand(value: number, min: number, max: number, hardMax = max * 1.25) {
  if (value >= min && value <= max) {
    return 100;
  }

  const delta = value < min ? min - value : value - max;
  const span = value < min ? min : hardMax - max;
  return clamp(100 - (delta / Math.max(span, 1)) * 100, 10, 100);
}

export function computeComfortBreakdown(reading: ComfortReading, thresholds: ThresholdProfile): ScoreBreakdown {
  return {
    temperature: scoreBand(reading.temperature, thresholds.temperature[0], thresholds.temperature[1], thresholds.temperature[1] + 6),
    humidity: scoreBand(reading.humidity, thresholds.humidity[0], thresholds.humidity[1], thresholds.humidity[1] + 20),
    airQuality: clamp(100 - ((reading.co2 - 450) / Math.max(thresholds.co2Max - 450, 1)) * 100, 10, 100),
    light: clamp(100 - Math.abs(reading.light - thresholds.lightTarget) / Math.max(thresholds.lightTarget, 1) * 100, 20, 100),
    noise: clamp(100 - Math.max(0, reading.noise - thresholds.noiseMax) / Math.max(thresholds.noiseMax, 1) * 100, 15, 100),
  };
}

export function computeComfortScore(reading: ComfortReading, thresholds: ThresholdProfile) {
  const breakdown = computeComfortBreakdown(reading, thresholds);
  const score = average(Object.values(breakdown));
  return {
    score: round(score),
    breakdown,
  };
}

export function findStructuredInsights({
  roomId,
  roomName,
  roomType,
  readings,
  thresholds,
}: {
  roomId: string;
  roomName: string;
  roomType: RoomType;
  readings: InsightReading[];
  thresholds: ThresholdProfile;
}): InsightFinding[] {
  if (!readings.length) {
    return [];
  }

  const findings: InsightFinding[] = [];
  const windowStart = new Date(readings[0].timestamp);
  const windowEnd = new Date(readings.at(-1)!.timestamp);

  const co2Afternoon = readings.filter((reading) => {
    const hour = new Date(reading.timestamp).getHours();
    return hour >= 14 && hour <= 16 && reading.co2 > thresholds.co2Max;
  });

  if (co2Afternoon.length >= 5) {
    findings.push({
      roomId,
      roomName,
      type: InsightType.AIR_QUALITY,
      findingKey: "co2_high_recurring_afternoon",
      evidence: `${co2Afternoon.length} of recent afternoon samples exceeded the CO2 threshold between 14:00-16:00`,
      windowStart,
      windowEnd,
    });
  }

  const highHumidity = readings.filter((reading) => reading.humidity > thresholds.humidity[1]);
  if (highHumidity.length >= 6) {
    findings.push({
      roomId,
      roomName,
      type: InsightType.HUMIDITY,
      findingKey: "humidity_high_recurring_evening",
      evidence: `${highHumidity.length} recent readings stayed above the preferred humidity ceiling`,
      windowStart,
      windowEnd,
    });
  }

  const highNoise = readings.filter((reading) => reading.noise > thresholds.noiseMax + 8);
  if (highNoise.length >= 4) {
    findings.push({
      roomId,
      roomName,
      type: InsightType.NOISE,
      findingKey: "noise_spikes_repeated",
      evidence: `${highNoise.length} readings crossed the calm-room noise target by at least 8 dB`,
      windowStart,
      windowEnd,
    });
  }

  const scored = readings.map((reading) => computeComfortScore(reading, thresholds).score);
  const degraded = scored.filter((score) => score < 68);
  if (degraded.length >= 6) {
    findings.push({
      roomId,
      roomName,
      type: InsightType.COMFORT,
      findingKey: roomType === "WORKSPACE" ? "comfort_drop_focus_window" : "comfort_score_degradation",
      evidence: `${degraded.length} readings dropped below the target comfort score of 68`,
      windowStart,
      windowEnd,
    });
  }

  return findings;
}

export function presentInsight(finding: InsightFinding) {
  switch (finding.findingKey) {
    case "co2_high_recurring_afternoon":
      return "Air quality tends to drop in the afternoon.";
    case "humidity_high_recurring_evening":
      return "Humidity is running a little high more often than expected.";
    case "noise_spikes_repeated":
      return "Noise levels spike often enough to interrupt the room's calm rhythm.";
    case "comfort_drop_focus_window":
      return "Focus conditions soften through the busiest part of the day.";
    default:
      return "Comfort conditions drift outside the preferred range more often than expected.";
  }
}
