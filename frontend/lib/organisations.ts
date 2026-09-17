import { apiRequest } from "./api";


export type Organization = {
  id: string;
  name: string;
  message: string;
};


export async function createOrganization(
  name: string,
): Promise<Organization> {
  return apiRequest<Organization>(
    "/organizations/",
    {
      method: "POST",
      body: JSON.stringify({
        name,
      }),
    },
  );
}
