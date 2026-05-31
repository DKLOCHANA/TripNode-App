import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  writeBatch,
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

/**
 * Permanently delete every trip belonging to a user (account deletion).
 * Must run while the user is still authenticated (Firestore rules).
 */
export async function deleteAllTripsFromFirebase(userId: string): Promise<void> {
  const tripsRef = collection(db, TRIPS_COLLECTION);
  const snapshot = await getDocs(query(tripsRef, where('userId', '==', userId)));

  if (snapshot.empty) return;

  // Chunk into batches (Firestore hard limit is 500 writes per batch).
  const BATCH_LIMIT = 450;
  for (let i = 0; i < snapshot.docs.length; i += BATCH_LIMIT) {
    const batch = writeBatch(db);
    snapshot.docs
      .slice(i, i + BATCH_LIMIT)
      .forEach((docSnap) => batch.delete(docSnap.ref));
    await batch.commit();
  }
}
