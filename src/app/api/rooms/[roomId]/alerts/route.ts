import { syncAlertsForRoom } from "@/server/services/alerts-service";

export async function GET(_request: Request, { params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  const payload = await syncAlertsForRoom(roomId);
  return Response.json(
    payload.map((alert) => ({
      id: alert.id,
      severity: alert.severity,
      status: alert.status,
      title: alert.title,
      description: alert.description,
      metricKey: alert.metricKey,
      triggeredAt: alert.triggeredAt.toISOString(),
    })),
  );
}
