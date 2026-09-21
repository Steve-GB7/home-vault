/**
 * Database types placeholder.
 * In production, generate with: npx supabase gen types typescript --linked > src/types/database.types.ts
 * These types match the schema defined in our migrations.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string | null;
          avatar_url: string | null;
          default_role: "household" | "business";
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          email: string;
          phone?: string | null;
          avatar_url?: string | null;
          default_role?: "household" | "business";
          timezone?: string;
        };
        Update: {
          full_name?: string;
          phone?: string | null;
          avatar_url?: string | null;
          default_role?: "household" | "business";
          timezone?: string;
        };
      };
      households: {
        Row: {
          id: string;
          name: string;
          owner_id: string;
          address_line: string | null;
          city: string | null;
          state: string | null;
          pincode: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          owner_id: string;
          address_line?: string | null;
          city?: string | null;
          state?: string | null;
          pincode?: string | null;
        };
        Update: {
          name?: string;
          address_line?: string | null;
          city?: string | null;
          state?: string | null;
          pincode?: string | null;
        };
      };
      household_members: {
        Row: {
          id: string;
          household_id: string;
          user_id: string;
          member_role: "owner" | "adult" | "viewer";
          joined_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          user_id: string;
          member_role?: "owner" | "adult" | "viewer";
        };
        Update: {
          member_role?: "owner" | "adult" | "viewer";
        };
      };
      businesses: {
        Row: {
          id: string;
          name: string;
          btype: "brand" | "service_center" | "amc_provider" | "retailer";
          contact_email: string;
          contact_phone: string | null;
          city: string | null;
          service_categories: string[];
          tier: "free" | "starter" | "pro" | "enterprise";
          is_approved: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          btype?: "brand" | "service_center" | "amc_provider" | "retailer";
          contact_email: string;
          contact_phone?: string | null;
          city?: string | null;
          service_categories?: string[];
          tier?: "free" | "starter" | "pro" | "enterprise";
          is_approved?: boolean;
        };
        Update: {
          name?: string;
          contact_email?: string;
          contact_phone?: string | null;
          city?: string | null;
          service_categories?: string[];
          tier?: "free" | "starter" | "pro" | "enterprise";
          is_approved?: boolean;
        };
      };
      business_members: {
        Row: {
          id: string;
          business_id: string;
          user_id: string;
          is_admin: boolean;
          display_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          user_id: string;
          is_admin?: boolean;
          display_name: string;
        };
        Update: {
          is_admin?: boolean;
          display_name?: string;
        };
      };
      household_invites: {
        Row: {
          id: string;
          household_id: string;
          email: string;
          invited_role: "owner" | "adult" | "viewer";
          token: string;
          status: "pending" | "accepted" | "expired" | "revoked";
          invited_by: string;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          email: string;
          invited_role?: "owner" | "adult" | "viewer";
          token?: string;
          status?: "pending" | "accepted" | "expired" | "revoked";
          invited_by: string;
          expires_at?: string;
          created_at?: string;
        };
        Update: {
          invited_role?: "owner" | "adult" | "viewer";
          status?: "pending" | "accepted" | "expired" | "revoked";
          expires_at?: string;
        };
      };
      business_invites: {
        Row: {
          id: string;
          business_id: string;
          email: string;
          is_admin: boolean;
          token: string;
          status: "pending" | "accepted" | "expired" | "revoked";
          invited_by: string;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          email: string;
          is_admin?: boolean;
          token?: string;
          status?: "pending" | "accepted" | "expired" | "revoked";
          invited_by: string;
          expires_at?: string;
          created_at?: string;
        };
        Update: {
          is_admin?: boolean;
          status?: "pending" | "accepted" | "expired" | "revoked";
          expires_at?: string;
        };
      };
      platform_admins: {
        Row: {
          id: string;
          created_at: string;
        };
        Insert: {
          id: string;
          created_at?: string;
        };
        Update: Record<string, never>;
      };
      assets: {
        Row: {
          id: string;
          household_id: string;
          category: string;
          brand: string;
          model: string;
          serial_number: string | null;
          nickname: string | null;
          purchase_date: string | null;
          purchase_price: number | null;
          seller_name: string | null;
          location_in_home: string | null;
          capacity_spec: string | null;
          status: "active" | "under_repair" | "retired" | "transferred";
          qr_token: string;
          provenance_asset_id: string | null;
          image_url: string | null;
          created_by: string;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          category: string;
          brand: string;
          model: string;
          serial_number?: string | null;
          nickname?: string | null;
          purchase_date?: string | null;
          purchase_price?: number | null;
          seller_name?: string | null;
          location_in_home?: string | null;
          capacity_spec?: string | null;
          status?: "active" | "under_repair" | "retired" | "transferred";
          image_url?: string | null;
          created_by: string;
        };
        Update: {
          category?: string;
          brand?: string;
          model?: string;
          serial_number?: string | null;
          nickname?: string | null;
          purchase_date?: string | null;
          purchase_price?: number | null;
          seller_name?: string | null;
          location_in_home?: string | null;
          capacity_spec?: string | null;
          status?: "active" | "under_repair" | "retired" | "transferred";
          image_url?: string | null;
          deleted_at?: string | null;
        };
      };
      documents: {
        Row: {
          id: string;
          asset_id: string | null;
          household_id: string;
          doc_type: string;
          file_path: string;
          file_name: string;
          mime_type: string;
          size_bytes: number;
          status: "pending" | "ready" | "failed";
          ocr_json: Json | null;
          uploaded_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          asset_id?: string | null;
          household_id: string;
          doc_type?: string;
          file_path: string;
          file_name: string;
          mime_type: string;
          size_bytes?: number;
          status?: "pending" | "ready" | "failed";
          ocr_json?: Json | null;
          uploaded_by: string;
        };
        Update: {
          doc_type?: string;
          file_path?: string;
          file_name?: string;
          status?: "pending" | "ready" | "failed";
          ocr_json?: Json | null;
        };
      };
      warranties_amcs: {
        Row: {
          id: string;
          asset_id: string;
          coverage_type: "manufacturer_warranty" | "extended_warranty" | "amc";
          provider_name: string;
          provider_business_id: string | null;
          start_date: string;
          end_date: string;
          cost: number;
          terms: string | null;
          document_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          asset_id: string;
          coverage_type: "manufacturer_warranty" | "extended_warranty" | "amc";
          provider_name: string;
          provider_business_id?: string | null;
          start_date: string;
          end_date: string;
          cost?: number;
          terms?: string | null;
          document_id?: string | null;
        };
        Update: {
          coverage_type?: "manufacturer_warranty" | "extended_warranty" | "amc";
          provider_name?: string;
          start_date?: string;
          end_date?: string;
          cost?: number;
          terms?: string | null;
        };
      };
      complaints: {
        Row: {
          id: string;
          ticket_no: string;
          asset_id: string;
          household_id: string;
          raised_by: string;
          assigned_business_id: string | null;
          assigned_technician_id: string | null;
          title: string;
          description: string;
          status: "new" | "assigned" | "in_progress" | "resolved" | "closed";
          priority: "low" | "medium" | "high" | "urgent";
          under_warranty: boolean;
          resolved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          ticket_no?: string;
          asset_id: string;
          household_id: string;
          raised_by: string;
          assigned_business_id?: string | null;
          assigned_technician_id?: string | null;
          title: string;
          description: string;
          status?: "new" | "assigned" | "in_progress" | "resolved" | "closed";
          priority?: "low" | "medium" | "high" | "urgent";
        };
        Update: {
          assigned_business_id?: string | null;
          assigned_technician_id?: string | null;
          title?: string;
          description?: string;
          status?: "new" | "assigned" | "in_progress" | "resolved" | "closed";
          priority?: "low" | "medium" | "high" | "urgent";
        };
      };
      complaint_media: {
        Row: {
          id: string;
          complaint_id: string;
          file_path: string;
          mtype: "image" | "video" | "audio" | "document";
          caption: string | null;
          uploaded_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          complaint_id: string;
          file_path: string;
          mtype?: "image" | "video" | "audio" | "document";
          caption?: string | null;
          uploaded_by: string;
        };
        Update: {
          caption?: string | null;
        };
      };
      service_logs: {
        Row: {
          id: string;
          asset_id: string;
          complaint_id: string | null;
          business_id: string | null;
          technician_name: string;
          stype: "installation" | "preventive_maintenance" | "repair" | "amc_visit" | "inspection";
          service_date: string;
          work_performed: string;
          parts_replaced: Json;
          labour_cost: number;
          parts_cost: number;
          total_cost: number;
          covered_by_warranty: boolean;
          next_service_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          asset_id: string;
          complaint_id?: string | null;
          business_id?: string | null;
          technician_name: string;
          stype?: "installation" | "preventive_maintenance" | "repair" | "amc_visit" | "inspection";
          service_date?: string;
          work_performed: string;
          parts_replaced?: Json;
          labour_cost?: number;
          parts_cost?: number;
          covered_by_warranty?: boolean;
          next_service_date?: string | null;
        };
        Update: {
          technician_name?: string;
          stype?: "installation" | "preventive_maintenance" | "repair" | "amc_visit" | "inspection";
          service_date?: string;
          work_performed?: string;
          parts_replaced?: Json;
          labour_cost?: number;
          parts_cost?: number;
          covered_by_warranty?: boolean;
          next_service_date?: string | null;
        };
      };
      asset_transfers: {
        Row: {
          id: string;
          source_asset_id: string;
          target_asset_id: string | null;
          from_household_id: string;
          to_household_id: string | null;
          transfer_price: number | null;
          transferred_at: string;
          initiated_by: string;
        };
        Insert: {
          id?: string;
          source_asset_id: string;
          target_asset_id?: string | null;
          from_household_id: string;
          to_household_id?: string | null;
          transfer_price?: number | null;
          initiated_by: string;
        };
        Update: {
          target_asset_id?: string | null;
          to_household_id?: string | null;
          transfer_price?: number | null;
        };
      };
    };
    Views: {
      asset_service_context: {
        Row: {
          id: string;
          household_id: string;
          category: string;
          brand: string;
          model: string;
          serial_number: string | null;
          nickname: string | null;
          purchase_date: string | null;
          location_in_home: string | null;
          capacity_spec: string | null;
          status: string;
          household_name: string;
          city: string | null;
          pincode: string | null;
        };
      };
      asset_coverage_status: {
        Row: {
          asset_id: string;
          warranty_end: string | null;
          amc_end: string | null;
          warranty_days_left: number | null;
          amc_days_left: number | null;
        };
      };
      asset_spend_summary: {
        Row: {
          asset_id: string;
          brand: string;
          model: string;
          purchase_price: number;
          total_service_spend: number;
          service_count: number;
          last_service_date: string | null;
          next_service_date: string | null;
        };
      };
    };
    Functions: {
      is_household_member: {
        Args: { hid: string };
        Returns: boolean;
      };
      is_household_owner: {
        Args: { hid: string };
        Returns: boolean;
      };
      is_business_member: {
        Args: { bid: string };
        Returns: boolean;
      };
      my_business_ids: {
        Args: Record<string, never>;
        Returns: string[];
      };
      business_can_see_asset: {
        Args: { aid: string };
        Returns: boolean;
      };
      is_platform_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      user_role: "household" | "business";
      member_role: "owner" | "adult" | "viewer";
      invite_status: "pending" | "accepted" | "expired" | "revoked";
      business_type: "brand" | "service_center" | "amc_provider" | "retailer";
      subscription_tier: "free" | "starter" | "pro" | "enterprise";
      asset_category:
        | "air_conditioner"
        | "refrigerator"
        | "washing_machine"
        | "television"
        | "ro_water_purifier"
        | "microwave"
        | "geyser"
        | "dishwasher"
        | "other";
      asset_status: "active" | "under_repair" | "retired" | "transferred";
      coverage_type: "manufacturer_warranty" | "extended_warranty" | "amc";
      document_type:
        | "invoice"
        | "warranty_certificate"
        | "amc_contract"
        | "manual"
        | "installation_report"
        | "service_receipt"
        | "evidence"
        | "other";
      document_status: "pending" | "ready" | "failed";
      complaint_status: "new" | "assigned" | "in_progress" | "resolved" | "closed";
      complaint_priority: "low" | "medium" | "high" | "urgent";
      service_type:
        | "installation"
        | "preventive_maintenance"
        | "repair"
        | "amc_visit"
        | "inspection";
      media_type: "image" | "video" | "audio" | "document";
    };
  };
}
