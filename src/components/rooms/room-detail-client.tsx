"use client";

import { startTransition, useEffect, useEffectEvent, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";

import type { EventMarker, ReadingPoint, RoomDetail } from "@/lib/contracts";
import type { RangeKey } from "@/lib/time";
import { POLL_INTERVAL_MS } from "@/lib/constants";
import { formatComfortScore, formatMetric } from "@/lib/formatting";

import { MetricChart } from "@/components/charts/metric-chart";
import { EmptyState, ErrorState } from "@/components/states/feedback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function RoomDetailClient({
  roomId,
  initialDetail,
  initialSeries,
}: {
  roomId: string;
  initialDetail: RoomDetail;
  initialSeries: {
    readings: ReadingPoint[];
    comfortSeries: Array<{ timestamp: string; score: number }>;
    eventMarkers: EventMarker[];
  };
}) {
  const [detail, setDetail] = useState(initialDetail);
  const [range, setRange] = useState<RangeKey>("24h");
  const [series, setSeries] = useState(initialSeries);
  const [error, setError] = useState<string | null>(null);

  async function fetchRoom(nextRange: RangeKey) {
    try {
      const [detailResponse, seriesResponse] = await Promise.all([
        fetch(`/api/rooms/${roomId}`, { cache: "no-store" }),
        fetch(`/api/rooms/${roomId}/readings?range=${nextRange}`, { cache: "no-store" }),
      ]);

      if (!detailResponse.ok || !seriesResponse.ok) {
        throw new Error("Room data is temporarily unavailable.");
      }

      const [nextDetail, nextSeries] = (await Promise.all([detailResponse.json(), seriesResponse.json()])) as [
        RoomDetail,
        typeof initialSeries,
      ];

      startTransition(() => {
        setDetail(nextDetail);
        setSeries(nextSeries);
        setError(null);
      });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Something went wrong.");
    }
  }

  const pollRoom = useEffectEvent(() => {
    void fetchRoom(range);
  });

  useEffect(() => {
    pollRoom();
    const interval = window.setInterval(() => {
      pollRoom();
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [range]);

  const comfortReadings = useMemo(
    () => series.readings.map((reading, index) => ({ ...reading, score: series.comfortSeries[index]?.score ?? 0 })),
    [series],
  );

  return (
    <div className="space-y-6">
      {error ? <ErrorState title="Live room refresh paused" description={error} /> : null}
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_340px]">
        <Card className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Badge>{detail.type.toLowerCase().replaceAll("_", " ")}</Badge>
              <CardTitle className="mt-3 text-3xl">{detail.name}</CardTitle>
              <CardDescription className="mt-2 max-w-xl">
                Live conditions, fixed MVP charts, and calm room signals generated from the latest readings.
              </CardDescription>
            </div>
            <div className="flex rounded-full bg-black/4 p-1">
              {(["24h", "7d"] as const).map((option) => (
                <button
                  key={option}
                  className={`rounded-full px-4 py-2 text-sm font-medium ${range === option ? "bg-white text-[color:var(--foreground)] shadow-sm" : "text-[color:var(--muted-foreground)]"}`}
                  onClick={() => setRange(option)}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-[24px] bg-black/4 p-4">
              <p className="text-sm text-[color:var(--muted-foreground)]">Temperature</p>
              <p className="mt-1 text-2xl font-semibold text-[color:var(--foreground)]">{formatMetric(detail.latestReading?.temperature ?? 0, "°")}</p>
            </div>
            <div className="rounded-[24px] bg-black/4 p-4">
              <p className="text-sm text-[color:var(--muted-foreground)]">Humidity</p>
              <p className="mt-1 text-2xl font-semibold text-[color:var(--foreground)]">{formatMetric(detail.latestReading?.humidity ?? 0, "%")}</p>
            </div>
            <div className="rounded-[24px] bg-black/4 p-4">
              <p className="text-sm text-[color:var(--muted-foreground)]">CO2</p>
              <p className="mt-1 text-2xl font-semibold text-[color:var(--foreground)]">{formatMetric(detail.latestReading?.co2 ?? 0, " ppm")}</p>
            </div>
            <div className="rounded-[24px] bg-black/4 p-4">
              <p className="text-sm text-[color:var(--muted-foreground)]">Comfort</p>
              <p className="mt-1 text-2xl font-semibold text-[color:var(--foreground)]">{formatComfortScore(detail.comfortScore)}</p>
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <div>
            <Badge variant="neutral">Device status</Badge>
            <CardTitle className="mt-3">{detail.device?.name ?? "No device paired"}</CardTitle>
            <CardDescription className="mt-1">Battery, sync freshness, and current connection state.</CardDescription>
          </div>
          {detail.device ? (
            <>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-[color:var(--muted-foreground)]">
                  <span>Battery</span>
                  <span>{detail.device.batteryLevel}%</span>
                </div>
                <Progress value={detail.device.batteryLevel} />
              </div>
              <div className="grid gap-3 text-sm">
                <div className="rounded-2xl bg-black/4 p-3">
                  <p className="text-[color:var(--muted-foreground)]">Connection</p>
                  <p className="mt-1 font-medium text-[color:var(--foreground)]">{detail.device.connectionState}</p>
                </div>
                <div className="rounded-2xl bg-black/4 p-3">
                  <p className="text-[color:var(--muted-foreground)]">Last sync</p>
                  <p className="mt-1 font-medium text-[color:var(--foreground)]">{formatDistanceToNow(new Date(detail.device.lastSyncAt), { addSuffix: true })}</p>
                </div>
              </div>
            </>
          ) : (
            <EmptyState title="No paired hardware yet" description="Use onboarding to pair a mock device before monitoring this room." />
          )}
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <MetricChart
          title="Temperature + Humidity"
          description="Core comfort conditions across the selected range."
          data={series.readings}
          lines={[
            { key: "temperature", color: "#3b6e70", name: "Temperature" },
            { key: "humidity", color: "#8ba7a8", name: "Humidity" },
          ]}
          range={range}
          eventMarkers={series.eventMarkers}
        />
        <MetricChart
          title="CO2"
          description="Air-quality drift and recurring afternoon pressure."
          data={series.readings}
          lines={[{ key: "co2", color: "#d97706", name: "CO2" }]}
          range={range}
          eventMarkers={series.eventMarkers}
        />
        <MetricChart
          title="Light + Noise"
          description="Ambient rhythm and activity changes throughout the day."
          data={series.readings}
          lines={[
            { key: "light", color: "#d7a332", name: "Light" },
            { key: "noise", color: "#8f5f7a", name: "Noise" },
          ]}
          range={range}
          eventMarkers={series.eventMarkers}
        />
        <MetricChart
          title="Comfort Score Over Time"
          description="Derived comfort score based on temperature, humidity, air quality, light, and noise."
          data={comfortReadings}
          lines={[{ key: "score", color: "#1f5e52", name: "Comfort score" }]}
          range={range}
          eventMarkers={series.eventMarkers}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_360px]">
        <Card className="space-y-4">
          <div>
            <CardTitle>Event timeline</CardTitle>
            <CardDescription>Anomalies, alerts, and insight markers from the selected range.</CardDescription>
          </div>
          <div className="space-y-3">
            {series.eventMarkers.length ? (
              series.eventMarkers.slice(-8).reverse().map((event) => (
                <div key={`${event.timestamp}-${event.label}`} className="rounded-2xl bg-black/4 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-medium text-[color:var(--foreground)]">{event.label}</p>
                    <Badge variant={event.kind === "alert" ? "caution" : event.kind === "anomaly" ? "danger" : "default"}>{event.kind}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="No recent event markers" description="The timeline fills in as alerts, anomalies, or findings appear." />
            )}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="space-y-4">
            <CardTitle>Recent alerts</CardTitle>
            <div className="space-y-3">
              {detail.recentAlerts.length ? (
                detail.recentAlerts.map((alert) => (
                  <div key={alert.id} className="rounded-2xl bg-black/4 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-[color:var(--foreground)]">{alert.title}</p>
                      <Badge variant={alert.severity === "HIGH" ? "danger" : alert.severity === "MEDIUM" ? "caution" : "neutral"}>{alert.severity}</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">{alert.description}</p>
                  </div>
                ))
              ) : (
                <EmptyState title="Room is stable" description="Alerts show up here when thresholds are crossed." />
              )}
            </div>
          </Card>

          <Card className="space-y-4">
            <CardTitle>Presentation layer</CardTitle>
            <div className="space-y-3">
              {detail.recentInsights.length ? (
                detail.recentInsights.map((insight) => (
                  <div key={insight.id} className="rounded-2xl bg-black/4 p-4">
                    <p className="text-sm font-medium text-[color:var(--foreground)]">{insight.displayText}</p>
                    <p className="mt-2 text-xs leading-5 text-[color:var(--muted-foreground)]">{insight.evidence}</p>
                  </div>
                ))
              ) : (
                <EmptyState title="No room insights yet" description="Findings appear once the room accumulates enough trend history." />
              )}
            </div>
            <Button variant="secondary" onClick={() => void fetchRoom(range)}>
              Refresh room
            </Button>
          </Card>
        </div>
      </section>
    </div>
  );
}


