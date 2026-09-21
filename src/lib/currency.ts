/**
 * Format a number as Indian Rupees with proper digit grouping.
 * ₹1,80,000 format (Indian numbering system)
 */
export function formatINR(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === "") return "₹0";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "₹0";

  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const parts = absNum.toFixed(2).split(".");
  const intPart = parts[0];
  const decPart = parts[1];

  let formatted: string;
  if (intPart.length <= 3) {
    formatted = intPart;
  } else {
    const last3 = intPart.slice(-3);
    const remaining = intPart.slice(0, -3);
    const groups: string[] = [];
    for (let i = remaining.length; i > 0; i -= 2) {
      groups.unshift(remaining.slice(Math.max(0, i - 2), i));
    }
    formatted = groups.join(",") + "," + last3;
  }

  const withDecimal = decPart === "00" ? formatted : `${formatted}.${decPart}`;
  return `${isNegative ? "-" : ""}₹${withDecimal}`;
}

/**
 * Parse an Indian currency string back to a number.
 */
export function parseINR(value: string): number {
  const cleaned = value.replace(/[₹,\s]/g, "").replace(/Rs\.?/i, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}
