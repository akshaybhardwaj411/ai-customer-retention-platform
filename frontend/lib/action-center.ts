import { apiRequest } from "./api";


export type ActionCenterItem = {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string | null;
  action_type: string;
  status: string;
  recommendation: string | null;
  risk_level: string;
  priority: number;
  source: string;
};


export type ActionCenterResponse = {
  total_actions: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  actions: ActionCenterItem[];
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
