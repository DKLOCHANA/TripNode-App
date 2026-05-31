/**
 * Local notification service (iOS, on-device only — no push tokens / servers).
 *
 * Schedules trip-tied reminders for saved itineraries, an optional weekly
 * re-engagement nudge, and a subscription-renewal heads-up 24h before
 * auto-renewal. The full set is recomputed (cancel-all → reschedule) whenever
 * trips or subscription state change, or on app foreground.
 *
 * Implemented notification types (per product decision):
 *   • Pre-trip countdown — 7 days & 1 day before start (6 PM device-local)
 *   • Trip-start         — morning of the start date (8 AM device-local)
 *   • Weekly re-engage   — repeating Sun 6 PM, only when no upcoming trip exists
 *   • Renewal reminder   — 24h before the active entitlement's expiration date
 */

import * as Notifications from 'expo-notifications';
import type { Itinerary } from '@/domain/entities/Itinerary';

// iOS allows max 64 pending local notifications. Stay well under, leaving
// headroom for the single repeating weekly trigger + the renewal reminder.
const MAX_ONE_OFF = 56;

const HOUR_MORNING = 8; // trip-start reminders
const HOUR_EVENING = 18; // pre-trip reminders & weekly nudge
const WEEKLY_WEEKDAY = 1; // 1 = Sunday (expo-notifications WEEKLY trigger)
const RENEWAL_REMINDER_MS_BEFORE = 24 * 60 * 60 * 1000; // 24 hours

let handlerConfigured = false;

/** Configure foreground presentation. Call once at app start. */
export function configureNotificationHandler(): void {
  if (handlerConfigured) return;
  handlerConfigured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

export async function getPermissionStatus(): Promise<PermissionStatus> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status === 'granted') return 'granted';
    if (status === 'undetermined') return 'undetermined';
    return 'denied';
  } catch {
    return 'denied';
  }
}

/** Trigger the native iOS permission prompt. Returns true if granted. */
export async function requestPermission(): Promise<boolean> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function cancelAll(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // Non-fatal.
  }
}

interface PlannedNotification {
  date: Date;
  title: string;
  body: string;
}

/**
 * Build a device-local Date from a UTC ISO string's calendar date.
 * We anchor on the trip's calendar day (date portion of the ISO) so the
 * reminder lands on the right day regardless of the user's timezone.
 */
function localDateFromIso(iso: string, hour: number, dayOffset = 0): Date | null {
  const datePart = iso.slice(0, 10); // YYYY-MM-DD
  const [y, m, d] = datePart.split('-').map((n) => parseInt(n, 10));
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d, hour, 0, 0, 0);
  if (dayOffset) date.setDate(date.getDate() + dayOffset);
  return date;
}

/** All one-off reminders for a single trip (only future ones are kept later). */
function planForTrip(trip: Itinerary, now: Date): PlannedNotification[] {
  const dest = trip.destination?.name?.trim() || 'your trip';
  const out: PlannedNotification[] = [];

  const sevenBefore = localDateFromIso(trip.startDateUtc, HOUR_EVENING, -7);
  if (sevenBefore) {
    out.push({
      date: sevenBefore,
      title: `✈️ One week to ${dest}!`,
      body: `Your day-by-day plan is ready. Tap to review before you go.`,
    });
  }

  const oneBefore = localDateFromIso(trip.startDateUtc, HOUR_EVENING, -1);
  if (oneBefore) {
    out.push({
      date: oneBefore,
      title: `🧳 ${dest} tomorrow!`,
      body: `Open your Day 1 itinerary tonight so you're ready to go.`,
    });
  }

  const start = localDateFromIso(trip.startDateUtc, HOUR_MORNING, 0);
  if (start) {
    out.push({
      date: start,
      title: `📍 Day 1 in ${dest} starts today`,
      body: `Tap to open today's plan and make the most of it.`,
    });
  }

  return out.filter((n) => n.date.getTime() > now.getTime());
}

/** Subscription state needed to schedule the renewal reminder. */
export interface RenewalReminderInput {
  /** Expiration / next-renewal date from RevenueCat (`entitlement.expirationDate`). */
  expirationDate: Date;
  /** Will the entitlement auto-renew at expiration? Skip the reminder if not. */
  willRenew: boolean;
  /** Used to phrase the reminder (e.g. "monthly" vs "yearly"). */
  productIdentifier: string | null;
}

function describePlan(productIdentifier: string | null): 'monthly' | 'yearly' | 'premium' {
  if (!productIdentifier) return 'premium';
  const lower = productIdentifier.toLowerCase();
  if (lower.includes('annual') || lower.includes('yearly') || lower.includes('year')) {
    return 'yearly';
  }
  if (lower.includes('monthly') || lower.includes('month')) {
    return 'monthly';
  }
  return 'premium';
}

function buildRenewalReminder(
  renewal: RenewalReminderInput,
  now: Date
): PlannedNotification | null {
  if (!renewal.willRenew) return null;

  const reminderTime = renewal.expirationDate.getTime() - RENEWAL_REMINDER_MS_BEFORE;
  if (reminderTime <= now.getTime()) return null;

  const plan = describePlan(renewal.productIdentifier);
  return {
    date: new Date(reminderTime),
    title:
      plan === 'yearly'
        ? 'Your yearly TripNode Premium renews tomorrow'
        : plan === 'monthly'
        ? 'Your TripNode Premium renews tomorrow'
        : 'TripNode Premium renews tomorrow',
    body:
      'Your subscription will auto-renew in 24 hours. Tap to manage anytime.',
  };
}

/**
 * Recompute and (re)schedule the full notification set: trips, renewal
 * reminder, weekly nudge. Caller is responsible for only invoking this when
 * notifications are enabled AND OS permission is granted.
 */
export async function scheduleAll(
  itineraries: Itinerary[],
  renewal: RenewalReminderInput | null = null
): Promise<void> {
  await cancelAll();

  const now = new Date();

  // Collect every future one-off across all trips, soonest first, then cap.
  const planned = itineraries
    .flatMap((t) => planForTrip(t, now))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, MAX_ONE_OFF);

  for (const n of planned) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: { title: n.title, body: n.body, sound: true },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: n.date,
        },
      });
    } catch {
      // Skip a single failed schedule rather than aborting the whole sync.
    }
  }

  // Renewal reminder — 24h before the active entitlement expires.
  if (renewal) {
    const reminder = buildRenewalReminder(renewal, now);
    if (reminder) {
      try {
        await Notifications.scheduleNotificationAsync({
          content: { title: reminder.title, body: reminder.body, sound: true },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: reminder.date,
          },
        });
      } catch {
        // Non-fatal.
      }
    }
  }

  // Weekly re-engagement — only when there is no upcoming trip on the books.
  const hasUpcomingTrip = itineraries.some((t) => {
    const start = localDateFromIso(t.startDateUtc, HOUR_MORNING, 0);
    return start ? start.getTime() > now.getTime() : false;
  });

  if (!hasUpcomingTrip) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Where to next?',
          body: 'Plan your next trip with TripNode — a full itinerary in seconds.',
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: WEEKLY_WEEKDAY,
          hour: HOUR_EVENING,
          minute: 0,
        },
      });
    } catch {
      // Non-fatal.
    }
  }
}
