import { addMinutes, differenceInMinutes } from "date-fns";

import { ROOM_TYPE_CONFIG, SIMULATION_STEP_MINUTES, type ThresholdProfile } from "./constants";
import { AlertSeverity, type RoomType } from "./domain";
import { clamp, round } from "./utils";

export type SimulatedReading = {
  temperature: number;
  humidity: number;
  co2: number;
  light: number;
  noise: number;
  occupancy: number;
  isAnomaly: boolean;
  anomalyLabel?: string | null;
};

type RuntimeReading = SimulatedReading & {
  timestamp: Date | string;
};

function hash(input: string) {
  return input.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
}

function noise(seed: number) {
  return Math.sin(seed) * 0.5 + Math.cos(seed / 3) * 0.25;
}

function roomOccupancyFactor(roomType: RoomType, hour: number) {
  if (roomType === "BEDROOM") {
    return hour >= 22 || hour <= 7 ? 2 : 0;
  }

  if (roomType === "WORKSPACE") {
    return hour >= 9 && hour <= 17 ? 3 : 1;
  }

  if (roomType === "SHARED_ROOM") {
    return hour >= 11 && hour <= 16 ? 4 : 1;
  }

  return hour >= 18 && hour <= 22 ? 3 : 1;
}

function baseLight(roomType: RoomType, hour: number) {
  const daylight = hour >= 7 && hour <= 18 ? 1 : 0.18;
  const multiplier = roomType === "WORKSPACE" ? 1.15 : roomType === "BEDROOM" ? 0.65 : 0.95;
  return Math.round(420 * daylight * multiplier);
}

function averageThreshold([min, max]: [number, number]) {
  return (min + max) / 2;
}

export function generateSeedReading({
  roomId,
  roomType,
  timestamp,
  previous,
}: {
  roomId: string;
  roomType: RoomType;
  timestamp: Date;
  previous: SimulatedReading | null;
}): SimulatedReading {
  const hour = timestamp.getHours();
  const daySeed = hash(`${roomId}-${timestamp.toISOString().slice(0, 13)}`);
  const thresholds = ROOM_TYPE_CONFIG[roomType].thresholds;
  const occupancy = clamp(roomOccupancyFactor(roomType, hour) + Math.round(noise(daySeed) * 2), 0, 5);
  const anomalyRoll = Math.abs(Math.sin(daySeed / 13));
  const isAnomaly = anomalyRoll > 0.985;
  const anomalyLabel = isAnomaly ? (hour > 14 ? "CO2 spike" : "Ventilation drift") : null;

  const baselineTemperature = (thresholds.temperature[0] + thresholds.temperature[1]) / 2;
  const nextTemp = previous
    ? previous.temperature + noise(daySeed / 7) * 0.6
    : baselineTemperature + noise(daySeed / 5) * 2;

  const nextHumidity = previous
    ? previous.humidity + noise(daySeed / 11) * 1.2
    : averageThreshold(thresholds.humidity) + noise(daySeed / 8) * 4;

  const co2 = Math.round(
    clamp(
      520 + occupancy * 140 + (hour >= 14 && hour <= 16 ? 110 : 0) + noise(daySeed / 4) * 100 + (isAnomaly ? 260 : 0),
      420,
      2000,
    ),
  );

  const light = Math.round(clamp(baseLight(roomType, hour) + noise(daySeed / 6) * 80, 8, 650));
  const noiseValue = Math.round(
    clamp(26 + occupancy * 7 + noise(daySeed / 9) * 8 + (isAnomaly ? 12 : 0), 18, 85),
  );

  return {
    temperature: round(clamp(nextTemp, baselineTemperature - 4, baselineTemperature + 5), 1),
    humidity: round(clamp(nextHumidity, thresholds.humidity[0] - 10, thresholds.humidity[1] + 12), 1),
    co2,
    light,
    noise: noiseValue,
    occupancy,
    isAnomaly,
    anomalyLabel,
  };
}

export function generateRuntimeReading({
  roomId,
  roomType,
  lastReading,
  now,
}: {
  roomId: string;
  roomType: RoomType;
  lastReading: RuntimeReading;
  now: Date;
}) {
  const lastTimestamp = new Date(lastReading.timestamp);
  const minutesSinceLast = differenceInMinutes(now, lastTimestamp);
  if (minutesSinceLast < SIMULATION_STEP_MINUTES) {
    return null;
  }

  return generateSeedReading({
    roomId,
    roomType,
    timestamp: addMinutes(lastTimestamp, SIMULATION_STEP_MINUTES),
    previous: lastReading,
  });
}

export function evaluateReadingAlerts({
  reading,
  thresholds,
}: {
  reading: Pick<RuntimeReading, "timestamp" | "temperature" | "humidity" | "co2" | "noise">;
  thresholds: ThresholdProfile;
}) {
  const alerts: Array<{
    severity: AlertSeverity;
    title: string;
    description: string;
    metricKey: string;
    threshold: number;
  }> = [];

  if (reading.co2 > thresholds.co2Max) {
    alerts.push({
      severity: reading.co2 > thresholds.co2Max + 250 ? AlertSeverity.HIGH : AlertSeverity.MEDIUM,
      title: "Air quality is slipping",
      description: `CO2 reached ${reading.co2} ppm, above the target of ${thresholds.co2Max} ppm.`,
      metricKey: "co2",
      threshold: thresholds.co2Max,
    });
  }

  if (reading.humidity > thresholds.humidity[1]) {
    alerts.push({
      severity: AlertSeverity.LOW,
      title: "Humidity is above the preferred range",
      description: `Humidity is at ${reading.humidity}% compared with the target ceiling of ${thresholds.humidity[1]}%.`,
      metricKey: "humidity",
      threshold: thresholds.humidity[1],
    });
  }

  if (reading.noise > thresholds.noiseMax) {
    alerts.push({
      severity: reading.noise > thresholds.noiseMax + 10 ? AlertSeverity.MEDIUM : AlertSeverity.LOW,
      title: "Noise level is elevated",
      description: `Noise reached ${reading.noise} dB, beyond the calm-room target of ${thresholds.noiseMax} dB.`,
      metricKey: "noise",
      threshold: thresholds.noiseMax,
    });
  }

  return alerts;
}
