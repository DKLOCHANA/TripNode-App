import type { Activity, TimelineItem } from './Activity';
import type { Location } from '../value-objects/Location';

/**
 * Itinerary entity - a complete trip plan with daily activities
 */
export interface Itinerary {
  id: string;
  userId: string;
  destination: Location;
  startDateUtc: string;
  endDateUtc: string;
  days: ItineraryDay[];
  interests: string[];
  budgetUsd: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ItineraryDay {
  dayNumber: number;
  date: string; // YYYY-MM-DD
  activities: Activity[];
}

/**
 * Get timeline items for a day (activities + free time blocks)
 */
export function getDayTimeline(day: ItineraryDay): TimelineItem[] {
  const items: TimelineItem[] = [];
  const sortedActivities = [...day.activities].sort(
    (a, b) => new Date(a.startTimeUtc).getTime() - new Date(b.startTimeUtc).getTime()
  );

  for (let i = 0; i < sortedActivities.length; i++) {
    const activity = sortedActivities[i];
    items.push({ type: 'activity', data: activity });

    // Check for free time between this activity and the next
    if (i < sortedActivities.length - 1) {
      const nextActivity = sortedActivities[i + 1];
      const currentEnd = new Date(activity.endTimeUtc).getTime();
      const nextStart = new Date(nextActivity.startTimeUtc).getTime();
      const gapMinutes = (nextStart - currentEnd) / (1000 * 60);

      if (gapMinutes >= 30) {
        items.push({
          type: 'freeTime',
          data: {
            id: `free_${activity.id}_${nextActivity.id}`,
            startTimeUtc: activity.endTimeUtc,
            endTimeUtc: nextActivity.startTimeUtc,
            durationMinutes: gapMinutes,
          },
        });
      }
    }
  }

  return items;
}

export function createItinerary(
  data: Omit<Itinerary, 'id' | 'createdAt' | 'updatedAt'>
): Itinerary {
  const now = new Date().toISOString();
  return {
    id: `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...data,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Get total number of days in itinerary
 */
export function getItineraryDuration(itinerary: Itinerary): number {
  return itinerary.days.length;
}

/**
 * Get formatted date range string
 */
export function getDateRangeString(itinerary: Itinerary): string {
  const start = new Date(itinerary.startDateUtc);
  const end = new Date(itinerary.endDateUtc);
  
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
}
