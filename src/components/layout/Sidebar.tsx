"use client";

import Link from "next/link";
import Image from "next/image";
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
    <aside className="flex h-full w-60 flex-col border-r border-neutral-200 bg-white">
      {/* Brand strip */}
      <div className="h-1 bg-brand-gradient" />

      <div className="flex h-16 items-center gap-3 border-b border-neutral-200 px-5">
        <Image
          src="/hovioo-logo-violet.png"
          alt="hovioo"
          width={96}
          height={32}
          priority
          className="h-7 w-auto"
        />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
          Admin
        </span>
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
                      ? "bg-primary-500 text-white shadow-sm"
                      : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
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
