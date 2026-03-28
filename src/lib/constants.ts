import { EXPO_PUBLIC_REVENUECAT_API_KEY, EXPO_PUBLIC_REVENUECAT_TEST_API_KEY } from '@env';

export const REVENUECAT = {
  API_KEY: EXPO_PUBLIC_REVENUECAT_API_KEY,
  TEST_API_KEY: EXPO_PUBLIC_REVENUECAT_TEST_API_KEY,
  ENTITLEMENT_PRO: 'TripNode Premium',
  PACKAGE_ANNUAL: '$rc_annual',
  PACKAGE_MONTHLY: '$rc_monthly',
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
export const PLACES_DEBOUNCE_MS = 350;
