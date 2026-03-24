import { getDashboardData } from "@/server/services/dashboard-service";

export async function GET() {
  const payload = await getDashboardData();
  return Response.json(payload);
}


