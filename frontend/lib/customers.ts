import { apiRequest } from "./api";


export type Customer = {
  id: string;
  name: string;
  email: string | null;
};


export async function getCustomers(
  organizationId: string,
  search?: string,
): Promise<Customer[]> {
  const params = new URLSearchParams();

  params.set(
    "organization_id",
    organizationId,
  );

  if (search?.trim()) {
    params.set(
      "search",
      search.trim(),
    );
  }

  return apiRequest<Customer[]>(
    `/customers/?${params.toString()}`,
  );
}
