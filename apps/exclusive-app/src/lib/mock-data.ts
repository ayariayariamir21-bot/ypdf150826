import type {
  AuditAction,
  AuditLogEntry,
  AuditStatus,
  MLModel,
  ModelStatus,
  ModelType,
  NodeKindId,
  NodeTypeId,
  PipelineEdge,
  PipelineNode,
  Workflow,
} from '@/types';
import { NODE_DESCRIPTIONS, NODE_LABELS } from './constants';
import { uid } from './utils';

function seeded(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function isoMinutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

function isoHoursAgo(hours: number): string {
  return isoMinutesAgo(hours * 60);
}

interface NodeSpec {
  kind: NodeKindId;
  type: NodeTypeId;
  x: number;
  y: number;
}

const MASTER_SPECS: readonly NodeSpec[] = [
  { kind: 'upload', type: 'trigger', x: 40, y: 220 },
  { kind: 'ocr', type: 'activity', x: 280, y: 220 },
  { kind: 'classify', type: 'activity', x: 520, y: 220 },
  { kind: 'extract', type: 'activity', x: 760, y: 220 },
  { kind: 'redact', type: 'activity', x: 1000, y: 220 },
  { kind: 'approval', type: 'gate', x: 1240, y: 220 },
  { kind: 'archive', type: 'output', x: 1480, y: 220 },
];

function buildNodes(specs: readonly NodeSpec[]): PipelineNode[] {
  return specs.map((spec) => {
    const id = uid(`node`);
    return {
      id,
      type: spec.type,
      kind: spec.kind,
      label: NODE_LABELS[spec.kind],
      description: NODE_DESCRIPTIONS[spec.kind],
      position: { x: spec.x, y: spec.y },
      state: 'idle',
      config: {},
    };
  });
}

function buildEdges(nodes: readonly PipelineNode[]): PipelineEdge[] {
  const edges: PipelineEdge[] = [];
  for (let index = 1; index < nodes.length; index += 1) {
    const from = nodes[index - 1];
    const to = nodes[index];
    if (from && to) {
      edges.push({ id: uid(`edge`), from: from.id, to: to.id });
    }
  }
  return edges;
}

function buildMasterPipeline(): { nodes: PipelineNode[]; edges: PipelineEdge[] } {
  const nodes = buildNodes(MASTER_SPECS);
  const edges = buildEdges(nodes);
  return { nodes, edges };
}

const master = buildMasterPipeline();

function makeWorkflow(
  specs: readonly NodeSpec[],
  extraEdges: ReadonlyArray<readonly [NodeKindId, NodeKindId]> = []
): { nodes: PipelineNode[]; edges: PipelineEdge[] } {
  const nodes = buildNodes(specs);
  const edges = buildEdges(nodes);
  const byKind = new Map(nodes.map((node) => [node.kind, node]));
  for (const [fromKind, toKind] of extraEdges) {
    const from = byKind.get(fromKind);
    const to = byKind.get(toKind);
    if (from && to) {
      edges.push({ id: uid('edge'), from: from.id, to: to.id });
    }
  }
  return { nodes, edges };
}

export const WORKFLOWS: readonly Workflow[] = [
  {
    id: 'wf-master-intake',
    name: 'Master Intake',
    description: 'Upload → OCR → Classify → Extract → Redact → Approval → Archive',
    status: 'active',
    lastRunAt: isoMinutesAgo(4),
    successRate: 98.7,
    queuedDocuments: 12,
    version: 7,
    nodes: master.nodes,
    edges: master.edges,
  },
  {
    id: 'wf-invoice-extraction',
    name: 'Invoice Extraction',
    description: 'Extract structured invoice data from incoming mail',
    status: 'active',
    lastRunAt: isoMinutesAgo(23),
    successRate: 96.4,
    queuedDocuments: 8,
    version: 4,
    ...makeWorkflow(
      [
        { kind: 'email', type: 'trigger', x: 40, y: 160 },
        { kind: 'classify', type: 'activity', x: 280, y: 160 },
        { kind: 'extract', type: 'activity', x: 520, y: 160 },
        { kind: 'condition', type: 'gate', x: 760, y: 160 },
        { kind: 'notify', type: 'output', x: 1000, y: 160 },
        { kind: 'error', type: 'error', x: 760, y: 320 },
      ],
      [['condition', 'error']]
    ),
  },
  {
    id: 'wf-nightly-backup',
    name: 'Nightly Backup',
    description: 'Scheduled archive of processed documents',
    status: 'paused',
    lastRunAt: isoHoursAgo(30),
    successRate: 100,
    queuedDocuments: 0,
    version: 2,
    ...makeWorkflow([
      { kind: 'schedule', type: 'trigger', x: 40, y: 160 },
      { kind: 'export', type: 'activity', x: 280, y: 160 },
      { kind: 'archive', type: 'output', x: 520, y: 160 },
    ]),
  },
  {
    id: 'wf-contract-review',
    name: 'Contract Review',
    description: 'Redact PII and summarise contract clauses',
    status: 'draft',
    lastRunAt: null,
    successRate: 0,
    queuedDocuments: 0,
    version: 1,
    ...makeWorkflow([
      { kind: 'webhook', type: 'trigger', x: 40, y: 160 },
      { kind: 'ocr', type: 'activity', x: 280, y: 160 },
      { kind: 'redact', type: 'activity', x: 520, y: 160 },
      { kind: 'summarize', type: 'activity', x: 760, y: 160 },
      { kind: 'approval', type: 'gate', x: 1000, y: 160 },
      { kind: 'notify', type: 'output', x: 1240, y: 160 },
    ]),
  },
];

export const DOCUMENTS = [
  { id: 'doc-1', name: 'vendor-agreement-2026.pdf', type: 'PDF', sizeBytes: 2_412_900, status: 'processed', pipeline: 'Master Intake', modifiedAt: isoMinutesAgo(4) },
  { id: 'doc-2', name: 'invoice-88523.pdf', type: 'PDF', sizeBytes: 412_031, status: 'processed', pipeline: 'Invoice Extraction', modifiedAt: isoMinutesAgo(19) },
  { id: 'doc-3', name: 'signed-nda-amir.pdf', type: 'PDF', sizeBytes: 891_240, status: 'queued', pipeline: 'Master Intake', modifiedAt: isoMinutesAgo(31) },
  { id: 'doc-4', name: 'scan-office-licence.png', type: 'PNG', sizeBytes: 2_910_556, status: 'processing', pipeline: 'Contract Review', modifiedAt: isoMinutesAgo(6) },
  { id: 'doc-5', name: 'board-minutes.docx', type: 'DOCX', sizeBytes: 124_800, status: 'processed', pipeline: 'Master Intake', modifiedAt: isoHoursAgo(2) },
  { id: 'doc-6', name: 'financials-q1.xlsx', type: 'XLSX', sizeBytes: 2_014_300, status: 'failed', pipeline: 'Invoice Extraction', modifiedAt: isoHoursAgo(5) },
  { id: 'doc-7', name: 'hr-policy-handbook.pdf', type: 'PDF', sizeBytes: 5_120_040, status: 'processed', pipeline: 'Master Intake', modifiedAt: isoHoursAgo(8) },
  { id: 'doc-8', name: 'receipt-09188.pdf', type: 'PDF', sizeBytes: 298_451, status: 'processed', pipeline: 'Invoice Extraction', modifiedAt: isoHoursAgo(12) },
];

const modelSeeds: ReadonlyArray<{
  name: string;
  type: ModelType;
  status: ModelStatus;
  accuracy: number;
  latencyMs: number;
}> = [
  { name: 'field-extractor', type: 'extraction', status: 'deployed', accuracy: 98.2, latencyMs: 214 },
  { name: 'invoice-classifier', type: 'classification', status: 'deployed', accuracy: 97.6, latencyMs: 132 },
  { name: 'contract-summarizer', type: 'summarization', status: 'deployed', accuracy: 95.1, latencyMs: 842 },
  { name: 'pii-redactor', type: 'redaction', status: 'deployed', accuracy: 99.3, latencyMs: 168 },
  { name: 'multi-lang-translator', type: 'translation', status: 'training', accuracy: 0, latencyMs: 0 },
  { name: 'invoice-ocr-v2', type: 'ocr', status: 'training', accuracy: 0, latencyMs: 0 },
  { name: 'legacy-doc-ocr', type: 'ocr', status: 'queued', accuracy: 0, latencyMs: 0 },
];

export const MODELS: readonly MLModel[] = modelSeeds.map((seed, index) => ({
  id: `model-${index + 1}`,
  name: seed.name,
  type: seed.type,
  description: `${seed.name.replace(/-/g, ' ')} fine-tuned on enterprise document volumes`,
  version: `v${index + 4}.2.0`,
  status: seed.status,
  accuracy: seed.accuracy,
  latencyMs: seed.latencyMs,
  updatedAt: index % 2 === 0 ? isoHoursAgo(index * 3 + 2) : isoDaysAgo(index + 1),
  owner: index % 3 === 0 ? 'Data Platform' : 'ML Engineering',
  training:
    seed.status === 'training'
      ? { currentEpoch: index + 2, epochs: 12, progress: 58 + index * 12, loss: 0.124, accuracy: 92.4 }
      : undefined,
  endpoint:
    seed.status === 'deployed'
      ? {
          region: 'eu-west-1',
          sku: 'Standard',
          capacityTpm: 120_000,
          autoscaling: true,
          minInstances: 2,
          maxInstances: 8,
          costPerMillion: 2.4,
        }
      : undefined,
}));

function isoDaysAgo(days: number): string {
  return isoHoursAgo(days * 24);
}

export const RECENT_ACTIVITY = [
  {
    id: 'act-1',
    title: 'Pipeline completed',
    metadata: '24 documents processed in 00:03:12',
    pipeline: 'Master Intake',
    time: isoMinutesAgo(3),
    status: 'success' as const,
  },
  {
    id: 'act-2',
    title: 'Model deployed',
    metadata: 'field-extractor v7 deployed to eu-west-1',
    pipeline: 'ML Platform',
    time: isoMinutesAgo(28),
    status: 'success' as const,
  },
  {
    id: 'act-3',
    title: 'Approval requested',
    metadata: '3 documents awaiting review',
    pipeline: 'Master Intake',
    time: isoMinutesAgo(41),
    status: 'warning' as const,
  },
  {
    id: 'act-4',
    title: 'Export completed',
    metadata: 'audit-trail-q1.csv exported by Data Team',
    pipeline: 'Audit',
    time: isoHoursAgo(1),
    status: 'success' as const,
  },
  {
    id: 'act-5',
    title: 'Document blocked',
    metadata: 'financials-q1.xlsx failed validation',
    pipeline: 'Invoice Extraction',
    time: isoHoursAgo(2),
    status: 'error' as const,
  },
  {
    id: 'act-6',
    title: 'Member invited',
    metadata: 'new analyst joined the org',
    pipeline: 'Org',
    time: isoHoursAgo(3),
    status: 'success' as const,
  },
];

export const DASHBOARD_STATS = {
  documentsProcessed: { label: 'Documents Processed', value: 284_931, change: 12.4 },
  activePipelines: { label: 'Active Pipelines', value: 23, change: 4.2 },
  aiTokensUsed: { label: 'AI Tokens Used', value: 48_902_144, change: 18.7 },
  avgProcessingTime: { label: 'Avg Processing Time', value: 38, change: -6.1 },
} as const;

export interface AuditLogSeed {
  users: readonly string[];
  resources: readonly string[];
  actions: readonly AuditAction[];
}

const AUDIT_USERS = ['amir.benali', 'sarah.kim', 'data-bot', 'jon.west', 'platform-admin', 'luis.ortiz'];
const AUDIT_RESOURCES = [
  'workflow/master-intake',
  'workflow/invoice-extraction',
  'model/field-extractor',
  'document/vendor-agreement-2026.pdf',
  'document/financials-q1.xlsx',
  'audit/export',
  'settings/security',
  'api/key-7f3c',
  'document/invoice-88523.pdf',
  'model/contract-summarizer',
];
const AUDIT_ACTIONS: readonly AuditAction[] = [
  'login',
  'logout',
  'create',
  'update',
  'delete',
  'export',
  'run_pipeline',
  'deploy_model',
  'download',
  'share',
];
const AUDIT_IPS = ['10.0.4.21', '185.199.108.1', '52.48.14.9', '10.0.7.115', '87.250.250.242', '10.0.2.77'];

export function generateAuditLogs(count: number): AuditLogEntry[] {
  const random = seeded(42);
  const logs: AuditLogEntry[] = [];
  for (let index = 0; index < count; index += 1) {
    const user = AUDIT_USERS[Math.floor(random() * AUDIT_USERS.length)] ?? 'unknown';
    const resource = AUDIT_RESOURCES[Math.floor(random() * AUDIT_RESOURCES.length)] ?? 'unknown';
    const action = AUDIT_ACTIONS[Math.floor(random() * AUDIT_ACTIONS.length)] ?? 'login';
    const ip = AUDIT_IPS[Math.floor(random() * AUDIT_IPS.length)] ?? '0.0.0.0';
    const roll = random();
    const status: AuditStatus = roll < 0.84 ? 'success' : roll < 0.96 ? 'warning' : 'blocked';
    logs.push({
      id: `log-${index + 1}`,
      timestamp: isoMinutesAgo(index * 7 + 1),
      user,
      action,
      resource,
      ip,
      status,
      metadata: {
        requestId: `req-${Math.floor(random() * 1_000_000).toString(36)}`,
        durationMs: Math.floor(12 + random() * 900),
        page: resource.includes('document') ? Math.floor(1 + random() * 40) : undefined,
        bytes: action === 'download' || action === 'export' ? Math.floor(50_000 + random() * 4_000_000) : undefined,
      },
    });
  }
  return logs;
}

export const AUDIT_LOGS: readonly AuditLogEntry[] = generateAuditLogs(640);

export interface StatValue {
  label: string;
  value: number;
  change: number;
}

export const ALL_WORKFLOWS: readonly Workflow[] = WORKFLOWS;
