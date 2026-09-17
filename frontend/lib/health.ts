import { apiRequest } from "./api";


export type DatabaseHealth = {
  status: string;
  database: string;
};


export async function getDatabaseHealth(): Promise<DatabaseHealth> {
  return apiRequest<DatabaseHealth>(
    "/health/database",
  );
}
