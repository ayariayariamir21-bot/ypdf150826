import type { Fetcher } from '@/types';
import { createApiClient } from './apiClient';
import { DEMO_COLLABORATORS, DEMO_USAGE } from './constants';

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

const mockFetcher: Fetcher = async (url, options) => {
  await delay(400);
  const method = options.method ?? 'GET';
  const path = url.replace(/^\/+|\/+$/g, '');
  if (method === 'GET' && path === 'api/collaborators') {
    return { status: 200, ok: true, json: [...DEMO_COLLABORATORS] };
  }
  if (method === 'GET' && path === 'api/usage') {
    return { status: 200, ok: true, json: { ...DEMO_USAGE } };
  }
  return {
    status: 404,
    ok: false,
    json: { error: `No mock handler for ${method} ${url}` },
  };
};

export const demoApi = createApiClient('/api', undefined, mockFetcher);
