import { apiRequest } from "./api";

export type MLStatus = {
  status: string;
  model_available: boolean;
  features_available: boolean;
  feature_count?: number;
  message: string;
};

export async function getMLStatus(): Promise<MLStatus> {
  return apiRequest<MLStatus>(
    "/ml/status",
  );
}
