import {
  getDeviceForRoom,
  getPrimarySpaceRecord,
  getPrimaryUserRecord,
  getUserPreferenceRecord,
  listRoomAlerts,
  listRoomInsights,
  listRoomReadings,
  listRoomsForSpace,
} from "../store/fake-db";

export async function getPrimarySpace() {
  const user = getPrimaryUserRecord();
  const preference = getUserPreferenceRecord();
  const space = getPrimarySpaceRecord();

  if (!user || !space) {
    return null;
  }

  const rooms = listRoomsForSpace(space.id).map((room) => ({
    ...room,
    device: getDeviceForRoom(room.id),
    readings: [...listRoomReadings(room.id)].sort((left, right) => right.timestamp.getTime() - left.timestamp.getTime()).slice(0, 1),
    alerts: listRoomAlerts(room.id)
      .filter((alert) => alert.status === "ACTIVE")
      .sort((left, right) => right.triggeredAt.getTime() - left.triggeredAt.getTime())
      .slice(0, 3),
    insights: listRoomInsights(room.id)
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
      .slice(0, 2),
  }));

  return {
    ...space,
    user: {
      ...user,
      preference: preference ?? null,
    },
    rooms,
  };
}

export async function getRoomOptions() {
  const space = getPrimarySpaceRecord();
  if (!space) {
    return [];
  }

  return listRoomsForSpace(space.id).map((room) => ({
    id: room.id,
    name: room.name,
    type: room.type,
  }));
}
