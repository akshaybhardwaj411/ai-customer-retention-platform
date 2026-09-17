import { apiRequest } from "./api";


export type Recommendation = {
  id: string;
  customer_id: string;
  action_type: string;
  reason: string | null;
  status: string;
};


export async function createRecommendation(
  organizationId: string,
  customerId: string,
  actionType: string,
  reason?: string,
): Promise<Recommendation> {
  return apiRequest<Recommendation>(
    "/recommendations/",
    {
      method: "POST",
      body: JSON.stringify({
        organization_id: organizationId,
        customer_id: customerId,
        action_type: actionType,
        reason: reason || null,
      }),
    },
  );
}
