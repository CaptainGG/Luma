import { jsonError } from "@/lib/http";
import { settingsSchema } from "@/lib/validation";
import { updatePreferences } from "@/server/services/settings-service";

export async function PATCH(request: Request) {
  try {
    const payload = settingsSchema.parse(await request.json());
    const preferences = await updatePreferences(payload);
    return Response.json(preferences);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Invalid settings payload.", 400);
  }
}


