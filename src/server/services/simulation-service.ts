import { ConnectionState } from "@/lib/domain";
import { generateRuntimeReading } from "@/lib/simulation";

import { getPrimarySpace } from "../queries/dashboard-queries";
import { getRoomById } from "../queries/room-queries";
import {
  createSensorReadingRecord,
  updateDeviceRecord,
} from "../store/fake-db";
import { syncAlertsForRoom } from "./alerts-service";

async function refreshRoom(roomId: string) {
  const room = await getRoomById(roomId);

  if (!room || !room.device || !room.readings[0]) {
    return;
  }

  const nextReading = generateRuntimeReading({
    roomId: room.id,
    roomType: room.type,
    lastReading: room.readings[0],
    now: new Date(),
  });

  if (!nextReading) {
    return;
  }

  createSensorReadingRecord({
    roomId: room.id,
    deviceId: room.device.id,
    timestamp: new Date(room.readings[0].timestamp.getTime() + 30 * 60 * 1000),
    temperature: nextReading.temperature,
    humidity: nextReading.humidity,
    co2: nextReading.co2,
    light: nextReading.light,
    noise: nextReading.noise,
    occupancy: nextReading.occupancy,
    isAnomaly: nextReading.isAnomaly,
    anomalyLabel: nextReading.anomalyLabel,
  });

  updateDeviceRecord(room.device.id, {
    batteryLevel: Math.max(room.device.batteryLevel - 1, 34),
    lastSyncAt: new Date(),
    connectionState: nextReading.isAnomaly ? ConnectionState.IDLE : ConnectionState.ONLINE,
  });

  await syncAlertsForRoom(roomId);
}

export async function ensureFreshRoomReading(roomId: string) {
  await refreshRoom(roomId);
}

export async function ensureFreshSpaceReadings(spaceId: string) {
  const space = await getPrimarySpace();

  if (!space || space.id !== spaceId) {
    return;
  }

  await Promise.all(space.rooms.map((room) => refreshRoom(room.id)));
}
