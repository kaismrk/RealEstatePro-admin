import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
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
      // POST to the Next.js /api/auth route — it calls FastAPI, verifies
      // admin identity, AND sets the httpOnly admin_token cookie that the
      // middleware checks. Hitting the FastAPI backend directly works for
      // the token but leaves the cookie unset → middleware bounces every
      // navigation back to /login.
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { detail?: string };
        throw new Error(body.detail ?? `Login failed (HTTP ${res.status})`);
      }

      const { admin, token } = (await res.json()) as {
        admin: AdminMe;
        token: string;
      };

      setToken(token);
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
    // Clear server-side cookie too (in addition to client-side Zustand state),
    // otherwise the middleware still considers the user logged in.
    void fetch("/api/auth", { method: "DELETE" });
    clearAuth();
    router.push("/login");
  };
}
