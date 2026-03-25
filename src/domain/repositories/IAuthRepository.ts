import type { User } from '../entities/User';

export interface AuthResult {
  user: User;
  token?: string;
}

export interface IAuthRepository {
  /**
   * Sign in with email and password
   */
  signInWithEmail(email: string, password: string): Promise<AuthResult>;

  /**
   * Register a new user with email and password
   */
  registerWithEmail(
    name: string,
    email: string,
    password: string
  ): Promise<AuthResult>;

  /**
   * Sign in with Apple
   */
  signInWithApple(): Promise<AuthResult>;

  /**
   * Sign in with Google
   */
  signInWithGoogle(): Promise<AuthResult>;

  /**
   * Sign out the current user
   */
  signOut(): Promise<void>;

  /**
   * Get the current authenticated user
   */
  getCurrentUser(): Promise<User | null>;

  /**
   * Delete the current user's account
   */
  deleteAccount(): Promise<void>;

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void;
}
