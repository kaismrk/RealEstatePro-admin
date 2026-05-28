"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { adminApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminAccount, AuditLog } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, ShieldOff, RefreshCw } from "lucide-react";

function RoleBadge({ role }: { role: string }) {
  if (role === "SUPER_ADMIN") return <Badge variant="destructive">Super Admin</Badge>;
  if (role === "PLATFORM_ADMIN") return <Badge>Platform Admin</Badge>;
  return <Badge variant="secondary">Operations Admin</Badge>;
}

export default function RbacPage() {
  const [auditAction, setAuditAction] = useState("");
  const [auditOffset, setAuditOffset] = useState(0);
  const AUDIT_LIMIT = 50;

  const qc = useQueryClient();

  const { data: admins, isLoading: adminsLoading } = useQuery({
    queryKey: ["admin", "admins"],
    queryFn: async () => {
      const res = await adminApi.getAdmins();
      return res.data as AdminAccount[];
    },
  });

  const { data: auditLogs, isLoading: auditLoading } = useQuery({
    queryKey: ["admin", "audit-logs", auditAction, auditOffset],
    queryFn: async () => {
      const res = await adminApi.getAuditLogs({
        action: auditAction || undefined,
        limit: AUDIT_LIMIT,
        offset: auditOffset,
      });
      return res.data as AuditLog[];
    },
  });

  const { mutate: deactivate, isPending: deactivating } = useMutation({
    mutationFn: (id: number) => adminApi.deactivateAdmin(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin", "admins"] }),
  });

  const { mutate: activate, isPending: activating } = useMutation({
    mutationFn: (id: number) => adminApi.activateAdmin(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin", "admins"] }),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">RBAC & Audit Log</h1>
        <p className="text-sm text-neutral-500">Manage admin accounts and view the audit trail</p>
      </div>

      {/* Admin accounts */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Accounts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {adminsLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded bg-neutral-100" />
              ))}
            </div>
          ) : (admins?.length ?? 0) === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-neutral-500">
              No admin accounts found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Scope</th>
                    <th className="px-4 py-3">Country</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {admins?.map((acct: AdminAccount) => (
                    <tr key={acct.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 font-medium text-neutral-900">{acct.user_email}</td>
                      <td className="px-4 py-3 text-neutral-600">
                        {[acct.user_first_name, acct.user_last_name].filter(Boolean).join(" ") || "—"}
                      </td>
                      <td className="px-4 py-3"><RoleBadge role={acct.admin_role} /></td>
                      <td className="px-4 py-3 text-neutral-600">{acct.admin_scope}</td>
                      <td className="px-4 py-3">
                        {acct.country_code ? (
                          <Badge variant="outline">{acct.country_code}</Badge>
                        ) : (
                          <span className="text-neutral-400">Global</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {acct.is_admin_active ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {acct.is_admin_active ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deactivate(acct.id)}
                              disabled={deactivating}
                              className="gap-1.5 text-red-600 hover:bg-red-50"
                            >
                              <ShieldOff className="h-3.5 w-3.5" />
                              Deactivate
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => activate(acct.id)}
                              disabled={activating}
                              className="gap-1.5 text-green-600 hover:bg-green-50"
                            >
                              <ShieldCheck className="h-3.5 w-3.5" />
                              Activate
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit log */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Audit Log</CardTitle>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Label className="text-sm text-neutral-500">Filter by action:</Label>
                <Input
                  value={auditAction}
                  onChange={(e) => { setAuditAction(e.target.value); setAuditOffset(0); }}
                  placeholder="e.g. listing_approved"
                  className="w-44"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {auditLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded bg-neutral-100" />
              ))}
            </div>
          ) : (auditLogs?.length ?? 0) === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-neutral-500">
              No audit log entries found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-100 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">Admin</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Target</th>
                      <th className="px-4 py-3">Country</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {auditLogs?.map((log: AuditLog) => (
                      <tr key={log.id} className="hover:bg-neutral-50">
                        <td className="px-4 py-3 text-neutral-500 whitespace-nowrap">
                          {format(new Date(log.timestamp), "MMM d, HH:mm:ss")}
                        </td>
                        <td className="px-4 py-3 text-neutral-700">Admin #{log.admin_user_id}</td>
                        <td className="px-4 py-3">
                          <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-800">
                            {log.action}
                          </code>
                        </td>
                        <td className="px-4 py-3 text-neutral-600">
                          {log.target_type} {log.target_id ? `#${log.target_id}` : ""}
                        </td>
                        <td className="px-4 py-3">
                          {log.country_code ? (
                            <Badge variant="outline">{log.country_code}</Badge>
                          ) : (
                            <span className="text-neutral-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-3">
                <p className="text-xs text-neutral-500">
                  Showing {auditOffset + 1}–{auditOffset + (auditLogs?.length ?? 0)}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setAuditOffset((o) => Math.max(0, o - AUDIT_LIMIT))}
                    disabled={auditOffset === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setAuditOffset((o) => o + AUDIT_LIMIT)}
                    disabled={(auditLogs?.length ?? 0) < AUDIT_LIMIT}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
