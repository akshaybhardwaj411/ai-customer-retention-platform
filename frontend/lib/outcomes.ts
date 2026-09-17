import { apiRequest } from "./api";

export type ActionOutcome = {
  id: string;
  action_id: string;
  customer_id: string;
  outcome: string;
  revenue_saved: number | null;
};

export async function createActionOutcome(
  organizationId: string,
  actionId: string,
  customerId: string,
  outcome: string,
  revenueSaved?: number,
): Promise<ActionOutcome> {
  return apiRequest<ActionOutcome>(
    "/outcomes/",
    {
      method: "POST",
      body: JSON.stringify({
        organization_id: organizationId,
        action_id: actionId,
        customer_id: customerId,
        outcome,
        revenue_saved: revenueSaved ?? null,
      }),
    },
  );
}
