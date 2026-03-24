import Link from "next/link";
import { ArrowRight, Dot, Sparkles, Waves } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-6 lg:px-6 lg:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-[1440px] flex-col justify-between rounded-[40px] border border-black/6 bg-[color:var(--panel)] px-6 py-8 shadow-[0_40px_120px_-55px_rgba(28,48,54,0.45)] lg:px-10 lg:py-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted-foreground)]">Luma</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.06em] text-[color:var(--foreground)] md:text-6xl">
              Indoor comfort intelligence for rooms that should feel calm, healthy, and easy to understand.
            </h1>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--accent-soft)] text-[color:var(--accent-strong)]">
            <Waves className="h-8 w-8" />
          </div>
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_420px]">
          <section className="space-y-6">
            <p className="max-w-2xl text-lg leading-8 text-[color:var(--muted-foreground)]">
              Luma blends simulated room sensors, grounded room insights, and a calm multi-room dashboard into one indoor environment companion.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/dashboard">
                  Open dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/onboarding">Run onboarding</Link>
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                ["Seeded history", "24h and 7d of room history with gradual drift and occasional anomalies."],
                ["Focused room charts", "Four room-detail charts keep temperature, air quality, light, noise, and comfort readable."],
                ["Grounded insights", "Deterministic findings turn room patterns into concise, product-style guidance."],
              ].map(([title, description]) => (
                <Card key={title} className="space-y-3">
                  <CardTitle className="text-base">{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </Card>
              ))}
            </div>
          </section>

          <Card className="space-y-5 bg-[#f7f6f1]">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[color:var(--foreground)]">How it works</p>
              <Sparkles className="h-4 w-4 text-[color:var(--accent-strong)]" />
            </div>
            <div className="space-y-4">
              {[
                "Create a space and pair a room monitor in a few calm setup steps.",
                "Watch room cards refresh as new readings drift in over time.",
                "Open a room to inspect charts, recent alerts, and event markers.",
                "Adjust thresholds and keep alerts grounded in real conditions.",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl bg-white px-4 py-3">
                  <Dot className="mt-1 h-4 w-4 text-[color:var(--accent-strong)]" />
                  <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">{item}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}


