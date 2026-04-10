import axios, { type AxiosError } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Bearer token from auth store on every request
apiClient.interceptors.request.use((config) => {
  // We import lazily to avoid SSR issues with Zustand localStorage
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("admin-auth");
      if (raw) {
        const parsed = JSON.parse(raw) as { state?: { accessToken?: string } };
        const token = parsed?.state?.accessToken;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch {
      // silently ignore parse errors
    }
  }
  return config;
});

// On 401 → clear auth and redirect to /login
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("admin-auth");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ── Admin API helpers ─────────────────────────────────────────────────────────

export const adminApi = {
  // Auth
  login: (email: string, password: string) =>
    apiClient.post<{ access_token: string; token_type: string }>(
      "/auth/login/access-token",
      new URLSearchParams({ username: email, password }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    ),

  getMe: () => apiClient.get("/admin/me"),

  // Dashboard
  getSystemMetrics: () => apiClient.get("/admin/metrics/system"),
  getServiceStatus: () => apiClient.get("/admin/service/status"),
  getAlerts: () => apiClient.get("/admin/alerts"),

  // Listings
  getPendingListings: (page = 1, size = 20) =>
    apiClient.get(`/admin/listings/pending?page=${page}&size=${size}`),
  approveListing: (id: number) =>
    apiClient.post(`/admin/listings/${id}/approve`),
  rejectListing: (id: number, reason: string) =>
    apiClient.post(`/admin/listings/${id}/reject`, { reason }),

  // Subscription plans
  getSubscriptionPlans: (countryCode?: string) =>
    apiClient.get(
      `/admin/subscription-plans/${countryCode ? `?country_code=${countryCode}` : ""}`
    ),
  createSubscriptionPlan: (payload: unknown) =>
    apiClient.post("/admin/subscription-plans/", payload),
  updateSubscriptionPlan: (id: number, payload: unknown) =>
    apiClient.patch(`/admin/subscription-plans/${id}`, payload),
  deactivateSubscriptionPlan: (id: number) =>
    apiClient.delete(`/admin/subscription-plans/${id}`),

  // Listing packs
  getListingPacks: (countryCode?: string) =>
    apiClient.get(
      `/listing-packs/${countryCode ? `?country_code=${countryCode}` : ""}`
    ),

  // Regions
  getRegions: (params?: {
    country_code?: string;
    parent_id?: number;
    level?: string;
    page?: number;
    size?: number;
  }) => {
    const qs = new URLSearchParams();
    if (params?.country_code) qs.set("country_code", params.country_code);
    if (params?.parent_id !== undefined)
      qs.set("parent_id", String(params.parent_id));
    if (params?.level) qs.set("level", params.level);
    if (params?.page) qs.set("page", String(params.page));
    if (params?.size) qs.set("size", String(params.size));
    return apiClient.get(`/admin/regions/?${qs.toString()}`);
  },
  createRegion: (payload: unknown) => apiClient.post("/admin/regions/", payload),
  updateRegion: (id: number, payload: unknown) =>
    apiClient.patch(`/admin/regions/${id}`, payload),
  deleteRegion: (id: number) => apiClient.delete(`/admin/regions/${id}`),
  seedTunisia: () => apiClient.post("/admin/regions/seed/tn"),

  // RBAC
  getAdmins: () => apiClient.get("/admin/admins"),
  getAuditLogs: (params?: {
    action?: string;
    admin_user_id?: number;
    target_type?: string;
    limit?: number;
    offset?: number;
  }) => {
    const qs = new URLSearchParams();
    if (params?.action) qs.set("action", params.action);
    if (params?.admin_user_id)
      qs.set("admin_user_id", String(params.admin_user_id));
    if (params?.target_type) qs.set("target_type", params.target_type);
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.offset) qs.set("offset", String(params.offset));
    return apiClient.get(`/admin/audit-logs?${qs.toString()}`);
  },
  createAdmin: (payload: unknown) => apiClient.post("/admin/admins", payload),
  deactivateAdmin: (id: number) =>
    apiClient.post(`/admin/admins/${id}/deactivate`),
  activateAdmin: (id: number) => apiClient.post(`/admin/admins/${id}/activate`),
  revokeSessions: (userId: number, reason?: string) =>
    apiClient.post("/admin/sessions/revoke", {
      target_user_id: userId,
      reason: reason ?? "admin_revocation",
      all_devices: true,
    }),
  resetUserPassword: (userId: number) =>
    apiClient.post("/admin/support/password-reset", {
      target_user_id: userId,
    }),

  // Users
  getUsers: (params?: { page?: number; size?: number; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.size) qs.set("size", String(params.size));
    if (params?.search) qs.set("search", params.search);
    return apiClient.get(`/users/?${qs.toString()}`);
  },
};
