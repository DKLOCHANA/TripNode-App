import type { Activity } from '@/domain/entities/Activity';
import type { ActivityDto, CreateActivityDto } from '../dto/ActivityDto';

/**
 * Map Activity DTO to domain entity
 */
export function mapActivityDtoToDomain(dto: ActivityDto): Activity {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    category: dto.category,
    address: dto.address,
    coordinates: {
      latitude: dto.latitude,
      longitude: dto.longitude,
    },
    startTimeUtc: dto.startTime,
    endTimeUtc: dto.endTime,
    durationMinutes: dto.durationMinutes,
    estimatedCostUsd: dto.estimatedCostUsd,
  };
}

/**
 * Map domain Activity to DTO for API requests
 */
export function mapActivityToDto(activity: Activity): ActivityDto {
  return {
    id: activity.id,
    name: activity.name,
    description: activity.description,
    category: activity.category,
    address: activity.address,
    latitude: activity.coordinates.latitude,
    longitude: activity.coordinates.longitude,
    startTime: activity.startTimeUtc,
    endTime: activity.endTimeUtc,
    durationMinutes: activity.durationMinutes,
    estimatedCostUsd: activity.estimatedCostUsd,
  };
}

/**
 * Map domain Activity to create DTO (without ID)
 */
export function mapActivityToCreateDto(activity: Omit<Activity, 'id'>): CreateActivityDto {
  return {
    name: activity.name,
    description: activity.description,
    category: activity.category,
    address: activity.address,
    latitude: activity.coordinates.latitude,
    longitude: activity.coordinates.longitude,
    startTime: activity.startTimeUtc,
    endTime: activity.endTimeUtc,
    durationMinutes: activity.durationMinutes,
    estimatedCostUsd: activity.estimatedCostUsd,
  };
}
