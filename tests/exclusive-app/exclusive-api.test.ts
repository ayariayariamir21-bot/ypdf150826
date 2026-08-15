import { describe, expect, it } from 'vitest';
import { apiClient } from '@/lib/apiClient';
import type { AuditQuery, AuditSort } from '@/lib/apiClient';

const sort: AuditSort = { key: 'timestamp', direction: 'desc' };

function query(overrides: Partial<AuditQuery> = {}): AuditQuery {
  return {
    page: 1,
    pageSize: 50,
    sort,
    filter: { search: '', action: 'all', status: 'all', from: null, to: null },
    ...overrides,
  };
}

describe('exclusive apiClient dashboard', () => {
  it('returns dashboard stats, activity and compliance', async () => {
    const result = await apiClient.getDashboard();
    expect(result.stats.documentsProcessed).toBeGreaterThan(0);
    expect(result.stats.avgProcessingTimeMs).toBeGreaterThan(0);
    expect(result.stats.changes).toBeDefined();
    expect(result.recentActivity.length).toBeGreaterThan(0);
    expect(result.compliance).toHaveLength(3);
    expect(result.compliance.every((item) => item.progress >= 0 && item.progress <= 100)).toBe(true);
  });
});

describe('exclusive apiClient workflows', () => {
  it('lists workflows and fetches by id', async () => {
    const workflows = await apiClient.getWorkflows();
    expect(workflows.length).toBeGreaterThan(0);
    const first = workflows[0];
    if (!first) {
      throw new Error('expected workflow');
    }
    const byId = await apiClient.getWorkflow(first.id);
    expect(byId?.id).toBe(first.id);
    expect(await apiClient.getWorkflow('missing')).toBeNull();
  });

  it('saves a workflow and bumps its version', async () => {
    const workflows = await apiClient.getWorkflows();
    const target = workflows[0];
    if (!target) {
      throw new Error('expected workflow');
    }
    const saved = await apiClient.saveWorkflow(target.id, target.nodes, target.edges);
    expect(saved.version).toBe(target.version + 1);
    await expect(apiClient.saveWorkflow('nope', [], [])).rejects.toThrow('Workflow not found');
  });

  it('validates graphs and flags issues', async () => {
    const workflows = await apiClient.getWorkflows();
    const target = workflows[0];
    if (!target) {
      throw new Error('expected workflow');
    }
    const broken = await apiClient.validateWorkflow(target.nodes, [
      ...target.edges,
      { id: 'x', from: 'ghost', to: 'ghost2' },
    ]);
    expect(broken.valid).toBe(false);
    expect(broken.issues.length).toBeGreaterThan(0);
  });

  it('starts a run', async () => {
    const run = await apiClient.runWorkflow();
    expect(run.runId).toBeTruthy();
    expect(run.startedAt).toBeTruthy();
  });
});

describe('exclusive apiClient models', () => {
  it('lists, tests and updates models', async () => {
    const models = await apiClient.getModels();
    expect(models.length).toBeGreaterThan(0);
    const deployed = models.find((model) => model.status === 'deployed');
    if (deployed) {
      const test = await apiClient.testModel(deployed.id);
      expect(test.ok).toBe(true);
      expect(test.latencyMs).toBeGreaterThan(0);
    }
    const target = models[0];
    if (!target) {
      throw new Error('expected model');
    }
    const updated = await apiClient.updateEndpoint(target.id, { region: 'eu-west-1' });
    expect(updated.endpoint?.region).toBe('eu-west-1');
  });

  it('deletes models and rejects unknown ids', async () => {
    const models = await apiClient.getModels();
    const target = models[0];
    if (!target) {
      throw new Error('expected model');
    }
    await expect(apiClient.deleteModel(target.id)).resolves.toBeUndefined();
    await expect(apiClient.deleteModel('missing')).rejects.toThrow('Model not found');
  });
});

describe('exclusive apiClient audit logs', () => {
  it('paginates audit logs', async () => {
    const result = await apiClient.getAuditLogs(query({ pageSize: 50, page: 1 }));
    expect(result.total).toBeGreaterThan(0);
    expect(result.items.length).toBeLessThanOrEqual(50);

    const second = await apiClient.getAuditLogs(query({ pageSize: 50, page: 2 }));
    expect(second.items[0]?.id).not.toBe(result.items[0]?.id);
  });

  it('filters by action, status and search', async () => {
    const byAction = await apiClient.getAuditLogs(
      query({ filter: { search: '', action: 'login', status: 'all', from: null, to: null } })
    );
    expect(byAction.total).toBeGreaterThan(0);
    expect(byAction.items.every((entry) => entry.action === 'login')).toBe(true);

    const byStatus = await apiClient.getAuditLogs(
      query({ filter: { search: '', action: 'all', status: 'blocked', from: null, to: null } })
    );
    expect(byStatus.items.every((entry) => entry.status === 'blocked')).toBe(true);

    const empty = await apiClient.getAuditLogs(
      query({ filter: { search: 'zzz-no-match-zzz', action: 'all', status: 'all', from: null, to: null } })
    );
    expect(empty.total).toBe(0);
  });

  it('sorts by a given key', async () => {
    const byUser = await apiClient.getAuditLogs(
      query({ sort: { key: 'user', direction: 'asc' }, pageSize: 100 })
    );
    const users = byUser.items.map((entry) => entry.user);
    expect(users).toEqual([...users].sort());
  });

  it('exports audit logs as CSV', async () => {
    const result = await apiClient.getAuditLogs(query({ pageSize: 10 }));
    const csv = await apiClient.exportAuditLogs(result.items);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('timestamp,user,action,resource,ip,status');
    expect(lines).toHaveLength(result.items.length + 1);
  });
});

describe('exclusive apiClient documents', () => {
  it('lists document records', async () => {
    const documents = await apiClient.getDocuments();
    expect(documents.length).toBeGreaterThan(0);
    expect(documents[0]?.name).toBeTruthy();
  });
});
