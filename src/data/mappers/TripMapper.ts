import type { Attraction, AttractionCategory } from '@/domain/entities/Attraction';
import type { Activity } from '@/domain/entities/Activity';
import type { Itinerary, ItineraryDay } from '@/domain/entities/Itinerary';
import type { Location } from '@/domain/value-objects/Location';
import type {
  AttractionDto,
  ActivityDto,
  ItineraryDayDto,
  GeneratedItineraryDto,
} from '../dto/TripGenerationDto';

/**
 * Map attraction DTO to domain entity
 */
export function mapAttractionToDomain(dto: AttractionDto, index: number): Attraction {
  return {
    id: `attr_${Date.now()}_${index}`,
    name: dto.name,
    description: dto.description,
    category: mapCategory(dto.category),
    address: dto.address,
    coordinates: {
      latitude: dto.latitude,
      longitude: dto.longitude,
    },
    estimatedDurationMinutes: dto.estimatedDurationMinutes,
    estimatedCostUsd: dto.estimatedCostUsd,
    rating: dto.rating,
  };
}

/**
 * Map activity DTO to domain entity with UTC times
 */
export function mapActivityToDomain(
  dto: ActivityDto,
  date: string,
  ianaTimezone: string,
  index: number
): Activity {
  return {
    id: `act_${Date.now()}_${index}`,
    name: dto.name,
    description: dto.description,
    category: dto.category,
    address: dto.address,
    coordinates: {
      latitude: dto.latitude,
      longitude: dto.longitude,
    },
    startTimeUtc: toUtcIso(date, dto.startTime, ianaTimezone),
    endTimeUtc: toUtcIso(date, dto.endTime, ianaTimezone),
    durationMinutes: dto.durationMinutes,
    estimatedCostUsd: dto.estimatedCostUsd,
  };
}

/**
 * Map generated itinerary DTO to domain entity
 */
export function mapItineraryToDomain(
  dto: GeneratedItineraryDto,
  userId: string,
  destination: Location,
  startDateUtc: string,
  endDateUtc: string,
  interests: string[],
  budgetUsd: number | null
): Itinerary {
  const ianaTimezone = destination.ianaTimezone || 'UTC';
  
  const days: ItineraryDay[] = dto.days.map((dayDto, dayIndex) => ({
    dayNumber: dayDto.dayNumber,
    date: dayDto.date,
    activities: dayDto.activities.map((actDto, actIndex) =>
      mapActivityToDomain(actDto, dayDto.date, ianaTimezone, dayIndex * 100 + actIndex)
    ),
  }));

  const now = new Date().toISOString();
  
  return {
    id: `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    destination,
    startDateUtc,
    endDateUtc,
    days,
    interests,
    budgetUsd,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Convert local time to UTC ISO string
 */
function toUtcIso(date: string, time: string, _ianaTimezone: string): string {
  // For simplicity, combine date and time directly
  // In production, use date-fns-tz for proper timezone conversion
  return `${date}T${time}:00.000Z`;
}

/**
 * Map string category to typed category
 */
function mapCategory(category: string): AttractionCategory {
  const validCategories: AttractionCategory[] = [
    'culture', 'foodie', 'adventure', 'relax', 'shopping',
    'nightlife', 'history', 'wellness', 'beach', 'photography',
    'nature', 'landmark',
  ];
  
  const normalized = category.toLowerCase().trim();
  return validCategories.includes(normalized as AttractionCategory)
    ? (normalized as AttractionCategory)
    : 'landmark';
}
