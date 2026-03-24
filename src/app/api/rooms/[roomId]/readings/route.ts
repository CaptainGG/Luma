import { rangeSchema } from "@/lib/validation";
import { getRoomReadingsPayload } from "@/server/services/room-service";

export async function GET(request: Request, { params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  const { searchParams } = new URL(request.url);
  const range = rangeSchema.parse(searchParams.get("range") ?? "24h");
  const payload = await getRoomReadingsPayload(roomId, range);
  return Response.json(payload);
}
