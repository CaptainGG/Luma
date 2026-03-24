import type { AlertSeverity, InsightType, RoomType, SummaryCadence } from "./domain";

import type { ThresholdProfile } from "./constants";

export type RoomCard = {
  id: string;
  name: string;
  type: RoomType;
  comfortScore: number;
  latestReading: {
    timestamp: string;
    temperature: number;
    humidity: number;
    co2: number;
    light: number;
    noise: number;
    occupancy: number;
  };
  device: {
    id: string;
    name: string;
    batteryLevel: number;
    connectionState: string;
    lastSyncAt: string;
  } | null;
  alerts: AlertItem[];
};

export type RoomDetail = {
  id: string;
  name: string;
  type: RoomType;
  thresholds: ThresholdProfile;
  latestReading: RoomCard["latestReading"] | null;
  comfortScore: number;
  device: RoomCard["device"];
  recentAlerts: AlertItem[];
  recentInsights: InsightCard[];
};

export type ReadingPoint = {
  timestamp: string;
  temperature: number;
  humidity: number;
  co2: number;
  light: number;
  noise: number;
  occupancy: number;
  isAnomaly: boolean;
  anomalyLabel?: string | null;
};

export type ComfortPoint = {
  timestamp: string;
  score: number;
};

export type EventMarker = {
  timestamp: string;
  label: string;
  kind: "alert" | "insight" | "anomaly";
};

export type AlertItem = {
  id: string;
  severity: AlertSeverity;
  status: string;
  title: string;
  description: string;
  metricKey: string;
  triggeredAt: string;
};

export type InsightFinding = {
  roomId: string;
  roomName: string;
  type: InsightType;
  findingKey: string;
  evidence: string;
  windowStart: Date;
  windowEnd: Date;
};

export type InsightCard = {
  id: string;
  type: InsightType;
  findingKey: string;
  evidence: string;
  displayText: string;
  source: string;
  createdAt: string;
};

export type DashboardData = {
  space: {
    id: string;
    name: string;
  };
  summary: {
    roomCount: number;
    activeAlerts: number;
    averageComfortScore: number;
    onlineDevices: number;
  };
  roomCards: RoomCard[];
  recentInsights: InsightCard[];
};

export type SettingsPayload = {
  summaryCadence: SummaryCadence;
  morningDigest: boolean;
  anomalyHighlights: boolean;
  comfortTargets: boolean;
  calmMode: boolean;
};


