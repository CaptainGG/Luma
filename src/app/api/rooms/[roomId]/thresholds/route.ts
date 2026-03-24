import { jsonError } from "@/lib/http";
import { thresholdSchema } from "@/lib/validation";
import { updateRoomThresholds } from "@/server/services/settings-service";

export async function PATCH(request: Request, { params }: { params: Promise<{ roomId: string }> }) {
  try {
    const { roomId } = await params;
    const payload = thresholdSchema.parse(await request.json());
    const room = await updateRoomThresholds(roomId, payload);
    return Response.json(room);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Invalid threshold payload.", 400);
  }
}
