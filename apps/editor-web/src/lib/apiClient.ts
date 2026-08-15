import type { ApiClient, ApiRequestOptions, Fetcher, HttpMethod } from '@/types';

async function defaultFetcher(url: string, options: ApiRequestOptions): Promise<{
  status: number;
  ok: boolean;
  json: unknown;
}> {
  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers: options.headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const json: unknown = response.status === 204 ? null : await response.json().catch(() => null);
  return { status: response.status, ok: response.ok, json };
}

function joinPath(baseUrl: string, path: string): string {
  if (path.startsWith('http')) {
    return path;
  }
  return `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

export function createApiClient(
  baseUrl: string,
  headers?: Readonly<Record<string, string>>,
  fetcher: Fetcher = defaultFetcher
): ApiClient {
  const request = async <T>(path: string, options?: ApiRequestOptions): Promise<T> => {
    const url = joinPath(baseUrl, path);
    const result = await fetcher(url, {
      method: (options?.method ?? 'GET') as HttpMethod,
      headers: { ...headers, ...options?.headers },
      body: options?.body,
    });
    if (!result.ok) {
      throw new Error(`Request to ${path} failed with status ${result.status}`);
    }
    return result.json as T;
  };

  return {
    request,
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
    put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
    patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
    delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  };
}
