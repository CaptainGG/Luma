import { getInsightsForRoom } from "@/server/services/insights-service";

export async function GET(_request: Request, { params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  const payload = await getInsightsForRoom(roomId);
  return Response.json(payload);
}
