import { formatInTimeZone } from 'date-fns-tz';
import { differenceInCalendarDays, format } from 'date-fns';

/**
 * Format a UTC ISO string for display in the destination's timezone.
 * Used for trip card dates, itinerary day headers.
 *
 * @example
 * formatForDestination('2024-06-01T00:00:00Z', 'Asia/Tokyo', 'EEE, MMM d')
 * // → "Sat, Jun 1"
 */
export function formatForDestination(
  utcIso: string,
  ianaTimezone: string,
  formatStr: string = 'EEE, MMM d'
): string {
  return formatInTimeZone(new Date(utcIso), ianaTimezone, formatStr);
}

/**
 * Format an activity time in the destination's timezone.
 * Used in ActivityCard to display "9:00 AM", "2:30 PM".
 */
export function formatActivityTime(
  utcIso: string,
  ianaTimezone: string
): string {
  return formatInTimeZone(new Date(utcIso), ianaTimezone, 'h:mm a');
}

/**
 * 24-hour clock time in the destination timezone, no leading zero.
 * @example formatClockTime('...T08:00:00Z', tz) // → "8:00"
 */
export function formatClockTime(utcIso: string, ianaTimezone: string): string {
  return formatInTimeZone(new Date(utcIso), ianaTimezone, 'H:mm');
}

/**
 * Hour-of-day (0–23) in the destination timezone — used to bucket activities
 * into morning / afternoon / evening segments.
 */
export function getDestinationHour(utcIso: string, ianaTimezone: string): number {
  return parseInt(formatInTimeZone(new Date(utcIso), ianaTimezone, 'H'), 10);
}

/**
 * Compact duration label.
 * @example 180 → "3h", 90 → "1h 30m", 45 → "45m"
 */
export function formatDurationShort(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours && mins) return `${hours}h ${mins}m`;
  if (hours) return `${hours}h`;
  return `${mins}m`;
}

/**
 * Format a date range summary string.
 * @example "Jun 1 – Jun 5" (in destination timezone)
 */
export function formatDateRangeSummary(
  startUtc: string,
  endUtc: string,
  ianaTimezone: string
): string {
  const start = formatInTimeZone(new Date(startUtc), ianaTimezone, 'MMM d');
  const end = formatInTimeZone(new Date(endUtc), ianaTimezone, 'MMM d');
  return `${start} – ${end}`;
}

/**
 * Format a local date for display
 */
export function formatLocalDate(date: Date, formatStr: string = 'MMM d'): string {
  return format(date, formatStr);
}

/**
 * Get the number of days between two dates
 */
export function getDaysDifference(start: Date, end: Date): number {
  return differenceInCalendarDays(end, start);
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
