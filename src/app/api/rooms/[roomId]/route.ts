import { getRoomDetail } from "@/server/services/room-service";

export async function GET(_request: Request, { params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  const payload = await getRoomDetail(roomId);
  return Response.json(payload);
}
