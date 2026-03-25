# 09 — Timezone Handling

← [08_API_Service_Layer](./08_API_Service_Layer.md) | Next → [10_Screens](./10_Screens.md)

---

## The Problem

A user in New York (UTC−5) plans a 5-day trip to Tokyo (UTC+9). If `DateRange` stores raw `Date` objects using the device timezone, all itinerary times display wrong — "9:00 AM breakfast" appears as "8:00 PM" on their phone.

---

## Strategy: Store in UTC, Display in Destination Timezone

| Step | Rule |
|---|---|
| Storage | All dates/times stored as UTC ISO 8601 strings |
| Selection UI | `DurationDatePicker` uses device local timezone for the picker — converts to UTC immediately on selection |
| Display | All itinerary times formatted using `date-fns-tz` with the destination's IANA timezone |
| AI Prompt | Dates sent to backend as UTC ISO strings — prompt instructs model to return activity times in destination timezone |

---

## `Location` Value Object (`src/domain/value-objects/Location.ts`)

`ianaTimezone` is a **required field**, not optional. It must be fetched from Google Places Details API alongside coordinates.

```typescript
export interface Location {
  readonly placeId: string;
  readonly name: string;              // e.g. "Tokyo"
  readonly formattedAddress: string;  // e.g. "Tokyo, Japan"
  readonly coordinates: {
    latitude: number;
    longitude: number;
  };
  readonly ianaTimezone: string;      // e.g. "Asia/Tokyo"
}
```

The `ianaTimezone` comes from the `timeZone` field in the Google Places Details API response (`places.googleapis.com/v1/places/{placeId}`). Include `timeZone` in the `X-Goog-FieldMask` header when calling `getPlaceDetails()`.

**Fallback:** If `ianaTimezone` is missing from the API response, default to `'UTC'` and show a non-blocking warning. Do not block trip creation.

---

## `DateRange` Value Object (`src/domain/value-objects/DateRange.ts`)

```typescript
import { differenceInCalendarDays } from 'date-fns';
import { ValidationError } from '@/errors/ValidationError';

export class DateRange {
  private constructor(
    readonly startDateUtc: string,  // ISO 8601 UTC string
    readonly endDateUtc: string,
  ) {}

  static create(start: Date, end: Date): DateRange {
    const days = differenceInCalendarDays(end, start);
    if (days < 1) throw new ValidationError({
      type: 'ValidationError',
      message: 'End date must be after start date',
      field: 'endDate',
    });
    if (days > 5) throw new ValidationError({
      type: 'ValidationError',
      message: 'Maximum trip duration is 5 days',
      field: 'endDate',
    });
    return new DateRange(start.toISOString(), end.toISOString());
  }

  get durationDays(): number {
    return differenceInCalendarDays(
      new Date(this.endDateUtc),
      new Date(this.startDateUtc)
    ) + 1;
  }
}
```

---

## Display Helpers (`src/lib/date.ts`)

```typescript
import { formatInTimeZone } from 'date-fns-tz';
import { differenceInCalendarDays } from 'date-fns';

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
 * Format a date range summary string.
 * @example "Jun 1 – Jun 5" (in destination timezone)
 */
export function formatDateRangeSummary(
  startUtc: string,
  endUtc: string,
  ianaTimezone: string
): string {
  const start = formatInTimeZone(new Date(startUtc), ianaTimezone, 'MMM d');
  const end   = formatInTimeZone(new Date(endUtc),   ianaTimezone, 'MMM d');
  return `${start} – ${end}`;
}
```

---

## Date Picker → UTC Conversion

`DurationDatePicker` uses the device's local timezone for the UI (iOS `DateTimePicker` always works in device timezone). Convert to UTC **immediately** on selection before storing in `tripFormStore`.

```typescript
// In DurationDatePicker component / usePlanTripViewModel:

const onStartDateChange = (selectedDate: Date) => {
  // selectedDate is in device local time — convert to UTC ISO before storing
  tripFormStore.setStartDate(new Date(selectedDate.toISOString()));
};
```

---

## Rules Summary

- `DurationDatePicker` → device local time for UI only → convert to UTC on selection
- `ianaTimezone` must be fetched in `placesApi.getPlaceDetails()` — it is a **required field**
- All dates sent to the AI endpoint are UTC ISO strings
- All itinerary times displayed via `formatActivityTime()` with destination timezone
- If `ianaTimezone` is missing → default to `'UTC'` + non-blocking toast warning
- Never use `new Date().toLocaleDateString()` for itinerary display — always use `date-fns-tz`
