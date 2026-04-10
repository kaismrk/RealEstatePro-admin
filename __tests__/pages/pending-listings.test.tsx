import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PendingListingsPage from "@/app/(admin)/listings/pending/page";

// Mock the hooks
vi.mock("@/lib/hooks/useListings", () => ({
  usePendingListings: vi.fn(),
  useApproveListing: vi.fn(),
  useRejectListing: vi.fn(),
}));

import * as listingsHooks from "@/lib/hooks/useListings";

const mockListing = {
  id: 1,
  title: "Beautiful Apartment in Tunis",
  listing_type: "sale" as const,
  property_type: "apartment",
  price: 250000,
  currency: "TND",
  city: "Tunis",
  country_code: "TN",
  publish_status: "not_published" as const,
  rejection_reason: null,
  owner_id: 42,
  created_at: "2026-01-15T10:30:00Z",
  updated_at: "2026-01-15T10:30:00Z",
  publishing_date: null,
  bedrooms: 3,
  bathrooms: 2,
  area_sqm: 120,
  photos: [],
};

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe("PendingListingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the pending listings table with mock data", () => {
    vi.mocked(listingsHooks.usePendingListings).mockReturnValue(
      { data: { total: 1, items: [mockListing], page: 1, size: 20 }, isLoading: false, isError: false } as unknown as ReturnType<typeof listingsHooks.usePendingListings>
    );
    vi.mocked(listingsHooks.useApproveListing).mockReturnValue(
      { mutate: vi.fn(), isPending: false } as unknown as ReturnType<typeof listingsHooks.useApproveListing>
    );
    vi.mocked(listingsHooks.useRejectListing).mockReturnValue(
      { mutate: vi.fn(), isPending: false } as unknown as ReturnType<typeof listingsHooks.useRejectListing>
    );

    render(<PendingListingsPage />, { wrapper });

    expect(screen.getByText("Beautiful Apartment in Tunis")).toBeTruthy();
    expect(screen.getByText("Tunis")).toBeTruthy();
    expect(screen.getByText("TN")).toBeTruthy();
  });

  it("calls approve mutation when Approve button is clicked", async () => {
    const approveMock = vi.fn();

    vi.mocked(listingsHooks.usePendingListings).mockReturnValue(
      { data: { total: 1, items: [mockListing], page: 1, size: 20 }, isLoading: false, isError: false } as unknown as ReturnType<typeof listingsHooks.usePendingListings>
    );
    vi.mocked(listingsHooks.useApproveListing).mockReturnValue(
      { mutate: approveMock, isPending: false } as unknown as ReturnType<typeof listingsHooks.useApproveListing>
    );
    vi.mocked(listingsHooks.useRejectListing).mockReturnValue(
      { mutate: vi.fn(), isPending: false } as unknown as ReturnType<typeof listingsHooks.useRejectListing>
    );

    render(<PendingListingsPage />, { wrapper });

    const approveBtn = screen.getByRole("button", { name: /approve/i });
    fireEvent.click(approveBtn);

    expect(approveMock).toHaveBeenCalledWith(1);
  });

  it("opens reject dialog and blocks submission without reason", async () => {
    const rejectMock = vi.fn();

    vi.mocked(listingsHooks.usePendingListings).mockReturnValue(
      { data: { total: 1, items: [mockListing], page: 1, size: 20 }, isLoading: false, isError: false } as unknown as ReturnType<typeof listingsHooks.usePendingListings>
    );
    vi.mocked(listingsHooks.useApproveListing).mockReturnValue(
      { mutate: vi.fn(), isPending: false } as unknown as ReturnType<typeof listingsHooks.useApproveListing>
    );
    vi.mocked(listingsHooks.useRejectListing).mockReturnValue(
      { mutate: rejectMock, isPending: false } as unknown as ReturnType<typeof listingsHooks.useRejectListing>
    );

    render(<PendingListingsPage />, { wrapper });

    const rejectBtn = screen.getByRole("button", { name: /reject/i });
    fireEvent.click(rejectBtn);

    // Dialog should open
    await waitFor(() => {
      expect(screen.getByText("Reject Listing")).toBeTruthy();
    });

    // Click confirm without entering a reason
    const confirmBtn = screen.getByRole("button", { name: /confirm rejection/i });
    fireEvent.click(confirmBtn);

    // Should show validation error, not call mutate
    expect(screen.getByText("Rejection reason is required")).toBeTruthy();
    expect(rejectMock).not.toHaveBeenCalled();
  });

  it("shows empty state when no pending listings", () => {
    vi.mocked(listingsHooks.usePendingListings).mockReturnValue(
      { data: { total: 0, items: [], page: 1, size: 20 }, isLoading: false, isError: false } as unknown as ReturnType<typeof listingsHooks.usePendingListings>
    );
    vi.mocked(listingsHooks.useApproveListing).mockReturnValue(
      { mutate: vi.fn(), isPending: false } as unknown as ReturnType<typeof listingsHooks.useApproveListing>
    );
    vi.mocked(listingsHooks.useRejectListing).mockReturnValue(
      { mutate: vi.fn(), isPending: false } as unknown as ReturnType<typeof listingsHooks.useRejectListing>
    );

    render(<PendingListingsPage />, { wrapper });

    expect(screen.getByText("No listings pending review")).toBeTruthy();
  });

  it("shows loading state", () => {
    vi.mocked(listingsHooks.usePendingListings).mockReturnValue(
      { data: undefined, isLoading: true, isError: false } as unknown as ReturnType<typeof listingsHooks.usePendingListings>
    );
    vi.mocked(listingsHooks.useApproveListing).mockReturnValue(
      { mutate: vi.fn(), isPending: false } as unknown as ReturnType<typeof listingsHooks.useApproveListing>
    );
    vi.mocked(listingsHooks.useRejectListing).mockReturnValue(
      { mutate: vi.fn(), isPending: false } as unknown as ReturnType<typeof listingsHooks.useRejectListing>
    );

    render(<PendingListingsPage />, { wrapper });

    expect(screen.getByText("Pending Listings")).toBeTruthy();
    // Loading skeleton should be present (no table)
    expect(screen.queryByRole("table")).toBeNull();
  });
});
