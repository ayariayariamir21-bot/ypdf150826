import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import type { EndpointConfigPatch, MLModel } from '@/types';

export function useModels() {
  return useQuery({
    queryKey: ['models'],
    queryFn: async () => apiClient.getModels(),
    staleTime: 30_000,
  });
}

export function useUpdateEndpoint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: EndpointConfigPatch }) =>
      apiClient.updateEndpoint(id, patch),
    onSuccess: (updated: MLModel) => {
      queryClient.setQueryData<readonly MLModel[]>(['models'], (models) =>
        models?.map((model) => (model.id === updated.id ? updated : model))
      );
    },
  });
}

export function useTestModel() {
  return useMutation({
    mutationFn: async (id: string) => apiClient.testModel(id),
  });
}

export function useDeleteModel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => apiClient.deleteModel(id),
    onSuccess: (_data, id: string) => {
      queryClient.setQueryData<readonly MLModel[]>(['models'], (models) =>
        models?.filter((model) => model.id !== id)
      );
    },
  });
}
