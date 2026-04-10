import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SubscriptionPlansPage from "@/app/(admin)/subscriptions/page";

vi.mock("@/lib/hooks/usePlans", () => ({
  useSubscriptionPlans: vi.fn(),
  useCreatePlan: vi.fn(),
  useUpdatePlan: vi.fn(),
  useDeactivatePlan: vi.fn(),
}));

import * as plansHooks from "@/lib/hooks/usePlans";

const mockPlan = {
  id: 1,
  name: "Professional Monthly",
  price: 49.99,
  listing_limit: 20,
  billing_cycle: "monthly" as const,
  country_code: "TN",
  is_active: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe("SubscriptionPlansPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(plansHooks.useCreatePlan).mockReturnValue(
      { mutate: vi.fn(), isPending: false } as unknown as ReturnType<typeof plansHooks.useCreatePlan>
    );
    vi.mocked(plansHooks.useUpdatePlan).mockReturnValue(
      { mutate: vi.fn(), isPending: false } as unknown as ReturnType<typeof plansHooks.useUpdatePlan>
    );
    vi.mocked(plansHooks.useDeactivatePlan).mockReturnValue(
      { mutate: vi.fn(), isPending: false } as unknown as ReturnType<typeof plansHooks.useDeactivatePlan>
    );
  });

  it("renders the plans table", () => {
    vi.mocked(plansHooks.useSubscriptionPlans).mockReturnValue(
      { data: { total: 1, items: [mockPlan] }, isLoading: false, isError: false } as unknown as ReturnType<typeof plansHooks.useSubscriptionPlans>
    );

    render(<SubscriptionPlansPage />, { wrapper });

    expect(screen.getByText("Professional Monthly")).toBeTruthy();
    expect(screen.getByText("TN")).toBeTruthy();
  });

  it("opens the create plan dialog when Create Plan is clicked", async () => {
    vi.mocked(plansHooks.useSubscriptionPlans).mockReturnValue(
      { data: { total: 0, items: [] }, isLoading: false, isError: false } as unknown as ReturnType<typeof plansHooks.useSubscriptionPlans>
    );

    render(<SubscriptionPlansPage />, { wrapper });

    const createBtn = screen.getByRole("button", { name: /create plan/i });
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(screen.getByText("Create Subscription Plan")).toBeTruthy();
    });
  });

  it("validates create form — price must be positive", async () => {
    vi.mocked(plansHooks.useSubscriptionPlans).mockReturnValue(
      { data: { total: 0, items: [] }, isLoading: false, isError: false } as unknown as ReturnType<typeof plansHooks.useSubscriptionPlans>
    );

    render(<SubscriptionPlansPage />, { wrapper });

    fireEvent.click(screen.getByRole("button", { name: /create plan/i }));

    await waitFor(() => {
      expect(screen.getByText("Create Subscription Plan")).toBeTruthy();
    });

    // Set name
    const nameInput = screen.getByLabelText(/plan name/i);
    fireEvent.change(nameInput, { target: { value: "Test Plan" } });

    // Set price to 0 (invalid)
    const priceInput = screen.getByLabelText(/price \(usd\)/i);
    fireEvent.change(priceInput, { target: { value: "0" } });

    // Set country code
    const countryInput = screen.getByLabelText(/country code/i);
    fireEvent.change(countryInput, { target: { value: "TN" } });

    // Submit form — find the submit button inside the dialog
    const dialogSaveBtn = screen.getAllByRole("button", { name: /create plan/i }).at(-1)!;
    fireEvent.click(dialogSaveBtn);

    await waitFor(() => {
      expect(screen.getByText("Price must be positive")).toBeTruthy();
    });
  });

  it("validates create form — name is required", async () => {
    vi.mocked(plansHooks.useSubscriptionPlans).mockReturnValue(
      { data: { total: 0, items: [] }, isLoading: false, isError: false } as unknown as ReturnType<typeof plansHooks.useSubscriptionPlans>
    );

    render(<SubscriptionPlansPage />, { wrapper });

    fireEvent.click(screen.getByRole("button", { name: /create plan/i }));

    await waitFor(() => {
      expect(screen.getByText("Create Subscription Plan")).toBeTruthy();
    });

    // Submit without name — get the Save button inside the dialog
    const dialogSaveBtn = screen.getAllByRole("button", { name: /create plan/i }).at(-1)!;
    fireEvent.click(dialogSaveBtn);

    await waitFor(() => {
      expect(screen.getByText("Name is required")).toBeTruthy();
    });
  });

  it("opens edit dialog with pre-filled values", async () => {
    vi.mocked(plansHooks.useSubscriptionPlans).mockReturnValue(
      { data: { total: 1, items: [mockPlan] }, isLoading: false, isError: false } as unknown as ReturnType<typeof plansHooks.useSubscriptionPlans>
    );

    render(<SubscriptionPlansPage />, { wrapper });

    const editBtn = screen.getByRole("button", { name: /edit/i });
    fireEvent.click(editBtn);

    await waitFor(() => {
      expect(screen.getByText("Edit Plan")).toBeTruthy();
    });

    // Name field should be pre-filled
    const nameInput = screen.getByDisplayValue("Professional Monthly");
    expect(nameInput).toBeTruthy();
  });
});
