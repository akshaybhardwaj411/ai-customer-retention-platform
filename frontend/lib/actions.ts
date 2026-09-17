import { apiRequest } from "./api";


export type RetentionAction = {
  id: string;
  customer_id: string;
  action_type: string;
  status: string;
  recommendation: string | null;
};


export async function createRetentionAction(
  organizationId: string,
  customerId: string,
  actionType: string,
  recommendation?: string,
): Promise<RetentionAction> {
  return apiRequest<RetentionAction>(
    "/actions/",
    {
      method: "POST",
      body: JSON.stringify({
        organization_id: organizationId,
        customer_id: customerId,
        action_type: actionType,
        recommendation:
          recommendation || null,
      }),
    },
  );
}
