/**
 * Interest value object - represents a travel interest category
 */

export const INTEREST_IDS = [
  'culture',
  'foodie',
  'adventure',
  'relax',
  'shopping',
  'nightlife',
  'history',
  'wellness',
  'beach',
  'photography',
] as const;

export type InterestId = (typeof INTEREST_IDS)[number];

export interface Interest {
  id: InterestId;
  label: string;
  emoji: string;
}

/**
 * All available interests with labels and emojis
 */
export const INTERESTS: readonly Interest[] = [
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

/**
 * Check if a string is a valid interest ID
 */
export function isValidInterestId(id: string): id is InterestId {
  return INTEREST_IDS.includes(id as InterestId);
}

/**
 * Get interest by ID
 */
export function getInterestById(id: InterestId): Interest | undefined {
  return INTERESTS.find((interest) => interest.id === id);
}

/**
 * Get labels for a list of interest IDs
 */
export function getInterestLabels(ids: InterestId[]): string[] {
  return ids
    .map((id) => getInterestById(id)?.label)
    .filter((label): label is string => label !== undefined);
}
