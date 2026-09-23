import { apiRequest } from "./api";

export type ChurnPrediction = {
  id: string;
  customer_id: string;
  organization_id: string;
  churn_probability: number;
  risk_level: string;
  source: string;
  created_at: string;
};

export async function predictCustomerChurn(
  customerId: string,
  organizationId: string,
  customerData: Record<string, unknown>,
): Promise<ChurnPrediction> {
  return apiRequest<ChurnPrediction>(
    `/ml/customers/${encodeURIComponent(
      customerId,
    )}/predict?organization_id=${encodeURIComponent(
      organizationId,
    )}`,
    {
      method: "POST",
      body: JSON.stringify({
        customer_data: customerData,
      }),
    },
  );
}
