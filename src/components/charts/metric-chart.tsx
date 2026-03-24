"use client";

import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format } from "date-fns";

import type { EventMarker, ReadingPoint } from "@/lib/contracts";
import type { RangeKey } from "@/lib/time";

import { EmptyState } from "@/components/states/feedback";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export function MetricChart({
  title,
  description,
  data,
  lines,
  range,
  eventMarkers,
}: {
  title: string;
  description: string;
  data: ReadingPoint[] | Array<ReadingPoint & { score?: number }>;
  lines: Array<{ key: string; color: string; name: string }>;
  range: RangeKey;
  eventMarkers: EventMarker[];
}) {
  if (!data.length) {
    return <EmptyState title={`No ${title.toLowerCase()} data`} description="This chart fills in once readings are available for the selected range." />;
  }

  return (
    <Card className="space-y-4">
      <div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: -14 }}>
            <CartesianGrid vertical={false} stroke="rgba(16,24,28,0.08)" />
            <XAxis
              dataKey="timestamp"
              minTickGap={28}
              tick={{ fill: "#6b7680", fontSize: 12 }}
              tickFormatter={(value) => format(new Date(value), range === "24h" ? "HH:mm" : "MMM d")}
              stroke="rgba(16,24,28,0.08)"
            />
            <YAxis tick={{ fill: "#6b7680", fontSize: 12 }} stroke="rgba(16,24,28,0.08)" width={40} />
            <Tooltip
              contentStyle={{ borderRadius: 16, border: "1px solid rgba(16,24,28,0.08)", boxShadow: "0 20px 40px -30px rgba(0,0,0,0.35)" }}
              labelFormatter={(value) => format(new Date(value), "EEE d MMM, HH:mm")}
            />
            <Legend />
            {eventMarkers.slice(-6).map((marker) => (
              <ReferenceLine
                key={`${marker.kind}-${marker.timestamp}-${marker.label}`}
                x={marker.timestamp}
                stroke={marker.kind === "alert" ? "#d97706" : marker.kind === "anomaly" ? "#a33c43" : "#3b6e70"}
                strokeDasharray="3 3"
              />
            ))}
            {lines.map((line) => (
              <Line key={line.key} type="monotone" dataKey={line.key} stroke={line.color} strokeWidth={2.2} dot={false} name={line.name} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}


