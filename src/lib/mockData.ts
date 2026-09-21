import { DEMO_AC_ASSET_ID, DEMO_HOUSEHOLD_ID, DEMO_BUSINESS_ID, DEMO_USERS } from "./constants";
import type {
  AssetWithCoverage,
  ComplaintWithAsset,
  ServiceLog,
  TimelineEvent,
  Household,
  HouseholdMember,
  Business,
  BusinessMember,
  HouseholdInvite,
  BusinessInvite,
} from "@/types/domain";

export interface MockUser {
  id: string;
  email: string;
  full_name: string;
  password?: string;
}

export interface StoreType {
  assets: AssetWithCoverage[];
  complaints: ComplaintWithAsset[];
  serviceLogs: ServiceLog[];
  documents: any[];
  households: Household[];
  householdMembers: HouseholdMember[];
  businesses: Business[];
  businessMembers: BusinessMember[];
  householdInvites: HouseholdInvite[];
  businessInvites: BusinessInvite[];
  users: MockUser[];
  activeUserId: string;
}

const initialAssets: AssetWithCoverage[] = [
  {
    id: DEMO_AC_ASSET_ID,
    household_id: DEMO_HOUSEHOLD_ID,
    category: "air_conditioner",
    brand: "LG",
    model: "PS-Q19YNZE",
    serial_number: "311KRPZ4D827",
    nickname: "Living Room AC",
    purchase_date: "2023-04-18",
    purchase_price: 42990.0,
    seller_name: "Bismi Appliances, Pathanamthitta",
    location_in_home: "Living Room",
    capacity_spec: "1.5 Ton 5 Star Dual Inverter",
    created_by: DEMO_USERS.priya,
    created_at: "2023-04-18T10:00:00Z",
    updated_at: "2023-04-18T10:00:00Z",
    deleted_at: null,
    image_url: null,
    qr_token: "qr_lg_ac_demo_token",
    provenance_asset_id: null,
    status: "active",
    coverage: {
      asset_id: DEMO_AC_ASSET_ID,
      warranty_end: "2033-04-17",
      amc_end: new Date(Date.now() + 41 * 86400000).toISOString().split("T")[0],
      warranty_days_left: 2760,
      amc_days_left: 41,
      warranty_end_date: "2033-04-17",
      warranty_provider: "LG Electronics India",
      warranty_status: "active",
      amc_end_date: new Date(Date.now() + 41 * 86400000).toISOString().split("T")[0],
      amc_provider: "CoolCare Authorized Service",
      amc_status: "active",
      best_status: "active",
    },
    spend: {
      asset_id: DEMO_AC_ASSET_ID,
      brand: "LG",
      model: "PS-Q19YNZE",
      purchase_price: 42990.0,
      total_service_spend: 4900.0,
      service_count: 3,
      last_service_date: "2025-05-22",
      next_service_date: "2025-11-22",
      total_labour_cost: 2800.0,
      total_parts_cost: 2100.0,
      total_service_cost: 4900.0,
      amc_cost: 3500.0,
      service_event_count: 3,
      lifetime_spend: 51390.0,
    },
  },
  {
    id: "dddddddd-0000-0000-0000-000000000002",
    household_id: DEMO_HOUSEHOLD_ID,
    category: "refrigerator",
    brand: "Samsung",
    model: "RT34C4522S8",
    serial_number: "SMSNRF2022X91",
    nickname: "Kitchen Fridge",
    purchase_date: "2022-11-02",
    purchase_price: 33500.0,
    seller_name: "Reliance Digital",
    location_in_home: "Kitchen",
    capacity_spec: "301 L Double Door",
    created_by: DEMO_USERS.priya,
    created_at: "2022-11-02T10:00:00Z",
    updated_at: "2022-11-02T10:00:00Z",
    deleted_at: null,
    image_url: null,
    qr_token: "qr_samsung_fridge_demo_token",
    provenance_asset_id: null,
    status: "active",
    coverage: {
      asset_id: "dddddddd-0000-0000-0000-000000000002",
      warranty_end: "2032-11-01",
      amc_end: null,
      warranty_days_left: 2600,
      amc_days_left: null,
      warranty_end_date: "2032-11-01",
      warranty_provider: "Samsung India",
      warranty_status: "active",
      amc_end_date: null,
      amc_provider: null,
      amc_status: "none",
      best_status: "active",
    },
    spend: {
      asset_id: "dddddddd-0000-0000-0000-000000000002",
      brand: "Samsung",
      model: "RT34C4522S8",
      purchase_price: 33500.0,
      total_service_spend: 1950.0,
      service_count: 1,
      last_service_date: "2024-08-05",
      next_service_date: null,
      total_labour_cost: 500.0,
      total_parts_cost: 1450.0,
      total_service_cost: 1950.0,
      amc_cost: 0.0,
      service_event_count: 1,
      lifetime_spend: 35450.0,
    },
  },
  {
    id: "dddddddd-0000-0000-0000-000000000003",
    household_id: DEMO_HOUSEHOLD_ID,
    category: "ro_water_purifier",
    brand: "Kent",
    model: "Grand Plus",
    serial_number: "KNTGP8841",
    nickname: "RO Purifier",
    purchase_date: "2024-06-10",
    purchase_price: 17900.0,
    seller_name: "Kent Dealer Store",
    location_in_home: "Kitchen",
    capacity_spec: "9 L Storage",
    created_by: DEMO_USERS.priya,
    created_at: "2024-06-10T10:00:00Z",
    updated_at: "2024-06-10T10:00:00Z",
    deleted_at: null,
    image_url: null,
    qr_token: "qr_kent_ro_demo_token",
    provenance_asset_id: null,
    status: "active",
    coverage: {
      asset_id: "dddddddd-0000-0000-0000-000000000003",
      warranty_end: "2025-06-09",
      amc_end: null,
      warranty_days_left: 0,
      amc_days_left: null,
      warranty_end_date: "2025-06-09",
      warranty_provider: "Kent RO Systems",
      warranty_status: "expired",
      amc_end_date: null,
      amc_provider: null,
      amc_status: "none",
      best_status: "expired",
    },
    spend: {
      asset_id: "dddddddd-0000-0000-0000-000000000003",
      brand: "Kent",
      model: "Grand Plus",
      purchase_price: 17900.0,
      total_service_spend: 0.0,
      service_count: 0,
      last_service_date: null,
      next_service_date: null,
      total_labour_cost: 0.0,
      total_parts_cost: 0.0,
      total_service_cost: 0.0,
      amc_cost: 0.0,
      service_event_count: 0,
      lifetime_spend: 17900.0,
    },
  },
];

