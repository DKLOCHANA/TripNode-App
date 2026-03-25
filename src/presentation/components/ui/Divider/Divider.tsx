import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme/spacing';
import { Typography } from '../Typography';

interface DividerProps {
  label?: string;
  style?: ViewStyle;
}

export function Divider({ label, style }: DividerProps) {
  const { colors } = useTheme();

  if (label) {
    return (
      <View style={[styles.labelContainer, style]}>
        <View style={[styles.line, { backgroundColor: colors.glassBorder }]} />
        <Typography
          variant="caption1"
          color={colors.textTertiary}
          style={styles.label}
        >
          {label}
        </Typography>
        <View style={[styles.line, { backgroundColor: colors.glassBorder }]} />
      </View>
    );
  }

  return <View style={[styles.fullLine, { backgroundColor: colors.glassBorder }, style]} />;
}

const styles = StyleSheet.create({
  fullLine: {
    height: StyleSheet.hairlineWidth,
    marginVertical: spacing.md,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  label: {
    marginHorizontal: spacing.sm,
  },
});
