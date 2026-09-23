import { apiRequest } from "./api";


export type MLTrainingMetrics = {
  accuracy: number;
  precision: number;
  recall: number;
  roc_auc: number;
};


export type MLTrainingMetadata = {
  model_type: string;
  trained_at: string;
  feature_count: number;
  test_rows: number;
  metrics: MLTrainingMetrics;
};


export type MLStatus = {
  status: string;
  model_available: boolean;
  features_available: boolean;
  metadata_available: boolean;
  feature_count: number;
  training: MLTrainingMetadata | null;
  message: string;
};


export async function getMLStatus(): Promise<MLStatus> {
  return apiRequest<MLStatus>(
    "/ml/status",
  );
}
