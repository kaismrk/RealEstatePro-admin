"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/api";
import { useAdStats } from "@/lib/hooks/useAds";
import type { AdCampaign } from "@/lib/types";

function pct(v: number | null | undefined): string {
  if (v == null) return "—";
  return `${(v * 100).toFixed(2)}%`;
}

function KpiTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-neutral-900">{value}</p>
    </div>
  );
}

interface AdStatsPanelProps {
  campaign: AdCampaign;
}

export function AdStatsPanel({ campaign }: AdStatsPanelProps) {
  const { data, isLoading, isError } = useAdStats(campaign.id);
  const [downloading, setDownloading] = useState(false);

  const handleCsvDownload = async () => {
    setDownloading(true);
    try {
      const res = await adminApi.downloadAdStatsCsv(campaign.id);
      const url = URL.createObjectURL(
        new Blob([res.data as BlobPart], { type: "text/csv" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `ad-campaign-${campaign.id}-stats.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-14 rounded bg-neutral-100" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
        Failed to load stats for this campaign.
      </div>
    );
  }

  const { totals, daily, weekly } = data;
  const isVideo = campaign.media_type === "video";
  const maxDailyImpressions = Math.max(1, ...daily.map((d) => d.impressions));

  return (
    <div className="space-y-6">
      {/* KPI tiles */}
      <div className={`grid gap-3 ${isVideo ? "grid-cols-5" : "grid-cols-4"}`}>
        <KpiTile label="Impressions" value={totals.impressions.toLocaleString()} />
        <KpiTile label="Unique reach" value={totals.unique_sessions.toLocaleString()} />
        <KpiTile label="Clicks" value={totals.clicks.toLocaleString()} />
        <KpiTile label="CTR" value={pct(totals.ctr)} />
        {isVideo && <KpiTile label="VTR" value={pct(totals.vtr)} />}
      </div>

      {isVideo && (
        <div className="grid grid-cols-4 gap-3">
          <KpiTile label="Video 25%" value={totals.video_q25.toLocaleString()} />
          <KpiTile label="Video 50%" value={totals.video_q50.toLocaleString()} />
          <KpiTile label="Video 75%" value={totals.video_q75.toLocaleString()} />
          <KpiTile label="Video 100%" value={totals.video_q100.toLocaleString()} />
        </div>
      )}

      {/* Daily series — simple CSS bar list (no chart lib in this repo) */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-neutral-900">Daily impressions</h3>
        {daily.length === 0 ? (
          <p className="text-sm text-neutral-500">No events recorded yet.</p>
        ) : (
          <div className="space-y-1.5">
            {daily.map((point) => (
              <div key={point.date} className="flex items-center gap-2 text-xs">
                <span className="w-20 shrink-0 font-mono text-neutral-500">{point.date}</span>
                <div className="h-4 flex-1 overflow-hidden rounded-sm bg-neutral-100">
                  <div
                    className="h-full rounded-sm bg-primary-500"
                    style={{
                      width: `${(point.impressions / maxDailyImpressions) * 100}%`,
                    }}
                  />
                </div>
                <span className="w-24 shrink-0 text-right text-neutral-600">
                  {point.impressions.toLocaleString()} · {point.clicks} clk
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Per-booked-week table (invoice periods) */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-neutral-900">
          Booked weeks (invoice periods)
        </h3>
        <div className="overflow-x-auto rounded-md border border-neutral-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                <th className="px-3 py-2">Week</th>
                <th className="px-3 py-2 text-right">Impressions</th>
                <th className="px-3 py-2 text-right">Clicks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {weekly.map((w) => (
                <tr key={w.week_label}>
                  <td className="px-3 py-2 font-medium text-neutral-900">{w.week_label}</td>
                  <td className="px-3 py-2 text-right text-neutral-700">
                    {w.impressions.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-right text-neutral-700">{w.clicks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={handleCsvDownload}
          disabled={downloading}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          {downloading ? "Preparing..." : "Download CSV"}
        </Button>
      </div>
    </div>
  );
}
