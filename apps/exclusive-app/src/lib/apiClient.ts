import type {
  AuditFilter,
  AuditLogEntry,
  AuditSort,
  EndpointConfigPatch,
  MLModel,
  PipelineEdge,
  PipelineNode,
  Workflow,
} from '@/types';
import {
  AUDIT_LOGS,
  DASHBOARD_STATS,
  DOCUMENTS,
  MODELS,
  RECENT_ACTIVITY,
  WORKFLOWS,
} from './mock-data';
import { errorMessage, uid } from './utils';

const LATENCY_MS = 280;

function delay(milliseconds = LATENCY_MS): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function cloneWorkflows(): Workflow[] {
  return WORKFLOWS.map((workflow) => ({
    ...workflow,
    nodes: workflow.nodes.map((node) => ({ ...node, position: { ...node.position } })),
    edges: workflow.edges.map((edge) => ({ ...edge })),
  }));
}

export interface DashboardStats {
  documentsProcessed: number;
  activePipelines: number;
  aiTokensUsed: number;
  avgProcessingTimeMs: number;
  changes: {
    documentsProcessed: number;
    activePipelines: number;
    aiTokensUsed: number;
    avgProcessingTimeMs: number;
  };
}

export interface RecentActivityItem {
  id: string;
  title: string;
  metadata: string;
  pipeline: string;
  time: string;
  status: 'success' | 'warning' | 'error';
}

export interface ComplianceProgress {
  id: string;
  label: string;
  progress: number;
  description: string;
}

export interface PagedAuditResult {
  items: readonly AuditLogEntry[];
  total: number;
}

export interface AuditQuery {
  page: number;
  pageSize: number;
  sort: AuditSort;
  filter: AuditFilter;
}

export interface DocumentRecord {
  id: string;
  name: string;
  type: string;
  sizeBytes: number;
  status: string;
  pipeline: string;
  modifiedAt: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ReadonlyArray<{ nodeId: string; message: string }>;
}

