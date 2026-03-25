import { useAuthStore } from '@/store/authStore';

/**
 * Hook to access auth state and actions
 * Provides a clean interface for components to interact with authentication
 */
export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const error = useAuthStore((state) => state.error);
  const signIn = useAuthStore((state) => state.signIn);
  const register = useAuthStore((state) => state.register);
  const signOut = useAuthStore((state) => state.signOut);
  const clearError = useAuthStore((state) => state.clearError);

  return {
    // State
    user,
    isAuthenticated: !!user,
    loading,
    isHydrated,
    error,

    // Actions
    signIn,
    register,
    signOut,
    clearError,
  };
}
