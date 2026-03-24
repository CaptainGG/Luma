import { DEMO_SPACE_NAME } from "@/lib/constants";
import type { RoomType } from "@/lib/domain";

import {
  pairDeviceForRoom,
  replaceRooms,
  upsertPrimarySpace,
} from "../store/fake-db";

export async function createSpace(name: string) {
  return upsertPrimarySpace(name || DEMO_SPACE_NAME);
}

export async function createRooms(roomTypes: RoomType[]) {
  return replaceRooms(roomTypes);
}

export async function pairMockDevices(roomIds: string[]) {
  return roomIds
    .map((roomId) => pairDeviceForRoom(roomId))
    .filter((device): device is NonNullable<typeof device> => Boolean(device));
}
