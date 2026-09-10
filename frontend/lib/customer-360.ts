import { apiRequest } from "./api";


export type Customer360 = {
  customer: {
    id: string;
    organization_id: string;
    name: string;
    email: string | null;
  };

  risk: {
    risk_level: string;
    churn_probability: number | null;
  };

  health: {
    status: string;
  };

  insights: unknown[];

  recommended_actions: unknown[];

  timeline: {
    id: string;
    event_type: string;
    description: string | null;
    created_at: string;
  }[];
};


export async function getCustomer360(
  customerId: string,
): Promise<Customer360> {
  return apiRequest<Customer360>(
    `/customer-360/${encodeURIComponent(
      customerId,
    )}`,
  );
}
