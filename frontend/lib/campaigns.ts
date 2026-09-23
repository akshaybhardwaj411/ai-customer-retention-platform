import { apiRequest } from "./api";


export type Campaign = {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  action_type: string;
  target_segment: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  customer_count?: number;
};


export type CreateCampaignInput = {
  organization_id: string;
  name: string;
  description?: string;
  action_type: string;
  target_segment?: string;
  start_date?: string;
  end_date?: string;
};


export type CampaignTargetResponse = {
  campaign_id: string;
  segment: string;
  added: number;
  skipped: number;
  message: string;
};


export type CampaignExecutionResponse = {
  campaign_id: string;
  created_actions: number;
  skipped_actions: number;
  message: string;
};


export type CampaignAnalytics = {
  campaign_id: string;
  campaign_name: string;
  status: string;
  target_segment: string | null;
  targeted_customers: number;
  actions_created: number;
  actions_executed: number;
  outcomes_recorded: number;
  saved: number;
  not_saved: number;
  no_response: number;
  unknown: number;
  resolved_outcomes: number;
  save_rate: number;
  revenue_saved: number;
};


export type CampaignCustomer = {
  id: string;
  campaign_id: string;
  customer_id: string;
  retention_action_id: string | null;
  customer_name: string;
  customer_email: string | null;
  status: string;
  outcome: string | null;
  created_at: string;
};


export async function getCampaigns(
  organizationId: string,
): Promise<Campaign[]> {
  return apiRequest<Campaign[]>(
    `/campaigns/?organization_id=${encodeURIComponent(
      organizationId,
    )}`,
  );
}


export async function createCampaign(
  data: CreateCampaignInput,
): Promise<Campaign> {
  return apiRequest<Campaign>(
    "/campaigns/",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}


export async function updateCampaignStatus(
  campaignId: string,
  organizationId: string,
  status: string,
): Promise<Campaign> {
  return apiRequest<Campaign>(
    `/campaigns/${encodeURIComponent(
      campaignId,
    )}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({
        organization_id:
          organizationId,
        status,
      }),
    },
  );
}


export async function targetCampaignCustomers(
  campaignId: string,
  organizationId: string,
  segment: string,
): Promise<CampaignTargetResponse> {
  return apiRequest<CampaignTargetResponse>(
    `/campaigns/${encodeURIComponent(
      campaignId,
    )}/target`,
    {
      method: "POST",
      body: JSON.stringify({
        organization_id:
          organizationId,
        segment,
      }),
    },
  );
}


export async function executeCampaign(
  campaignId: string,
  organizationId: string,
): Promise<CampaignExecutionResponse> {
  return apiRequest<CampaignExecutionResponse>(
    `/campaigns/${encodeURIComponent(
      campaignId,
    )}/execute?organization_id=${encodeURIComponent(
      organizationId,
    )}`,
    {
      method: "POST",
    },
  );
}


export async function getCampaignAnalytics(
  campaignId: string,
  organizationId: string,
): Promise<CampaignAnalytics> {
  return apiRequest<CampaignAnalytics>(
    `/campaigns/${encodeURIComponent(
      campaignId,
    )}/analytics?organization_id=${encodeURIComponent(
      organizationId,
    )}`,
  );
}


export async function getCampaignCustomers(
  campaignId: string,
  organizationId: string,
): Promise<CampaignCustomer[]> {
  return apiRequest<CampaignCustomer[]>(
    `/campaigns/${encodeURIComponent(
      campaignId,
    )}/customers?organization_id=${encodeURIComponent(
      organizationId,
    )}`,
  );
}
