import { InsightSource } from "@/lib/domain";
import { findStructuredInsights, presentInsight } from "@/lib/scoring";

import { getRecentRoomReadings, getRoomById } from "../queries/room-queries";
import { createInsightRecord } from "../store/fake-db";

export async function getInsightsForRoom(roomId: string) {
  const room = await getRoomById(roomId);

  if (!room) {
    return [];
  }

  const thresholds = {
    temperature: [room.temperatureMin, room.temperatureMax] as [number, number],
    humidity: [room.humidityMin, room.humidityMax] as [number, number],
    co2Max: room.co2Max,
    lightTarget: room.lightTarget,
    noiseMax: room.noiseMax,
  };

  const readings = await getRecentRoomReadings(roomId, 96);
  const findings = findStructuredInsights({
    roomId: room.id,
    roomName: room.name,
    roomType: room.type,
    readings,
    thresholds,
  });

  return findings.map((finding, index) => ({
    id: `${room.id}-${finding.findingKey}-${index}`,
    type: finding.type,
    findingKey: finding.findingKey,
    evidence: finding.evidence,
    displayText: presentInsight(finding),
    source: InsightSource.RULES,
    createdAt: new Date().toISOString(),
  }));
}

export async function persistSeedInsight(roomId: string) {
  const insights = await getInsightsForRoom(roomId);

  for (const insight of insights.slice(0, 2)) {
    createInsightRecord({
      roomId,
      type: insight.type,
      findingKey: insight.findingKey,
      evidence: insight.evidence,
      displayText: insight.displayText,
      source: InsightSource.RULES,
      windowStart: new Date(Date.now() - 1000 * 60 * 60 * 24),
      windowEnd: new Date(),
    });
  }
}
