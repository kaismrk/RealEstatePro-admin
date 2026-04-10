"use client";

import { LogOut, User } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth";
import { useLogout } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";

export function Topbar() {
  const admin = useAuthStore((s) => s.admin);
  const logout = useLogout();

  const displayName = admin
    ? [admin.first_name, admin.last_name].filter(Boolean).join(" ") || admin.email
    : "";

  const roleLabel: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    PLATFORM_ADMIN: "Platform Admin",
    OPERATIONS_ADMIN: "Operations Admin",
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div />

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <User className="h-4 w-4 text-gray-400" />
          <span className="font-medium">{displayName}</span>
          {admin && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
              {roleLabel[admin.admin_role] ?? admin.admin_role}
            </span>
          )}
          {admin?.country_code && (
            <span className="text-xs text-gray-400">[{admin.country_code}]</span>
          )}
        </div>

        <Button variant="ghost" size="sm" onClick={logout} className="gap-2 text-gray-600">
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </header>
  );
}
