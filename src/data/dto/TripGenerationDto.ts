/**
 * DTOs for trip generation API responses
 */

export interface AttractionDto {
  name: string;
  description: string;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  estimatedDurationMinutes: number;
  estimatedCostUsd: number | null;
  bestTimeToVisit: 'morning' | 'afternoon' | 'evening';
  rating: number;
}

export interface AttractionSuggestionsDto {
  destinationOverview: string;
  attractions: AttractionDto[];
}

export interface ActivityDto {
  name: string;
  description: string;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  estimatedCostUsd: number | null;
}

export interface ItineraryDayDto {
  dayNumber: number;
  date: string;
  activities: ActivityDto[];
}

export interface GeneratedItineraryDto {
  days: ItineraryDayDto[];
}
