import { apiRequest } from "./api";


export type ImpactSummary = {
  total_actions: number;
  customers_saved: number;
  revenue_saved: number;
};


export async function getImpact(
  organizationId: string,
): Promise<ImpactSummary> {
  return apiRequest<ImpactSummary>(
    `/impact/?organization_id=${encodeURIComponent(
      organizationId,
    )}`,
  );
}
