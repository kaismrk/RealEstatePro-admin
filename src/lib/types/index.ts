// ── Auth ─────────────────────────────────────────────────────────────────────

export type AdminRole = "SUPER_ADMIN" | "PLATFORM_ADMIN" | "OPERATIONS_ADMIN";
export type AdminScope = "GLOBAL" | "COUNTRY";

export interface AdminMe {
  user_id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  admin_role: AdminRole;
  admin_scope: AdminScope;
  country_code: string | null;
  is_admin_active: boolean;
  permissions: string[];
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// ── Listings ─────────────────────────────────────────────────────────────────

export type PublishStatus = "not_published" | "published" | "archived";
export type ListingType = "sale" | "rent" | "vacation_rent";

export interface PropertyItem {
  id: number;
  title: string;
  listing_type: ListingType;
  property_type: string;
  price: number | null;
  currency: string;
  city: string | null;
  country_code: string;
  publish_status: PublishStatus;
  rejection_reason: string | null;
  owner_id: number;
  created_at: string;
  updated_at: string;
  publishing_date: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqm: number | null;
  photos: string[];
}

export interface PropertyList {
  total: number;
  items: PropertyItem[];
  page: number;
  size: number;
}

// ── Subscription Plans ────────────────────────────────────────────────────────

export type BillingCycle = "monthly" | "annual";

export interface SubscriptionPlan {
  id: number;
  name: string;
  price: number;
  listing_limit: number;
  billing_cycle: BillingCycle;
  country_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlanList {
  total: number;
  items: SubscriptionPlan[];
}

export interface SubscriptionPlanCreate {
  name: string;
  price: number;
  listing_limit: number;
  billing_cycle: BillingCycle;
  country_code: string;
}

export interface SubscriptionPlanUpdate {
  name?: string;
  price?: number;
  listing_limit?: number;
  billing_cycle?: BillingCycle;
  is_active?: boolean;
}

// ── Listing Packs ─────────────────────────────────────────────────────────────

export interface ListingPack {
  id: number;
  name: string;
  listing_count: number;
  price: number;
  country_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListingPackList {
  total: number;
  items: ListingPack[];
}

// ── Boosts ────────────────────────────────────────────────────────────────────

export type PlacementType = "TOP_OF_SEARCH" | "FEATURED_SECTION" | "HOMEPAGE_BANNER";

export interface ListingBoost {
  id: number;
  property_id: number;
  placement_type: PlacementType;
  starts_at: string;
  ends_at: string;
  amount_paid: number;
  currency: string;
  owner_id: number;
  property_title?: string;
  owner_email?: string;
}

export interface ListingBoostList {
  total: number;
  items: ListingBoost[];
}

// ── Regions ───────────────────────────────────────────────────────────────────

export type RegionLevel = "country" | "region" | "department" | "city";

export interface AdminRegion {
  id: number;
  name: string;
  level: RegionLevel;
  country_code: string;
  code: string | null;
  parent_id: number | null;
  created_at?: string;
}

export interface AdminRegionTree extends AdminRegion {
  children: AdminRegionTree[];
}

export interface AdminRegionList {
  total: number;
  items: AdminRegion[];
}

// ── RBAC ──────────────────────────────────────────────────────────────────────

export interface AdminAccount {
  id: number;
  user_id: number;
  admin_role: AdminRole;
  admin_scope: AdminScope;
  country_code: string | null;
  is_admin_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  user_email: string;
  user_first_name: string | null;
  user_last_name: string | null;
}

export interface AuditLog {
  id: number;
  admin_user_id: number;
  action: string;
  target_type: string;
  target_id: number | null;
  metadata: Record<string, unknown> | null;
  timestamp: string;
  country_code: string | null;
  ip_address: string | null;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export interface ResourceUsage {
  cpu_percent: number;
  memory_percent: number;
  disk_usage_percent: number;
}

export interface SystemMetrics {
  active_users: number;
  api_requests_total: number;
  api_requests_rate: number;
  average_response_time: number;
  error_rate: number;
  total_deployments: number;
  active_deployments: number;
  resources: ResourceUsage;
  uptime_days: number;
  last_updated: string;
}

export interface ServiceStatus {
  name: string;
  status: "healthy" | "degraded" | "down";
  message: string | null;
  last_checked: string;
}

export type AlertSeverity = "info" | "warning" | "error" | "critical";

export interface Alert {
  id: string;
  timestamp: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  source: string;
  country_code: string | null;
  acknowledged: boolean;
}

// ── Users ─────────────────────────────────────────────────────────────────────

export interface UserItem {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  country_code: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}
