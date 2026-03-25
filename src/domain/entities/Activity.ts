/**
 * Activity entity - a scheduled activity in an itinerary
 */
export interface Activity {
  id: string;
  name: string;
  description: string;
  category: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  startTimeUtc: string; // ISO 8601
  endTimeUtc: string;   // ISO 8601
  durationMinutes: number;
  estimatedCostUsd: number | null;
}

export interface FreeTimeBlock {
  id: string;
  startTimeUtc: string;
  endTimeUtc: string;
  durationMinutes: number;
}

export type TimelineItem = 
  | { type: 'activity'; data: Activity }
  | { type: 'freeTime'; data: FreeTimeBlock };

export function createActivity(data: Omit<Activity, 'id'>): Activity {
  return {
    id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...data,
  };
}

export function createFreeTimeBlock(
  startTimeUtc: string,
  endTimeUtc: string,
  durationMinutes: number
): FreeTimeBlock {
  return {
    id: `free_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    startTimeUtc,
    endTimeUtc,
    durationMinutes,
  };
}
