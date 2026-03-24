import { subDays, subMinutes } from "date-fns";

import { DEMO_SPACE_NAME, DEMO_USER_EMAIL, DEMO_USER_NAME, ROOM_TYPE_CONFIG } from "@/lib/constants";
import {
  AlertStatus,
  ConnectionState,
  InsightSource,
  SummaryCadence,
  type AlertSeverity as AlertSeverityValue,
  type AlertStatus as AlertStatusValue,
  type ConnectionState as ConnectionStateValue,
  type InsightSource as InsightSourceValue,
  type InsightType,
  type RoomType,
  type SummaryCadence as SummaryCadenceValue,
} from "@/lib/domain";
import { findStructuredInsights, presentInsight } from "@/lib/scoring";
import { evaluateReadingAlerts, generateSeedReading } from "@/lib/simulation";

export type UserRecord = {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export type UserPreferenceRecord = {
  id: string;
  userId: string;
  summaryCadence: SummaryCadenceValue;
  morningDigest: boolean;
  anomalyHighlights: boolean;
  comfortTargets: boolean;
  calmMode: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type SpaceRecord = {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type RoomRecord = {
  id: string;
  spaceId: string;
  name: string;
  type: RoomType;
  temperatureMin: number;
  temperatureMax: number;
  humidityMin: number;
  humidityMax: number;
  co2Max: number;
  lightTarget: number;
  noiseMax: number;
  createdAt: Date;
  updatedAt: Date;
};

export type DeviceRecord = {
  id: string;
  roomId: string;
  name: string;
  batteryLevel: number;
  connectionState: ConnectionStateValue;
  firmwareVersion: string;
  lastSyncAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type SensorReadingRecord = {
  id: string;
  roomId: string;
  deviceId: string;
  timestamp: Date;
  temperature: number;
  humidity: number;
  co2: number;
  light: number;
  noise: number;
  occupancy: number;
  isAnomaly: boolean;
  anomalyLabel?: string | null;
  createdAt: Date;
};

export type AlertRecord = {
  id: string;
  roomId: string;
  deviceId?: string | null;
  severity: AlertSeverityValue;
  status: AlertStatusValue;
  title: string;
  description: string;
  metricKey: string;
  threshold?: number;
  triggeredAt: Date;
  resolvedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type InsightRecord = {
  id: string;
  roomId: string;
  type: InsightType;
  findingKey: string;
  evidence: string;
  displayText: string;
  source: InsightSourceValue;
  windowStart: Date;
  windowEnd: Date;
  createdAt: Date;
  updatedAt: Date;
};

type FakeState = {
  nextId: number;
  users: UserRecord[];
  preferences: UserPreferenceRecord[];
  spaces: SpaceRecord[];
  rooms: RoomRecord[];
  devices: DeviceRecord[];
  readings: SensorReadingRecord[];
  alerts: AlertRecord[];
  insights: InsightRecord[];
};

type FakeIndex = {
  usersById: Map<string, UserRecord>;
  preferencesByUserId: Map<string, UserPreferenceRecord>;
  spacesById: Map<string, SpaceRecord>;
  spacesByUserId: Map<string, SpaceRecord[]>;
  roomsById: Map<string, RoomRecord>;
  roomsBySpaceId: Map<string, RoomRecord[]>;
  devicesById: Map<string, DeviceRecord>;
  devicesByRoomId: Map<string, DeviceRecord>;
  readingsByRoomId: Map<string, SensorReadingRecord[]>;
  alertsByRoomId: Map<string, AlertRecord[]>;
  insightsByRoomId: Map<string, InsightRecord[]>;
};

type FakeStore = {
  state: FakeState;
  index: FakeIndex;
};

const DEFAULT_ROOM_TYPES: RoomType[] = [
  "BEDROOM",
  "WORKSPACE",
  "LIVING_ROOM",
  "SHARED_ROOM",
];

const globalForStore = globalThis as typeof globalThis & {
  __lumaFakeStore?: FakeStore;
};

function createEmptyState(): FakeState {
  return {
    nextId: 0,
    users: [],
    preferences: [],
    spaces: [],
    rooms: [],
    devices: [],
    readings: [],
    alerts: [],
    insights: [],
  };
}

function createEmptyIndex(): FakeIndex {
  return {
    usersById: new Map(),
    preferencesByUserId: new Map(),
    spacesById: new Map(),
    spacesByUserId: new Map(),
    roomsById: new Map(),
    roomsBySpaceId: new Map(),
    devicesById: new Map(),
    devicesByRoomId: new Map(),
    readingsByRoomId: new Map(),
    alertsByRoomId: new Map(),
    insightsByRoomId: new Map(),
  };
}

function buildIndex(state: FakeState): FakeIndex {
  const index = createEmptyIndex();

  for (const user of state.users) {
    index.usersById.set(user.id, user);
  }

  for (const preference of state.preferences) {
    index.preferencesByUserId.set(preference.userId, preference);
  }

  for (const space of state.spaces) {
    index.spacesById.set(space.id, space);
    index.spacesByUserId.set(space.userId, [...(index.spacesByUserId.get(space.userId) ?? []), space]);
  }

  for (const room of state.rooms) {
    index.roomsById.set(room.id, room);
    index.roomsBySpaceId.set(room.spaceId, [...(index.roomsBySpaceId.get(room.spaceId) ?? []), room]);
  }

  for (const device of state.devices) {
    index.devicesById.set(device.id, device);
    index.devicesByRoomId.set(device.roomId, device);
  }

  for (const reading of state.readings) {
    index.readingsByRoomId.set(reading.roomId, [...(index.readingsByRoomId.get(reading.roomId) ?? []), reading]);
  }

  for (const alert of state.alerts) {
    index.alertsByRoomId.set(alert.roomId, [...(index.alertsByRoomId.get(alert.roomId) ?? []), alert]);
  }

  for (const insight of state.insights) {
    index.insightsByRoomId.set(insight.roomId, [...(index.insightsByRoomId.get(insight.roomId) ?? []), insight]);
  }

  for (const [key, spaces] of index.spacesByUserId.entries()) {
    index.spacesByUserId.set(
      key,
      [...spaces].sort((left, right) => left.createdAt.getTime() - right.createdAt.getTime()),
    );
  }

  for (const [key, rooms] of index.roomsBySpaceId.entries()) {
    index.roomsBySpaceId.set(
      key,
      [...rooms].sort((left, right) => left.name.localeCompare(right.name)),
    );
  }

  for (const [key, readings] of index.readingsByRoomId.entries()) {
    index.readingsByRoomId.set(
      key,
      [...readings].sort((left, right) => left.timestamp.getTime() - right.timestamp.getTime()),
    );
  }

  for (const [key, alerts] of index.alertsByRoomId.entries()) {
    index.alertsByRoomId.set(
      key,
      [...alerts].sort((left, right) => right.triggeredAt.getTime() - left.triggeredAt.getTime()),
    );
  }

  for (const [key, insights] of index.insightsByRoomId.entries()) {
    index.insightsByRoomId.set(
      key,
      [...insights].sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime()),
    );
  }

  return index;
}

function updateIndex(store: FakeStore) {
  store.index = buildIndex(store.state);
}

function createId(store: FakeStore, prefix: string) {
  store.state.nextId += 1;
  return `${prefix}_${store.state.nextId.toString().padStart(4, "0")}`;
}

function thresholdsForRoom(room: RoomRecord) {
  return {
    temperature: [room.temperatureMin, room.temperatureMax] as [number, number],
    humidity: [room.humidityMin, room.humidityMax] as [number, number],
    co2Max: room.co2Max,
    lightTarget: room.lightTarget,
    noiseMax: room.noiseMax,
  };
}

function createBaseRecords(store: FakeStore) {
  const now = new Date();
  const user: UserRecord = {
    id: createId(store, "user"),
    email: DEMO_USER_EMAIL,
    name: DEMO_USER_NAME,
    createdAt: now,
    updatedAt: now,
  };
  const preference: UserPreferenceRecord = {
    id: createId(store, "pref"),
    userId: user.id,
    summaryCadence: SummaryCadence.DAILY,
    morningDigest: true,
    anomalyHighlights: true,
    comfortTargets: true,
    calmMode: true,
    createdAt: now,
    updatedAt: now,
  };
  const space: SpaceRecord = {
    id: createId(store, "space"),
    name: DEMO_SPACE_NAME,
    userId: user.id,
    createdAt: now,
    updatedAt: now,
  };

  store.state.users.push(user);
  store.state.preferences.push(preference);
  store.state.spaces.push(space);
}

function createRoomRecord(store: FakeStore, spaceId: string, roomType: RoomType) {
  const now = new Date();
  const config = ROOM_TYPE_CONFIG[roomType];
  const room: RoomRecord = {
    id: createId(store, "room"),
    spaceId,
    name: config.defaultName,
    type: roomType,
    temperatureMin: config.thresholds.temperature[0],
    temperatureMax: config.thresholds.temperature[1],
    humidityMin: config.thresholds.humidity[0],
    humidityMax: config.thresholds.humidity[1],
    co2Max: config.thresholds.co2Max,
    lightTarget: config.thresholds.lightTarget,
    noiseMax: config.thresholds.noiseMax,
    createdAt: now,
    updatedAt: now,
  };

  store.state.rooms.push(room);
  return room;
}

function seedRoomBundle(store: FakeStore, room: RoomRecord) {
  const now = new Date();
  const device: DeviceRecord = {
    id: createId(store, "device"),
    roomId: room.id,
    name: `${room.name} Monitor`,
    batteryLevel: 97,
    connectionState: ConnectionState.ONLINE,
    firmwareVersion: "1.4.2",
    lastSyncAt: subMinutes(now, 6),
    createdAt: now,
    updatedAt: now,
  };

  store.state.devices.push(device);

  const readings: SensorReadingRecord[] = [];
  const start = subDays(now, 7);
  let cursor = start;
  let previous = null;

  while (cursor <= now) {
    const next = generateSeedReading({
      roomId: room.id,
      roomType: room.type,
      timestamp: cursor,
      previous,
    });

    const reading: SensorReadingRecord = {
      id: createId(store, "reading"),
      roomId: room.id,
      deviceId: device.id,
      timestamp: cursor,
      temperature: next.temperature,
      humidity: next.humidity,
      co2: next.co2,
      light: next.light,
      noise: next.noise,
      occupancy: next.occupancy,
      isAnomaly: next.isAnomaly,
      anomalyLabel: next.anomalyLabel,
      createdAt: cursor,
    };

    readings.push(reading);
    previous = next;
    cursor = subMinutes(cursor, -30);
  }

  store.state.readings.push(...readings);

  const latest = readings.at(-1);
  if (latest) {
    const alerts = evaluateReadingAlerts({
      reading: latest,
      thresholds: thresholdsForRoom(room),
    });

    for (const alert of alerts) {
      store.state.alerts.push({
        id: createId(store, "alert"),
        roomId: room.id,
        deviceId: device.id,
        severity: alert.severity,
        status: AlertStatus.ACTIVE,
        title: alert.title,
        description: alert.description,
        metricKey: alert.metricKey,
        threshold: alert.threshold,
        triggeredAt: latest.timestamp,
        resolvedAt: null,
        createdAt: latest.timestamp,
        updatedAt: latest.timestamp,
      });
    }
  }

  const findings = findStructuredInsights({
    roomId: room.id,
    roomName: room.name,
    roomType: room.type,
    readings,
    thresholds: thresholdsForRoom(room),
  });

  for (const finding of findings.slice(0, 2)) {
    store.state.insights.push({
      id: createId(store, "insight"),
      roomId: room.id,
      type: finding.type,
      findingKey: finding.findingKey,
      evidence: finding.evidence,
      displayText: presentInsight(finding),
      source: InsightSource.RULES,
      windowStart: finding.windowStart,
      windowEnd: finding.windowEnd,
      createdAt: now,
      updatedAt: now,
    });
  }

  updateIndex(store);
  return device;
}

function createSeededStore(): FakeStore {
  const store: FakeStore = {
    state: createEmptyState(),
    index: createEmptyIndex(),
  };

  createBaseRecords(store);
  const space = store.state.spaces[0];

  for (const roomType of DEFAULT_ROOM_TYPES) {
    const room = createRoomRecord(store, space.id, roomType);
    seedRoomBundle(store, room);
  }

  updateIndex(store);
  return store;
}

function getStoreInternal() {
  if (!globalForStore.__lumaFakeStore) {
    globalForStore.__lumaFakeStore = createSeededStore();
  }

  return globalForStore.__lumaFakeStore;
}

export function getFakeStore() {
  return getStoreInternal();
}

export function resetFakeStore() {
  globalForStore.__lumaFakeStore = createSeededStore();
  return globalForStore.__lumaFakeStore;
}

export function getPrimaryUserRecord() {
  return getFakeStore().state.users[0] ?? null;
}

export function getPrimarySpaceRecord() {
  return getFakeStore().state.spaces[0] ?? null;
}

export function getRoomRecord(roomId: string) {
  return getFakeStore().index.roomsById.get(roomId) ?? null;
}

export function listRoomsForSpace(spaceId: string) {
  return [...(getFakeStore().index.roomsBySpaceId.get(spaceId) ?? [])];
}

export function getDeviceForRoom(roomId: string) {
  return getFakeStore().index.devicesByRoomId.get(roomId) ?? null;
}

export function listRoomReadings(roomId: string) {
  return [...(getFakeStore().index.readingsByRoomId.get(roomId) ?? [])];
}

export function listRoomAlerts(roomId: string) {
  return [...(getFakeStore().index.alertsByRoomId.get(roomId) ?? [])];
}

export function listRoomInsights(roomId: string) {
  return [...(getFakeStore().index.insightsByRoomId.get(roomId) ?? [])];
}

export function getUserPreferenceRecord() {
  const user = getPrimaryUserRecord();
  if (!user) {
    return null;
  }

  return getFakeStore().index.preferencesByUserId.get(user.id) ?? null;
}

export function upsertPrimarySpace(name: string) {
  const store = getFakeStore();
  const space = getPrimarySpaceRecord();
  if (!space) {
    throw new Error("No fake space is available.");
  }

  space.name = name || DEMO_SPACE_NAME;
  space.updatedAt = new Date();
  updateIndex(store);
  return space;
}

export function replaceRooms(roomTypes: RoomType[]) {
  const store = getFakeStore();
  const space = getPrimarySpaceRecord();
  if (!space) {
    throw new Error("No fake space is available.");
  }

  const roomIds = new Set(store.state.rooms.filter((room) => room.spaceId === space.id).map((room) => room.id));
  const deviceIds = new Set(store.state.devices.filter((device) => roomIds.has(device.roomId)).map((device) => device.id));

  store.state.rooms = store.state.rooms.filter((room) => room.spaceId !== space.id);
  store.state.devices = store.state.devices.filter((device) => !roomIds.has(device.roomId));
  store.state.readings = store.state.readings.filter((reading) => !deviceIds.has(reading.deviceId));
  store.state.alerts = store.state.alerts.filter((alert) => !roomIds.has(alert.roomId));
  store.state.insights = store.state.insights.filter((insight) => !roomIds.has(insight.roomId));

  const rooms = roomTypes.map((roomType) => createRoomRecord(store, space.id, roomType));
  updateIndex(store);
  return rooms;
}

export function pairDeviceForRoom(roomId: string) {
  const existing = getDeviceForRoom(roomId);
  if (existing) {
    return existing;
  }

  const room = getRoomRecord(roomId);
  if (!room) {
    return null;
  }

  return seedRoomBundle(getFakeStore(), room);
}

export function createAlertRecord(payload: Omit<AlertRecord, "id" | "createdAt" | "updatedAt">) {
  const store = getFakeStore();
  const now = new Date();
  const alert: AlertRecord = {
    ...payload,
    id: createId(store, "alert"),
    createdAt: now,
    updatedAt: now,
  };
  store.state.alerts.push(alert);
  updateIndex(store);
  return alert;
}

export function updateAlertRecord(alertId: string, payload: Partial<Omit<AlertRecord, "id" | "roomId">>) {
  const store = getFakeStore();
  const alert = store.state.alerts.find((item) => item.id === alertId);
  if (!alert) {
    return null;
  }

  Object.assign(alert, payload, { updatedAt: new Date() });
  updateIndex(store);
  return alert;
}

export function createInsightRecord(payload: Omit<InsightRecord, "id" | "createdAt" | "updatedAt">) {
  const store = getFakeStore();
  const now = new Date();
  const insight: InsightRecord = {
    ...payload,
    id: createId(store, "insight"),
    createdAt: now,
    updatedAt: now,
  };
  store.state.insights.push(insight);
  updateIndex(store);
  return insight;
}

export function createSensorReadingRecord(payload: Omit<SensorReadingRecord, "id" | "createdAt">) {
  const store = getFakeStore();
  const reading: SensorReadingRecord = {
    ...payload,
    id: createId(store, "reading"),
    createdAt: payload.timestamp,
  };
  store.state.readings.push(reading);
  updateIndex(store);
  return reading;
}

export function updateDeviceRecord(deviceId: string, payload: Partial<Omit<DeviceRecord, "id" | "roomId">>) {
  const store = getFakeStore();
  const device = store.state.devices.find((item) => item.id === deviceId);
  if (!device) {
    return null;
  }

  Object.assign(device, payload, { updatedAt: new Date() });
  updateIndex(store);
  return device;
}

export function updatePreferencesRecord(payload: {
  summaryCadence: SummaryCadenceValue;
  morningDigest: boolean;
  anomalyHighlights: boolean;
  comfortTargets: boolean;
  calmMode: boolean;
}) {
  const store = getFakeStore();
  const preference = getUserPreferenceRecord();
  if (!preference) {
    throw new Error("Preferences are not initialized yet.");
  }

  Object.assign(preference, payload, { updatedAt: new Date() });
  updateIndex(store);
  return preference;
}

export function updateRoomThresholdRecord(
  roomId: string,
  payload: Pick<
    RoomRecord,
    "temperatureMin" | "temperatureMax" | "humidityMin" | "humidityMax" | "co2Max" | "lightTarget" | "noiseMax"
  >,
) {
  const store = getFakeStore();
  const room = getRoomRecord(roomId);
  if (!room) {
    throw new Error("Room not found.");
  }

  Object.assign(room, payload, { updatedAt: new Date() });
  updateIndex(store);
  return room;
}
