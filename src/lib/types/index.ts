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

// ── Professional signups (Phase 20) ──────────────────────────────────────────

export type SignupStatus = "pending" | "activated" | "rejected" | "duplicate";
export type SignupType = "agent" | "agency" | "promoter";

export interface ProfessionalSignup {
  id: number;
  country_code: string;
  type: SignupType;
  status: SignupStatus;
  prospect_id: number | null;
  email: string;
  profile: Record<string, string>;
  notes: string | null;
  created_user_id: number | null;
  created_agency_id: number | null;
  created_agent_id: number | null;
  activated_by_admin_id: number | null;
  activated_at: string | null;
  rejected_reason: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfessionalSignupList {
  items: ProfessionalSignup[];
  total: number;
  page: number;
  size: number;
}

export interface ProfessionalSignupStats {
  pending: number;
  activated: number;
  rejected: number;
  activated_by_type: Record<SignupType, number>;
  pending_by_type: Record<SignupType, number>;
}

// ── Real-estate prospects (Phase 18) ─────────────────────────────────────────

export type ProspectType = "agent" | "agency" | "developer_licensed" | "developer" | "promoter";
export type ProspectStatus = "unclaimed" | "pending_verification" | "claimed" | "dismissed" | "merged";

export interface RealEstateProspect {
  id: number;
  country_code: string;
  type: ProspectType;
  origin: string;
  status: ProspectStatus;
  name: string;
  normalized_name: string;
  governorate: string | null;
  city: string | null;
  region_id: number | null;
  phones: string[];
  email: string | null;
  website: string | null;
  mubawab_url: string | null;
  mubawab_customer: string | null;
  source_url: string | null;
  external_refs: Record<string, unknown>;
  notes: string | null;
  claimed_by_agency_id: number | null;
  claimed_by_user_id: number | null;
  claimed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProspectList {
  items: RealEstateProspect[];
  total: number;
  page: number;
  size: number;
}

export interface ProspectStats {
  total: number;
  by_status: Partial<Record<ProspectStatus, number>>;
  by_type: Partial<Record<ProspectType, number>>;
  subscribed_count: number;
  subscribed_pct: number;
}

// ── In-feed ad campaigns (Phase ads-b-admin) ─────────────────────────────────

export type AdvertiserType = "external" | "pro";
export type AdMediaType = "image" | "video";
export type AdCtaAction = "web" | "whatsapp" | "phone" | "internal";
export type AdCampaignStatus = "draft" | "active" | "paused" | "ended";

export interface AdCampaign {
  id: number;
  name: string;
  advertiser_type: AdvertiserType;
  advertiser_name: string;
  advertiser_user_id: number | null;
  media_type: AdMediaType;
  media_url: string | null;
  thumbnail_url: string | null;
  title: string;
  body: string | null;
  cta_label: string | null;
  cta_action: AdCtaAction | null;
  cta_value: string | null;
  status: AdCampaignStatus;
  display_order: number;
  country_code: string;
  target_governorate: string | null;
  target_property_type: string | null;
  target_transaction_type: string | null;
  start_year: number;
  start_week: number;
  end_year: number;
  end_week: number;
  starts_at: string;
  ends_at: string;
  max_impressions: number | null;
  created_by: number | null;
  created_at: string;
  // Computed by the list endpoint
  impressions: number;
  clicks: number;
}

export interface AdCampaignList {
  total: number;
  items: AdCampaign[];
  // Active campaign count per governorate — UI shows a soft share-of-voice
  // warning when a governorate has > 5 active campaigns.
  active_per_governorate: Record<string, number>;
}

export interface AdCampaignCreate {
  name: string;
  advertiser_type: AdvertiserType;
  advertiser_name: string;
  advertiser_user_id?: number | null;
  media_type: AdMediaType;
  title: string;
  body?: string | null;
  cta_label?: string | null;
  cta_action?: AdCtaAction | null;
  cta_value?: string | null;
  display_order?: number;
  country_code?: string | null;
  target_governorate?: string | null;
  target_property_type?: string | null;
  target_transaction_type?: string | null;
  start_year: number;
  start_week: number;
  end_year: number;
  end_week: number;
  max_impressions?: number | null;
}

export interface AdCampaignUpdate extends Partial<AdCampaignCreate> {
  status?: AdCampaignStatus;
}

export interface AdSettings {
  country_code: string;
  first_position: number;
  interval: number;
}

export interface AdSettingsUpdate {
  first_position: number;
  interval: number;
}

export interface AdStatsTotals {
  impressions: number;
  unique_sessions: number;
  clicks: number;
  ctr: number;
  video_q25: number;
  video_q50: number;
  video_q75: number;
  video_q100: number;
  vtr: number | null;
}

export interface AdStatsDailyPoint {
  date: string;
  impressions: number;
  clicks: number;
}

export interface AdStatsWeekPoint {
  iso_year: number;
  iso_week: number;
  week_label: string;
  impressions: number;
  clicks: number;
}

export interface AdStats {
  campaign_id: number;
  totals: AdStatsTotals;
  daily: AdStatsDailyPoint[];
  weekly: AdStatsWeekPoint[];
}
