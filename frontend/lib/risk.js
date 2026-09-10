import { apiRequest } from "./api";


export type CustomerRisk = {
  customer_id: string;
  churn_probability: number | null;
  risk_level: string;
  source: string;
};


export type RiskSummary = {
  total_customers_with_predictions: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
};


export async function getCustomerRisk(
  customerId: string,
): Promise<CustomerRisk> {
  return apiRequest<CustomerRisk>(
    `/risk/customers/${encodeURIComponent(
      customerId,
    )}`,
  );
}


export async function getRiskSummary(
  organizationId: string,
): Promise<RiskSummary> {
  return apiRequest<RiskSummary>(
    `/risk-summary/?organization_id=${encodeURIComponent(
      organizationId,
    )}`,
  );
}
