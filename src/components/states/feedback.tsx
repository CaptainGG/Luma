import { AlertCircle, Sparkles } from "lucide-react";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card className="border-dashed bg-white/60 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--accent-soft)] text-[color:var(--accent-strong)]">
        <Sparkles className="h-6 w-6" />
      </div>
      <div className="mt-4 space-y-2">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </div>
    </Card>
  );
}

export function ErrorState({ title, description }: { title: string; description: string }) {
  return (
    <Card className="border-[#f3d2d6] bg-[#fff8f8]">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fdebec] text-[#a33c43]">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </div>
    </Card>
  );
}

export function LoadingState({ title }: { title: string }) {
  return (
    <Card className="space-y-4">
      <div className="h-4 w-24 animate-pulse rounded-full bg-black/8" />
      <div className="h-8 w-48 animate-pulse rounded-full bg-black/8" />
      <div className="h-28 animate-pulse rounded-[24px] bg-black/6" />
      <p className="text-sm text-[color:var(--muted-foreground)]">{title}</p>
    </Card>
  );
}


