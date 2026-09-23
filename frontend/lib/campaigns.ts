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
