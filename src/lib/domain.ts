export const RoomType = {
  BEDROOM: "BEDROOM",
  WORKSPACE: "WORKSPACE",
  LIVING_ROOM: "LIVING_ROOM",
  SHARED_ROOM: "SHARED_ROOM",
} as const;

export type RoomType = (typeof RoomType)[keyof typeof RoomType];

export const ConnectionState = {
  ONLINE: "ONLINE",
  IDLE: "IDLE",
  OFFLINE: "OFFLINE",
} as const;

export type ConnectionState = (typeof ConnectionState)[keyof typeof ConnectionState];

export const AlertSeverity = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
} as const;

export type AlertSeverity = (typeof AlertSeverity)[keyof typeof AlertSeverity];

export const AlertStatus = {
  ACTIVE: "ACTIVE",
  RESOLVED: "RESOLVED",
} as const;

export type AlertStatus = (typeof AlertStatus)[keyof typeof AlertStatus];

export const InsightType = {
  AIR_QUALITY: "AIR_QUALITY",
  COMFORT: "COMFORT",
  HUMIDITY: "HUMIDITY",
  LIGHTING: "LIGHTING",
  NOISE: "NOISE",
} as const;

export type InsightType = (typeof InsightType)[keyof typeof InsightType];

export const InsightSource = {
  RULES: "RULES",
  LLM: "LLM",
} as const;

export type InsightSource = (typeof InsightSource)[keyof typeof InsightSource];

export const SummaryCadence = {
  DAILY: "DAILY",
  WEEKLY: "WEEKLY",
  OFF: "OFF",
} as const;

export type SummaryCadence = (typeof SummaryCadence)[keyof typeof SummaryCadence];
