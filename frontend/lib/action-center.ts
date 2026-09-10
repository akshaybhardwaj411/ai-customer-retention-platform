import { apiRequest } from "./api";


export type RetentionAction = {
  id: string;
  customer_id: string;
  action_type: string;
  status: string;
  recommendation: string | null;
};


export type ActionCenterResponse = {
  total_actions: number;
  actions: RetentionAction[];
};


export async function getActionCenter(
  organizationId: string,
): Promise<ActionCenterResponse> {
  return apiRequest<ActionCenterResponse>(
    `/action-center/?organization_id=${encodeURIComponent(
      organizationId,
    )}`,
  );
}
