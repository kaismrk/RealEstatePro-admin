import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import type {
  ProfessionalSignupList,
  ProfessionalSignupStats,
  SignupStatus,
  SignupType,
} from "@/lib/types";

const KEY_STATS = (cc?: string) => ["admin", "pro-signups", "stats", cc ?? "all"];
const KEY_LIST = (p: Record<string, unknown>) => ["admin", "pro-signups", "list", p];

export function useProfessionalSignupStats(countryCode?: string) {
  return useQuery({
    queryKey: KEY_STATS(countryCode),
    queryFn: async () => {
      const res = await adminApi.getProfessionalSignupStats(countryCode);
      return res.data as ProfessionalSignupStats;
    },
    staleTime: 30_000,
  });
}

export function useProfessionalSignups(params: {
  country_code?: string;
  status?: SignupStatus;
  type?: SignupType;
  page?: number;
  size?: number;
}) {
  return useQuery({
    queryKey: KEY_LIST(params),
    queryFn: async () => {
      const res = await adminApi.getProfessionalSignups(params);
      return res.data as ProfessionalSignupList;
    },
    staleTime: 15_000,
  });
}

export function useActivateSignup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.activateProfessionalSignup(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "pro-signups"] });
    },
  });
}

export function useRejectSignup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      adminApi.rejectProfessionalSignup(id, reason),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "pro-signups"] });
    },
  });
}
