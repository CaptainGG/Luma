export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/layout/page-header";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { getDashboardData } from "@/server/services/dashboard-service";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Live overview"
        title="Indoor comfort at a glance"
        description="A multi-room snapshot of comfort, alerts, and grounded insights generated from seeded history plus lightweight runtime simulation."
      />
      <DashboardClient initialData={data} />
    </div>
  );
}


