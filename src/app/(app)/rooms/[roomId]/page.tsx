export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/layout/page-header";
import { RoomDetailClient } from "@/components/rooms/room-detail-client";
import { getRoomDetail, getRoomReadingsPayload } from "@/server/services/room-service";

export default async function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  const detail = await getRoomDetail(roomId);
  const series = await getRoomReadingsPayload(roomId, "24h");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Room detail"
        title={detail.name}
        description="Track temperature, humidity, air quality, light, noise, and comfort across the selected range."
      />
      <RoomDetailClient roomId={roomId} initialDetail={detail} initialSeries={series} />
    </div>
  );
}
