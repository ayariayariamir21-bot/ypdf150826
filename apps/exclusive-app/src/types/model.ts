export type ModelType =
  | 'classification'
  | 'extraction'
  | 'summarization'
  | 'translation'
  | 'ocr'
  | 'redaction';

export type ModelStatus = 'deployed' | 'training' | 'failed' | 'queued';

export interface TrainingProgressInfo {
  currentEpoch: number;
  epochs: number;
  progress: number;
  loss: number;
  accuracy: number;
}

export interface EndpointConfigInfo {
  region: string;
  sku: string;
  capacityTpm: number;
  autoscaling: boolean;
  minInstances: number;
  maxInstances: number;
  costPerMillion: number;
}

export interface MLModel {
  id: string;
  name: string;
  type: ModelType;
  description: string;
  version: string;
  status: ModelStatus;
  accuracy: number;
  latencyMs: number;
  updatedAt: string;
  owner: string;
  training?: TrainingProgressInfo;
  endpoint?: EndpointConfigInfo;
}

export interface EndpointConfigPatch {
  region?: string;
  sku?: string;
  capacityTpm?: number;
  autoscaling?: boolean;
  minInstances?: number;
  maxInstances?: number;
}
