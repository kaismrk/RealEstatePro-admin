import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/api";
import { useAuthStore } from "@/lib/stores/auth";
import type { AdminMe } from "@/lib/types";

export function useLogin() {
  const router = useRouter();
  const { setToken, setAdmin } = useAuthStore();

  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      // Step 1: get token
      const tokenRes = await adminApi.login(email, password);
      const token = tokenRes.data.access_token;
      setToken(token);

      // Step 2: verify admin identity
      const meRes = await adminApi.getMe();
      const admin = meRes.data as AdminMe;
      if (!admin.is_admin_active) {
        throw new Error("Admin account is deactivated");
      }
      setAdmin(admin);
      return admin;
    },
    onSuccess: () => {
      router.push("/dashboard");
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const { clearAuth } = useAuthStore();

  return () => {
    clearAuth();
    router.push("/login");
  };
}
