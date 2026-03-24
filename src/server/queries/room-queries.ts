import {
  getDeviceForRoom,
  getRoomRecord,
  listRoomAlerts,
  listRoomInsights,
  listRoomReadings,
} from "../store/fake-db";

export async function getRoomById(roomId: string) {
  const room = getRoomRecord(roomId);
  if (!room) {
    return null;
  }

  return {
    ...room,
    device: getDeviceForRoom(roomId),
    alerts: listRoomAlerts(roomId)
      .sort((left, right) => right.triggeredAt.getTime() - left.triggeredAt.getTime())
      .slice(0, 6),
    insights: listRoomInsights(roomId)
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
      .slice(0, 6),
    readings: [...listRoomReadings(roomId)]
      .sort((left, right) => right.timestamp.getTime() - left.timestamp.getTime())
      .slice(0, 1),
  };
}

export async function getRoomReadings(roomId: string, from: Date) {
  return listRoomReadings(roomId).filter((reading) => reading.timestamp >= from);
}

export async function getRecentRoomReadings(roomId: string, limit = 96) {
  return [...listRoomReadings(roomId)].slice(-limit);
}
