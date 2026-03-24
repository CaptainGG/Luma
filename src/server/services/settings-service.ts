import type { SettingsPayload } from "@/lib/contracts";

import { getUserPreferences } from "../queries/settings-queries";
import {
  updatePreferencesRecord,
  updateRoomThresholdRecord,
} from "../store/fake-db";

export async function getSettingsData() {
  const preferences = await getUserPreferences();

  return {
    preferences: preferences
      ? {
          summaryCadence: preferences.summaryCadence,
          morningDigest: preferences.morningDigest,
          anomalyHighlights: preferences.anomalyHighlights,
          comfortTargets: preferences.comfortTargets,
          calmMode: preferences.calmMode,
        }
      : null,
    rooms:
      preferences?.user.spaces[0]?.rooms.map((room) => ({
        id: room.id,
        name: room.name,
        type: room.type,
        temperatureMin: room.temperatureMin,
        temperatureMax: room.temperatureMax,
        humidityMin: room.humidityMin,
        humidityMax: room.humidityMax,
        co2Max: room.co2Max,
        lightTarget: room.lightTarget,
        noiseMax: room.noiseMax,
      })) ?? [],
  };
}

export async function updatePreferences(payload: SettingsPayload) {
  return updatePreferencesRecord(payload);
}

export async function updateRoomThresholds(
  roomId: string,
  payload: {
    temperatureMin: number;
    temperatureMax: number;
    humidityMin: number;
    humidityMax: number;
    co2Max: number;
    lightTarget: number;
    noiseMax: number;
  },
) {
  return updateRoomThresholdRecord(roomId, payload);
}
