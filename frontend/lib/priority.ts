import { apiRequest } from "./api";

export type CustomerPriority = {
  customer_id: string;
  churn_probability: number | null;
  customer_value: number;
  intervention_opportunity: number;
  priority_score: number;
  priority_level: string;
};

export async function getCustomerPriority(
  customerId: string,
  organizationId: string,
  customerValue: number,
  interventionOpportunity: number,
): Promise<CustomerPriority> {
  return apiRequest<CustomerPriority>(
    `/priority/customers/${encodeURIComponent(
      customerId,
    )}?organization_id=${encodeURIComponent(
      organizationId,
    )}`,
    {
      method: "POST",
      body: JSON.stringify({
        customer_value: customerValue,
        intervention_opportunity:
          interventionOpportunity,
      }),
    },
  );
}
