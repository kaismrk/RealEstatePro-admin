"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useUsers, useResetUserPassword, useRevokeSessions } from "@/lib/hooks/useUsers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { UserItem } from "@/lib/types";
import { Search, KeyRound, LogOut } from "lucide-react";

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const size = 20;

  const [confirmReset, setConfirmReset] = useState<UserItem | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState<UserItem | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { data, isLoading } = useUsers({ page, size, search: search || undefined });
  const { mutate: resetPassword, isPending: resetting } = useResetUserPassword();
  const { mutate: revokeSessions, isPending: revoking } = useRevokeSessions();

  const users = (data?.items ?? []) as UserItem[];
  const total = (data as { total?: number } | undefined)?.total ?? 0;

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleReset = () => {
    if (!confirmReset) return;
    resetPassword(confirmReset.id, {
      onSuccess: () => {
        setConfirmReset(null);
        showSuccess(`Password reset for ${confirmReset.email}. Inform the user via a secure channel.`);
      },
    });
  };

  const handleRevoke = () => {
    if (!confirmRevoke) return;
    revokeSessions(
      { userId: confirmRevoke.id, reason: "admin_revocation" },
      {
        onSuccess: () => {
          setConfirmRevoke(null);
          showSuccess(`All sessions revoked for ${confirmRevoke.email}.`);
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500">{total} users total</p>
      </div>

      {successMsg && (
        <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-700">
          {successMsg}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search users..."
          className="pl-9"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded bg-gray-100" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-gray-500">
              No users found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Country</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user: UserItem) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{user.email}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {[user.first_name, user.last_name].filter(Boolean).join(" ") || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{user.country_code}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        {user.is_active ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="destructive">Inactive</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {format(new Date(user.created_at), "MMM d, yyyy")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setConfirmReset(user)}
                            className="gap-1.5"
                          >
                            <KeyRound className="h-3.5 w-3.5" />
                            Reset PW
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setConfirmRevoke(user)}
                            className="gap-1.5 text-red-600 hover:bg-red-50"
                          >
                            <LogOut className="h-3.5 w-3.5" />
                            Revoke
                          </Button>
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

      {/* Pagination */}
      {total > size && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {page} of {Math.ceil(total / size)}
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              Previous
            </Button>
            <Button size="sm" variant="outline" onClick={() => setPage((p) => p + 1)} disabled={users.length < size}>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Reset password confirm */}
      <Dialog open={!!confirmReset} onOpenChange={(open) => !open && setConfirmReset(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Reset password for <strong>{confirmReset?.email}</strong>?
          </p>
          <p className="text-xs text-gray-500">
            Per FINDING-009: the temporary password is not returned in the response. You must deliver it to the user via a secure out-of-band channel.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmReset(null)}>Cancel</Button>
            <Button onClick={handleReset} disabled={resetting}>
              {resetting ? "Resetting..." : "Confirm Reset"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke sessions confirm */}
      <Dialog open={!!confirmRevoke} onOpenChange={(open) => !open && setConfirmRevoke(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Revoke All Sessions</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Revoke all active sessions for <strong>{confirmRevoke?.email}</strong>? They will be signed out from all devices.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmRevoke(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRevoke} disabled={revoking}>
              {revoking ? "Revoking..." : "Revoke Sessions"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
