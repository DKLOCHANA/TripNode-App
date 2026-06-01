import type React from 'react';
import { Ionicons } from '@expo/vector-icons';

export type DaySegment = 'morning' | 'afternoon' | 'evening';

/**
 * Accent colour + icon for each time-of-day segment in the itinerary timeline.
 * Centralised here (with the rest of the theme) rather than hardcoded in the
 * screen. Base hues derive a translucent icon-chip background plus readable
 * icon colour, adapting to light/dark via the `isDark` flag.
 */
const SEGMENT_BASE: Record<DaySegment, string> = {
  morning: '#FF9F0A', // sunrise — warm amber
  afternoon: '#0A84FF', // sun — brand blue
  evening: '#5E5CE6', // moon — indigo
};

const SEGMENT_ICON: Record<DaySegment, React.ComponentProps<typeof Ionicons>['name']> = {
  morning: 'partly-sunny-outline',
  afternoon: 'sunny-outline',
  evening: 'moon-outline',
};

export function getSegmentForHour(hour: number): DaySegment {
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export const SEGMENT_LABEL: Record<DaySegment, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
};

export function getSegmentIcon(segment: DaySegment) {
  return SEGMENT_ICON[segment];
}

export function getSegmentColors(segment: DaySegment, isDark: boolean): { bg: string; tint: string } {
  const base = SEGMENT_BASE[segment];
  return {
    bg: `${base}${isDark ? '2E' : '1F'}`,
    tint: base,
  };
}
