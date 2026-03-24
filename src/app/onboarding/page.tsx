import { PageHeader } from "@/components/layout/page-header";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>;
}) {
  const params = await searchParams;
  const previewStep = Number(params.step);
  const initialStep = Number.isFinite(previewStep) ? previewStep : 1;

  return (
    <main className="min-h-screen px-4 py-6 lg:px-6 lg:py-8">
      <div className="mx-auto max-w-[960px] space-y-6">
        <PageHeader
          eyebrow="Minimal setup"
          title="Set up your space in four steps"
          description="Name the space, choose room types, pair monitors, and move into the dashboard without extra configuration."
        />
        <OnboardingFlow initialStep={initialStep} />
      </div>
    </main>
  );
}


