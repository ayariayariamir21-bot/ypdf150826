import { describe, expect, it } from 'vitest';
import { createApiClient } from '@/lib/apiClient';
import { demoApi } from '@/lib/demoApi';
import type { ApiRequestOptions, Fetcher } from '@/types';

function jsonFetcher(responses: Record<string, unknown>): Fetcher {
  return async (url, options: ApiRequestOptions) => {
    const key = `${options.method ?? 'GET'} ${url}`;
    const payload = responses[key];
    if (payload === undefined) {
      return { status: 404, ok: false, json: { error: `unhandled ${key}` } };
    }
    return { status: 200, ok: true, json: payload };
  };
}

describe('createApiClient', () => {
  it('issues GET requests and joins paths', async () => {
    const calls: Array<{ url: string; method: string }> = [];
    const fetcher: Fetcher = async (url, options) => {
      calls.push({ url, method: options.method ?? 'GET' });
      return { status: 200, ok: true, json: { ok: true } };
    };
    const client = createApiClient('https://api.example.com/', undefined, fetcher);
    const result = await client.get<{ ok: boolean }>('/v1/ping');
    expect(result.ok).toBe(true);
    expect(calls).toEqual([{ url: 'https://api.example.com/v1/ping', method: 'GET' }]);
  });

  it('supports all verb helpers with JSON bodies', async () => {
    const fetcher: Fetcher = async (_url, options) => ({
      status: 200,
      ok: true,
      json: { method: options.method, body: options.body },
    });
    const client = createApiClient('/api', undefined, fetcher);
    expect((await client.post<{ method: string }>('/x', { a: 1 })).method).toBe('POST');
    expect((await client.put<{ method: string }>('/x', { a: 1 })).method).toBe('PUT');
    expect((await client.patch<{ method: string }>('/x', { a: 1 })).method).toBe('PATCH');
    expect((await client.delete<{ method: string }>('/x')).method).toBe('DELETE');
  });

  it('keeps absolute urls untouched', async () => {
    let seen = '';
    const fetcher: Fetcher = async (url) => {
      seen = url;
      return { status: 200, ok: true, json: null };
    };
    const client = createApiClient('/api', undefined, fetcher);
    await client.get('https://other.example.org/data');
    expect(seen).toBe('https://other.example.org/data');
  });

  it('throws on non-ok responses', async () => {
    const client = createApiClient('/api', undefined, jsonFetcher({}));
    await expect(client.get('/missing')).rejects.toThrow(/failed with status 404/);
  });

  it('merges headers', async () => {
    let headers: Record<string, string> | undefined;
    const fetcher: Fetcher = async (_url, options) => {
      headers = options.headers;
      return { status: 200, ok: true, json: null };
    };
    const client = createApiClient('/api', { Authorization: 'Bearer token' }, fetcher);
    await client.request('/x', { headers: { 'X-Custom': '1' } });
    expect(headers).toMatchObject({ Authorization: 'Bearer token', 'X-Custom': '1' });
  });
});

describe('demoApi', () => {
  it('returns mock collaborators', async () => {
    const result = await demoApi.get<Array<{ id: string }>>('/collaborators');
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]?.id).toBeTruthy();
  });

  it('returns mock usage', async () => {
    const usage = await demoApi.get<{ documentsUsed: number; documentsTotal: number }>('/usage');
    expect(usage.documentsUsed).toBeLessThanOrEqual(usage.documentsTotal);
  });

  it('rejects unknown endpoints', async () => {
    await expect(demoApi.get('/nope')).rejects.toThrow(/failed with status 404/);
  });
});
