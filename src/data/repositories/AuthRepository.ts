import type { IAuthRepository, AuthResult } from '@/domain/repositories/IAuthRepository';
import type { User } from '@/domain/entities/User';
import {
  registerWithEmail as firebaseRegister,
  signInWithEmail as firebaseSignIn,
  signInWithApple as firebaseSignInWithApple,
  logOut as firebaseLogOut,
  subscribeToAuthState,
} from '@/data/sources/remote/firebase/auth';
import { SecureStoreService } from '@/data/sources/local/secureStore';
import { auth } from '@/data/sources/remote/firebase/config';
import { deleteUser } from 'firebase/auth';

/**
 * Auth repository implementation using Firebase
 */
export class AuthRepository implements IAuthRepository {
  async signInWithEmail(email: string, password: string): Promise<AuthResult> {
    const result = await firebaseSignIn(email, password);
    const user = this.mapFirebaseUser(result.user);
    const token = await result.user.getIdToken();
    
    await SecureStoreService.setToken(token);
    
    return { user, token };
  }

  async registerWithEmail(name: string, email: string, password: string): Promise<AuthResult> {
    const result = await firebaseRegister(name, email, password);
    const user = this.mapFirebaseUser(result.user);
    const token = await result.user.getIdToken();
    
    await SecureStoreService.setToken(token);
    
    return { user, token };
  }

  async signInWithApple(): Promise<AuthResult> {
    const result = await firebaseSignInWithApple();
    const user = this.mapFirebaseUser(result.user);
    const token = await result.user.getIdToken();

    await SecureStoreService.setToken(token);

    return { user, token };
  }

  async signInWithGoogle(): Promise<AuthResult> {
    // TODO: Implement Google Sign In
    throw new Error('Google Sign In not implemented');
  }

  async signOut(): Promise<void> {
    await firebaseLogOut();
    await SecureStoreService.clearAll();
  }

  async getCurrentUser(): Promise<User | null> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;
    return this.mapFirebaseUser(firebaseUser);
  }

  async deleteAccount(): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }
    
    await deleteUser(user);
    await SecureStoreService.clearAll();
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return subscribeToAuthState((firebaseUser) => {
      callback(firebaseUser ? this.mapFirebaseUser(firebaseUser) : null);
    });
  }

  private mapFirebaseUser(firebaseUser: { uid: string; email: string | null; displayName: string | null; photoURL: string | null }): User {
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.displayName,
      photoUrl: firebaseUser.photoURL,
      createdAt: new Date().toISOString(),
    };
  }
}

// Singleton instance
export const authRepository = new AuthRepository();
