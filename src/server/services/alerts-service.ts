import { AlertStatus } from "@/lib/domain";
import { evaluateReadingAlerts } from "@/lib/simulation";

import { getRoomById } from "../queries/room-queries";
import {
  createAlertRecord,
  listRoomAlerts,
  updateAlertRecord,
} from "../store/fake-db";

export async function syncAlertsForRoom(roomId: string) {
  const room = await getRoomById(roomId);

  if (!room || !room.device || !room.readings[0]) {
    return [];
  }

  const thresholds = {
    temperature: [room.temperatureMin, room.temperatureMax] as [number, number],
    humidity: [room.humidityMin, room.humidityMax] as [number, number],
    co2Max: room.co2Max,
    lightTarget: room.lightTarget,
    noiseMax: room.noiseMax,
  };

  const activeAlerts = listRoomAlerts(roomId).filter((alert) => alert.status === AlertStatus.ACTIVE);
  const nextAlerts = evaluateReadingAlerts({
    reading: {
      timestamp: room.readings[0].timestamp,
      temperature: room.readings[0].temperature,
      humidity: room.readings[0].humidity,
      co2: room.readings[0].co2,
      noise: room.readings[0].noise,
    },
    thresholds,
  });

  const activeMetrics = new Set(nextAlerts.map((alert) => alert.metricKey));

  for (const alert of activeAlerts) {
    if (!activeMetrics.has(alert.metricKey)) {
      updateAlertRecord(alert.id, {
        status: AlertStatus.RESOLVED,
        resolvedAt: new Date(),
      });
    }
  }

  for (const alert of nextAlerts) {
    const existing = activeAlerts.find((activeAlert) => activeAlert.metricKey === alert.metricKey);
    if (existing) {
      continue;
    }

    createAlertRecord({
      roomId,
      deviceId: room.device.id,
      severity: alert.severity,
      status: AlertStatus.ACTIVE,
      title: alert.title,
      description: alert.description,
      metricKey: alert.metricKey,
      threshold: alert.threshold,
      triggeredAt: room.readings[0].timestamp,
      resolvedAt: null,
    });
  }

  return listRoomAlerts(roomId).slice(0, 8);
}
