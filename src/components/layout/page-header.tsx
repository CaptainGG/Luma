import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 rounded-[32px] border border-black/6 bg-[color:var(--panel)] px-6 py-6 shadow-[0_30px_100px_-55px_rgba(28,48,54,0.45)] md:flex-row md:items-end md:justify-between", className)}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[color:var(--foreground)] md:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--muted-foreground)] md:text-base">{description}</p>
      </div>
      {action}
    </div>
  );
}


