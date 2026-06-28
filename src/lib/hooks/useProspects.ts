import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import type {
  ProspectList,
  ProspectStats,
  ProspectStatus,
  ProspectType,
} from "@/lib/types";

const KEY_STATS = (cc?: string) => ["admin", "prospects", "stats", cc ?? "all"];
const KEY_LIST = (p: Record<string, unknown>) => ["admin", "prospects", "list", p];

export function useProspectStats(countryCode?: string) {
  return useQuery({
    queryKey: KEY_STATS(countryCode),
    queryFn: async () => {
      const res = await adminApi.getProspectStats(countryCode);
      return res.data as ProspectStats;
    },
    staleTime: 30_000,
  });
}

export function useProspects(params: {
  country_code?: string;
  type?: ProspectType;
  status?: ProspectStatus;
  governorate?: string;
  claimed?: boolean;
  search?: string;
  page?: number;
  size?: number;
}) {
  return useQuery({
    queryKey: KEY_LIST(params),
    queryFn: async () => {
      const res = await adminApi.getProspects(params);
      return res.data as ProspectList;
    },
    staleTime: 15_000,
  });
}

export function useUpdateProspect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: unknown }) =>
      adminApi.updateProspect(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "prospects"] });
    },
  });
}

export function useDeleteProspect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.deleteProspect(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "prospects"] });
    },
  });
}
