export type AuditAction =
  | 'login'
  | 'logout'
  | 'create'
  | 'update'
  | 'delete'
  | 'export'
  | 'run_pipeline'
  | 'deploy_model'
  | 'download'
  | 'share';

export type AuditStatus = 'success' | 'warning' | 'blocked';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: AuditAction;
  resource: string;
  ip: string;
  status: AuditStatus;
  metadata: Record<string, unknown>;
}

export interface AuditFilter {
  search: string;
  action: AuditAction | 'all';
  status: AuditStatus | 'all';
  from: string | null;
  to: string | null;
}

export type AuditSortKey = 'timestamp' | 'user' | 'action' | 'resource' | 'ip' | 'status';

export interface AuditSort {
  key: AuditSortKey;
  direction: 'asc' | 'desc';
}

export type AuditPageSize = 50 | 100 | 500;
