import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '@/presentation/components/ui/Typography';
import { DayTabBar } from '@/presentation/components/itinerary/DayTabBar';
import { TimelineSection } from '@/presentation/components/itinerary/TimelineSection';
import { useItineraryDetailViewModel } from '@/presentation/view-models/useItineraryDetailViewModel';
import { useTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme/spacing';

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
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm, backgroundColor: colors.backgroundPrimary }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={vm.handleGoBack} style={styles.backButton} hitSlop={12}>
            <Typography variant="title3" color={colors.electricBlue}>
              ←
            </Typography>
          </Pressable>
          <View style={styles.headerContent}>
            <Typography variant="title3" weight="bold" numberOfLines={1}>
              {vm.headerInfo.destination}
            </Typography>
            <Typography variant="caption1" color={colors.textSecondary}>
              {vm.headerInfo.dateRange}
            </Typography>
          </View>
        </View>
      </View>

      {/* Day Tabs */}
      <DayTabBar
        days={vm.dayTabs}
        selectedDay={vm.selectedDayNumber}
        onSelectDay={vm.handleSelectDay}
      />

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  headerContent: {
    flex: 1,
  },
  timeline: {
    flex: 1,
  },
});
