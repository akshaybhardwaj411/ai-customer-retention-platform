import { apiRequest } from "./api";


export type Customer = {
  id: string;
  name: string;
  email: string | null;
};


export async function getCustomers(
  organizationId: string,
): Promise<Customer[]> {
  return apiRequest<Customer[]>(
    `/customers/?organization_id=${encodeURIComponent(
      organizationId,
    )}`,
  );
}
