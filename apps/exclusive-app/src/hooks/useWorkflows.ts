import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import type { PipelineEdge, PipelineNode, Workflow } from '@/types';

export function useWorkflows() {
  return useQuery({
    queryKey: ['workflows'],
    queryFn: async () => apiClient.getWorkflows(),
    staleTime: 30_000,
  });
}

export function useWorkflow(id: string | null) {
  return useQuery({
    queryKey: ['workflow', id],
    queryFn: async () => (id ? apiClient.getWorkflow(id) : null),
    enabled: id != null,
    staleTime: 15_000,
  });
}

export function useSaveWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      nodes,
      edges,
    }: {
      id: string;
      nodes: readonly PipelineNode[];
      edges: readonly PipelineEdge[];
    }) => apiClient.saveWorkflow(id, nodes, edges),
    onSuccess: (workflow: Workflow) => {
      queryClient.setQueryData(['workflow', workflow.id], workflow);
      void queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });
}

export function useValidateWorkflow() {
  return useMutation({
    mutationFn: async ({
      nodes,
      edges,
    }: {
      nodes: readonly PipelineNode[];
      edges: readonly PipelineEdge[];
    }) => apiClient.validateWorkflow(nodes, edges),
  });
}

export function useRunWorkflow() {
  return useMutation({
    mutationFn: async () => apiClient.runWorkflow(),
  });
}
