import React, { useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '@/presentation/components/ui/Typography';
import { AttractionCard } from './AttractionCard';
import { AttractionLoadingState } from './AttractionLoadingState';
import { formatDurationShort } from '@/lib/date';
import { useTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme/spacing';
import { radii } from '@/theme/radii';
import type { Attraction } from '@/domain/entities/Attraction';
import type { InterestId } from '@/lib/constants';

interface TripSummary {
  destinationName: string;
  interests: InterestId[];
  days: number | null;
  budgetLabel: string | null;
}

interface AttractionSelectionSheetProps {
  visible: boolean;
  isLoading: boolean;
  loadingPhase?: 'attractions' | 'itinerary';
  tripSummary?: TripSummary;
  budgetUsd?: number | null;
  destinationOverview: string | null;
  attractions: Attraction[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onConfirm: () => void;
  onClose: () => void;
}

function money(n: number): string {
  return `$${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

export function AttractionSelectionSheet({
  visible,
  isLoading,
  loadingPhase = 'attractions',
  tripSummary,
  budgetUsd,
  destinationOverview,
  attractions,
  selectedIds,
  onToggle,
  onSelectAll,
  onClearAll,
  onConfirm,
  onClose,
}: AttractionSelectionSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  // Selected totals.
  const totals = useMemo(() => {
    let cost = 0;
    let minutes = 0;
    for (const a of attractions) {
      if (selectedIds.has(a.id)) {
        cost += a.estimatedCostUsd ?? 0;
        minutes += a.estimatedDurationMinutes;
      }
    }
    return { cost, minutes };
  }, [attractions, selectedIds]);

  const destinationCity = tripSummary?.destinationName;
  const renderAttraction = useCallback(
    ({ item }: { item: Attraction }) => (
      <AttractionCard
        attraction={item}
        selected={selectedIds.has(item.id)}
        destinationCity={destinationCity}
        onToggle={() => onToggle(item.id)}
      />
    ),
    [selectedIds, onToggle, destinationCity]
  );

  const keyExtractor = useCallback((item: Attraction) => item.id, []);

  const selectedCount = selectedIds.size;
  const canConfirm = selectedCount > 0;

  // Recommend ~3 places per day so every day of the trip can be filled. Shown
  // as a gentle, non-blocking hint when the user hasn't picked enough yet.
  const tripDays = tripSummary?.days ?? null;
  const recommendedCount = tripDays ? tripDays * 3 : null;
  const showSelectionHint =
    recommendedCount != null && selectedCount < recommendedCount;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.backgroundPrimary }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={12} style={styles.headerSide}>
            <Typography variant="body" color={colors.electricBlue}>
              Cancel
            </Typography>
          </Pressable>
          <Typography variant="headline" weight="semiBold" color={colors.textPrimary}>
            Select Attractions
          </Typography>
          <View style={styles.headerSide} />
        </View>
        <View style={[styles.handle, { backgroundColor: colors.glassBorder }]} />

        {isLoading ? (
          <AttractionLoadingState
            destinationName={tripSummary?.destinationName ?? 'your destination'}
            interests={tripSummary?.interests ?? []}
            days={tripSummary?.days ?? null}
            budgetLabel={tripSummary?.budgetLabel ?? null}
            phase={loadingPhase}
          />
        ) : (
          <View style={styles.body}>
            {/* Stats */}
            <View style={[styles.stats, { backgroundColor: colors.backgroundSecondary, borderColor: colors.glassBorder }]}>
              <View style={styles.statGroup}>
                <Stat value={String(selectedCount)} label="selected" />
                <View style={[styles.statDivider, { backgroundColor: colors.glassBorder }]} />
                <Stat
                  value={money(totals.cost)}
                  label={budgetUsd != null ? `of ${money(budgetUsd)}` : 'spent'}
                />
                <View style={[styles.statDivider, { backgroundColor: colors.glassBorder }]} />
                <Stat value={totals.minutes > 0 ? formatDurationShort(totals.minutes) : '—'} label="total time" />
              </View>
              <View style={styles.statBtns}>
                <Pressable
                  onPress={onSelectAll}
                  style={[styles.statBtn, { backgroundColor: colors.electricBlueDim }]}
                  hitSlop={6}
                >
                  <Typography variant="caption1" weight="medium" color={colors.electricBlue}>
                    All
                  </Typography>
                </Pressable>
                <Pressable
                  onPress={onClearAll}
                  style={[styles.statBtn, { backgroundColor: colors.backgroundTertiary }]}
                  hitSlop={6}
                >
                  <Typography variant="caption1" weight="medium" color={colors.textSecondary}>
                    None
                  </Typography>
                </Pressable>
              </View>
            </View>

            {/* Selection hint */}
            {showSelectionHint ? (
              <View style={styles.hint}>
                <Ionicons name="bulb-outline" size={14} color={colors.electricBlue} />
                <Typography variant="caption1" color={colors.textSecondary} style={styles.hintText}>
                  {`Select about ${recommendedCount} places for a full ${tripDays}-day plan (3-5 per day).`}
                </Typography>
              </View>
            ) : null}

            {/* List */}
            <FlatList
              data={attractions}
              renderItem={renderAttraction}
              keyExtractor={keyExtractor}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              initialNumToRender={10}
              ListHeaderComponent={
                destinationOverview ? (
                  <Typography variant="footnote" color={colors.textSecondary} style={styles.overview}>
                    {destinationOverview}
                  </Typography>
                ) : null
              }
            />

            {/* CTA */}
            <View style={[styles.ctaBar, { paddingBottom: insets.bottom + spacing.md }]} pointerEvents="box-none">
              <LinearGradient
                colors={['transparent', colors.backgroundPrimary]}
                locations={[0, 0.35]}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              />
              <Pressable
                onPress={onConfirm}
                disabled={!canConfirm}
                style={[styles.cta, { backgroundColor: colors.electricBlue }, !canConfirm && styles.ctaDisabled]}
              >
                <Ionicons name="sparkles" size={16} color={colors.white} />
                <Typography variant="callout" weight="semiBold" color={colors.white}>
                  Create itinerary
                </Typography>
                {selectedCount > 0 ? (
                  <View style={styles.ctaBadge}>
                    <Typography variant="caption1" weight="semiBold" color={colors.white}>
                      {selectedCount}
                    </Typography>
                  </View>
                ) : null}
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function Stat({ value, label }: { value: string; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.stat}>
      <Typography variant="subheadline" weight="semiBold" color={colors.textPrimary}>
        {value}
      </Typography>
      <Typography variant="caption2" color={colors.textTertiary}>
        {label}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  headerSide: {
    minWidth: 52,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: radii.full,
    alignSelf: 'center',
    marginTop: spacing.xs,
  },
  body: {
    flex: 1,
  },

  // Stats
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  statGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stat: {
    alignItems: 'center',
    gap: 1,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 24,
  },
  statBtns: {
    flexDirection: 'row',
    gap: spacing.xxs,
  },
  statBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radii.xs,
  },

  // Hint
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  hintText: {
    flex: 1,
  },

  // List
  overview: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: 120,
  },

  // CTA
  ctaBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
  },
  ctaDisabled: {
    opacity: 0.5,
  },
  ctaBadge: {
    minWidth: 24,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
  },
});
