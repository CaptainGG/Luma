import { notFound } from "next/navigation";

import type { DashboardData, RoomCard } from "@/lib/contracts";
import { computeComfortScore } from "@/lib/scoring";
import { average } from "@/lib/utils";

import { getPrimarySpace } from "../queries/dashboard-queries";
import { ensureFreshSpaceReadings } from "./simulation-service";

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

function mapRoomCard(room: NonNullable<Awaited<ReturnType<typeof getPrimarySpace>>>["rooms"][number]): RoomCard {
  const latestReading = room.readings[0];
  const comfortScore = latestReading
    ? computeComfortScore(latestReading, thresholdsForRoom(room)).score
    : 0;

  return {
    id: room.id,
    name: room.name,
    type: room.type,
    comfortScore,
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
      : {
          timestamp: new Date().toISOString(),
          temperature: 0,
          humidity: 0,
          co2: 0,
          light: 0,
          noise: 0,
          occupancy: 0,
        },
    device: room.device
      ? {
          id: room.device.id,
          name: room.device.name,
          batteryLevel: room.device.batteryLevel,
          connectionState: room.device.connectionState,
          lastSyncAt: room.device.lastSyncAt.toISOString(),
        }
      : null,
    alerts: room.alerts.map((alert) => ({
      id: alert.id,
      severity: alert.severity,
      status: alert.status,
      title: alert.title,
      description: alert.description,
      metricKey: alert.metricKey,
      triggeredAt: alert.triggeredAt.toISOString(),
    })),
  };
}

export async function getDashboardData(): Promise<DashboardData> {
  const initialSpace = await getPrimarySpace();

  if (!initialSpace) {
    notFound();
  }

  await ensureFreshSpaceReadings(initialSpace.id);
  const space = (await getPrimarySpace()) ?? initialSpace;
  const roomCards = space.rooms.map(mapRoomCard);

  return {
    space: {
      id: space.id,
      name: space.name,
    },
    summary: {
      roomCount: roomCards.length,
      activeAlerts: roomCards.reduce((total, room) => total + room.alerts.length, 0),
      averageComfortScore: average(roomCards.map((room) => room.comfortScore)),
      onlineDevices: roomCards.filter((room) => room.device?.connectionState === "ONLINE").length,
    },
    roomCards,
    recentInsights: space.rooms
      .flatMap((room) => room.insights)
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
      .slice(0, 4)
      .map((insight) => ({
        id: insight.id,
        type: insight.type,
        findingKey: insight.findingKey,
        evidence: insight.evidence,
        displayText: insight.displayText,
        source: insight.source,
        createdAt: insight.createdAt.toISOString(),
      })),
  };
}