const initialComplaints: ComplaintWithAsset[] = [
  {
    id: "ffffffff-0000-0000-0000-000000000001",
    ticket_no: "TCK-2026-0001",
    asset_id: "dddddddd-0000-0000-0000-000000000003",
    household_id: DEMO_HOUSEHOLD_ID,
    raised_by: DEMO_USERS.priya,
    assigned_business_id: DEMO_BUSINESS_ID,
    assigned_technician_id: DEMO_USERS.rahul,
    title: "RO purifier leaking from bottom",
    description: "Water pooling under the unit since yesterday morning. Filter light is green.",
    status: "assigned",
    priority: "high",
    under_warranty: false,
    resolution_notes: null,
    resolved_at: null,
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    assets: {
      brand: "Kent",
      model: "Grand Plus",
      category: "ro_water_purifier",
      nickname: "RO Purifier",
      serial_number: "KNTGP8841",
    },
    households: {
      name: "Nair Residence",
    },
  },
];

const initialServiceLogs: ServiceLog[] = [
  {
    id: "s-01",
    asset_id: DEMO_AC_ASSET_ID,
    business_id: DEMO_BUSINESS_ID,
    complaint_id: null,
    technician_name: "Rahul Menon",
    stype: "installation",
    service_date: "2023-04-20",
    work_performed: "Indoor and outdoor unit installation, copper piping, vacuum test.",
    parts_replaced: [{ part: "Copper pipe 3m", qty: 1, cost: 1200 }],
    labour_cost: 800.0,
    parts_cost: 1200.0,
    total_cost: 2000.0,
    covered_by_warranty: false,
    next_service_date: "2023-10-20",
    created_at: "2023-04-20T11:00:00Z",
    updated_at: "2023-04-20T11:00:00Z",
  },
  {
    id: "s-02",
    asset_id: DEMO_AC_ASSET_ID,
    business_id: DEMO_BUSINESS_ID,
    complaint_id: null,
    technician_name: "Sajid K",
    stype: "preventive_maintenance",
    service_date: "2024-03-11",
    work_performed: "Deep cleaning of coil and blower, drain flush, gas pressure check.",
    parts_replaced: [],
    labour_cost: 1400.0,
    parts_cost: 0.0,
    total_cost: 1400.0,
    covered_by_warranty: false,
    next_service_date: "2024-09-11",
    created_at: "2024-03-11T14:30:00Z",
    updated_at: "2024-03-11T14:30:00Z",
  },
  {
    id: "s-03",
    asset_id: DEMO_AC_ASSET_ID,
    business_id: DEMO_BUSINESS_ID,
    complaint_id: null,
    technician_name: "Sajid K",
    stype: "repair",
    service_date: "2025-05-22",
    work_performed: "Replaced faulty capacitor on outdoor unit; verified compressor start current.",
    parts_replaced: [{ part: "Run capacitor 45uF", qty: 1, cost: 900 }],
    labour_cost: 600.0,
    parts_cost: 900.0,
    total_cost: 1500.0,
    covered_by_warranty: false,
    next_service_date: "2025-11-22",
    created_at: "2025-05-22T16:00:00Z",
    updated_at: "2025-05-22T16:00:00Z",
  },
  {
    id: "s-04",
    asset_id: "dddddddd-0000-0000-0000-000000000002",
    business_id: DEMO_BUSINESS_ID,
    complaint_id: null,
    technician_name: "Rahul Menon",
    stype: "repair",
    service_date: "2024-08-05",
    work_performed: "Door gasket replacement, thermostat recalibration.",
    parts_replaced: [{ part: "Door gasket", qty: 1, cost: 1450 }],
    labour_cost: 500.0,
    parts_cost: 1450.0,
    total_cost: 1950.0,
    covered_by_warranty: false,
    next_service_date: null,
    created_at: "2024-08-05T12:00:00Z",
    updated_at: "2024-08-05T12:00:00Z",
  },
];

