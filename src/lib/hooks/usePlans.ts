import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import type {
  SubscriptionPlanList,
  SubscriptionPlanCreate,
  SubscriptionPlanUpdate,
} from "@/lib/types";

export function useSubscriptionPlans(countryCode?: string) {
  return useQuery({
    queryKey: ["admin", "subscription-plans", countryCode],
    queryFn: async () => {
      const res = await adminApi.getSubscriptionPlans(countryCode);
      return res.data as SubscriptionPlanList;
    },
    staleTime: 60_000,
  });
}

export function useCreatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubscriptionPlanCreate) =>
      adminApi.createSubscriptionPlan(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "subscription-plans"] });
    },
  });
}

export function useUpdatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SubscriptionPlanUpdate }) =>
      adminApi.updateSubscriptionPlan(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "subscription-plans"] });
    },
  });
}

export function useDeactivatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.deactivateSubscriptionPlan(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "subscription-plans"] });
    },
  });
}
