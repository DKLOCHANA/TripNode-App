import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/data/sources/remote/firebase/config';
import type { Itinerary } from '@/domain/entities/Itinerary';

const TRIPS_COLLECTION = 'trips';

/**
 * Save a trip to Firestore
 */
export async function saveTripToFirebase(itinerary: Itinerary): Promise<void> {
  const tripRef = doc(db, TRIPS_COLLECTION, itinerary.id);
  await setDoc(tripRef, itinerary);
}

/**
 * Get all trips for a user from Firestore
 */
export async function getTripsFromFirebase(userId: string): Promise<Itinerary[]> {
  const tripsRef = collection(db, TRIPS_COLLECTION);
  const q = query(
    tripsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as Itinerary);
}

/**
 * Get a single trip by ID from Firestore
 */
export async function getTripFromFirebase(tripId: string): Promise<Itinerary | null> {
  const tripRef = doc(db, TRIPS_COLLECTION, tripId);
  const snapshot = await getDoc(tripRef);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as Itinerary;
}

/**
 * Delete a trip from Firestore
 */
export async function deleteTripFromFirebase(tripId: string): Promise<void> {
  const tripRef = doc(db, TRIPS_COLLECTION, tripId);
  await deleteDoc(tripRef);
}
