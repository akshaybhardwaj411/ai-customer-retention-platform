import { apiRequest } from "./api";


export type CustomerInsight = {
  customer_id: string;
  summary: string;
  risk_factors: string[];
  confidence: number | null;
};


export async function getCustomerInsight(
  customerId: string,
): Promise<CustomerInsight> {
  return apiRequest<CustomerInsight>(
    `/insights/${encodeURIComponent(
      customerId,
    )}`,
  );
}
