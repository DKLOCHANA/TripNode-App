import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/presentation/components/ui/Typography';
import { formatDurationShort } from '@/lib/date';
import { useTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme/spacing';
import { radii } from '@/theme/radii';
import type { FreeTimeBlock } from '@/domain/entities/Activity';

interface FreeTimeCardProps {
  freeTime: FreeTimeBlock;
}

/** A subtle connector between two activities, indicating free time in between. */
export function FreeTimeCard({ freeTime }: FreeTimeCardProps) {
  const { colors } = useTheme();
  const duration = formatDurationShort(freeTime.durationMinutes);

  return (
    <View style={styles.container}>
      <View style={styles.dots}>
        <View style={[styles.dot, { borderColor: colors.glassBorder }]} />
        <View style={[styles.dash, { borderColor: colors.glassBorder }]} />
        <View style={[styles.dot, { borderColor: colors.glassBorder }]} />
      </View>
      <View style={styles.text}>
        <Ionicons name="walk" size={14} color={colors.textTertiary} />
        <Typography variant="caption1" color={colors.textTertiary}>
          {duration} free · time to explore nearby
        </Typography>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: spacing.xs,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  dots: {
    alignItems: 'center',
    gap: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radii.full,
    borderWidth: 1.5,
  },
  dash: {
    width: 1,
    height: 12,
    borderLeftWidth: 1.5,
    borderStyle: 'dashed',
  },
  text: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
