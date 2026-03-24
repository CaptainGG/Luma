import { jsonError } from "@/lib/http";
import { onboardingRoomsSchema } from "@/lib/validation";
import { createRooms } from "@/server/services/onboarding-service";

export async function POST(request: Request) {
  try {
    const payload = onboardingRoomsSchema.parse(await request.json());
    const rooms = await createRooms(payload.roomTypes);
    return Response.json(rooms, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Invalid rooms payload.", 400);
  }
}


