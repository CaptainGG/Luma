export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/layout/page-header";
import { SettingsClient } from "@/components/settings/settings-client";
import { getSettingsData } from "@/server/services/settings-service";

export default async function SettingsPage() {
  const data = await getSettingsData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Room controls"
        title="Thresholds and summaries"
        description="A tight MVP scope: practical thresholds, summary cadence, and a few calm preference toggles."
      />
      <SettingsClient initialData={data} />
    </div>
  );
}


