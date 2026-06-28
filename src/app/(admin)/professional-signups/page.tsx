"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Briefcase,
  Building2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  useActivateSignup,
  useProfessionalSignupStats,
  useProfessionalSignups,
  useRejectSignup,
} from "@/lib/hooks/useProfessionalSignups";
import type { ProfessionalSignup, SignupStatus, SignupType } from "@/lib/types";

const TYPE_LABEL: Record<SignupType, string> = {
  agent: "Independent agent",
  agency: "Real-estate agency",
  promoter: "Real-estate promoter",
};

function StatusBadge({ status }: { status: SignupStatus }) {
  if (status === "pending") return <Badge variant="warning">Pending</Badge>;
  if (status === "activated") return <Badge variant="success">Activated</Badge>;
  if (status === "rejected") return <Badge variant="destructive">Rejected</Badge>;
  return <Badge>Duplicate</Badge>;
}

function KpiCard({
  title,
  value,
  icon: Icon,
  hint,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  hint?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-neutral-500">{title}</CardTitle>
        <Icon className="h-4 w-4 text-neutral-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-neutral-900">{value}</div>
        {hint ? <p className="mt-1 text-xs text-neutral-500">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

function displayName(s: ProfessionalSignup): string {
  const p = s.profile ?? {};
  return (
    p.companyName ||
    [p.managerFirst, p.managerLast].filter(Boolean).join(" ") ||
    [p.firstName, p.lastName].filter(Boolean).join(" ") ||
    s.email
  );
}

function RejectDialog({
  open,
  onClose,
  onConfirm,
  isPending,
  who,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isPending: boolean;
  who: string;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError("Please provide a reason — the applicant will see it in their email");
      return;
    }
    setError("");
    onConfirm(reason.trim());
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject {who}&apos;s application?</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Label htmlFor="reject-reason">
            Reason (shown to the applicant)
          </Label>
          <Input
            id="reject-reason"
            placeholder="e.g. Could not verify FNPI agrément"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isPending}
          />
          {error ? <p className="text-xs text-red-600">{error}</p> : null}
          <p className="text-xs text-neutral-500">
            The linked prospect (if any) will be released back to unclaimed so
            other applicants can try.
          </p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isPending}>
            {isPending ? "Rejecting…" : "Reject application"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DetailDialog({
  signup,
  onClose,
}: {
  signup: ProfessionalSignup | null;
  onClose: () => void;
}) {
  if (!signup) return null;
  const profile = signup.profile ?? {};
  const entries = Object.entries(profile).filter(([, v]) => v !== "" && v != null);
  return (
    <Dialog open={!!signup} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {displayName(signup)}{" "}
            <span className="text-sm font-normal text-neutral-500">
              · {TYPE_LABEL[signup.type]} · {signup.country_code}
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs uppercase text-neutral-400">Status</div>
              <div className="mt-1">
                <StatusBadge status={signup.status} />
              </div>
            </div>
            <div>
              <div className="text-xs uppercase text-neutral-400">Submitted</div>
              <div className="mt-1 text-neutral-900">
                {format(new Date(signup.created_at), "PPpp")}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase text-neutral-400">Email</div>
              <div className="mt-1 text-neutral-900">{signup.email}</div>
            </div>
            <div>
              <div className="text-xs uppercase text-neutral-400">Linked prospect</div>
              <div className="mt-1 text-neutral-900">
                {signup.prospect_id ? (
                  <a
                    href={`/prospects?id=${signup.prospect_id}`}
                    className="text-primary-600 hover:underline"
                  >
                    #{signup.prospect_id}
                  </a>
                ) : (
                  <span className="text-neutral-400">— (manual verification)</span>
                )}
              </div>
            </div>
          </div>
          <div>
            <div className="mb-1 text-xs uppercase text-neutral-400">Submitted profile</div>
            <div className="overflow-hidden rounded-md border border-neutral-200">
              <table className="w-full">
                <tbody className="divide-y divide-neutral-200 text-sm">
                  {entries.map(([k, v]) => (
                    <tr key={k}>
                      <td className="w-40 bg-neutral-50 px-3 py-2 text-xs font-semibold uppercase text-neutral-500">
                        {k}
                      </td>
                      <td className="px-3 py-2 text-neutral-900">{String(v)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {signup.status === "rejected" && signup.rejected_reason ? (
            <div>
              <div className="mb-1 text-xs uppercase text-neutral-400">Rejection reason</div>
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
                {signup.rejected_reason}
              </div>
            </div>
          ) : null}
          {signup.status === "activated" ? (
            <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-900">
              Activated · created user #{signup.created_user_id}
              {signup.created_agency_id ? `, agency #${signup.created_agency_id}` : ""}
              {signup.created_agent_id ? `, agent #${signup.created_agent_id}` : ""}
              {signup.activated_at
                ? ` on ${format(new Date(signup.activated_at), "PPpp")}`
                : null}
            </div>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ProfessionalSignupsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<SignupStatus | "">("pending");
  const [typeFilter, setTypeFilter] = useState<SignupType | "">("");
  const [rejectTarget, setRejectTarget] = useState<ProfessionalSignup | null>(null);
  const [detailTarget, setDetailTarget] = useState<ProfessionalSignup | null>(null);
  const size = 25;

  const { data: stats, isLoading: statsLoading } = useProfessionalSignupStats();
  const { data, isLoading, isError } = useProfessionalSignups({
    status: statusFilter || undefined,
    type: typeFilter || undefined,
    page,
    size,
  });
  const { mutate: activate, isPending: activating } = useActivateSignup();
  const { mutate: reject, isPending: rejecting } = useRejectSignup();

  const totalPages = data ? Math.max(1, Math.ceil(data.total / size)) : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Professional signups</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Applications from the landing-site Partner Profile Setup wizard.
          Activate to create the User + Agency/Agent and link the prospect, or
          reject with a reason (the applicant gets emailed either way).
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Pending approval"
          value={statsLoading ? "…" : stats?.pending ?? 0}
          icon={Clock}
          hint={
            stats
              ? `${stats.pending_by_type.agency ?? 0} agencies · ${stats.pending_by_type.promoter ?? 0} promoters · ${stats.pending_by_type.agent ?? 0} agents`
              : undefined
          }
        />
        <KpiCard
          title="Active agencies"
          value={statsLoading ? "…" : stats?.activated_by_type.agency ?? 0}
          icon={Briefcase}
        />
        <KpiCard
          title="Active promoters"
          value={statsLoading ? "…" : stats?.activated_by_type.promoter ?? 0}
          icon={Building2}
        />
        <KpiCard
          title="Active agents"
          value={statsLoading ? "…" : stats?.activated_by_type.agent ?? 0}
          icon={UserCheck}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 rounded-md border border-neutral-200 bg-white px-4 py-3">
        <span className="text-xs uppercase text-neutral-400">Status</span>
        {(["pending", "activated", "rejected", ""] as const).map((s) => (
          <button
            key={s || "all"}
            type="button"
            onClick={() => {
              setStatusFilter(s);
              setPage(1);
            }}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              statusFilter === s
                ? "bg-primary-500 text-white"
                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
            }`}
          >
            {s || "All"}
          </button>
        ))}
        <span className="mx-2 h-4 w-px bg-neutral-300" />
        <span className="text-xs uppercase text-neutral-400">Type</span>
        {(["agency", "agent", "promoter", ""] as const).map((t) => (
          <button
            key={t || "all-types"}
            type="button"
            onClick={() => {
              setTypeFilter(t);
              setPage(1);
            }}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              typeFilter === t
                ? "bg-primary-500 text-white"
                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
            }`}
          >
            {t || "All"}
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded bg-neutral-100" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          Couldn&apos;t load signups.
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="rounded-md border border-dashed border-neutral-300 bg-neutral-50 px-4 py-10 text-center text-sm text-neutral-500">
          No applications match the current filters.
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-neutral-200 bg-white">
          <table className="w-full">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-2">Applicant</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Submitted</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-sm">
              {data.items.map((s) => (
                <tr key={s.id} className="hover:bg-neutral-50">
                  <td
                    className="cursor-pointer px-4 py-3 font-medium text-neutral-900 hover:text-primary-600"
                    onClick={() => setDetailTarget(s)}
                  >
                    {displayName(s)}
                    {s.profile?.governorate ? (
                      <div className="text-xs text-neutral-500">
                        {s.profile.governorate}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">
                    {TYPE_LABEL[s.type]}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{s.email}</td>
                  <td className="px-4 py-3 text-neutral-500">
                    {format(new Date(s.created_at), "MMM d, HH:mm")}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {s.status === "pending" ? (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={activating}
                            onClick={() => activate(s.id)}
                            title="Activate"
                          >
                            <CheckCircle2 className="mr-1 h-4 w-4 text-green-600" />
                            Activate
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setRejectTarget(s)}
                            title="Reject"
                          >
                            <XCircle className="mr-1 h-4 w-4 text-red-600" />
                            Reject
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDetailTarget(s)}
                        >
                          View
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

      {data && data.total > size && (
        <div className="flex items-center justify-between text-sm text-neutral-600">
          <span>
            {(page - 1) * size + 1}–{Math.min(page * size, data.total)} of {data.total}
          </span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span>
              {page} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <RejectDialog
        open={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        isPending={rejecting}
        who={rejectTarget ? displayName(rejectTarget) : ""}
        onConfirm={(reason) => {
          if (!rejectTarget) return;
          reject(
            { id: rejectTarget.id, reason },
            { onSuccess: () => setRejectTarget(null) }
          );
        }}
      />
      <DetailDialog signup={detailTarget} onClose={() => setDetailTarget(null)} />
    </div>
  );
}
