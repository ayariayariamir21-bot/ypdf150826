export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiRequestOptions {
  method?: HttpMethod;
  headers?: Readonly<Record<string, string>>;
  body?: unknown;
}

export type Fetcher = (
  url: string,
  options: ApiRequestOptions
) => Promise<{ status: number; ok: boolean; json: unknown }>;

export interface ApiClient {
  request<T>(path: string, options?: ApiRequestOptions): Promise<T>;
  get<T>(path: string): Promise<T>;
  post<T>(path: string, body?: unknown): Promise<T>;
  put<T>(path: string, body?: unknown): Promise<T>;
  patch<T>(path: string, body?: unknown): Promise<T>;
  delete<T>(path: string): Promise<T>;
}

export interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: 'owner' | 'editor' | 'viewer';
  status: 'active' | 'invited';
  lastActiveAt: Date;
}

export interface UsageSummary {
  documentsUsed: number;
  documentsTotal: number;
  storageUsedMb: number;
  storageTotalMb: number;
  aiRequestsUsed: number;
  aiRequestsTotal: number;
}
