import type { OcrResult } from "./schema";

const SERIAL_PATTERN = /^[A-Za-z0-9\-]{4,32}$/;

const CATEGORY_MAP: Record<string, string> = {
  ac: "air_conditioner",
  "air conditioner": "air_conditioner",
  "split ac": "air_conditioner",
  "window ac": "air_conditioner",
  fridge: "refrigerator",
  refrigerator: "refrigerator",
  "washing machine": "washing_machine",
  washer: "washing_machine",
  tv: "television",
  television: "television",
  "led tv": "television",
  ro: "ro_water_purifier",
  "water purifier": "ro_water_purifier",
  "ro purifier": "ro_water_purifier",
  microwave: "microwave",
  "microwave oven": "microwave",
  geyser: "geyser",
  "water heater": "geyser",
  dishwasher: "dishwasher",
};

const VALID_CATEGORIES = new Set([
  "air_conditioner",
  "refrigerator",
  "washing_machine",
  "television",
  "ro_water_purifier",
  "microwave",
  "geyser",
  "dishwasher",
  "other",
]);

/**
 * Coerce Indian date formats (dd/mm/yyyy, dd-mm-yy) to ISO (yyyy-mm-dd).
 */
function coerceDate(dateStr: string | null): string | null {
  if (!dateStr) return null;

  // Already ISO?
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  // dd/mm/yyyy or dd-mm-yyyy
  const dmyFull = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmyFull) {
    const [, d, m, y] = dmyFull;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  // dd/mm/yy or dd-mm-yy
  const dmyShort = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})$/);
  if (dmyShort) {
    const [, d, m, y] = dmyShort;
    const fullYear = parseInt(y) > 50 ? `19${y}` : `20${y}`;
    return `${fullYear}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  return null;
}

/**
 * Strip ₹, Rs., commas from amounts and convert to number.
 */
function cleanAmount(val: number | string | null): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === "number") return val;
  const cleaned = val.replace(/[₹,\s]/g, "").replace(/Rs\.?/i, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/**
 * Map free-text product type to asset_category enum.
 */
function mapCategory(cat: string | null): string | null {
  if (!cat) return null;
  const lower = cat.toLowerCase().trim();
  if (VALID_CATEGORIES.has(lower)) return lower;
  return CATEGORY_MAP[lower] || "other";
}

/**
 * Validate and clean OCR results. Fields failing validation are nulled
 * and their confidence set to 0.
 */
export function validateOcrResult(raw: OcrResult): OcrResult {
  const result = { ...raw };
  const confidence = { ...result.confidence };

  // Validate serial number
  if (result.serial_number && !SERIAL_PATTERN.test(result.serial_number)) {
    result.serial_number = null;
    confidence.serial_number = 0;
  }

  // Coerce date
  result.purchase_date = coerceDate(result.purchase_date);
  if (result.purchase_date) {
    const d = new Date(result.purchase_date);
    const now = new Date();
    const min = new Date("1990-01-01");
    if (d > now || d < min) {
      result.purchase_date = null;
      confidence.purchase_date = 0;
    }
  }

  // Clean amount
  const price = cleanAmount(result.purchase_price as unknown as string | number | null);
  if (price !== null && price >= 0) {
    result.purchase_price = price;
  } else {
    result.purchase_price = null;
    confidence.purchase_price = 0;
  }

  // Map category
  result.category = mapCategory(result.category) as OcrResult["category"];

  result.confidence = confidence;
  return result;
}