const initialDocuments = [
  {
    id: "eeeeeeee-0000-0000-0000-000000000001",
    asset_id: DEMO_AC_ASSET_ID,
    household_id: DEMO_HOUSEHOLD_ID,
    doc_type: "invoice",
    file_path: "mock/invoice-lg-ac.pdf",
    file_name: "invoice-lg-ac.pdf",
    mime_type: "application/pdf",
    size_bytes: 284512,
    status: "ready",
    ocr_json: {
      brand: "LG",
      model: "PS-Q19YNZE",
      serial_number: "311KRPZ4D827",
      purchase_date: "2023-04-18",
      purchase_price: 42990,
      seller_name: "Bismi Appliances, Pathanamthitta",
    },
    uploaded_by: DEMO_USERS.priya,
    created_at: "2023-04-18T10:05:00Z",
  },
  {
    id: "eeeeeeee-0000-0000-0000-000000000002",
    asset_id: DEMO_AC_ASSET_ID,
    household_id: DEMO_HOUSEHOLD_ID,
    doc_type: "amc_contract",
    file_path: "mock/amc-2026.pdf",
    file_name: "amc-2026.pdf",
    mime_type: "application/pdf",
    size_bytes: 118300,
    status: "ready",
    ocr_json: null,
    uploaded_by: DEMO_USERS.priya,
    created_at: "2024-04-18T11:00:00Z",
  },
];

const initialHouseholds: Household[] = [
  {
    id: DEMO_HOUSEHOLD_ID,
    name: "Nair Residence",
    owner_id: DEMO_USERS.priya,
    address_line: "Flat 4B, Green Meadows",
    city: "Pathanamthitta",
    state: "Kerala",
    pincode: "689645",
    created_at: "2023-04-18T10:00:00Z",
    updated_at: "2023-04-18T10:00:00Z",
  },
];

const initialHouseholdMembers: HouseholdMember[] = [
  {
    id: "hm-1",
    household_id: DEMO_HOUSEHOLD_ID,
    user_id: DEMO_USERS.priya,
    member_role: "owner",
    joined_at: "2023-04-18T10:00:00Z",
  },
  {
    id: "hm-2",
    household_id: DEMO_HOUSEHOLD_ID,
    user_id: DEMO_USERS.arun,
    member_role: "adult",
    joined_at: "2023-04-18T10:00:00Z",
  },
];

