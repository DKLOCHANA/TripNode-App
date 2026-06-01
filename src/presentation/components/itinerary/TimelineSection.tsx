import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ActivityCard } from './ActivityCard';
import { FreeTimeCard } from './FreeTimeCard';
import { Typography } from '@/presentation/components/ui/Typography';
import { getDestinationHour } from '@/lib/date';
import { useTheme } from '@/theme/ThemeContext';
import {
  getSegmentForHour,
  getSegmentColors,
  getSegmentIcon,
  SEGMENT_LABEL,
  type DaySegment,
} from '@/theme/segmentColors';
import { spacing } from '@/theme/spacing';
import { radii } from '@/theme/radii';
import type { TimelineItem } from '@/domain/entities/Activity';

interface TimelineSectionProps {
  items: TimelineItem[];
  destinationCity?: string;
  ianaTimezone?: string;
}

function SegmentHeader({ segment }: { segment: DaySegment }) {
  const { colors, isDark } = useTheme();
  const { bg, tint } = getSegmentColors(segment, isDark);
  return (
    <View style={styles.segment}>
      <View style={[styles.segmentIcon, { backgroundColor: bg }]}>
        <Ionicons name={getSegmentIcon(segment)} size={14} color={tint} />
      </View>
      <Typography variant="caption1" weight="semiBold" color={colors.textSecondary} style={styles.segmentLabel}>
        {SEGMENT_LABEL[segment].toUpperCase()}
      </Typography>
      <View style={[styles.segmentLine, { backgroundColor: colors.glassBorder }]} />
    </View>
  );
}

export function TimelineSection({ items, destinationCity, ianaTimezone }: TimelineSectionProps) {
  const tz = ianaTimezone ?? 'UTC';
  const nodes: React.ReactNode[] = [];
  let lastSegment: DaySegment | null = null;

  for (const item of items) {
    if (item.type === 'activity') {
      const segment = getSegmentForHour(getDestinationHour(item.data.startTimeUtc, tz));
      if (segment !== lastSegment) {
        nodes.push(<SegmentHeader key={`seg-${item.data.id}`} segment={segment} />);
        lastSegment = segment;
      }
      nodes.push(
        <ActivityCard
          key={item.data.id}
          activity={item.data}
          destinationCity={destinationCity}
          ianaTimezone={tz}
        />
      );
    } else {
      nodes.push(<FreeTimeCard key={item.data.id} freeTime={item.data} />);
    }
  }

  return <View style={styles.container}>{nodes}</View>;
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.xs,
  },
  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  segmentIcon: {
    width: 26,
    height: 26,
    borderRadius: radii.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentLabel: {
    letterSpacing: 0.5,
  },
  segmentLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
});
