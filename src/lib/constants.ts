import { RoomType, type RoomType as RoomTypeValue } from "./domain";

export const APP_NAME = "Luma";
export const DEMO_USER_EMAIL = "demo@luma.local";
export const DEMO_USER_NAME = "Luma Demo";
export const DEMO_SPACE_NAME = "Nordic Studio Loft";
export const POLL_INTERVAL_MS = 30000;
export const SIMULATION_STEP_MINUTES = 30;

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/rooms/cm-demo-room", label: "Rooms" },
  { href: "/settings", label: "Settings" },
];

export type ThresholdProfile = {
  temperature: [number, number];
  humidity: [number, number];
  co2Max: number;
  lightTarget: number;
  noiseMax: number;
};

export const ROOM_TYPE_OPTIONS: Array<{ value: RoomTypeValue; label: string; description: string }> = [
  {
    value: RoomType.BEDROOM,
    label: "Bedroom",
    description: "Gentle overnight comfort and darker evenings.",
  },
  {
    value: RoomType.WORKSPACE,
    label: "Workspace",
    description: "Sharper focus hours with stronger daylight swings.",
  },
  {
    value: RoomType.LIVING_ROOM,
    label: "Living room",
    description: "Balanced daytime comfort with relaxed evening activity.",
  },
  {
    value: RoomType.SHARED_ROOM,
    label: "Shared room",
    description: "Meeting or shared-use space with higher occupancy spikes.",
  },
];

export const ROOM_TYPE_CONFIG: Record<RoomTypeValue, { defaultName: string; thresholds: ThresholdProfile }> = {
  BEDROOM: {
    defaultName: "Bedroom",
    thresholds: {
      temperature: [18, 23],
      humidity: [40, 55],
      co2Max: 900,
      lightTarget: 120,
      noiseMax: 40,
    },
  },
  WORKSPACE: {
    defaultName: "Workspace",
    thresholds: {
      temperature: [20, 24],
      humidity: [35, 55],
      co2Max: 1000,
      lightTarget: 420,
      noiseMax: 55,
    },
  },
  LIVING_ROOM: {
    defaultName: "Living Room",
    thresholds: {
      temperature: [20, 24],
      humidity: [35, 58],
      co2Max: 1000,
      lightTarget: 280,
      noiseMax: 58,
    },
  },
  SHARED_ROOM: {
    defaultName: "Shared Studio",
    thresholds: {
      temperature: [20, 24],
      humidity: [35, 55],
      co2Max: 1100,
      lightTarget: 360,
      noiseMax: 62,
    },
  },
};


