/**
 * Attraction entity - represents a suggested attraction from AI
 */
export interface Attraction {
  id: string;
  name: string;
  description: string;
  category: AttractionCategory;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  estimatedDurationMinutes: number;
  estimatedCostUsd: number | null;
  imageUrl?: string;
  rating?: number;
}

export type AttractionCategory =
  | 'culture'
  | 'foodie'
  | 'adventure'
  | 'relax'
  | 'shopping'
  | 'nightlife'
  | 'history'
  | 'wellness'
  | 'beach'
  | 'photography'
  | 'nature'
  | 'landmark';

export function createAttraction(data: Omit<Attraction, 'id'>): Attraction {
  return {
    id: `attr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...data,
  };
}
