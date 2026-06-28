"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Database,
  CheckCircle2,
  Hourglass,
  Percent,
  ChevronLeft,
  ChevronRight,
  Search,
  Globe,
  Phone,
  Mail,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useProspects,
  useProspectStats,
} from "@/lib/hooks/useProspects";
import type { ProspectStatus, ProspectType, RealEstateProspect } from "@/lib/types";

const TYPE_LABEL: Record<string, string> = {
  agency: "Agency",
  agent: "Agent",
  developer_licensed: "Developer (licensed)",
  developer: "Developer",
  promoter: "Promoter",
};

function KpiCard({
  title,
  value,
  icon: Icon,
  hint,
  tone = "default",
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  hint?: string;
  tone?: "default" | "success" | "warning";
}) {
  const toneText =
    tone === "success"
      ? "text-green-700"
      : tone === "warning"
      ? "text-amber-700"
      : "text-neutral-900";
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-neutral-500">{title}</CardTitle>
        <Icon className="h-4 w-4 text-neutral-400" />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${toneText}`}>{value}</div>
        {hint ? <p className="mt-1 text-xs text-neutral-500">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ s }: { s: ProspectStatus }) {
  if (s === "claimed") return <Badge variant="success">Subscribed</Badge>;
  if (s === "pending_verification") return <Badge variant="warning">Pending</Badge>;
  if (s === "unclaimed") return <Badge>Unclaimed</Badge>;
  if (s === "dismissed") return <Badge variant="destructive">Dismissed</Badge>;
  return <Badge>Merged</Badge>;
}

function DetailDialog({
  prospect,
  onClose,
}: {
  prospect: RealEstateProspect | null;
  onClose: () => void;
}) {
  if (!prospect) return null;
  return (
    <Dialog open={!!prospect} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {prospect.name}{" "}
            <span className="text-sm font-normal text-neutral-500">
              · {TYPE_LABEL[prospect.type] ?? prospect.type}
              {prospect.governorate ? ` · ${prospect.governorate}` : ""}
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs uppercase text-neutral-400">Subscriber status</div>
              <div className="mt-1"><StatusBadge s={prospect.status} /></div>
            </div>
            <div>
              <div className="text-xs uppercase text-neutral-400">Origin</div>
              <div className="mt-1 text-neutral-900">{prospect.origin}</div>
            </div>
            {prospect.email ? (
              <div>
                <div className="text-xs uppercase text-neutral-400">Email</div>
                <a href={`mailto:${prospect.email}`} className="mt-1 inline-flex items-center gap-1 text-primary-600 hover:underline">
                  <Mail className="h-3 w-3" />
                  {prospect.email}
                </a>
              </div>
            ) : null}
            {prospect.website ? (
              <div>
                <div className="text-xs uppercase text-neutral-400">Website</div>
                <a href={prospect.website.startsWith("http") ? prospect.website : `https://${prospect.website}`}
                   target="_blank" rel="noreferrer"
                   className="mt-1 inline-flex items-center gap-1 text-primary-600 hover:underline">
                  <Globe className="h-3 w-3" />
                  {prospect.website}
                </a>
              </div>
            ) : null}
            <div className="col-span-2">
              <div className="text-xs uppercase text-neutral-400">Phones</div>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-neutral-900">
                {prospect.phones && prospect.phones.length > 0 ? (
                  prospect.phones.map((p, i) => (
                    <span key={i} className="inline-flex items-center gap-1">
                      <Phone className="h-3 w-3 text-neutral-400" />
                      {p}
                    </span>
                  ))
                ) : (
                  <span className="text-neutral-400">—</span>
                )}
              </div>
            </div>
            {prospect.city ? (
              <div>
                <div className="text-xs uppercase text-neutral-400">City</div>
                <div className="mt-1 text-neutral-900">{prospect.city}</div>
              </div>
            ) : null}
            {prospect.mubawab_customer ? (
              <div>
                <div className="text-xs uppercase text-neutral-400">Mubawab customer?</div>
                <div className="mt-1 text-neutral-900">{prospect.mubawab_customer}</div>
              </div>
            ) : null}
          </div>
          {prospect.status === "claimed" ? (
            <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-900">
              Claimed by user #{prospect.claimed_by_user_id}
              {prospect.claimed_by_agency_id ? `, agency #${prospect.claimed_by_agency_id}` : ""}
              {prospect.claimed_at
                ? ` on ${format(new Date(prospect.claimed_at), "PPpp")}`
                : null}
            </div>
          ) : null}
          {prospect.source_url ? (
            <a
              href={prospect.source_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-primary-600"
            >
              <ExternalLink className="h-3 w-3" />
              Original source
            </a>
          ) : null}
          {prospect.notes ? (
            <div>
              <div className="text-xs uppercase text-neutral-400">Notes</div>
              <p className="mt-1 whitespace-pre-wrap text-neutral-900">{prospect.notes}</p>
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

export default function ProspectsPage() {
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [typeFilter, setTypeFilter] = useState<ProspectType | "">("");
  const [statusFilter, setStatusFilter] = useState<ProspectStatus | "">("");
  const [page, setPage] = useState(1);
  const [detailTarget, setDetailTarget] = useState<RealEstateProspect | null>(null);
  const size = 30;

  // Debounce the search field so we don't refetch on every keystroke
  useDebounce(() => setSearchDebounced(search), 250, [search]);

  const { data: stats, isLoading: statsLoading } = useProspectStats();
  const { data, isLoading, isError } = useProspects({
    country_code: "TN",
    search: searchDebounced || undefined,
    type: typeFilter || undefined,
    status: statusFilter || undefined,
    page,
    size,
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / size)) : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Prospect directory</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Pre-loaded directory of Tunisian agencies and developers (816 records)
          shown in the public Partner Profile Setup wizard. The <strong>Subscribed</strong>
          flag indicates whether an applicant has successfully claimed the profile via signup.
        </p>
      </div>

      {/* KPI row — the conversion / subscriber view at the top */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total prospects"
          value={statsLoading ? "…" : stats?.total ?? 0}
          icon={Database}
        />
        <KpiCard
          title="Subscribed"
          value={statsLoading ? "…" : stats?.subscribed_count ?? 0}
          icon={CheckCircle2}
          tone="success"
          hint={`= status 'claimed' (signup activated)`}
        />
        <KpiCard
          title="Pending verification"
          value={statsLoading ? "…" : stats?.by_status?.pending_verification ?? 0}
          icon={Hourglass}
          tone="warning"
          hint="= signup submitted, awaiting admin review"
        />
        <KpiCard
          title="Conversion rate"
          value={statsLoading ? "…" : `${(stats?.subscribed_pct ?? 0).toFixed(1)}%`}
          icon={Percent}
          hint="Subscribed ÷ Total"
        />
      </div>

      {/* Filters */}
      <div className="space-y-3 rounded-md border border-neutral-200 bg-white px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name…"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase text-neutral-400">Type</span>
          {(["", "agency", "developer_licensed", "developer", "agent"] as const).map((t) => (
            <button
              key={t || "all-types"}
              type="button"
              onClick={() => { setTypeFilter(t); setPage(1); }}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                typeFilter === t
                  ? "bg-primary-500 text-white"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              {t === "" ? "All" : TYPE_LABEL[t] ?? t}
            </button>
          ))}
          <span className="mx-2 h-4 w-px bg-neutral-300" />
          <span className="text-xs uppercase text-neutral-400">Subscriber</span>
          {(["", "unclaimed", "pending_verification", "claimed"] as const).map((s) => (
            <button
              key={s || "all-status"}
              type="button"
              onClick={() => { setStatusFilter(s as ProspectStatus | ""); setPage(1); }}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                statusFilter === s
                  ? "bg-primary-500 text-white"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              {s === "" ? "All" :
                s === "claimed" ? "Subscribed" :
                s === "pending_verification" ? "Pending" :
                "Unclaimed"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 rounded bg-neutral-100" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          Couldn&apos;t load prospects.
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="rounded-md border border-dashed border-neutral-300 bg-neutral-50 px-4 py-10 text-center text-sm text-neutral-500">
          No prospects match the current filters.
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-neutral-200 bg-white">
          <table className="w-full">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Governorate</th>
                <th className="px-4 py-2">Contact</th>
                <th className="px-4 py-2">Subscriber</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-sm">
              {data.items.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-50">
                  <td
                    className="cursor-pointer px-4 py-3 font-medium text-neutral-900 hover:text-primary-600"
                    onClick={() => setDetailTarget(p)}
                  >
                    {p.name}
                    {p.city ? (
                      <div className="text-xs text-neutral-500">{p.city}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{TYPE_LABEL[p.type] ?? p.type}</td>
                  <td className="px-4 py-3 text-neutral-700">{p.governorate ?? "—"}</td>
                  <td className="px-4 py-3 text-neutral-700">
                    {p.phones?.[0] ?? p.email ?? "—"}
                  </td>
                  <td className="px-4 py-3"><StatusBadge s={p.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => setDetailTarget(p)}>
                      View
                    </Button>
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
            <span>{page} / {totalPages}</span>
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

      <DetailDialog prospect={detailTarget} onClose={() => setDetailTarget(null)} />
    </div>
  );
}

// Local minimal debounce hook (avoids an extra dependency)
import { useEffect } from "react";
function useDebounce(fn: () => void, delay: number, deps: unknown[]) {
  useEffect(() => {
    const t = setTimeout(fn, delay);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
