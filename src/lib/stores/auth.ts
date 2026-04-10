import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AdminMe } from "@/lib/types";

interface AuthState {
  admin: AdminMe | null;
  accessToken: string | null;
  setAdmin: (admin: AdminMe) => void;
  setToken: (token: string) => void;
  clearAuth: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      admin: null,
      accessToken: null,

      setAdmin: (admin) => set({ admin }),

      setToken: (token) => set({ accessToken: token }),

      clearAuth: () => set({ admin: null, accessToken: null }),

      hydrate: () => {
        // Zustand persist handles rehydration automatically.
        // This method exists as an explicit hook for components that need
        // to trigger rehydration check on mount.
      },
    }),
    {
      name: "admin-auth",
      // Only persist these fields — never expose sensitive data beyond token
      partialize: (state) => ({
        admin: state.admin,
        accessToken: state.accessToken,
      }),
    }
  )
);
