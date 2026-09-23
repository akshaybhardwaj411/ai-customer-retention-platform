import { apiRequest } from "./api";


export type RetentionAction = {
  id: string;
  customer_id: string;
  action_type: string;
  status: string;
  recommendation: string | null;
};


export type ExecutedRetentionAction =
  RetentionAction & {
    message: string;
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
        organization_id:
          organizationId,
        customer_id: customerId,
        action_type: actionType,
        recommendation:
          recommendation || null,
      }),
    },
  );
}


export async function executeRetentionAction(
  actionId: string,
  organizationId: string,
): Promise<ExecutedRetentionAction> {
  return apiRequest<ExecutedRetentionAction>(
    `/actions/${encodeURIComponent(
      actionId,
    )}/execute?organization_id=${encodeURIComponent(
      organizationId,
    )}`,
    {
      method: "POST",
    },
  );
}
