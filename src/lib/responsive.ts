import { Dimensions, PixelRatio } from 'react-native';

/**
 * Responsive scaling utilities.
 *
 * The onboarding mockups were designed against a reference iPhone (390 x 844pt —
 * iPhone 13/14). These helpers scale fonts, spacing and dimensions relative to the
 * user's actual device so the flow looks correct from iPhone SE up to Pro Max.
 *
 * - `scale`          → scales with screen WIDTH (use for horizontal sizes, font sizes)
 * - `verticalScale`  → scales with screen HEIGHT (use for vertical spacing)
 * - `moderateScale`  → dampened width scale (best default for typography & padding —
 *                       avoids huge text on big phones / tiny text on small phones)
 */

const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Guard against landscape / unusual metrics by always treating the shorter edge as width.
const shortEdge = Math.min(SCREEN_WIDTH, SCREEN_HEIGHT);
const longEdge = Math.max(SCREEN_WIDTH, SCREEN_HEIGHT);

export const screen = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  /** True for compact devices like the iPhone SE / mini. */
  isSmall: shortEdge <= 375,
  /** True for large devices like the Pro Max. */
  isLarge: shortEdge >= 414,
};

export function scale(size: number): number {
  return roundToPixel((shortEdge / BASE_WIDTH) * size);
}

export function verticalScale(size: number): number {
  return roundToPixel((longEdge / BASE_HEIGHT) * size);
}

/**
 * Width-based scale with a damping factor so the result never strays too far from
 * the original design value. `factor` 0 = no scaling, 1 = full `scale()`.
 */
export function moderateScale(size: number, factor = 0.5): number {
  return roundToPixel(size + (scale(size) - size) * factor);
}

/** Font size helper — clamps so text stays legible on every device. */
export function fontScale(size: number): number {
  const scaled = moderateScale(size, 0.45);
  const min = size * 0.85;
  const max = size * 1.18;
  return roundToPixel(Math.min(Math.max(scaled, min), max));
}

function roundToPixel(value: number): number {
  return PixelRatio.roundToNearestPixel(value);
}
