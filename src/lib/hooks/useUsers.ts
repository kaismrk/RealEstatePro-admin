import { useQuery, useMutation } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";

export function useUsers(params?: {
  page?: number;
  size?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: async () => {
      const res = await adminApi.getUsers(params);
      return res.data as { total: number; items: unknown[] };
    },
    staleTime: 30_000,
  });
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: (userId: number) => adminApi.resetUserPassword(userId),
  });
}

export function useRevokeSessions() {
  return useMutation({
    mutationFn: ({ userId, reason }: { userId: number; reason?: string }) =>
      adminApi.revokeSessions(userId, reason),
  });
}
