import { apiRequest } from "./api";


export type NextBestAction = {
  customer_id: string;
  action: string | null;
  reason: string | null;
  expected_value: number | null;
  status: string;
};


export async function getNextBestAction(
  customerId: string,
): Promise<NextBestAction> {
  return apiRequest<NextBestAction>(
    `/next-best-action/${encodeURIComponent(
      customerId,
    )}`,
  );
}
