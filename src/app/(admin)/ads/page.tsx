"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Pause,
  Play,
  Square,
  BarChart3,
  UploadCloud,
  AlertTriangle,
  Film,
  ImageIcon,
} from "lucide-react";
import {
  useAdCampaigns,
  useCreateAd,
  useUpdateAd,
  useDeleteAd,
  useAdSettings,
  useUpdateAdSettings,
} from "@/lib/hooks/useAds";
import { AdForm, toAdPayload, type AdFormValues } from "@/components/ads/AdForm";
import { MediaUpload } from "@/components/ads/MediaUpload";
import { AdStatsPanel } from "@/components/ads/AdStatsPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatWeekRange } from "@/lib/utils/isoWeek";
import { backendFileUrl } from "@/lib/utils/media";
import type { AdCampaign, AdCampaignStatus } from "@/lib/types";

const SOV_SOFT_CAP = 5;

function StatusPill({ status }: { status: AdCampaignStatus }) {
  if (status === "active") return <Badge variant="success">Active</Badge>;
  if (status === "paused") return <Badge variant="warning">Paused</Badge>;
  if (status === "ended") return <Badge variant="secondary">Ended</Badge>;
  return <Badge variant="outline">Draft</Badge>;
}

function MediaThumb({ campaign }: { campaign: AdCampaign }) {
  const thumb = backendFileUrl(campaign.thumbnail_url ?? campaign.media_url);
  if (campaign.media_type === "image" && thumb) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={thumb}
        alt={campaign.name}
        className="h-10 w-16 rounded border border-neutral-200 object-cover"
      />
    );
  }
  if (campaign.media_type === "video" && campaign.thumbnail_url && thumb) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={thumb}
        alt={campaign.name}
        className="h-10 w-16 rounded border border-neutral-200 object-cover"
      />
    );
  }
  return (
    <div className="flex h-10 w-16 items-center justify-center rounded border border-dashed border-neutral-300 text-neutral-400">
      {campaign.media_type === "video" ? (
        <Film className="h-4 w-4" />
      ) : (
        <ImageIcon className="h-4 w-4" />
      )}
    </div>
  );
}

function PlacementSettingsCard() {
  const { data: settings, isLoading } = useAdSettings();
  const { mutate: saveSettings, isPending } = useUpdateAdSettings();

  const [firstPosition, setFirstPosition] = useState("3");
  const [interval, setInterval] = useState("7");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setFirstPosition(String(settings.first_position));
      setInterval(String(settings.interval));
    }
  }, [settings]);

  const fp = Number(firstPosition);
  const iv = Number(interval);
  const invalid =
    !Number.isInteger(fp) || fp < 1 || !Number.isInteger(iv) || iv < 3;

  const handleSave = () => {
    if (invalid) return;
    saveSettings(
      { first_position: fp, interval: iv },
      {
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => setSaved(false), 2500);
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feed Placement Settings{settings ? ` — ${settings.country_code}` : ""}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label htmlFor="ads-first-position">First ad position</Label>
            <Input
              id="ads-first-position"
              type="number"
              min={1}
              value={firstPosition}
              onChange={(e) => setFirstPosition(e.target.value)}
              className="w-32"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ads-interval">Interval between ads</Label>
            <Input
              id="ads-interval"
              type="number"
              min={3}
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              className="w-32"
              disabled={isLoading}
            />
          </div>
          <Button onClick={handleSave} disabled={isPending || isLoading || invalid}>
            {isPending ? "Saving..." : saved ? "Saved ✓" : "Save Settings"}
          </Button>
        </div>
        {invalid && (
          <p className="text-sm text-red-600">
            First position must be ≥ 1 and interval must be ≥ 3.
          </p>
        )}
        <p className="text-xs text-neutral-500">
          Controls where ads appear in the mobile search feed — applies immediately, no
          app release.
        </p>
      </CardContent>
    </Card>
  );
}

