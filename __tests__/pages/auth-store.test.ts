import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "@/lib/stores/auth";
import type { AdminMe } from "@/lib/types";

const mockAdmin: AdminMe = {
  user_id: 1,
  email: "admin@example.com",
  first_name: "Alice",
  last_name: "Admin",
  admin_role: "SUPER_ADMIN",
  admin_scope: "GLOBAL",
  country_code: null,
  is_admin_active: true,
  permissions: [
    "listing:review",
    "billing:manage",
    "region:manage",
    "admin:read",
    "audit:read",
  ],
};

describe("AuthStore", () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
  });

  it("starts with no admin and no token", () => {
    const state = useAuthStore.getState();
    expect(state.admin).toBeNull();
    expect(state.accessToken).toBeNull();
  });

  it("setToken stores the token", () => {
    useAuthStore.getState().setToken("test-jwt-token");
    expect(useAuthStore.getState().accessToken).toBe("test-jwt-token");
  });

  it("setAdmin stores the admin object", () => {
    useAuthStore.getState().setAdmin(mockAdmin);
    const stored = useAuthStore.getState().admin;
    expect(stored?.email).toBe("admin@example.com");
    expect(stored?.admin_role).toBe("SUPER_ADMIN");
    expect(stored?.permissions).toContain("listing:review");
  });

  it("clearAuth removes token and admin", () => {
    useAuthStore.getState().setToken("some-token");
    useAuthStore.getState().setAdmin(mockAdmin);
    useAuthStore.getState().clearAuth();

    expect(useAuthStore.getState().admin).toBeNull();
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it("hydrate is callable without error", () => {
    expect(() => useAuthStore.getState().hydrate()).not.toThrow();
  });
});
