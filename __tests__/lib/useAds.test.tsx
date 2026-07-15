import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useAdCampaigns,
  useCreateAd,
  useUpdateAd,
  useDeleteAd,
  useAdSettings,
  useUpdateAdSettings,
  useAdStats,
  useUploadAdMedia,
} from "@/lib/hooks/useAds";

vi.mock("@/lib/api", () => ({
  adminApi: {
    getAdCampaigns: vi.fn(),
    createAdCampaign: vi.fn(),
    updateAdCampaign: vi.fn(),
    deleteAdCampaign: vi.fn(),
    getAdSettings: vi.fn(),
    updateAdSettings: vi.fn(),
    uploadAdMedia: vi.fn(),
    getAdStats: vi.fn(),
    downloadAdStatsCsv: vi.fn(),
  },
}));

import { adminApi } from "@/lib/api";

const mockCampaign = {
  id: 12,
  name: "BIAT July push",
  advertiser_type: "external",
  advertiser_name: "Best Bank",
  advertiser_user_id: null,
  media_type: "image",
  media_url: "/uploads/ads/12/creative.jpg",
  thumbnail_url: null,
  title: "0% intro rate",
  body: null,
  cta_label: "En savoir plus",
  cta_action: "web",
  cta_value: "https://bank.tn",
  status: "active",
  display_order: 0,
  country_code: "TN",
  target_governorate: null,
  target_property_type: null,
  target_transaction_type: null,
  start_year: 2026,
  start_week: 30,
  end_year: 2026,
  end_week: 33,
  starts_at: "2026-07-19T23:00:00",
  ends_at: "2026-08-16T22:59:59.999999",
  max_impressions: null,
  created_by: 1,
  created_at: "2026-07-16T00:00:00Z",
  impressions: 340,
  clicks: 18,
};

let queryClient: QueryClient;

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("useAds hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
  });

  it("useAdCampaigns fetches the campaign list with filters", async () => {
    vi.mocked(adminApi.getAdCampaigns).mockResolvedValue({
      data: {
        total: 1,
        items: [mockCampaign],
        active_per_governorate: { Ariana: 6 },
      },
    } as never);

    const { result } = renderHook(() => useAdCampaigns({ status: "active" }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(adminApi.getAdCampaigns).toHaveBeenCalledWith({ status: "active" });
    expect(result.current.data?.items[0].name).toBe("BIAT July push");
    expect(result.current.data?.active_per_governorate.Ariana).toBe(6);
  });

  it("useCreateAd posts the payload and invalidates the ads cache", async () => {
    vi.mocked(adminApi.createAdCampaign).mockResolvedValue({
      data: mockCampaign,
    } as never);
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateAd(), { wrapper });
    result.current.mutate({
      name: "BIAT July push",
      advertiser_type: "external",
      advertiser_name: "Best Bank",
      media_type: "image",
      title: "0% intro rate",
      start_year: 2026,
      start_week: 30,
      end_year: 2026,
      end_week: 33,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(adminApi.createAdCampaign).toHaveBeenCalledOnce();
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["admin", "ads"] });
  });

  it("useUpdateAd patches by id and invalidates", async () => {
    vi.mocked(adminApi.updateAdCampaign).mockResolvedValue({
      data: { ...mockCampaign, status: "paused" },
    } as never);
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateAd(), { wrapper });
    result.current.mutate({ id: 12, payload: { status: "paused" } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(adminApi.updateAdCampaign).toHaveBeenCalledWith(12, {
      status: "paused",
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["admin", "ads"] });
  });

  it("useDeleteAd deletes by id and invalidates", async () => {
    vi.mocked(adminApi.deleteAdCampaign).mockResolvedValue({ data: null } as never);
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteAd(), { wrapper });
    result.current.mutate(12);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(adminApi.deleteAdCampaign).toHaveBeenCalledWith(12);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["admin", "ads"] });
  });

  it("useAdSettings fetches placement settings", async () => {
    vi.mocked(adminApi.getAdSettings).mockResolvedValue({
      data: { country_code: "TN", first_position: 3, interval: 7 },
    } as never);

    const { result } = renderHook(() => useAdSettings(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({
      country_code: "TN",
      first_position: 3,
      interval: 7,
    });
  });

  it("useUpdateAdSettings PUTs and invalidates the settings key", async () => {
    vi.mocked(adminApi.updateAdSettings).mockResolvedValue({
      data: { country_code: "TN", first_position: 4, interval: 8 },
    } as never);
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateAdSettings(), { wrapper });
    result.current.mutate({ first_position: 4, interval: 8 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(adminApi.updateAdSettings).toHaveBeenCalledWith({
      first_position: 4,
      interval: 8,
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["admin", "ads", "settings"],
    });
  });

  it("useAdStats fetches stats when an id is set", async () => {
    vi.mocked(adminApi.getAdStats).mockResolvedValue({
      data: {
        campaign_id: 12,
        totals: {
          impressions: 340,
          unique_sessions: 210,
          clicks: 18,
          ctr: 0.0529,
          video_q25: 0,
          video_q50: 0,
          video_q75: 0,
          video_q100: 0,
          vtr: null,
        },
        daily: [],
        weekly: [],
      },
    } as never);

    const { result } = renderHook(() => useAdStats(12), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(adminApi.getAdStats).toHaveBeenCalledWith(12);
    expect(result.current.data?.totals.impressions).toBe(340);
  });

  it("useAdStats stays disabled when id is null", async () => {
    const { result } = renderHook(() => useAdStats(null), { wrapper });

    // No fetch should ever fire for a null id
    await new Promise((r) => setTimeout(r, 50));
    expect(adminApi.getAdStats).not.toHaveBeenCalled();
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("useUploadAdMedia posts the FormData and invalidates", async () => {
    vi.mocked(adminApi.uploadAdMedia).mockResolvedValue({
      data: mockCampaign,
    } as never);
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUploadAdMedia(), { wrapper });
    const formData = new FormData();
    const onProgress = vi.fn();
    result.current.mutate({ id: 12, formData, onProgress });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(adminApi.uploadAdMedia).toHaveBeenCalledWith(12, formData, onProgress);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["admin", "ads"] });
  });
});
