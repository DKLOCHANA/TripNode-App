import type { Trip } from '../entities/Trip';
import type { Location } from '../value-objects/Location';
import type { InterestId } from '@/lib/constants';

export interface GenerateTripParams {
  destination: Location;
  startDateUtc: string;
  endDateUtc: string;
  interests: InterestId[];
  budgetUsd: number | null;
}

export interface ITripRepository {
  /**
   * Generate a new trip using AI
   */
  generateTrip(userId: string, params: GenerateTripParams): Promise<Trip>;

  /**
   * Get all trips for a user
   */
  getTrips(userId: string): Promise<Trip[]>;

  /**
   * Get a single trip by ID
   */
  getTripById(tripId: string): Promise<Trip>;

  /**
   * Delete a trip
   */
  deleteTrip(tripId: string): Promise<void>;

  /**
   * Delete all trips for a user (used in account deletion)
   */
  deleteAllForUser(userId: string): Promise<void>;
}
