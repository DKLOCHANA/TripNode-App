/**
 * Per-interest accent colours for trip interest tags.
 *
 * Centralised here so the palette lives with the rest of the theme instead of
 * being hardcoded in screens. Each base hue (Apple-system style) is used to
 * derive a translucent chip background plus readable text, adapting to light
 * and dark mode via the `isDark` flag.
 */
const INTEREST_BASE: Record<string, string> = {
  culture: '#5856D6',
  foodie: '#FF9500',
  adventure: '#34C759',
  relax: '#00C7BE',
  shopping: '#FF2D55',
  nightlife: '#AF52DE',
  history: '#A2845E',
  wellness: '#30B0C7',
  beach: '#007AFF',
  photography: '#FF3B30',
  nature: '#2FB344',
  landmark: '#647387',
};

const FALLBACK = '#0A84FF';

export function getInterestColors(id: string, isDark: boolean): { bg: string; text: string } {
  const base = INTEREST_BASE[id] ?? FALLBACK;
  // Append an alpha channel to the 6-digit hex: ~18% in dark, ~12% in light.
  return {
    bg: `${base}${isDark ? '2E' : '1F'}`,
    text: base,
  };
}
