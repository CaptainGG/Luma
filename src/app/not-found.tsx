import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="max-w-md space-y-4 text-center">
        <CardTitle>That room drifted out of view</CardTitle>
        <CardDescription>Try returning to the dashboard and choosing an active room from the current space.</CardDescription>
        <Button asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </Card>
    </main>
  );
}


