import { create } from 'zustand';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  registerWithEmail,
  signInWithEmail,
  signInWithApple,
  logOut,
  subscribeToAuthState,
} from '@/data/sources/remote/firebase/auth';
import {
  SecureStoreService,
  type StoredUser,
} from '@/data/sources/local/secureStore';
import { type DomainError, normalizeFirebaseError } from '@/errors/DomainError';

// App User type (stored locally)
export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthState {
  user: AppUser | null;
  loading: boolean;
  isHydrated: boolean; // true when SecureStore read completes on app launch
  error: DomainError | null;

  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  clearUser: () => void;
  init: () => () => void;
}

// Helper to convert Firebase user to our app user
function toAppUser(firebaseUser: FirebaseUser): AppUser {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  isHydrated: false,
  error: null,

  signIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const result = await signInWithEmail(email, password);
      const appUser = toAppUser(result.user);

      // Store user data locally for persistence
      await SecureStoreService.setUser({
        uid: appUser.uid,
        email: appUser.email,
        displayName: appUser.displayName,
        photoURL: appUser.photoURL,
      });

      // Get and store the ID token
      const token = await result.user.getIdToken();
      await SecureStoreService.setToken(token);

      set({ user: appUser, loading: false });
    } catch (err: any) {
      const domainError = normalizeFirebaseError(err.code);
      set({ error: domainError, loading: false });
      throw domainError;
    }
  },

  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const result = await registerWithEmail(name, email, password);
      const appUser = toAppUser(result.user);

      // Store user data locally for persistence
      await SecureStoreService.setUser({
        uid: appUser.uid,
        email: appUser.email,
        displayName: appUser.displayName,
        photoURL: appUser.photoURL,
      });

      // Get and store the ID token
      const token = await result.user.getIdToken();
      await SecureStoreService.setToken(token);

      set({ user: appUser, loading: false });
    } catch (err: any) {
      const domainError = normalizeFirebaseError(err.code);
      set({ error: domainError, loading: false });
      throw domainError;
    }
  },

  signInWithApple: async () => {
    set({ loading: true, error: null });
    try {
      const result = await signInWithApple();
      const appUser = toAppUser(result.user);

      await SecureStoreService.setUser({
        uid: appUser.uid,
        email: appUser.email,
        displayName: appUser.displayName,
        photoURL: appUser.photoURL,
      });

      const token = await result.user.getIdToken();
      await SecureStoreService.setToken(token);

      set({ user: appUser, loading: false });
    } catch (err: any) {
      // User cancelled the Apple Sign In flow
      if (err.code === 'ERR_REQUEST_CANCELED') {
        set({ loading: false });
        return;
      }
      const domainError = normalizeFirebaseError(err.code);
      set({ error: domainError, loading: false });
      throw domainError;
    }
  },

  signOut: async () => {
    set({ loading: true, error: null });
    try {
      await logOut();
      // Clear all stored auth data
      await SecureStoreService.clearAll();
      set({ user: null, loading: false });
    } catch (err: any) {
      const domainError = normalizeFirebaseError(err.code);
      set({ error: domainError, loading: false });
    }
  },

  clearError: () => set({ error: null }),

  clearUser: () => {
    SecureStoreService.clearAll();
    set({ user: null });
  },

  init: () => {
    // Set a timeout to ensure isHydrated is set even if Firebase is slow
    const hydrationTimeout = setTimeout(() => {
      set((state) => {
        // Only set isHydrated if it's still false (hasn't been set by Firebase yet)
        if (!state.isHydrated) {
          console.warn('Auth hydration timeout - setting isHydrated to prevent infinite loading');
          return { isHydrated: true };
        }
        return state;
      });
    }, 5000); // 5 second timeout for hydration

    // First, try to load user from secure storage (for instant startup)
    SecureStoreService.getUser()
      .then((storedUser) => {
        if (storedUser) {
          set({
            user: {
              uid: storedUser.uid,
              email: storedUser.email,
              displayName: storedUser.displayName,
              photoURL: storedUser.photoURL,
            },
          });
        }
      })
      .catch((error) => {
        console.warn('Failed to load stored user:', error);
      });

    // Then subscribe to Firebase auth state for real-time updates
    const unsubscribe = subscribeToAuthState(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const appUser = toAppUser(firebaseUser);

          // Update stored user data
          await SecureStoreService.setUser({
            uid: appUser.uid,
            email: appUser.email,
            displayName: appUser.displayName,
            photoURL: appUser.photoURL,
          });

          // Refresh token
          const token = await firebaseUser.getIdToken();
          await SecureStoreService.setToken(token);

          set({ user: appUser, isHydrated: true, loading: false });
        } else {
          // User signed out or no user
          // Only clear if we don't have stored user (handles offline case)
          const storedUser = await SecureStoreService.getUser();
          if (!storedUser) {
            set({ user: null, isHydrated: true, loading: false });
          } else {
            // Keep stored user for offline access, but mark as hydrated
            set({ isHydrated: true, loading: false });
          }
        }
      } catch (error) {
        console.warn('Error during auth state update:', error);
        // Ensure we're marked as hydrated even on error
        set({ isHydrated: true, loading: false });
      } finally {
        clearTimeout(hydrationTimeout);
      }
    });

    return () => {
      clearTimeout(hydrationTimeout);
      unsubscribe();
    };
  },
}));
