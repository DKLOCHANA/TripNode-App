export { colors, darkColors, lightColors } from './colors';
export { typography } from './typography';
export { spacing } from './spacing';
export { radii } from './radii';
export { shadows } from './shadows';
export { springs, durations } from './animations';
export { ThemeProvider, useTheme } from './ThemeContext';

import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { radii } from './radii';
import { shadows } from './shadows';
import { springs, durations } from './animations';

export const theme = {
  colors,
  typography,
  spacing,
  radii,
  shadows,
  springs,
  durations,
} as const;
