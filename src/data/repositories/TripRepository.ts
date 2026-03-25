import { AsyncStorageService } from '@/data/sources/local/asyncStorage';
import {
  saveTripToFirebase,
  deleteTripFromFirebase,
  getTripsFromFirebase,
  getTripFromFirebase,
} from '@/data/sources/remote/firebase/firestoreTrips';
import type { Itinerary } from '@/domain/entities/Itinerary';

const TRIPS_STORAGE_KEY = 'tripnode_trips_v1';
const PHOTO_CACHE_KEY = 'tripnode_photo_cache_v1';

type TripsStore = Record<string, Itinerary[]>;
type PhotoCache = Record<string, string>;

/**
 * Read trips store from local storage
 */
async function readStore(): Promise<TripsStore> {
  const raw = await AsyncStorageService.getItem(TRIPS_STORAGE_KEY);
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as TripsStore;
    return parsed ?? {};
  } catch {
    return {};
  }
}

/**
 * Write trips store to local storage
 */
async function writeStore(store: TripsStore): Promise<void> {
  await AsyncStorageService.setItem(TRIPS_STORAGE_KEY, JSON.stringify(store));
}

/**
 * Trip Repository implementation following Clean Architecture
 * Implements offline-first pattern with Firebase sync
 */
export class TripRepository {
  async getTrips(userId: string): Promise<Itinerary[]> {
    const store = await readStore();
    const trips = store[userId] ?? [];

    return [...trips].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getTripById(userId: string, tripId: string): Promise<Itinerary | null> {
    const trips = await this.getTrips(userId);
    return trips.find((trip) => trip.id === tripId) ?? null;
  }

  async saveTrip(itinerary: Itinerary): Promise<Itinerary> {
    // Save locally first (offline-first approach)
    const store = await readStore();
    const userTrips = store[itinerary.userId] ?? [];

    const nextTrips = [itinerary, ...userTrips.filter((trip) => trip.id !== itinerary.id)];
    store[itinerary.userId] = nextTrips;

    await writeStore(store);

    // Then sync to Firebase (fire and forget, don't block UI)
    saveTripToFirebase(itinerary).catch((error) => {
      console.warn('Failed to sync trip to Firebase:', error);
    });

    return itinerary;
  }

  async deleteTrip(userId: string, tripId: string): Promise<void> {
    // Delete locally first
    const store = await readStore();
    const userTrips = store[userId] ?? [];
    store[userId] = userTrips.filter((trip) => trip.id !== tripId);
    await writeStore(store);

    // Then delete from Firebase (fire and forget)
    deleteTripFromFirebase(tripId).catch((error) => {
      console.warn('Failed to delete trip from Firebase:', error);
    });
  }

  /**
   * Sync local trips with Firebase
   */
  async syncWithFirebase(userId: string): Promise<void> {
    try {
      const remoteTrips = await getTripsFromFirebase(userId);
      const store = await readStore();
      
      // Merge remote trips with local (remote takes precedence)
      const localTrips = store[userId] ?? [];
      const mergedTrips = this.mergeTrips(localTrips, remoteTrips);
      
      store[userId] = mergedTrips;
      await writeStore(store);
    } catch (error) {
      console.warn('Failed to sync with Firebase:', error);
    }
  }

  private mergeTrips(local: Itinerary[], remote: Itinerary[]): Itinerary[] {
    const tripMap = new Map<string, Itinerary>();
    
    // Add local trips first
    local.forEach((trip) => tripMap.set(trip.id, trip));
    
    // Override with remote trips (they are the source of truth)
    remote.forEach((trip) => tripMap.set(trip.id, trip));
    
    return Array.from(tripMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}

// Photo cache functions
export async function getCachedPhoto(searchQuery: string): Promise<string | null> {
  const raw = await AsyncStorageService.getItem(PHOTO_CACHE_KEY);
  if (!raw) return null;

  try {
    const cache = JSON.parse(raw) as PhotoCache;
    return cache[searchQuery] ?? null;
  } catch {
    return null;
  }
}

export async function setCachedPhoto(searchQuery: string, photoUri: string): Promise<void> {
  let cache: PhotoCache = {};

  const raw = await AsyncStorageService.getItem(PHOTO_CACHE_KEY);
  if (raw) {
    try {
      cache = JSON.parse(raw) as PhotoCache;
    } catch {
      cache = {};
    }
  }

  cache[searchQuery] = photoUri;
  await AsyncStorageService.setItem(PHOTO_CACHE_KEY, JSON.stringify(cache));
}

// Export singleton instance for convenience
export const tripRepository = new TripRepository();

// Re-export legacy functions for backward compatibility
export const getTripsByUser = (userId: string) => tripRepository.getTrips(userId);
export const getTripById = (userId: string, tripId: string) => tripRepository.getTripById(userId, tripId);
export const saveTrip = (itinerary: Itinerary) => tripRepository.saveTrip(itinerary);
export const deleteTripById = (userId: string, tripId: string) => tripRepository.deleteTrip(userId, tripId);