export const apiClient = {
  async getDashboard(): Promise<{
    stats: DashboardStats;
    recentActivity: readonly RecentActivityItem[];
    compliance: readonly ComplianceProgress[];
  }> {
    await delay();
    return {
      stats: {
        documentsProcessed: DASHBOARD_STATS.documentsProcessed.value,
        activePipelines: DASHBOARD_STATS.activePipelines.value,
        aiTokensUsed: DASHBOARD_STATS.aiTokensUsed.value,
        avgProcessingTimeMs: DASHBOARD_STATS.avgProcessingTime.value * 1000,
        changes: {
          documentsProcessed: DASHBOARD_STATS.documentsProcessed.change,
          activePipelines: DASHBOARD_STATS.activePipelines.change,
          aiTokensUsed: DASHBOARD_STATS.aiTokensUsed.change,
          avgProcessingTimeMs: DASHBOARD_STATS.avgProcessingTime.change,
        },
      },
      recentActivity: RECENT_ACTIVITY,
      compliance: [
        { id: 'soc2', label: 'SOC 2', progress: 96, description: 'Type II attestation in progress' },
        { id: 'gdpr', label: 'GDPR', progress: 88, description: 'DPA signed across all subprocessors' },
        { id: 'hipaa', label: 'HIPAA', progress: 74, description: 'BAAs and encryption controls' },
      ],
    };
  },

  async getWorkflows(): Promise<readonly Workflow[]> {
    await delay();
    return cloneWorkflows();
  },

  async getWorkflow(id: string): Promise<Workflow | null> {
    await delay(140);
    const workflow = cloneWorkflows().find((item) => item.id === id);
    return workflow ?? null;
  },

  async saveWorkflow(
    id: string,
    nodes: readonly PipelineNode[],
    edges: readonly PipelineEdge[]
  ): Promise<Workflow> {
    await delay();
    const existing = cloneWorkflows().find((workflow) => workflow.id === id);
    if (!existing) {
      throw new Error('Workflow not found');
    }
    return {
      ...existing,
      nodes: nodes.map((node) => ({ ...node })),
      edges: edges.map((edge) => ({ ...edge })),
      version: existing.version + 1,
    };
  },

  async validateWorkflow(
    nodes: readonly PipelineNode[],
    edges: readonly PipelineEdge[]
  ): Promise<ValidationResult> {
    await delay(180);
    const issues: Array<{ nodeId: string; message: string }> = [];
    const nodesById = new Map(nodes.map((node) => [node.id, node]));
    const incoming = new Map<string, number>();
    for (const edge of edges) {
      incoming.set(edge.to, (incoming.get(edge.to) ?? 0) + 1);
    }
    for (const node of nodes) {
      if (node.type === 'trigger' && (incoming.get(node.id) ?? 0) > 0) {
        issues.push({ nodeId: node.id, message: 'Trigger nodes cannot have incoming connections.' });
      }
    }
    for (const edge of edges) {
      if (!nodesById.has(edge.from) || !nodesById.has(edge.to)) {
        issues.push({ nodeId: edge.from, message: 'Connection references a missing node.' });
      }
    }
    const connected = new Set<string>();
    for (const edge of edges) {
      connected.add(edge.from);
      connected.add(edge.to);
    }
    for (const node of nodes) {
      if (node.type === 'output' && !connected.has(node.id)) {
        issues.push({ nodeId: node.id, message: 'Output node is not connected to the graph.' });
      }
    }
    return { valid: issues.length === 0, issues };
  },

  async runWorkflow(): Promise<{ runId: string; startedAt: string }> {
    await delay(240);
    return { runId: uid('run'), startedAt: new Date().toISOString() };
  },

  async getModels(): Promise<readonly MLModel[]> {
    await delay();
    return MODELS.map((model) => ({
      ...model,
      endpoint: model.endpoint ? { ...model.endpoint } : undefined,
      training: model.training ? { ...model.training } : undefined,
    }));
  },

  async updateEndpoint(id: string, patch: EndpointConfigPatch): Promise<MLModel> {
    await delay();
    const model = MODELS.find((item) => item.id === id);
    if (!model) {
      throw new Error('Model not found');
    }
    return { ...model, endpoint: { ...(model.endpoint ?? {}), ...patch } as MLModel['endpoint'] };
  },

  async testModel(id: string): Promise<{ ok: boolean; latencyMs: number }> {
    await delay(900);
    const model = MODELS.find((item) => item.id === id);
    return { ok: model?.status === 'deployed', latencyMs: model?.latencyMs ?? 320 };
  },

  async deleteModel(id: string): Promise<void> {
    await delay();
    const exists = MODELS.some((model) => model.id === id);
    if (!exists) {
      throw new Error('Model not found');
    }
  },

  async getAuditLogs(query: AuditQuery): Promise<PagedAuditResult> {
    await delay(320);
    const { page, pageSize, sort, filter } = query;
    let items = AUDIT_LOGS as readonly AuditLogEntry[];

    if (filter.action !== 'all') {
      items = items.filter((entry) => entry.action === filter.action);
    }
    if (filter.status !== 'all') {
      items = items.filter((entry) => entry.status === filter.status);
    }
    if (filter.from) {
      const fromTime = new Date(filter.from).getTime();
      items = items.filter((entry) => new Date(entry.timestamp).getTime() >= fromTime);
    }
    if (filter.to) {
      const toTime = new Date(filter.to).getTime();
      items = items.filter((entry) => new Date(entry.timestamp).getTime() <= toTime);
    }
    if (filter.search.trim()) {
      const needle = filter.search.trim().toLowerCase();
      items = items.filter(
        (entry) =>
          entry.user.toLowerCase().includes(needle) ||
          entry.resource.toLowerCase().includes(needle) ||
          entry.ip.toLowerCase().includes(needle)
      );
    }

    const sorted = [...items].sort((a, b) => {
      const direction = sort.direction === 'asc' ? 1 : -1;
      const aValue = valueForSort(a, sort.key);
      const bValue = valueForSort(b, sort.key);
      if (aValue < bValue) {
        return -1 * direction;
      }
      if (aValue > bValue) {
        return 1 * direction;
      }
      return 0;
    });

    const total = sorted.length;
    const start = (page - 1) * pageSize;
    return { items: sorted.slice(start, start + pageSize), total };
  },

  async exportAuditLogs(entries: readonly AuditLogEntry[]): Promise<string> {
    await delay(160);
    const header = ['timestamp', 'user', 'action', 'resource', 'ip', 'status'];
    const rows = entries.map((entry) =>
      [entry.timestamp, entry.user, entry.action, entry.resource, entry.ip, entry.status]
        .map((value) => `"${value.replaceAll('"', '""')}"`)
        .join(',')
    );
    return [header.join(','), ...rows].join('\n');
  },

  async getDocuments(): Promise<readonly DocumentRecord[]> {
    await delay();
    return DOCUMENTS;
  },
};

function valueForSort(entry: AuditLogEntry, key: string): string | number {
  switch (key) {
    case 'timestamp':
      return new Date(entry.timestamp).getTime();
    case 'user':
      return entry.user;
    case 'action':
      return entry.action;
    case 'resource':
      return entry.resource;
    case 'ip':
      return entry.ip;
    case 'status':
      return entry.status;
    default:
      return entry.timestamp;
  }
}

export function toErrorMessage(cause: unknown): string {
  return errorMessage(cause);
}
