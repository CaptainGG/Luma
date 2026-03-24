import { z } from "zod";
import { RoomType, SummaryCadence } from "./domain";

export const rangeSchema = z.enum(["24h", "7d"]).default("24h");

export const onboardingSpaceSchema = z.object({
  name: z.string().trim().min(2).max(50),
});

export const onboardingRoomsSchema = z.object({
  roomTypes: z.array(z.enum([RoomType.BEDROOM, RoomType.WORKSPACE, RoomType.LIVING_ROOM, RoomType.SHARED_ROOM])).min(1).max(4),
});

export const pairDevicesSchema = z.object({
  roomIds: z.array(z.string().min(1)).min(1),
});

export const thresholdSchema = z.object({
  temperatureMin: z.number().min(10).max(28),
  temperatureMax: z.number().min(16).max(32),
  humidityMin: z.number().min(20).max(60),
  humidityMax: z.number().min(30).max(75),
  co2Max: z.number().min(600).max(2000),
  lightTarget: z.number().min(80).max(700),
  noiseMax: z.number().min(25).max(80),
}).refine((payload) => payload.temperatureMin < payload.temperatureMax, {
  message: "Temperature min must be below max.",
  path: ["temperatureMax"],
}).refine((payload) => payload.humidityMin < payload.humidityMax, {
  message: "Humidity min must be below max.",
  path: ["humidityMax"],
});

export const settingsSchema = z.object({
  summaryCadence: z.enum([SummaryCadence.DAILY, SummaryCadence.WEEKLY, SummaryCadence.OFF]),
  morningDigest: z.boolean(),
  anomalyHighlights: z.boolean(),
  comfortTargets: z.boolean(),
  calmMode: z.boolean(),
});


