import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/presentation/components/ui/Typography';
import { DayTabBar } from '@/presentation/components/itinerary/DayTabBar';
import { TimelineSection } from '@/presentation/components/itinerary/TimelineSection';
import { useItineraryDetailViewModel } from '@/presentation/view-models/useItineraryDetailViewModel';
import { useTheme, type ColorScheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme/spacing';
import { radii } from '@/theme/radii';

function StatItem({ value, label }: { value: string; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.statItem}>
      <Typography variant="subheadline" weight="semiBold" color={colors.textPrimary}>
        {value}
      </Typography>
      <Typography variant="caption2" color={colors.textTertiary}>
        {label}
      </Typography>
    </View>
  );
}

function StatsBar({ activities, planned, cost }: { activities: number; planned: string; cost: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.statsBar, { backgroundColor: colors.backgroundSecondary, borderColor: colors.glassBorder }]}>
      <StatItem value={String(activities)} label={activities === 1 ? 'activity' : 'activities'} />
      <View style={[styles.statDivider, { backgroundColor: colors.glassBorder }]} />
      <StatItem value={planned} label="planned" />
      <View style={[styles.statDivider, { backgroundColor: colors.glassBorder }]} />
      <StatItem value={cost} label="estimated" />
    </View>
  );
}

export function ItineraryDetailScreen() {
  const insets = useSafeAreaInsets();
  const vm = useItineraryDetailViewModel();
  const { colors } = useTheme();

  if (!vm.itinerary) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.backgroundPrimary }]}>
        <Typography variant="body" color={colors.textSecondary}>
          No itinerary found
        </Typography>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable
          onPress={vm.handleGoBack}
          hitSlop={10}
          style={[styles.backButton, backButtonSurface(colors)]}
        >
          <Ionicons name="arrow-back" size={18} color={colors.textPrimary} />
        </Pressable>
        <Typography variant="headline" weight="semiBold" color={colors.textPrimary} numberOfLines={1} style={styles.headerTitle}>
          {vm.headerInfo.destination}
        </Typography>
      </View>

      {/* Day selector */}
      <DayTabBar days={vm.dayTabs} selectedDay={vm.selectedDayNumber} onSelectDay={vm.handleSelectDay} />

      {/* Selected-day stats */}
      <View style={styles.statsWrap}>
        <StatsBar
          activities={vm.dayStats.activityCount}
          planned={vm.dayStats.plannedLabel}
          cost={vm.dayStats.costLabel}
        />
      </View>

      {/* Timeline */}
      <ScrollView
        style={styles.timeline}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.lg }}
        showsVerticalScrollIndicator={false}
      >
        <TimelineSection
          items={vm.timelineItems}
          destinationCity={vm.headerInfo.destination}
          ianaTimezone={vm.ianaTimezone}
        />
      </ScrollView>
    </View>
  );
}

function backButtonSurface(colors: ColorScheme) {
  return { backgroundColor: colors.backgroundSecondary };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.sm,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: radii.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
  },
  statsWrap: {
    paddingHorizontal: spacing.screen,
    marginBottom: spacing.sm,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  statItem: {
    alignItems: 'center',
    gap: 1,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 22,
  },
  timeline: {
    flex: 1,
  },
});
