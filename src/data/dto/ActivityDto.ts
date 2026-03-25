/**
 * Activity DTO - API response shape for activity data
 * Note: This extends the existing ActivityDto in TripGenerationDto.ts
 * for standalone activity operations
 */
export interface ActivityDto {
  id: string;
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

/**
 * Activity create/update request DTO
 */
export interface CreateActivityDto {
  name: string;
  description: string;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  estimatedCostUsd?: number | null;
}
