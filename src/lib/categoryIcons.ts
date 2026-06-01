import type React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { INTERESTS } from '@/lib/constants';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

/**
 * Maps an attraction/interest category to an Ionicon. Shared by the attraction
 * cards and the generating-trip loading pills so the icon set stays consistent.
 */
const CATEGORY_ICON: Record<string, IoniconName> = {
  culture: 'business-outline',
  foodie: 'restaurant-outline',
  adventure: 'trail-sign-outline',
  relax: 'bed-outline',
  shopping: 'bag-handle-outline',
  nightlife: 'wine-outline',
  history: 'time-outline',
  wellness: 'flower-outline',
  beach: 'sunny-outline',
  photography: 'camera-outline',
  nature: 'leaf-outline',
  landmark: 'location-outline',
};

const INTEREST_LABELS = Object.fromEntries(INTERESTS.map((i) => [i.id, i.label]));

export function getCategoryIcon(category: string): IoniconName {
  return CATEGORY_ICON[category?.toLowerCase()] ?? 'location-outline';
}

/** Human label for a category — interest label if known, else capitalised. */
export function getCategoryLabel(category: string): string {
  if (!category) return '';
  const key = category.toLowerCase();
  return INTEREST_LABELS[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
}
