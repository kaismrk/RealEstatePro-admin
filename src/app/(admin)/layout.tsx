"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { admin, accessToken, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!accessToken) {
      router.replace("/login");
    }
  }, [accessToken, router]);

  if (!accessToken || !admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="text-sm text-neutral-500">Loading...</div>
      </div>
    );
  }

  if (!admin.is_admin_active) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-50">
        <h1 className="text-xl font-semibold text-red-700">Access Denied</h1>
        <p className="text-sm text-neutral-500">Your admin account has been deactivated.</p>
        <button
          onClick={() => {
            useAuthStore.getState().clearAuth();
            router.replace("/login");
          }}
          className="text-sm text-primary-500 underline"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-6">{children}</main>
      </div>
    </div>
  );
}
