import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import type {
  AdCampaignList,
  AdCampaignCreate,
  AdCampaignUpdate,
  AdSettings,
  AdSettingsUpdate,
  AdStats,
} from "@/lib/types";

export interface AdCampaignFilters {
  country_code?: string;
  status?: string;
  page?: number;
  size?: number;
}

export function useAdCampaigns(filters?: AdCampaignFilters) {
  return useQuery({
    queryKey: ["admin", "ads", "campaigns", filters ?? {}],
    queryFn: async () => {
      const res = await adminApi.getAdCampaigns(filters);
      return res.data as AdCampaignList;
    },
    staleTime: 30_000,
  });
}

export function useCreateAd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdCampaignCreate) => adminApi.createAdCampaign(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "ads"] });
    },
  });
}

export function useUpdateAd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AdCampaignUpdate }) =>
      adminApi.updateAdCampaign(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "ads"] });
    },
  });
}

export function useDeleteAd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.deleteAdCampaign(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "ads"] });
    },
  });
}

export function useAdSettings() {
  return useQuery({
    queryKey: ["admin", "ads", "settings"],
    queryFn: async () => {
      const res = await adminApi.getAdSettings();
      return res.data as AdSettings;
    },
    staleTime: 60_000,
  });
}

export function useUpdateAdSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdSettingsUpdate) => adminApi.updateAdSettings(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "ads", "settings"] });
    },
  });
}

export function useAdStats(campaignId: number | null) {
  return useQuery({
    queryKey: ["admin", "ads", "stats", campaignId],
    queryFn: async () => {
      const res = await adminApi.getAdStats(campaignId as number);
      return res.data as AdStats;
    },
    enabled: campaignId !== null,
    staleTime: 30_000,
  });
}

export function useUploadAdMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      formData,
      onProgress,
    }: {
      id: number;
      formData: FormData;
      onProgress?: (percent: number) => void;
    }) => adminApi.uploadAdMedia(id, formData, onProgress),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "ads"] });
    },
  });
}
