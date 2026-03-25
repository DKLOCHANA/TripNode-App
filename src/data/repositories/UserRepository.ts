import type { IUserRepository } from '@/domain/repositories/IUserRepository';
import type { User } from '@/domain/entities/User';
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/data/sources/remote/firebase/config';

/**
 * User repository implementation using Firestore
 */
export class UserRepository implements IUserRepository {
  private readonly collection = 'users';

  async getProfile(userId: string): Promise<User> {
    const docRef = doc(db, this.collection, userId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('User not found');
    }

    const data = docSnap.data();
    return {
      id: userId,
      email: data.email ?? null,
      name: data.name ?? data.displayName ?? null,
      photoUrl: data.photoUrl ?? data.photoURL ?? null,
      createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    };
  }

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    const docRef = doc(db, this.collection, userId);
    
    const updateData: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.photoUrl !== undefined) updateData.photoUrl = data.photoUrl;

    await updateDoc(docRef, updateData);

    return this.getProfile(userId);
  }

  async deleteProfile(userId: string): Promise<void> {
    const docRef = doc(db, this.collection, userId);
    await deleteDoc(docRef);
  }
}

// Singleton instance
export const userRepository = new UserRepository();
