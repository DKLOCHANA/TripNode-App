import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Typography } from '@/presentation/components/ui/Typography';
import { useTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme/spacing';
import { radii } from '@/theme/radii';

interface InterestChipProps {
  label: string;
  emoji: string;
  selected: boolean;
  compact?: boolean;
  onToggle: () => void;
}

export function InterestChip({ label, emoji, selected, compact = false, onToggle }: InterestChipProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onToggle}
      hitSlop={compact ? 4 : 2}
      style={[
        styles.chip,
        compact && styles.chipCompact,
        { borderColor: colors.glassBorder, backgroundColor: colors.glassSurface },
        selected && { backgroundColor: colors.electricBlue, borderColor: colors.electricBlue },
      ]}
    >
      <Typography variant="footnote" style={styles.emoji}>
        {emoji}
      </Typography>
      <Typography
        variant="footnote"
        weight={selected ? 'semiBold' : 'regular'}
        color={selected ? colors.white : colors.textSecondary}
      >
        {label}
      </Typography>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
    minHeight: 36,
  },
  chipCompact: {
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.xs,
    marginRight: 0,
    marginBottom: 0,
    minHeight: 28,
  },
  emoji: {
    marginRight: spacing.xxs,
  },
});
