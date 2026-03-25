import type { Location } from '../value-objects/Location';
import type { DateRange } from '../value-objects/DateRange';
import type { InterestId } from '@/lib/constants';

export interface Trip {
  id: string;
  userId: string;
  destination: Location;
  dateRange: DateRange;
  interests: InterestId[];
  budgetUsd: number | null;
  days: ItineraryDay[];
  createdAt: string;
}

export interface ItineraryDay {
  dayNumber: number;
  date: string; // UTC ISO
  activities: Activity[];
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  timeSlot: 'morning' | 'afternoon' | 'evening';
  estimatedTimeUtc: string;
  estimatedDurationMinutes: number;
  estimatedCostUsd: number;
  location: {
    name: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  category: string;
}
