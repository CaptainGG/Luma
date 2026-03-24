"use client";

import { useEffect, useEffectEvent, useState, startTransition } from "react";
import Link from "next/link";
import { Activity, ThermometerSun, TriangleAlert, Wifi } from "lucide-react";

import type { DashboardData } from "@/lib/contracts";
import { formatComfortScore, formatMetric, formatTimestamp } from "@/lib/formatting";
import { POLL_INTERVAL_MS } from "@/lib/constants";

import { EmptyState, ErrorState, LoadingState } from "@/components/states/feedback";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const summaryItems = [
  { key: "averageComfortScore", label: "Avg comfort", icon: Activity },
  { key: "activeAlerts", label: "Active alerts", icon: TriangleAlert },
  { key: "onlineDevices", label: "Online devices", icon: Wifi },
  { key: "roomCount", label: "Rooms", icon: ThermometerSun },
] as const;

export function DashboardClient({ initialData }: { initialData: DashboardData }) {
  const [data, setData] = useState(initialData);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function fetchDashboard() {
    setIsLoading(true);

    try {
      const response = await fetch("/api/dashboard", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Unable to load the dashboard right now.");
      }

      const nextData = (await response.json()) as DashboardData;
      startTransition(() => {
        setData(nextData);
        setError(null);
      });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  const pollDashboard = useEffectEvent(() => {
    void fetchDashboard();
  });

  useEffect(() => {
    const interval = window.setInterval(() => {
      pollDashboard();
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, []);

  if (!data.roomCards.length && isLoading) {
    return <LoadingState title="Warming up the dashboard" />;
  }

  return (
    <div className="space-y-6">
      {error ? <ErrorState title="Live refresh paused" description={error} /> : null}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryItems.map(({ key, label, icon: Icon }) => (
          <Card key={key} className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="neutral">{label}</Badge>
              <Icon className="h-4 w-4 text-[color:var(--muted-foreground)]" />
            </div>
            <div>
              <p className="text-3xl font-semibold tracking-[-0.04em] text-[color:var(--foreground)]">
                {key === "averageComfortScore"
                  ? formatComfortScore(data.summary.averageComfortScore)
                  : data.summary[key]}
              </p>
              <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">{label} across {data.space.name}</p>
            </div>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_360px]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-[color:var(--foreground)]">Room snapshot</h2>
              <p className="text-sm text-[color:var(--muted-foreground)]">Live-ish conditions with device and alert context.</p>
            </div>
            {isLoading ? <Badge variant="neutral">Refreshing</Badge> : null}
          </div>

          {data.roomCards.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {data.roomCards.map((room) => (
                <Link key={room.id} href={`/rooms/${room.id}`}>
                  <Card className="h-full space-y-4 transition hover:-translate-y-0.5 hover:shadow-[0_30px_90px_-45px_rgba(26,46,54,0.5)]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle>{room.name}</CardTitle>
                        <CardDescription>{room.type.toLowerCase().replaceAll("_", " ")}</CardDescription>
                      </div>
                      <Badge variant={room.alerts.length ? "caution" : "positive"}>
                        {room.alerts.length ? `${room.alerts.length} alerts` : "Calm"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm text-[color:var(--muted-foreground)]">
                      <div className="rounded-2xl bg-black/4 p-3">
                        <p>Temperature</p>
                        <p className="mt-1 text-lg font-semibold text-[color:var(--foreground)]">{formatMetric(room.latestReading.temperature, "°")}</p>
                      </div>
                      <div className="rounded-2xl bg-black/4 p-3">
                        <p>Humidity</p>
                        <p className="mt-1 text-lg font-semibold text-[color:var(--foreground)]">{formatMetric(room.latestReading.humidity, "%")}</p>
                      </div>
                      <div className="rounded-2xl bg-black/4 p-3">
                        <p>CO2</p>
                        <p className="mt-1 text-lg font-semibold text-[color:var(--foreground)]">{formatMetric(room.latestReading.co2, " ppm")}</p>
                      </div>
                      <div className="rounded-2xl bg-black/4 p-3">
                        <p>Comfort</p>
                        <p className="mt-1 text-lg font-semibold text-[color:var(--foreground)]">{formatComfortScore(room.comfortScore)}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-[color:var(--muted-foreground)]">
                      <span>{room.device ? `${room.device.batteryLevel}% battery` : "No paired device"}</span>
                      <span>{formatTimestamp(room.latestReading.timestamp, "HH:mm")}</span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="No rooms yet" description="Complete onboarding to generate a believable multi-room demo." />
          )}
        </div>

        <Card className="space-y-4">
          <div>
            <Badge>Insight layer</Badge>
            <CardTitle className="mt-3">Recent room signals</CardTitle>
            <CardDescription className="mt-1">Deterministic findings rendered as calm product copy.</CardDescription>
          </div>
          <div className="space-y-3">
            {data.recentInsights.length ? (
              data.recentInsights.map((insight) => (
                <div key={insight.id} className="rounded-2xl bg-black/4 p-4">
                  <p className="text-sm font-medium text-[color:var(--foreground)]">{insight.displayText}</p>
                  <p className="mt-2 text-xs leading-5 text-[color:var(--muted-foreground)]">{insight.evidence}</p>
                </div>
              ))
            ) : (
              <EmptyState title="No notable patterns yet" description="Insights will appear as soon as the rooms build enough trend history." />
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}


