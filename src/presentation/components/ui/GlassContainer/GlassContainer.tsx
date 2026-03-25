import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/theme/ThemeContext';
import { shadows } from '@/theme/shadows';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

interface GlassContainerProps {
  children: React.ReactNode;
  intensity?: number;
  padding?: number;
  style?: ViewStyle;
}

export function GlassContainer({
  children,
  intensity = 40,
  padding = spacing.md,
  style,
}: GlassContainerProps) {
  const { colors, isDark } = useTheme();

  return (
    // Outer wrapper: shadow + borderRadius. Must NOT have overflow:hidden or shadow is clipped.
    <View style={[styles.shadow, style]}>
      {/* Inner wrapper: overflow:hidden to clip the BlurView to rounded corners */}
      <View style={[styles.inner, { borderColor: colors.glassBorder }]}>
        <BlurView
          intensity={intensity}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.glassSurface }]} />
        <View style={{ padding }}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: radii.card,
    ...shadows.card,
  },
  inner: {
    borderRadius: radii.card,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
