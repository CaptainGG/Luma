import { PageHeader } from "@/components/layout/page-header";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";

export default function OnboardingPage() {
  return (
    <main className="min-h-screen px-4 py-6 lg:px-6 lg:py-8">
      <div className="mx-auto max-w-[960px] space-y-6">
        <PageHeader
          eyebrow="Minimal setup"
          title="Create the demo in four steps"
          description="Name the space, choose room types, pair mock devices, and land on the dashboard. Nothing more."
        />
        <OnboardingFlow />
      </div>
    </main>
  );
}