const initialBusinesses: Business[] = [
  {
    id: DEMO_BUSINESS_ID,
    name: "CoolCare Authorized Service",
    btype: "service_center",
    contact_email: "desk@coolcare.demo",
    contact_phone: "+91-9447-112233",
    city: "Pathanamthitta",
    service_categories: ["air_conditioner", "refrigerator", "washing_machine"],
    tier: "pro",
    is_approved: true,
    created_at: "2023-04-18T10:00:00Z",
    updated_at: "2023-04-18T10:00:00Z",
  },
  {
    id: "bbbbbbbb-0000-0000-0000-000000000002",
    name: "Apex Electronics & Care",
    btype: "service_center",
    contact_email: "desk@apexcare.demo",
    contact_phone: "+91-9876-543210",
    city: "Ernakulam",
    service_categories: ["refrigerator", "washing_machine"],
    tier: "pro",
    is_approved: true,
    created_at: "2023-04-18T10:00:00Z",
    updated_at: "2023-04-18T10:00:00Z",
  },
];

const initialBusinessMembers: BusinessMember[] = [
  {
    id: "bm-1",
    business_id: DEMO_BUSINESS_ID,
    user_id: DEMO_USERS.rahul,
    is_admin: true,
    display_name: "Rahul Menon",
    created_at: "2023-04-18T10:00:00Z",
  },
  {
    id: "bm-2",
    business_id: DEMO_BUSINESS_ID,
    user_id: "44444444-4444-4444-4444-444444444444",
    is_admin: false,
    display_name: "Suresh Kumar",
    created_at: "2023-04-18T10:00:00Z",
  },
  {
    id: "bm-3",
    business_id: "bbbbbbbb-0000-0000-0000-000000000002",
    user_id: "55555555-5555-5555-5555-555555555555",
    is_admin: true,
    display_name: "Vikram Sharma",
    created_at: "2023-04-18T10:00:00Z",
  },
];

const initialUsers: MockUser[] = [
  {
    id: DEMO_USERS.priya,
    email: "priya@homevault.demo",
    full_name: "Priya Nair",
    password: "HomeVault@2026",
  },
  {
    id: DEMO_USERS.arun,
    email: "arun@homevault.demo",
    full_name: "Arun Nair",
    password: "HomeVault@2026",
  },
  {
    id: DEMO_USERS.rahul,
    email: "desk@coolcare.demo",
    full_name: "Rahul Menon",
    password: "HomeVault@2026",
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    email: "suresh@coolcare.demo",
    full_name: "Suresh Kumar",
    password: "HomeVault@2026",
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    email: "desk@apexcare.demo",
    full_name: "Vikram Sharma",
    password: "HomeVault@2026",
  },
];

declare global {
  var __HOMEVAULT_STORE__: StoreType | undefined;
}

export function getStore(): StoreType {
  if (!global.__HOMEVAULT_STORE__ || !global.__HOMEVAULT_STORE__.users) {
    global.__HOMEVAULT_STORE__ = {
      assets: [...initialAssets],
      complaints: [...initialComplaints],
      serviceLogs: [...initialServiceLogs],
      documents: [...initialDocuments],
      households: [...initialHouseholds],
      householdMembers: [...initialHouseholdMembers],
      businesses: [...initialBusinesses],
      businessMembers: [...initialBusinessMembers],
      householdInvites: [],
      businessInvites: [],
      users: [...initialUsers],
      activeUserId: DEMO_USERS.priya,
    };
  }
  return global.__HOMEVAULT_STORE__;
}

export function calculateAssetSpend(assetId: string) {
  const store = getStore();
  const asset = store.assets.find((a) => a.id === assetId);
  if (!asset) return null;

  const logs = store.serviceLogs.filter((l) => l.asset_id === assetId);
  const totalLabour = logs.reduce((sum, l) => sum + (l.labour_cost || 0), 0);
  const totalParts = logs.reduce((sum, l) => sum + (l.parts_cost || 0), 0);
  const totalService = totalLabour + totalParts;
  const amcCost = assetId === DEMO_AC_ASSET_ID ? 3500 : 0;
  const lifetimeSpend = (asset.purchase_price || 0) + totalService + amcCost;

  return {
    asset_id: assetId,
    brand: asset.brand,
    model: asset.model,
    purchase_price: asset.purchase_price || 0,
    total_service_spend: totalService,
    service_count: logs.length,
    last_service_date: logs[0]?.service_date || null,
    next_service_date: logs[0]?.next_service_date || null,
    total_labour_cost: totalLabour,
    total_parts_cost: totalParts,
    total_service_cost: totalService,
    amc_cost: amcCost,
    service_event_count: logs.length,
    lifetime_spend: lifetimeSpend,
  };
}
