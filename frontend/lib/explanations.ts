import { apiRequest } from "./api";


export type RiskFactor = {
  feature: string;
  label: string;
  impact: number;
  direction:
    | "increases_risk"
    | "decreases_risk";
};


export type CustomerRiskExplanation = {
  customer_id: string;
  organization_id: string;
  risk_factors: RiskFactor[];
  source: string;
};


export async function getCustomerRiskExplanation(
  customerId: string,
  organizationId: string,
  customerData: Record<string, unknown>,
): Promise<CustomerRiskExplanation> {
  return apiRequest<CustomerRiskExplanation>(
    `/explanations/customers/${encodeURIComponent(
      customerId,
    )}?organization_id=${encodeURIComponent(
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
