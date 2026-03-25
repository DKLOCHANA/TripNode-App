# 05 — Theme System

← [04_Navigation](./04_Navigation.md) | Next → [06_Error_Handling](./06_Error_Handling.md)

---

## Single Source of Truth

**Rule:** One import point. Never use raw hex values, pixel numbers, or font names in component files.

```typescript
// ✅ Correct
import { theme } from '@/theme';
backgroundColor: theme.colors.glassSurface
paddingHorizontal: theme.spacing.screen

// ❌ Wrong
backgroundColor: 'rgba(255,255,255,0.08)'
paddingHorizontal: 20
```

All theme files export from `src/theme/index.ts`:
```typescript
export { colors } from './colors';
export { typography } from './typography';
export { spacing } from './spacing';
export { radii } from './radii';
export { shadows } from './shadows';
export { springs, durations } from './animations';

// Convenience re-export
export const theme = { colors, typography, spacing, radii, shadows, springs, durations };
```

---

## `colors.ts` — Apple Glass Palette

```typescript
export const colors = {
  // Brand
  electricBlue:          '#0A84FF',               // SF System Blue
  electricBlueDim:       'rgba(10,132,255,0.15)',

  // Backgrounds — OLED optimised
  backgroundPrimary:     '#000000',               // Pure black base
  backgroundSecondary:   '#0C0C0E',
  backgroundTertiary:    '#1C1C1E',

  // Glass surfaces (layered over BlurView)
  glassSurface:          'rgba(255,255,255,0.08)',
  glassBorder:           'rgba(255,255,255,0.12)',
  glassHighlight:        'rgba(255,255,255,0.04)',

  // Text
  textPrimary:           '#FFFFFF',
  textSecondary:         'rgba(255,255,255,0.60)',
  textTertiary:          'rgba(255,255,255,0.35)',
  textDisabled:          'rgba(255,255,255,0.20)',

  // Semantic
  success:               '#30D158',
  successDim:            'rgba(48,209,88,0.15)',
  warning:               '#FFD60A',
  error:                 '#FF453A',
  errorDim:              'rgba(255,69,58,0.15)',

  // Tab bar
  tabBarBackground:      'rgba(0,0,0,0.85)',
  tabBarBorder:          'rgba(255,255,255,0.08)',
  tabBarActive:          '#0A84FF',
  tabBarInactive:        'rgba(255,255,255,0.35)',
} as const;
```

---

## `typography.ts` — SF Pro Scale

SF Pro is the iOS system font — **no bundling required**. Reference it via `fontFamily: undefined` (system default). Uses the iOS Human Interface Guidelines font size scale.

```typescript
export const typography = {
  fontWeight: {
    regular:  '400' as const,
    medium:   '500' as const,
    semiBold: '600' as const,
    bold:     '700' as const,
    heavy:    '800' as const,
  },
  fontSize: {
    largeTitle:   34,
    title1:       28,
    title2:       22,
    title3:       20,
    headline:     17,
    body:         17,
    callout:      16,
    subheadline:  15,
    footnote:     13,
    caption1:     12,
    caption2:     11,
  },
  lineHeight: {
    largeTitle:   41,
    title1:       34,
    title2:       28,
    title3:       25,
    headline:     22,
    body:         22,
    callout:      21,
    subheadline:  20,
    footnote:     18,
    caption1:     16,
    caption2:     13,
  },
} as const;
```

---

## `spacing.ts` — 8-Point Grid

Consistent with iOS Human Interface Guidelines.

```typescript
export const spacing = {
  xxs:    4,
  xs:     8,
  sm:     12,
  md:     16,
  lg:     20,
  xl:     24,
  xxl:    32,
  xxxl:   48,
  screen: 20,   // standard horizontal screen padding
} as const;
```

---

## `radii.ts` — Border Radii

```typescript
export const radii = {
  xs:   6,
  sm:   10,
  md:   14,
  lg:   18,
  xl:   24,
  card: 16,     // iOS 16+ convention for cards
  full: 9999,   // fully rounded (pills, avatars)
} as const;
```

---

## `animations.ts` — Reanimated Spring Presets

Consistent physics across the app. Pass these configs to `withSpring()`.

```typescript
export const springs = {
  gentle:  { damping: 20, stiffness: 180 },  // subtle transitions
  snappy:  { damping: 16, stiffness: 300 },  // quick responses
  bouncy:  { damping: 12, stiffness: 250 },  // playful interactions
} as const;

export const durations = {
  fast:   150,   // micro-interactions
  normal: 250,   // standard transitions
  slow:   400,   // entrance/exit animations
} as const;
```

---

## GlassContainer Component

The "Apple Glass" design primitive. Every card-like surface in the app uses this component.

**Implementation** (`src/presentation/components/ui/GlassContainer/GlassContainer.tsx`):

```typescript
import { BlurView } from 'expo-blur';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { theme } from '@/theme';

interface GlassContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
}

export const GlassContainer = ({
  children,
  style,
  intensity = 40,
}: GlassContainerProps) => (
  <BlurView
    intensity={intensity}
    tint="dark"
    style={[styles.blur, style]}
  >
    <View style={styles.overlay} />
    {children}
  </BlurView>
);

const styles = StyleSheet.create({
  blur: {
    borderRadius: theme.radii.card,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.glassSurface,
  },
});
```

---

## Typography Component

All text in the app goes through the `Typography` component — never raw `<Text>`.

```typescript
type TypographyVariant =
  | 'largeTitle' | 'title1' | 'title2' | 'title3'
  | 'headline' | 'body' | 'callout' | 'subheadline'
  | 'footnote' | 'caption1' | 'caption2';

type TypographyColor = keyof typeof theme.colors;

interface TypographyProps {
  variant?: TypographyVariant;
  color?: TypographyColor;
  weight?: keyof typeof theme.typography.fontWeight;
  children: React.ReactNode;
  style?: TextStyle;
}
```

---

## Button Component

Variants map directly to use cases:

| Variant | Use case |
|---|---|
| `primary` | Main CTA (Electric Blue fill) |
| `secondary` | Alternative action (glass surface) |
| `ghost` | Text-only action |
| `destructive` | Delete / dangerous action (error red) |

States: `loading` (shows spinner, disables press), `disabled` (reduced opacity).
