import { jsonError } from "@/lib/http";
import { onboardingSpaceSchema } from "@/lib/validation";
import { createSpace } from "@/server/services/onboarding-service";

export async function POST(request: Request) {
  try {
    const payload = onboardingSpaceSchema.parse(await request.json());
    const space = await createSpace(payload.name);
    return Response.json(space, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Invalid space payload.", 400);
  }
}


