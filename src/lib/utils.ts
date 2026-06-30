import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date-ish value into India Standard Time (UTC+05:30).
 *
 * Audit timestamps from the backend are stored as full JS Date strings in UTC,
 * e.g. "Thu Apr 03 2025 16:39:22 GMT+0000 (Coordinated Universal Time)".
 * This converts such values to a readable IST string and appends " IST".
 *
 * - Empty / "--" values return "--".
 * - Unparseable strings are returned unchanged (so already-formatted values
 *   are never mangled).
 */
export function formatToIST(value?: string | number | Date | null): string {
  if (value === null || value === undefined) return "--";
  const trimmed = typeof value === "string" ? value.trim() : value;
  if (trimmed === "" || trimmed === "--") return "--";

  const date = toDate(value);
  if (!date) return String(value);

  return (
    date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }) + " IST"
  );
}

/**
 * Coerce assorted backend date representations into a JS Date (or null).
 * Handles: Date, ISO/epoch values, and Firestore Timestamp objects that get
 * serialized as { _seconds, _nanoseconds } (or { seconds, nanoseconds }).
 */
export function toDate(value?: unknown): Date | null {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  if (typeof value === "object") {
    const v = value as { _seconds?: number; seconds?: number };
    const seconds = v._seconds ?? v.seconds;
    if (typeof seconds === "number") return new Date(seconds * 1000);
    return null;
  }

  if (typeof value === "string") {
    let s = value.trim();
    // Canonical IST audit format, e.g. "April 13, 2026 at 7:01:47 PM UTC+5:30",
    // which the JS Date parser can't read directly. Normalize the " at "
    // separator and the non-standard "UTC+5:30" offset.
    if (/UTC\+5:30/i.test(s) || /\s+at\s+/i.test(s)) {
      s = s.replace(/\s+at\s+/i, " ").replace(/UTC\+5:30/i, "GMT+0530");
    }
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const d = new Date(value as number);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Format a date-ish value as a readable date (no time) in IST, or "N/A".
 */
export function formatDate(value?: unknown): string {
  const date = toDate(value);
  if (!date) return "N/A";
  return date.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
