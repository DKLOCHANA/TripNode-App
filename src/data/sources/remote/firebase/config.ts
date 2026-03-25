import { initializeApp, getApp, getApps } from 'firebase/app';
// @ts-expect-error - getReactNativePersistence exists in firebase/auth but types may lag behind
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  EXPO_PUBLIC_FIREBASE_FIREBASE_API_KEY,
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  EXPO_PUBLIC_FIREBASE_APP_ID,
} from '@env';

// Validate required Firebase configuration
const requiredConfig = {
  apiKey: EXPO_PUBLIC_FIREBASE_FIREBASE_API_KEY,
  authDomain: EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Check for missing environment variables
const missingVars = Object.entries(requiredConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error(
    `Firebase configuration error: Missing environment variables: ${missingVars.join(', ')}`
  );
  throw new Error(
    `Firebase initialization failed: Missing required environment variables`
  );
}

const firebaseConfig = requiredConfig;

// Initialize Firebase app (handle hot reload)
let app;
try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
} catch (error) {
  console.error('Firebase app initialization error:', error);
  throw error;
}

// Initialize auth with AsyncStorage persistence for React Native
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  // Auth may already be initialized
  console.warn('Firebase auth initialization warning:', error);
}

export const db = getFirestore(app);
export const storage = getStorage(app);
export { auth };
