import type { Database } from "./database.types";

/** Convenience aliases for database row types */
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Household = Database["public"]["Tables"]["households"]["Row"];
export type HouseholdMember = Database["public"]["Tables"]["household_members"]["Row"];
export type Business = Database["public"]["Tables"]["businesses"]["Row"];
export type BusinessMember = Database["public"]["Tables"]["business_members"]["Row"];
export type Asset = Database["public"]["Tables"]["assets"]["Row"];
export type Document = Database["public"]["Tables"]["documents"]["Row"];
export type WarrantyAmc = Database["public"]["Tables"]["warranties_amcs"]["Row"];
export type Complaint = Database["public"]["Tables"]["complaints"]["Row"] & {
  resolution_notes?: string | null;
};
export type ComplaintMedia = Database["public"]["Tables"]["complaint_media"]["Row"];
export type ServiceLog = Database["public"]["Tables"]["service_logs"]["Row"];
export type AssetTransfer = Database["public"]["Tables"]["asset_transfers"]["Row"];
export type HouseholdInvite = Database["public"]["Tables"]["household_invites"]["Row"];
export type BusinessInvite = Database["public"]["Tables"]["business_invites"]["Row"];
export type InviteStatus = Database["public"]["Enums"]["invite_status"];

/** View types */
export type AssetServiceContext = Database["public"]["Views"]["asset_service_context"]["Row"];

export type AssetCoverageStatus = Database["public"]["Views"]["asset_coverage_status"]["Row"] & {
  warranty_end_date?: string | null;
  amc_end_date?: string | null;
  warranty_provider?: string | null;
  amc_provider?: string | null;
  warranty_status?: string | null;
  amc_status?: string | null;
  best_status?: string | null;
  category?: string | null;
  brand?: string | null;
  model?: string | null;
  serial_number?: string | null;
  household_id?: string | null;
};

export type AssetSpendSummary = Database["public"]["Views"]["asset_spend_summary"]["Row"] & {
  total_labour_cost?: number;
  total_parts_cost?: number;
  total_service_cost?: number;
  amc_cost?: number;
  service_event_count?: number;
  lifetime_spend?: number;
};

/** Enum types */
export type UserRole = Database["public"]["Enums"]["user_role"];
export type AssetCategory = Database["public"]["Enums"]["asset_category"];
export type AssetStatus = Database["public"]["Enums"]["asset_status"];
export type CoverageType = Database["public"]["Enums"]["coverage_type"];
export type DocumentType = Database["public"]["Enums"]["document_type"];
export type ComplaintStatus = Database["public"]["Enums"]["complaint_status"];
export type ComplaintPriority = Database["public"]["Enums"]["complaint_priority"];
export type ServiceType = Database["public"]["Enums"]["service_type"];

/** Asset with coverage info joined */
export interface AssetWithCoverage extends Asset {
  coverage?: AssetCoverageStatus;
  spend?: AssetSpendSummary;
}

/** Complaint with related asset info */
export interface ComplaintWithAsset extends Complaint {
  assets?: Pick<Asset, "brand" | "model" | "category" | "nickname" | "serial_number">;
  households?: Pick<Household, "name">;
  businesses?: Pick<Business, "name">;
}

/** Timeline event for the asset passport */
export interface TimelineEvent {
  id: string;
  type: "purchase" | "coverage_start" | "coverage_end" | "service" | "complaint" | "transfer";
  date: string;
  title: string;
  subtitle?: string;
  description?: string;
  cost?: number;
  icon?: string;
  metadata?: Record<string, unknown>;
}

/** Chat message for the AI assistant */
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

/** API response wrapper */
export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

/** Parts row for service log form */
export interface PartRow {
  part: string;
  qty: number;
  cost: number;
}
