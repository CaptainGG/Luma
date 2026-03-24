import { notFound } from "next/navigation";

import type { ComfortPoint, EventMarker, ReadingPoint, RoomDetail } from "@/lib/contracts";
import { computeComfortScore } from "@/lib/scoring";
import { resolveRangeStart, type RangeKey } from "@/lib/time";

import { getRoomReadings, getRoomById } from "../queries/room-queries";
import { syncAlertsForRoom } from "./alerts-service";
import { getInsightsForRoom } from "./insights-service";
import { ensureFreshRoomReading } from "./simulation-service";

function thresholdsForRoom(room: {
  temperatureMin: number;
  temperatureMax: number;
  humidityMin: number;
  humidityMax: number;
  co2Max: number;
  lightTarget: number;
  noiseMax: number;
}) {
  return {
    temperature: [room.temperatureMin, room.temperatureMax] as [number, number],
    humidity: [room.humidityMin, room.humidityMax] as [number, number],
    co2Max: room.co2Max,
    lightTarget: room.lightTarget,
    noiseMax: room.noiseMax,
  };
}

export async function getRoomDetail(roomId: string): Promise<RoomDetail> {
  await ensureFreshRoomReading(roomId);
  const room = await getRoomById(roomId);

  if (!room) {
    notFound();
  }

  const latestReading = room.readings[0] ?? null;
  const recentInsights = await getInsightsForRoom(roomId);
  const recentAlerts = await syncAlertsForRoom(roomId);

  return {
    id: room.id,
    name: room.name,
    type: room.type,
    thresholds: thresholdsForRoom(room),
    latestReading: latestReading
      ? {
          timestamp: latestReading.timestamp.toISOString(),
          temperature: latestReading.temperature,
          humidity: latestReading.humidity,
          co2: latestReading.co2,
          light: latestReading.light,
          noise: latestReading.noise,
          occupancy: latestReading.occupancy,
        }
      : null,
    comfortScore: latestReading ? computeComfortScore(latestReading, thresholdsForRoom(room)).score : 0,
    device: room.device
      ? {
          id: room.device.id,
          name: room.device.name,
          batteryLevel: room.device.batteryLevel,
          connectionState: room.device.connectionState,
          lastSyncAt: room.device.lastSyncAt.toISOString(),
        }
      : null,
    recentAlerts: recentAlerts.map((alert) => ({
      id: alert.id,
      severity: alert.severity,
      status: alert.status,
      title: alert.title,
      description: alert.description,
      metricKey: alert.metricKey,
      triggeredAt: alert.triggeredAt.toISOString(),
    })),
    recentInsights,
  };
}

export async function getRoomReadingsPayload(roomId: string, range: RangeKey) {
  await ensureFreshRoomReading(roomId);
  const room = await getRoomById(roomId);

  if (!room) {
    notFound();
  }

  const readings = await getRoomReadings(roomId, resolveRangeStart(range));
  const thresholds = thresholdsForRoom(room);
  const alerts = await syncAlertsForRoom(roomId);
  const insights = await getInsightsForRoom(roomId);

  const readingPoints: ReadingPoint[] = readings.map((reading) => ({
    timestamp: reading.timestamp.toISOString(),
    temperature: reading.temperature,
    humidity: reading.humidity,
    co2: reading.co2,
    light: reading.light,
    noise: reading.noise,
    occupancy: reading.occupancy,
    isAnomaly: reading.isAnomaly,
    anomalyLabel: reading.anomalyLabel,
  }));

  const comfortSeries: ComfortPoint[] = readings.map((reading) => ({
    timestamp: reading.timestamp.toISOString(),
    score: computeComfortScore(reading, thresholds).score,
  }));

  const eventMarkers: EventMarker[] = [
    ...alerts.map((alert) => ({
      timestamp: alert.triggeredAt.toISOString(),
      label: alert.title,
      kind: "alert" as const,
    })),
    ...insights.map((insight) => ({
      timestamp: insight.createdAt,
      label: insight.displayText,
      kind: "insight" as const,
    })),
    ...readings
      .filter((reading) => reading.isAnomaly)
      .map((reading) => ({
        timestamp: reading.timestamp.toISOString(),
        label: reading.anomalyLabel ?? "Anomaly",
        kind: "anomaly" as const,
      })),
  ].sort((left, right) => new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime());

  return {
    readings: readingPoints,
    comfortSeries,
    eventMarkers,
  };
}


