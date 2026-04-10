import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import type { PropertyList } from "@/lib/types";

export function usePendingListings(page = 1, size = 20) {
  return useQuery({
    queryKey: ["admin", "listings", "pending", page, size],
    queryFn: async () => {
      const res = await adminApi.getPendingListings(page, size);
      return res.data as PropertyList;
    },
    staleTime: 30_000,
  });
}

export function useApproveListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.approveListing(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "listings", "pending"] });
    },
  });
}

export function useRejectListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      adminApi.rejectListing(id, reason),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "listings", "pending"] });
    },
  });
}
