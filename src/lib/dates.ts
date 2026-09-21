import { format, formatDistanceToNow, differenceInDays, parseISO, isValid } from "date-fns";

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "—";
  return format(d, "dd MMM yyyy");
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "—";
  return format(d, "dd MMM yyyy, h:mm a");
}

export function daysRemaining(endDate: string | Date | null | undefined): number | null {
  if (!endDate) return null;
  const d = typeof endDate === "string" ? parseISO(endDate) : endDate;
  if (!isValid(d)) return null;
  return differenceInDays(d, new Date());
}

export function relativeTime(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "—";
  return formatDistanceToNow(d, { addSuffix: true });
}

export function coverageStatus(daysLeft: number | null): "active" | "warning" | "critical" | "expired" {
  if (daysLeft === null) return "expired";
  if (daysLeft < 0) return "expired";
  if (daysLeft < 15) return "critical";
  if (daysLeft < 60) return "warning";
  return "active";
}
