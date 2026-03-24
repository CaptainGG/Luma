"use client";

import { useMemo, useState } from "react";

import type { SettingsPayload } from "@/lib/contracts";
import type { RoomType } from "@/lib/domain";

import { EmptyState, ErrorState } from "@/components/states/feedback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export function SettingsClient({
  initialData,
}: {
  initialData: {
    preferences: SettingsPayload | null;
    rooms: Array<{
      id: string;
      name: string;
      type: RoomType;
      temperatureMin: number;
      temperatureMax: number;
      humidityMin: number;
      humidityMax: number;
      co2Max: number;
      lightTarget: number;
      noiseMax: number;
    }>;
  };
}) {
  const [preferences, setPreferences] = useState<SettingsPayload>(
    initialData.preferences ?? {
      summaryCadence: "DAILY",
      morningDigest: true,
      anomalyHighlights: true,
      comfortTargets: true,
      calmMode: true,
    },
  );
  const [rooms, setRooms] = useState(initialData.rooms);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const roomById = useMemo(() => Object.fromEntries(rooms.map((room) => [room.id, room])), [rooms]);

  async function savePreferences() {
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/settings/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error("Unable to save preferences.");
      }

      setMessage("Preferences saved.");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Something went wrong.");
    }
  }

  async function saveRoom(roomId: string) {
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/rooms/${roomId}/thresholds`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roomById[roomId]),
      });

      if (!response.ok) {
        throw new Error("Unable to save room thresholds.");
      }

      setMessage("Thresholds updated.");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Something went wrong.");
    }
  }

  return (
    <div className="space-y-6">
      {error ? <ErrorState title="Settings update failed" description={error} /> : null}
      {message ? <Badge variant="positive">{message}</Badge> : null}
      <Card className="space-y-6">
        <div>
          <CardTitle>Summary preferences</CardTitle>
          <CardDescription>Keep settings light: calm defaults, grounded insights, and minimal notification logic.</CardDescription>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cadence">Summary cadence</Label>
            <Select
              value={preferences.summaryCadence}
              onValueChange={(value) => setPreferences((current) => ({ ...current, summaryCadence: value as SettingsPayload["summaryCadence"] }))}
            >
              <SelectTrigger id="cadence">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DAILY">Daily</SelectItem>
                <SelectItem value="WEEKLY">Weekly</SelectItem>
                <SelectItem value="OFF">Off</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-3">
            {[
              ["morningDigest", "Morning digest"],
              ["anomalyHighlights", "Anomaly highlights"],
              ["comfortTargets", "Comfort targets"],
              ["calmMode", "Calm mode"],
            ].map(([key, label]) => (
              <div key={key} className="flex items-center justify-between rounded-2xl bg-black/4 px-4 py-3">
                <p className="text-sm font-medium text-[color:var(--foreground)]">{label}</p>
                <Switch
                  checked={preferences[key as keyof SettingsPayload] as boolean}
                  onCheckedChange={(checked) =>
                    setPreferences((current) => ({
                      ...current,
                      [key]: checked,
                    }))
                  }
                />
              </div>
            ))}
          </div>
        </div>
        <Button onClick={() => void savePreferences()}>Save preferences</Button>
      </Card>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-[color:var(--foreground)]">Room thresholds</h2>
          <p className="text-sm text-[color:var(--muted-foreground)]">Small, explicit room controls for the MVP. Nothing more.</p>
        </div>
        {rooms.length ? (
          rooms.map((room) => (
            <Card key={room.id} className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>{room.name}</CardTitle>
                  <CardDescription>{room.type.toLowerCase().replaceAll("_", " ")}</CardDescription>
                </div>
                <Button variant="secondary" onClick={() => void saveRoom(room.id)}>
                  Save room
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  ["temperatureMin", "Temperature min"],
                  ["temperatureMax", "Temperature max"],
                  ["humidityMin", "Humidity min"],
                  ["humidityMax", "Humidity max"],
                  ["co2Max", "CO2 max"],
                  ["lightTarget", "Light target"],
                  ["noiseMax", "Noise max"],
                ].map(([key, label]) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={`${room.id}-${key}`}>{label}</Label>
                    <Input
                      id={`${room.id}-${key}`}
                      type="number"
                      value={room[key as keyof typeof room] as number}
                      onChange={(event) =>
                        setRooms((current) =>
                          current.map((item) =>
                            item.id === room.id ? { ...item, [key]: Number(event.target.value) } : item,
                          ),
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            </Card>
          ))
        ) : (
          <EmptyState title="No rooms to configure" description="Create and pair rooms in onboarding first." />
        )}
      </div>
    </div>
  );
}


