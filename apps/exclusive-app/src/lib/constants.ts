import type {
  AuditAction,
  AuditPageSize,
  AuditStatus,
  ModelStatus,
  ModelType,
  NodeKindId,
  NodeState,
  NodeTypeId,
} from '@/types';

export const APP_NAME = 'PDF AI';

export const ORG = {
  id: 'org-exclusive',
  name: 'Acme Enterprise',
  tier: 'Exclusive',
  members: 184,
} as const;

export const ENTERPRISE_BADGE = 'ENTERPRISE';

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Overview', href: '/dashboard', icon: 'dashboard' },
  { label: 'Documents', href: '/documents', icon: 'documents' },
  { label: 'Pipelines', href: '/pipelines', icon: 'pipelines' },
  { label: 'Models', href: '/models', icon: 'models' },
  { label: 'Audit', href: '/audit', icon: 'audit' },
  { label: 'Settings', href: '/settings', icon: 'settings' },
];

export interface PaletteItem {
  id: NodeKindId;
  label: string;
  type: NodeTypeId;
  description: string;
}

export interface PaletteCategory {
  id: string;
  label: string;
  items: readonly PaletteItem[];
}

export const NODE_PALETTE: readonly PaletteCategory[] = [
  {
    id: 'triggers',
    label: 'Triggers',
    items: [
      { id: 'upload', label: 'Upload', type: 'trigger', description: 'Starts when a file is uploaded' },
      { id: 'email', label: 'Email', type: 'trigger', description: 'Starts when an email is received' },
      { id: 'schedule', label: 'Schedule', type: 'trigger', description: 'Runs on a schedule' },
      { id: 'webhook', label: 'Webhook', type: 'trigger', description: 'Starts from an HTTP call' },
    ],
  },
  {
    id: 'activities',
    label: 'Activities',
    items: [
      { id: 'ocr', label: 'OCR', type: 'activity', description: 'Extract text from scanned pages' },
      { id: 'classify', label: 'Classify', type: 'activity', description: 'Categorise the document' },
      { id: 'extract', label: 'Extract', type: 'activity', description: 'Pull structured fields' },
      { id: 'redact', label: 'Redact', type: 'activity', description: 'Mask sensitive content' },
      { id: 'translate', label: 'Translate', type: 'activity', description: 'Translate the document' },
      { id: 'summarize', label: 'Summarize', type: 'activity', description: 'Generate a summary' },
    ],
  },
  {
    id: 'gates',
    label: 'Gates',
    items: [
      { id: 'approval', label: 'Human Approval', type: 'gate', description: 'Waits for a reviewer' },
      { id: 'condition', label: 'Condition', type: 'gate', description: 'Branch on a condition' },
      { id: 'delay', label: 'Delay', type: 'gate', description: 'Pause for a duration' },
    ],
  },
  {
    id: 'outputs',
    label: 'Outputs',
    items: [
      { id: 'archive', label: 'Archive', type: 'output', description: 'Store the result' },
      { id: 'notify', label: 'Notify', type: 'output', description: 'Send a notification' },
      { id: 'export', label: 'Export', type: 'output', description: 'Export the result' },
      { id: 'webhook-output', label: 'Webhook', type: 'output', description: 'Call an endpoint' },
    ],
  },
];

export const NODE_LABELS: Readonly<Record<NodeKindId, string>> = {
  upload: 'Upload',
  email: 'Email',
  schedule: 'Schedule',
  webhook: 'Webhook',
  ocr: 'OCR',
  classify: 'Classify',
  extract: 'Extract',
  redact: 'Redact',
  translate: 'Translate',
  summarize: 'Summarize',
  approval: 'Human Approval',
  condition: 'Condition',
  delay: 'Delay',
  archive: 'Archive',
  notify: 'Notify',
  export: 'Export',
  'webhook-output': 'Webhook',
  error: 'Error',
};

export const NODE_DESCRIPTIONS: Readonly<Record<NodeKindId, string>> = {
  upload: 'Starts when a file is uploaded',
  email: 'Starts when an email is received',
  schedule: 'Runs on a schedule',
  webhook: 'Starts from an HTTP call',
  ocr: 'Extract text from scanned pages',
  classify: 'Categorise the document',
  extract: 'Pull structured fields',
  redact: 'Mask sensitive content',
  translate: 'Translate the document',
  summarize: 'Generate a summary',
  approval: 'Waits for a reviewer',
  condition: 'Branch on a condition',
  delay: 'Pause for a duration',
  archive: 'Store the result',
  notify: 'Send a notification',
  export: 'Export the result',
  'webhook-output': 'Call an endpoint',
  error: 'Handle failures',
};

export const NODE_TYPE_COLORS: Readonly<Record<NodeTypeId, string>> = {
  trigger: 'text-violet-400',
  activity: 'text-brand-400',
  gate: 'text-amber-400',
  output: 'text-emerald-400',
  error: 'text-danger-500',
};

export const NODE_TYPE_LABELS: Readonly<Record<NodeTypeId, string>> = {
  trigger: 'Trigger',
  activity: 'Activity',
  gate: 'Gate',
  output: 'Output',
  error: 'Error',
};

export const NODE_STATE_LABELS: Readonly<Record<NodeState, string>> = {
  idle: 'Idle',
  running: 'Running',
  completed: 'Completed',
  failed: 'Failed',
  paused: 'Paused',
};

export const MODEL_TYPE_LABELS: Readonly<Record<ModelType, string>> = {
  classification: 'Classification',
  extraction: 'Extraction',
  summarization: 'Summarization',
  translation: 'Translation',
  ocr: 'OCR',
  redaction: 'Redaction',
};

export const MODEL_STATUS_LABELS: Readonly<Record<ModelStatus, string>> = {
  deployed: 'Deployed',
  training: 'Training',
  failed: 'Failed',
  queued: 'Queued',
};

export const AUDIT_ACTION_LABELS: Readonly<Record<AuditAction, string>> = {
  login: 'Login',
  logout: 'Logout',
  create: 'Create',
  update: 'Update',
  delete: 'Delete',
  export: 'Export',
  run_pipeline: 'Run pipeline',
  deploy_model: 'Deploy model',
  download: 'Download',
  share: 'Share',
};

export const AUDIT_STATUS_LABELS: Readonly<Record<AuditStatus, string>> = {
  success: 'Success',
  warning: 'Warning',
  blocked: 'Blocked',
};

export const AUDIT_PAGE_SIZES: readonly AuditPageSize[] = [50, 100, 500];

export interface ComplianceRequirement {
  id: string;
  label: string;
  progress: number;
  description: string;
}

export const COMPLIANCE_REQUIREMENTS: readonly ComplianceRequirement[] = [
  { id: 'soc2', label: 'SOC 2', progress: 96, description: 'Type II attestation in progress' },
  { id: 'gdpr', label: 'GDPR', progress: 88, description: 'DPA signed across all subprocessors' },
  { id: 'hipaa', label: 'HIPAA', progress: 74, description: 'BAAs and encryption controls' },
];

export const ENDPOINT_REGIONS = ['eu-west-1', 'us-east-1', 'us-west-2', 'ap-southeast-1'] as const;

export const ENDPOINT_SKUS = ['Standard', 'GlobalStandard', 'ProvisionedManaged'] as const;

export const DOCUMENT_TYPES = ['PDF', 'DOCX', 'PNG', 'XLSX'] as const;

export const PIPELINE_STATUS_LABELS = {
  active: 'Active',
  paused: 'Paused',
  draft: 'Draft',
  archived: 'Archived',
} as const;
