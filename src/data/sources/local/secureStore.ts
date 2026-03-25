import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'tripnode_auth_token';
const REFRESH_TOKEN_KEY = 'tripnode_refresh_token';
const USER_KEY = 'tripnode_user_data';

export interface StoredUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export const SecureStoreService = {
  // Token management
  getToken: () => SecureStore.getItemAsync(TOKEN_KEY),
  setToken: (token: string) => SecureStore.setItemAsync(TOKEN_KEY, token),
  clearToken: () => SecureStore.deleteItemAsync(TOKEN_KEY),

  getRefreshToken: () => SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
  setRefreshToken: (token: string) => SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token),
  clearRefreshToken: () => SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),

  // User data management (for offline access)
  getUser: async (): Promise<StoredUser | null> => {
    const data = await SecureStore.getItemAsync(USER_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data) as StoredUser;
    } catch {
      return null;
    }
  },

  setUser: async (user: StoredUser): Promise<void> => {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  },

  clearUser: () => SecureStore.deleteItemAsync(USER_KEY),

  // Clear all auth data
  clearAll: async (): Promise<void> => {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);
  },
};