export default function AdsPage() {
  const { data, isLoading, isError } = useAdCampaigns();
  const { mutate: createAd, isPending: creating } = useCreateAd();
  const { mutate: updateAd, isPending: updating } = useUpdateAd();
  const { mutate: deleteAd } = useDeleteAd();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editCampaign, setEditCampaign] = useState<AdCampaign | null>(null);
  const [mediaCampaign, setMediaCampaign] = useState<AdCampaign | null>(null);
  const [statsCampaign, setStatsCampaign] = useState<AdCampaign | null>(null);

  const sorted = useMemo(
    () =>
      [...(data?.items ?? [])].sort(
        (a, b) => a.display_order - b.display_order || a.id - b.id
      ),
    [data?.items]
  );

  const sovOverCap = useMemo(
    () =>
      Object.entries(data?.active_per_governorate ?? {}).filter(
        ([, count]) => count > SOV_SOFT_CAP
      ),
    [data?.active_per_governorate]
  );

  const handleCreate = (values: AdFormValues) => {
    createAd(toAdPayload(values), { onSuccess: () => setShowCreateDialog(false) });
  };

  const handleUpdate = (values: AdFormValues) => {
    if (!editCampaign) return;
    updateAd(
      { id: editCampaign.id, payload: toAdPayload(values) },
      { onSuccess: () => setEditCampaign(null) }
    );
  };

  const setStatus = (campaign: AdCampaign, status: AdCampaignStatus) => {
    updateAd({ id: campaign.id, payload: { status } });
  };

  const handleDelete = (campaign: AdCampaign) => {
    if (window.confirm(`Delete draft campaign "${campaign.name}"?`)) {
      deleteAd(campaign.id);
    }
  };

  /** Move a row up/down by swapping display_order with its neighbour. */
  const handleMove = (index: number, dir: "up" | "down") => {
    const row = sorted[index];
    const neighbour = sorted[dir === "up" ? index - 1 : index + 1];
    if (!row || !neighbour) return;
    if (row.display_order === neighbour.display_order) {
      // Tie (currently broken by id): give the moving row priority explicitly.
      if (dir === "up") {
        updateAd({ id: row.id, payload: { display_order: neighbour.display_order } });
        updateAd({
          id: neighbour.id,
          payload: { display_order: neighbour.display_order + 1 },
        });
      } else {
        updateAd({
          id: row.id,
          payload: { display_order: neighbour.display_order + 1 },
        });
      }
    } else {
      updateAd({ id: row.id, payload: { display_order: neighbour.display_order } });
      updateAd({ id: neighbour.id, payload: { display_order: row.display_order } });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-neutral-900">Ads</h1>
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 rounded bg-neutral-100" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-neutral-900">Ads</h1>
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          Failed to load ad campaigns. Check your permissions (requires ad:manage).
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Ads</h1>
          <p className="text-sm text-neutral-500">
            {data?.total ?? 0} campaigns — in-feed sponsored placements in the mobile
            search feed
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Campaign
        </Button>
      </div>

      {/* Share-of-voice soft warning */}
      {sovOverCap.length > 0 && (
        <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-semibold">Share-of-voice warning</p>
            <p>
              More than {SOV_SOFT_CAP} active campaigns in:{" "}
              {sovOverCap.map(([gov, count]) => `${gov} (${count})`).join(", ")}. Ads in
              these governorates will rotate with low individual visibility.
            </p>
          </div>
        </div>
      )}

      <PlacementSettingsCard />

      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {sorted.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-neutral-500">
              No ad campaigns yet. Create one to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Advertiser</th>
                    <th className="px-4 py-3">Media</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Booked weeks</th>
                    <th className="px-4 py-3 text-right">Impr.</th>
                    <th className="px-4 py-3 text-right">Clicks</th>
                    <th className="px-4 py-3 text-right">CTR</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {sorted.map((campaign, index) => {
                    const ctr =
                      campaign.impressions > 0
                        ? `${((campaign.clicks / campaign.impressions) * 100).toFixed(2)}%`
                        : "—";
                    return (
                      <tr key={campaign.id} className="hover:bg-neutral-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <span className="w-6 text-neutral-500">
                              {campaign.display_order}
                            </span>
                            <div className="flex flex-col">
                              <button
                                type="button"
                                aria-label={`Move ${campaign.name} up`}
                                onClick={() => handleMove(index, "up")}
                                disabled={index === 0 || updating}
                                className="rounded p-0.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-30"
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                aria-label={`Move ${campaign.name} down`}
                                onClick={() => handleMove(index, "down")}
                                disabled={index === sorted.length - 1 || updating}
                                className="rounded p-0.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-30"
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-neutral-900">
                          {campaign.name}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-neutral-700">
                              {campaign.advertiser_name}
                            </span>
                            {campaign.advertiser_type === "pro" ? (
                              <Badge variant="brand">Pro</Badge>
                            ) : (
                              <Badge variant="outline">External</Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <MediaThumb campaign={campaign} />
                        </td>
                        <td className="px-4 py-3">
                          <StatusPill status={campaign.status} />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-neutral-600">
                          {formatWeekRange(
                            campaign.start_year,
                            campaign.start_week,
                            campaign.end_year,
                            campaign.end_week
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-neutral-700">
                          {campaign.impressions.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right text-neutral-700">
                          {campaign.clicks.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right text-neutral-700">{ctr}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditCampaign(campaign)}
                              className="gap-1"
                              title="Edit"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setMediaCampaign(campaign)}
                              className="gap-1"
                              title="Upload media"
                            >
                              <UploadCloud className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setStatsCampaign(campaign)}
                              className="gap-1"
                              title="Stats"
                            >
                              <BarChart3 className="h-3.5 w-3.5" />
                            </Button>
                            {(campaign.status === "draft" ||
                              campaign.status === "paused") && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setStatus(campaign, "active")}
                                disabled={updating}
                                className="gap-1 text-green-700 hover:bg-green-50"
                                title={campaign.status === "draft" ? "Activate" : "Resume"}
                              >
                                <Play className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            {campaign.status === "active" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setStatus(campaign, "paused")}
                                disabled={updating}
                                className="gap-1 text-amber-700 hover:bg-amber-50"
                                title="Pause"
                              >
                                <Pause className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            {(campaign.status === "active" ||
                              campaign.status === "paused") && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setStatus(campaign, "ended")}
                                disabled={updating}
                                className="gap-1 text-neutral-600 hover:bg-neutral-100"
                                title="End campaign"
                              >
                                <Square className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            {campaign.status === "draft" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(campaign)}
                                className="gap-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                                title="Delete draft"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Ad Campaign</DialogTitle>
          </DialogHeader>
          <AdForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreateDialog(false)}
            isPending={creating}
            submitLabel="Create Campaign"
          />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog
        open={!!editCampaign}
        onOpenChange={(open) => !open && setEditCampaign(null)}
      >
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Campaign</DialogTitle>
          </DialogHeader>
          {editCampaign && (
            <AdForm
              defaultValues={editCampaign}
              onSubmit={handleUpdate}
              onCancel={() => setEditCampaign(null)}
              isPending={updating}
              submitLabel="Update Campaign"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Media upload dialog */}
      <Dialog
        open={!!mediaCampaign}
        onOpenChange={(open) => !open && setMediaCampaign(null)}
      >
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Media — {mediaCampaign?.name}
            </DialogTitle>
          </DialogHeader>
          {mediaCampaign && (
            <MediaUpload
              campaign={mediaCampaign}
              onUploaded={() => setMediaCampaign(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Stats dialog */}
      <Dialog
        open={!!statsCampaign}
        onOpenChange={(open) => !open && setStatsCampaign(null)}
      >
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Stats — {statsCampaign?.name}</DialogTitle>
          </DialogHeader>
          {statsCampaign && <AdStatsPanel campaign={statsCampaign} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
