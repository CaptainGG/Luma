import type { ReactNode } from "react";
import Link from "next/link";

import { APP_NAME } from "@/lib/constants";

import { Button } from "@/components/ui/button";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[color:var(--page-gradient)]">
      <div className="mx-auto grid min-h-screen w-full max-w-[1440px] gap-6 px-4 py-4 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-6 lg:py-6">
        <aside className="rounded-[32px] border border-black/6 bg-[color:var(--panel)] p-6 shadow-[0_40px_120px_-50px_rgba(22,39,45,0.4)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted-foreground)]">Indoor companion</p>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-[-0.04em] text-[color:var(--foreground)]">{APP_NAME}</h1>
                <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">Portfolio-ready climate intelligence</p>
              </div>
            </div>
          </div>
          <nav className="mt-10 space-y-2">
            <Link className="block rounded-2xl px-4 py-3 text-sm font-medium text-[color:var(--foreground)] transition hover:bg-black/4" href="/dashboard">
              Dashboard
            </Link>
            <Link className="block rounded-2xl px-4 py-3 text-sm font-medium text-[color:var(--foreground)] transition hover:bg-black/4" href="/onboarding">
              Onboarding
            </Link>
            <Link className="block rounded-2xl px-4 py-3 text-sm font-medium text-[color:var(--foreground)] transition hover:bg-black/4" href="/settings">
              Settings
            </Link>
          </nav>
          <div className="mt-10 rounded-[28px] bg-[color:var(--accent-soft)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--accent-strong)]">Demo mode</p>
            <p className="mt-3 text-sm leading-6 text-[color:var(--muted-foreground)]">
              Data stays lightweight: seeded history plus runtime drift when dashboards poll.
            </p>
            <Button className="mt-4 w-full" variant="secondary" asChild>
              <Link href="/dashboard">Open live demo</Link>
            </Button>
          </div>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}


