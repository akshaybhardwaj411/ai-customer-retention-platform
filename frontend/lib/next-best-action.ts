import { apiRequest } from "./api";


export type NextBestActionRiskFactor = {
  feature: string;
  label: string;
  impact: number;
  direction:
    | "increases_risk"
    | "decreases_risk";
  interpretation: string;
};


export type NextBestAction = {
  customer_id: string;
  action: string | null;
  reason: string | null;
  expected_value: number | null;
  risk_factors: NextBestActionRiskFactor[];
  status: string;
  source?: string;
};


export async function getNextBestAction(
  customerId: string,
  organizationId: string,
): Promise<NextBestAction> {
  return apiRequest<NextBestAction>(
    `/next-best-action/${encodeURIComponent(
      customerId,
    )}?organization_id=${encodeURIComponent(
      organizationId,
    )}`,
  );
}
