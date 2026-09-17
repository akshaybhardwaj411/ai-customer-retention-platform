import { apiRequest } from "./api";


export type ApiVersion = {
  version: string;
  service: string;
};


export async function getApiVersion(): Promise<ApiVersion> {
  return apiRequest<ApiVersion>(
    "/version",
  );
}
