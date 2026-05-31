import { EXPO_PUBLIC_REVENUECAT_API_KEY, EXPO_PUBLIC_REVENUECAT_TEST_API_KEY, APPSFLYER_DEV_KEY } from '@env';

export const REVENUECAT = {
  API_KEY: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY,
  TEST_API_KEY: process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY,
  ENTITLEMENT_PRO: 'TripNode Premium',
  PACKAGE_ANNUAL: '$rc_annual',
  PACKAGE_MONTHLY: '$rc_monthly',
} as const;

export const APPSFLYER = {
  DEV_KEY: APPSFLYER_DEV_KEY,
  APP_ID: '6761075583',
  ATT_TIMEOUT_SECONDS: 120,
} as const;

export const INTERESTS = [
  { id: 'culture', label: 'Culture', emoji: '🏛️' },
  { id: 'foodie', label: 'Foodie', emoji: '🍜' },
  { id: 'adventure', label: 'Adventure', emoji: '⛰️' },
  { id: 'relax', label: 'Relax', emoji: '🏖️' },
  { id: 'shopping', label: 'Shopping', emoji: '🏪' },
  { id: 'nightlife', label: 'Nightlife', emoji: '🌃' },
  { id: 'history', label: 'History', emoji: '🏰' },
  { id: 'wellness', label: 'Wellness', emoji: '🧘' },
  { id: 'beach', label: 'Beach', emoji: '🏝️' },
  { id: 'photography', label: 'Photography', emoji: '📸' },
] as const;

export type InterestId = (typeof INTERESTS)[number]['id'];

export const MAX_TRIP_DAYS = 5;
export const FREE_TRIP_LIMIT = 1;
export const PLACES_DEBOUNCE_MS = 350;
