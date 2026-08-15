export type NodeTypeId = 'trigger' | 'activity' | 'gate' | 'output' | 'error';

export type NodeState = 'idle' | 'running' | 'completed' | 'failed' | 'paused';

export type NodeKindId =
  | 'upload'
  | 'email'
  | 'schedule'
  | 'webhook'
  | 'ocr'
  | 'classify'
  | 'extract'
  | 'redact'
  | 'translate'
  | 'summarize'
  | 'approval'
  | 'condition'
  | 'delay'
  | 'archive'
  | 'notify'
  | 'export'
  | 'webhook-output'
  | 'error';

export interface NodePosition {
  x: number;
  y: number;
}

export interface PipelineNodeConfig {
  [key: string]: string | number | boolean;
}

export interface PipelineNode {
  id: string;
  type: NodeTypeId;
  kind: NodeKindId;
  label: string;
  description: string;
  position: NodePosition;
  state: NodeState;
  error?: string;
  config: PipelineNodeConfig;
}

export interface PipelineEdge {
  id: string;
  from: string;
  to: string;
}

export type WorkflowStatus = 'active' | 'paused' | 'draft' | 'archived';

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  lastRunAt: string | null;
  successRate: number;
  queuedDocuments: number;
  version: number;
  nodes: readonly PipelineNode[];
  edges: readonly PipelineEdge[];
}

export type RunStatus = 'idle' | 'running' | 'paused' | 'completed' | 'failed';

export type ExecutionLogLevel = 'info' | 'success' | 'warning' | 'error';

export interface ExecutionLogEntry {
  id: string;
  level: ExecutionLogLevel;
  message: string;
  nodeId?: string;
  timestamp: string;
}

export interface ValidationIssue {
  nodeId: string;
  message: string;
}
