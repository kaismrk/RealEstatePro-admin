import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import type { AdminRegionList } from "@/lib/types";

export function useRegions(params?: {
  country_code?: string;
  parent_id?: number;
  level?: string;
  page?: number;
  size?: number;
}) {
  return useQuery({
    queryKey: ["admin", "regions", params],
    queryFn: async () => {
      const res = await adminApi.getRegions(params);
      return res.data as AdminRegionList;
    },
    staleTime: 60_000,
  });
}

export function useCreateRegion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: unknown) => adminApi.createRegion(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "regions"] });
    },
  });
}

export function useUpdateRegion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: unknown }) =>
      adminApi.updateRegion(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "regions"] });
    },
  });
}

export function useDeleteRegion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.deleteRegion(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "regions"] });
    },
  });
}

export function useSeedTunisia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminApi.seedTunisia(),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "regions"] });
    },
  });
}
