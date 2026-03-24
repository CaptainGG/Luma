import {
  getPrimaryUserRecord,
  getPrimarySpaceRecord,
  getUserPreferenceRecord,
  listRoomsForSpace,
} from "../store/fake-db";

export async function getUserPreferences() {
  const user = getPrimaryUserRecord();
  const preference = getUserPreferenceRecord();
  const space = getPrimarySpaceRecord();

  if (!user || !preference) {
    return null;
  }

  return {
    ...preference,
    user: {
      ...user,
      spaces: space
        ? [
            {
              ...space,
              rooms: listRoomsForSpace(space.id),
            },
          ]
        : [],
    },
  };
}
