import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient, type AuditQuery, type PagedAuditResult } from '@/lib/apiClient';
import type { AuditLogEntry } from '@/types';

export function useAuditLogs(query: AuditQuery) {
  return useQuery({
    queryKey: ['audit', query],
    queryFn: async (): Promise<PagedAuditResult> => apiClient.getAuditLogs(query),
    staleTime: 10_000,
  });
}

export function useExportAuditLogs() {
  return useMutation({
    mutationFn: async (entries: readonly AuditLogEntry[]) => apiClient.exportAuditLogs(entries),
  });
}
