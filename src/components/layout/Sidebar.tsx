"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  Users,
  CreditCard,
  Package,
  MapPin,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAuthStore } from "@/lib/stores/auth";

const ALL_NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, permission: null },
  { href: "/listings/pending", label: "Pending Listings", icon: ListChecks, permission: "listing:review" },
  { href: "/users", label: "Users", icon: Users, permission: "user:read" },
  { href: "/subscriptions", label: "Subscription Plans", icon: CreditCard, permission: "billing:manage" },
  { href: "/packs", label: "Listing Packs", icon: Package, permission: "billing:manage" },
  { href: "/boosts", label: "Boosts", icon: Zap, permission: "listing:review" },
  { href: "/regions", label: "Geo Regions", icon: MapPin, permission: "region:manage" },
  { href: "/rbac", label: "RBAC & Audit", icon: ShieldCheck, permission: "admin:read" },
];

export function Sidebar() {
  const pathname = usePathname();
  const admin = useAuthStore((s) => s.admin);
  const permissions = admin?.permissions ?? [];

  const navItems = ALL_NAV_ITEMS.filter(
    (item) => item.permission === null || permissions.includes(item.permission)
  );

  return (
    <aside className="flex h-full w-60 flex-col border-r border-gray-200 bg-gray-50">
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <span className="text-lg font-bold text-gray-900">RealEstate Admin</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
