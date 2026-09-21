import {
  Snowflake,
  Refrigerator,
  WashingMachine,
  Tv,
  Droplets,
  Microwave,
  Flame,
  UtensilsCrossed,
  Package,
  type LucideIcon,
} from "lucide-react";

export const APP_NAME = "HomeVault";

export const ASSET_CATEGORY_LABELS: Record<string, string> = {
  air_conditioner: "Air Conditioner",
  refrigerator: "Refrigerator",
  washing_machine: "Washing Machine",
  television: "Television",
  ro_water_purifier: "RO Water Purifier",
  microwave: "Microwave",
  geyser: "Geyser",
  dishwasher: "Dishwasher",
  other: "Other",
};

export const ASSET_CATEGORY_ICONS: Record<string, LucideIcon> = {
  air_conditioner: Snowflake,
  refrigerator: Refrigerator,
  washing_machine: WashingMachine,
  television: Tv,
  ro_water_purifier: Droplets,
  microwave: Microwave,
  geyser: Flame,
  dishwasher: UtensilsCrossed,
  other: Package,
};

export const COVERAGE_TYPE_LABELS: Record<string, string> = {
  manufacturer_warranty: "Manufacturer Warranty",
  extended_warranty: "Extended Warranty",
  amc: "AMC",
};

export const COMPLAINT_STATUS_LABELS: Record<string, string> = {
  new: "New",
  assigned: "Assigned",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

export const COMPLAINT_PRIORITY_LABELS: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const SERVICE_TYPE_LABELS: Record<string, string> = {
  installation: "Installation",
  preventive_maintenance: "Preventive Maintenance",
  repair: "Repair",
  amc_visit: "AMC Visit",
  inspection: "Inspection",
};

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  invoice: "Invoice",
  warranty_certificate: "Warranty Certificate",
  amc_contract: "AMC Contract",
  manual: "Manual",
  installation_report: "Installation Report",
  service_receipt: "Service Receipt",
  evidence: "Evidence",
  other: "Other",
};

/** Legal status transitions for complaints */
export const LEGAL_TRANSITIONS: Record<string, string[]> = {
  new: ["assigned", "closed"],
  assigned: ["in_progress", "new", "closed"],
  in_progress: ["resolved", "assigned"],
  resolved: ["closed", "in_progress"],
  closed: [],
};

/** Demo user IDs */
export const DEMO_USERS = {
  priya: "11111111-1111-1111-1111-111111111111",
  arun: "22222222-2222-2222-2222-222222222222",
  rahul: "33333333-3333-3333-3333-333333333333",
} as const;

export const DEMO_HOUSEHOLD_ID = "aaaaaaaa-0000-0000-0000-000000000001";
export const DEMO_BUSINESS_ID = "bbbbbbbb-0000-0000-0000-000000000001";
export const DEMO_AC_ASSET_ID = "dddddddd-0000-0000-0000-000000000001";
