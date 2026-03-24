import { jsonError } from "@/lib/http";
import { pairDevicesSchema } from "@/lib/validation";
import { pairMockDevices } from "@/server/services/onboarding-service";

export async function POST(request: Request) {
  try {
    const payload = pairDevicesSchema.parse(await request.json());
    const devices = await pairMockDevices(payload.roomIds);
    return Response.json(devices, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Invalid pairing payload.", 400);
  }
}


