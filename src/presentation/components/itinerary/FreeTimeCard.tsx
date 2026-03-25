import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '@/presentation/components/ui/Typography';
import { useTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme/spacing';
import { radii } from '@/theme/radii';
import type { FreeTimeBlock } from '@/domain/entities/Activity';

interface FreeTimeCardProps {
  freeTime: FreeTimeBlock;
}

export function FreeTimeCard({ freeTime }: FreeTimeCardProps) {
  const { colors } = useTheme();
  const startTime = formatTime(freeTime.startTimeUtc);
  const endTime = formatTime(freeTime.endTimeUtc);
  const duration = formatDuration(freeTime.durationMinutes);

  return (
    <View style={styles.container}>
      {/* Time column spacer */}
      <View style={styles.timeColumn}>
        <View style={styles.timeline}>
          <View style={[styles.timelineLine, { backgroundColor: colors.glassBorder }]} />
        </View>
      </View>

      {/* Free time card */}
      <View style={[
        styles.card,
        { backgroundColor: colors.backgroundSecondary, borderColor: colors.glassBorder },
      ]}>
        <View style={styles.content}>
          <Typography variant="footnote" color={colors.textSecondary}>
            Free time: {duration}
          </Typography>
          <Typography variant="caption2" color={colors.textTertiary}>
            {startTime} - {endTime}
          </Typography>
        </View>
      </View>
    </View>
  );
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  timeColumn: {
    width: 50,
    alignItems: 'center',
  },
  timeline: {
    flex: 1,
    alignItems: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    borderStyle: 'dashed',
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radii.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    marginLeft: spacing.xs,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  content: {},
});
