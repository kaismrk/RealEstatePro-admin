"use client";

import { useState } from "react";
import {
  useRegions,
  useCreateRegion,
  useUpdateRegion,
  useDeleteRegion,
  useSeedTunisia,
} from "@/lib/hooks/useRegions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AdminRegion, RegionLevel } from "@/lib/types";
import { Plus, Pencil, Trash2, Sprout, ChevronRight } from "lucide-react";

const LEVEL_LABELS: Record<RegionLevel, string> = {
  country: "Country",
  region: "Region",
  department: "Department",
  city: "City",
};

const LEVEL_COLORS: Record<RegionLevel, string> = {
  country: "bg-primary-50 text-primary-700",
  region: "bg-purple-100 text-purple-700",
  department: "bg-green-100 text-green-700",
  city: "bg-orange-100 text-orange-700",
};

interface RegionFormData {
  name: string;
  code: string;
  level: RegionLevel;
  country_code: string;
  parent_id: number | null;
}

export default function RegionsPage() {
  const [countryFilter, setCountryFilter] = useState("TN");
  const [levelFilter, setLevelFilter] = useState<string>("");
  const [parentIdFilter, setParentIdFilter] = useState<number | undefined>(undefined);

  const { data, isLoading, isError } = useRegions({
    country_code: countryFilter || undefined,
    level: levelFilter || undefined,
    parent_id: parentIdFilter,
    size: 100,
  });

  const { mutate: createRegion, isPending: creating } = useCreateRegion();
  const { mutate: updateRegion, isPending: updating } = useUpdateRegion();
  const { mutate: deleteRegion, isPending: deleting } = useDeleteRegion();
  const { mutate: seedTN, isPending: seeding } = useSeedTunisia();

  const [showCreate, setShowCreate] = useState(false);
  const [editRegion, setEditRegion] = useState<AdminRegion | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<AdminRegion | null>(null);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  const [form, setForm] = useState<RegionFormData>({
    name: "",
    code: "",
    level: "country",
    country_code: "TN",
    parent_id: null,
  });

  const handleCreateOpen = () => {
    setForm({ name: "", code: "", level: "country", country_code: countryFilter || "TN", parent_id: null });
    setShowCreate(true);
  };

  const handleCreate = () => {
    createRegion(
      { ...form, code: form.code || undefined, parent_id: form.parent_id || undefined },
      { onSuccess: () => setShowCreate(false) }
    );
  };

  const handleUpdate = () => {
    if (!editRegion) return;
    updateRegion(
      { id: editRegion.id, payload: { name: form.name, code: form.code || undefined } },
      { onSuccess: () => setEditRegion(null) }
    );
  };

  const handleEditOpen = (region: AdminRegion) => {
    setEditRegion(region);
    setForm({ name: region.name, code: region.code ?? "", level: region.level, country_code: region.country_code, parent_id: region.parent_id });
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    deleteRegion(deleteConfirm.id, { onSuccess: () => setDeleteConfirm(null) });
  };

  const handleSeedTN = () => {
    seedTN(undefined, {
      onSuccess: (res) => {
        const msg = (res.data as { message?: string })?.message ?? "Seeded successfully";
        setSeedMessage(msg);
        setTimeout(() => setSeedMessage(null), 5000);
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Geo Regions</h1>
          <p className="text-sm text-neutral-500">{data?.total ?? 0} regions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleSeedTN}
            disabled={seeding}
            className="gap-2 text-green-700 border-green-300 hover:bg-green-50"
          >
            <Sprout className="h-4 w-4" />
            {seeding ? "Seeding..." : "Seed Tunisia (TN)"}
          </Button>
          <Button onClick={handleCreateOpen} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Region
          </Button>
        </div>
      </div>

      {seedMessage && (
        <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-700">
          {seedMessage}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Label className="text-sm text-neutral-600">Country:</Label>
          <Input
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value.toUpperCase())}
            className="w-20 uppercase"
            maxLength={3}
            placeholder="TN"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm text-neutral-600">Level:</Label>
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All levels</SelectItem>
              <SelectItem value="country">Country</SelectItem>
              <SelectItem value="region">Region</SelectItem>
              <SelectItem value="department">Department</SelectItem>
              <SelectItem value="city">City</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { setCountryFilter(""); setLevelFilter(""); setParentIdFilter(undefined); }}
          className="text-neutral-500"
        >
          Clear filters
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Region Hierarchy</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded bg-neutral-100" />
              ))}
            </div>
          ) : isError ? (
            <div className="p-4">
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
                Failed to load regions. This endpoint requires REGION_MANAGE permission (SUPER_ADMIN only).
              </div>
            </div>
          ) : data?.items.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-neutral-500">
              No regions found. Use &quot;Seed Tunisia&quot; to bootstrap the hierarchy.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Level</th>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Country</th>
                    <th className="px-4 py-3">Parent ID</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {data?.items.map((region: AdminRegion) => (
                    <tr key={region.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {region.parent_id && (
                            <ChevronRight className="h-3.5 w-3.5 text-neutral-300" />
                          )}
                          <span className="font-medium text-neutral-900">{region.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            LEVEL_COLORS[region.level]
                          }`}
                        >
                          {LEVEL_LABELS[region.level]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-600">{region.code ?? "—"}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{region.country_code}</Badge>
                      </td>
                      <td className="px-4 py-3 text-neutral-500">
                        {region.parent_id ? (
                          <button
                            onClick={() => setParentIdFilter(region.parent_id ?? undefined)}
                            className="text-primary-500 hover:underline"
                          >
                            #{region.parent_id}
                          </button>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditOpen(region)}
                            className="gap-1.5"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteConfirm(region)}
                            disabled={deleting}
                            className="gap-1.5 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Region</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tunis" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Level *</Label>
                <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v as RegionLevel })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="country">Country</SelectItem>
                    <SelectItem value="region">Region</SelectItem>
                    <SelectItem value="department">Department</SelectItem>
                    <SelectItem value="city">City</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Country code *</Label>
                <Input value={form.country_code} onChange={(e) => setForm({ ...form, country_code: e.target.value.toUpperCase() })} maxLength={3} className="uppercase" placeholder="TN" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Code (optional)</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="TUN" />
              </div>
              <div className="space-y-2">
                <Label>Parent ID (optional)</Label>
                <Input
                  type="number"
                  value={form.parent_id ?? ""}
                  onChange={(e) => setForm({ ...form, parent_id: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="Leave empty for root"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating || !form.name || !form.country_code}>
              {creating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editRegion} onOpenChange={(open) => !open && setEditRegion(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Region</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Code (optional)</Label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            </div>
            <p className="text-xs text-neutral-500">Level and country code cannot be changed.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRegion(null)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={updating || !form.name}>
              {updating ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Region</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-neutral-600">
            Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>? This will fail if the region has children.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
