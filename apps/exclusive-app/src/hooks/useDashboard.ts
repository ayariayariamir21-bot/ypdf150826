import { useQuery } from '@tanstack/react-query';
import { apiClient, type DocumentRecord } from '@/lib/apiClient';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => apiClient.getDashboard(),
    staleTime: 30_000,
  });
}

export function useDocuments() {
  return useQuery({
    queryKey: ['documents'],
    queryFn: async (): Promise<readonly DocumentRecord[]> => apiClient.getDocuments(),
    staleTime: 30_000,
  });
}
