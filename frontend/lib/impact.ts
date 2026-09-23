import { apiRequest } from "./api";


export type ImpactMetrics = {
  total_actions: number;
  customers_saved: number;
  customers_not_saved: number;
  no_response: number;
  unknown: number;
  revenue_saved: number;
  save_rate: number;
};


export async function getImpact(
  organizationId: string,
): Promise<ImpactMetrics> {
  return apiRequest<ImpactMetrics>(
    `/impact/?organization_id=${encodeURIComponent(
      organizationId,
    )}`,
  );
}
