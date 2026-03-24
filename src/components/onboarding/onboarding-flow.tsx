"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ROOM_TYPE_OPTIONS } from "@/lib/constants";
import type { RoomType } from "@/lib/domain";

import { ErrorState } from "@/components/states/feedback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function OnboardingFlow({ initialStep = 1 }: { initialStep?: number }) {
  const router = useRouter();
  const normalizedStep = Math.min(4, Math.max(1, initialStep));
  const isPreviewStep = normalizedStep !== 1;
  const [step, setStep] = useState(normalizedStep);
  const [spaceName, setSpaceName] = useState("Nordic Studio Loft");
  const [roomTypes, setRoomTypes] = useState<RoomType[]>(["BEDROOM", "WORKSPACE", "LIVING_ROOM"]);
  const [roomIds, setRoomIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleContinue() {
    setError(null);
    setIsLoading(true);

    try {
      if (step === 1) {
        const response = await fetch("/api/onboarding/space", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: spaceName }),
        });
        if (!response.ok) throw new Error("Unable to create the space.");
        setStep(2);
      } else if (step === 2) {
        const response = await fetch("/api/onboarding/rooms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomTypes }),
        });
        if (!response.ok) throw new Error("Unable to create rooms.");
        const payload = (await response.json()) as Array<{ id: string }>;
        setRoomIds(payload.map((room) => room.id));
        setStep(3);
      } else if (step === 3) {
        const response = await fetch("/api/onboarding/pair-device", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomIds }),
        });
        if (!response.ok) throw new Error("Unable to pair devices.");
        setStep(4);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {error ? <ErrorState title="Onboarding paused" description={error} /> : null}
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className={`rounded-full px-3 py-1 ${item === step ? "bg-[color:var(--accent-soft)] text-[color:var(--accent-strong)]" : "bg-black/4"}`}>
            Step {item}
          </div>
        ))}
      </div>

      <Card className="space-y-6">
        {step === 1 ? (
          <>
            <div>
              <CardTitle>Name your space</CardTitle>
              <CardDescription>Start with the space name, then move straight into room setup.</CardDescription>
            </div>
            <div className="space-y-2">
              <Label htmlFor="space-name">Space name</Label>
              <Input id="space-name" value={spaceName} onChange={(event) => setSpaceName(event.target.value)} />
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <div>
              <CardTitle>Select room types</CardTitle>
              <CardDescription>Choose the rooms to prepare so the dashboard reflects the spaces you care about.</CardDescription>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {ROOM_TYPE_OPTIONS.map((option) => {
                const selected = roomTypes.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`rounded-[24px] border p-4 text-left transition ${selected ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)]" : "border-black/8 bg-white"}`}
                    onClick={() =>
                      setRoomTypes((current) =>
                        current.includes(option.value)
                          ? current.filter((item) => item !== option.value)
                          : [...current, option.value],
                      )
                    }
                  >
                    <p className="text-base font-semibold text-[color:var(--foreground)]">{option.label}</p>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">{option.description}</p>
                  </button>
                );
              })}
            </div>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <div>
              <CardTitle>Pair room monitors</CardTitle>
              <CardDescription>Pair one monitor per room to start tracking air quality, comfort, and room activity.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {roomTypes.map((roomType) => (
                <Badge key={roomType}>{roomType.toLowerCase().replaceAll("_", " ")}</Badge>
              ))}
            </div>
          </>
        ) : null}

        {step === 4 ? (
          <>
            <div>
              <CardTitle>Ready to monitor</CardTitle>
              <CardDescription>The space is ready, rooms are prepared, and monitors are paired. Head straight to the dashboard.</CardDescription>
            </div>
            <div className="rounded-[24px] bg-[color:var(--accent-soft)] p-5 text-sm leading-6 text-[color:var(--accent-strong)]">
              Setup stays short: create the space, choose rooms, pair monitors, and start tracking conditions.
            </div>
          </>
        ) : null}

        {isPreviewStep ? (
          <div className="h-11" aria-hidden="true" />
        ) : (
          <Button onClick={() => void handleContinue()} disabled={isLoading || (step === 2 && !roomTypes.length)}>
            {isLoading ? "Working..." : step < 4 ? "Continue" : "Open dashboard"}
          </Button>
        )}
      </Card>
    </div>
  );
}


