import React, { memo } from 'react';
import {
  ScrollView,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { differenceInCalendarDays } from 'date-fns';
import type { Itinerary } from '@/domain/entities/Itinerary';
import { formatDateRangeSummary, getDaysDifference } from '@/lib/date';
import { INTERESTS } from '@/lib/constants';
import { useTripCardPhoto } from '@/hooks';
import { useMyTripsViewModel } from '@/presentation/view-models/useMyTripsViewModel';
import { GlassContainer } from '@/presentation/components/ui/GlassContainer';
import { Typography } from '@/presentation/components/ui/Typography';
import { Button } from '@/presentation/components/ui/Button';
import { useTheme } from '@/theme/ThemeContext';
import { gradients } from '@/theme/colors';
import { getInterestColors } from '@/theme/interestColors';
import { shadows } from '@/theme/shadows';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

const INTEREST_LABELS = Object.fromEntries(INTERESTS.map((i) => [i.id, i.label]));
const OVERLAY_GRADIENT = ['transparent', 'rgba(0,0,0,0.55)'] as const;
const META_WHITE = 'rgba(255,255,255,0.78)';

// ── Per-trip display derivations (pure) ──────────────────────────────────────

function formatBudget(n: number | null): string | null {
  if (n == null) return null;
  return `$${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

function getTripMeta(trip: Itinerary) {
  const dateRange = formatDateRangeSummary(
    trip.startDateUtc,
    trip.endDateUtc,
    trip.destination.ianaTimezone
  );
  const dayCount =
    trip.days?.length ||
    getDaysDifference(new Date(trip.startDateUtc), new Date(trip.endDateUtc)) + 1;
  const spots = (trip.days ?? []).reduce((n, day) => n + (day.activities?.length ?? 0), 0);
  return { dateRange, dayCount, spots, budget: formatBudget(trip.budgetUsd) };
}

/** Short countdown label for an upcoming trip, or null if it's already started. */
function getCountdownLabel(startUtc: string): string | null {
  const days = differenceInCalendarDays(new Date(startUtc), new Date());
  if (days > 1) return `In ${days} days`;
  if (days === 1) return 'Tomorrow';
  if (days === 0) return 'Today';
  return 'Ongoing';
}

// ── Shared card pieces ───────────────────────────────────────────────────────

function CountdownBadge({ label }: { label: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.countdownBadge, { backgroundColor: colors.success }]}>
      <View style={styles.countdownDot} />
      <Typography variant="caption2" weight="semiBold" color={colors.white}>
        {label}
      </Typography>
    </View>
  );
}

function DeleteButton({ onPress }: { onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable style={styles.deleteButton} onPress={onPress} hitSlop={10}>
      <Ionicons name="trash-outline" size={16} color={colors.white} />
    </Pressable>
  );
}

function InterestTag({ id }: { id: string }) {
  const { isDark } = useTheme();
  const { bg, text } = getInterestColors(id, isDark);
  return (
    <View style={[styles.tag, { backgroundColor: bg }]}>
      <Typography variant="caption2" weight="medium" color={text}>
        {INTEREST_LABELS[id] ?? id}
      </Typography>
    </View>
  );
}

function MetaStat({ icon, label }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.metaStat}>
      <Ionicons name={icon} size={13} color={colors.electricBlue} />
      <Typography variant="caption1" weight="medium" color={colors.textSecondary}>
        {label}
      </Typography>
    </View>
  );
}

/** Background image (or gradient fallback) + dark overlay shared by all cards. */
function CardBackdrop({ trip }: { trip: Itinerary }) {
  const { data: photoUri } = useTripCardPhoto(trip);
  return (
    <>
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} contentFit="cover" cachePolicy="disk" />
      ) : (
        <LinearGradient colors={gradients.brand} style={StyleSheet.absoluteFill} />
      )}
      <LinearGradient colors={OVERLAY_GRADIENT} style={styles.overlay} />
    </>
  );
}

// ── Featured (nearest upcoming) card ─────────────────────────────────────────

interface CardProps {
  trip: Itinerary;
  onPress: () => void;
  onDelete: () => void;
}

const FeaturedTripCard = memo(function FeaturedTripCard({ trip, onPress, onDelete }: CardProps) {
  const { colors } = useTheme();
  const meta = getTripMeta(trip);
  const countdown = getCountdownLabel(trip.startDateUtc);

  return (
    <Pressable onPress={onPress} style={[styles.cardShadow, styles.card]}>
      <View style={styles.featuredImage}>
        <CardBackdrop trip={trip} />
        {countdown ? <CountdownBadge label={countdown} /> : null}
        <DeleteButton onPress={onDelete} />
        <View style={styles.captionWrap}>
          <Typography variant="title2" weight="bold" color={colors.white} numberOfLines={1} style={styles.titleShadow}>
            {trip.destination.name}
          </Typography>
          <Typography variant="footnote" color={META_WHITE} style={styles.titleShadow}>
            {meta.dateRange} · {meta.dayCount} days
          </Typography>
        </View>
      </View>

      <View style={[styles.featuredFooter, { backgroundColor: colors.backgroundSecondary }]}>
        <View style={styles.metaRow}>
          {meta.spots > 0 ? <MetaStat icon="location" label={`${meta.spots} spots`} /> : null}
          {meta.budget ? <MetaStat icon="wallet" label={meta.budget} /> : null}
        </View>
        <View style={styles.tagRow}>
          {trip.interests.slice(0, 3).map((id) => (
            <InterestTag key={id} id={id} />
          ))}
        </View>
      </View>
    </Pressable>
  );
});

// ── Compact card (other upcoming + past) ─────────────────────────────────────

const CompactTripCard = memo(function CompactTripCard({
  trip,
  onPress,
  onDelete,
  isPast,
}: CardProps & { isPast: boolean }) {
  const { colors } = useTheme();
  const meta = getTripMeta(trip);
  const countdown = isPast ? null : getCountdownLabel(trip.startDateUtc);

  const inlineMeta = [meta.dateRange, `${meta.dayCount} days`, meta.spots > 0 ? `${meta.spots} spots` : null, meta.budget]
    .filter(Boolean)
    .join('  ·  ');

  return (
    <Pressable onPress={onPress} style={[styles.cardShadow, styles.card, isPast && styles.pastCard]}>
      <View style={styles.compactImage}>
        <CardBackdrop trip={trip} />
        {countdown ? <CountdownBadge label={countdown} /> : null}
        <DeleteButton onPress={onDelete} />
        <View style={styles.captionWrap}>
          <Typography variant="headline" weight="bold" color={colors.white} numberOfLines={1} style={styles.titleShadow}>
            {trip.destination.name}
          </Typography>
          <Typography variant="caption1" color={META_WHITE} numberOfLines={1} style={styles.titleShadow}>
            {inlineMeta}
          </Typography>
        </View>
      </View>
    </Pressable>
  );
});

// ── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ label, dotColor }: { label: string; dotColor: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionDot, { backgroundColor: dotColor }]} />
      <Typography variant="caption1" weight="semiBold" color={colors.textTertiary} style={styles.sectionLabel}>
        {label}
      </Typography>
      <View style={[styles.sectionLine, { backgroundColor: colors.glassBorder }]} />
    </View>
  );
}

// ── States ───────────────────────────────────────────────────────────────────

function LoadingState() {
  const { colors } = useTheme();
  return (
    <View style={styles.listContent}>
      {[200, 150, 150].map((h, i) => (
        <View
          key={i}
          style={[styles.skeleton, { height: h, backgroundColor: colors.backgroundTertiary, borderColor: colors.glassBorder }]}
        />
      ))}
    </View>
  );
}

function EmptyState({ onPlanTrip }: { onPlanTrip: () => void }) {
  const { colors } = useTheme();
  return (
    <View style={styles.emptyContainer}>
      <Typography variant="title3" weight="bold" align="center" color={colors.textPrimary}>
        No paths discovered yet
      </Typography>
      <Typography variant="body" color={colors.textSecondary} align="center" style={styles.emptySubtitle}>
        Plan your first AI-powered trip
      </Typography>
      <Button
        title="Plan a Trip"
        variant="primary"
        onPress={onPlanTrip}
        icon={<Ionicons name="add" size={18} color={colors.white} />}
      />
    </View>
  );
}

// ── Screen ───────────────────────────────────────────────────────────────────

export function MyTripsScreen() {
  const insets = useSafeAreaInsets();
  const vm = useMyTripsViewModel();
  const { colors } = useTheme();

  const hasTrips = vm.upcomingTrips.length > 0 || vm.pastTrips.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Typography variant="title1" weight="bold" color={colors.textPrimary}>
          My Trips
        </Typography>
        <Button
          title="New Trip"
          variant="primary"
          size="small"
          onPress={vm.handlePlanTrip}
          icon={<Ionicons name="add" size={16} color={colors.white} />}
        />
      </View>

      {vm.isLoadingTrips ? (
        <LoadingState />
      ) : !hasTrips ? (
        <EmptyState onPlanTrip={vm.handlePlanTrip} />
      ) : (
        <ScrollView
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + spacing.xxxl }]}
          showsVerticalScrollIndicator={false}
        >
          {vm.upcomingTrips.length > 0 ? (
            <>
              <SectionHeader label="Upcoming" dotColor={colors.success} />
              {vm.upcomingTrips.map((trip, index) =>
                index === 0 ? (
                  <FeaturedTripCard
                    key={trip.id}
                    trip={trip}
                    onPress={() => vm.handleOpenTrip(trip.id)}
                    onDelete={() => vm.requestDeleteTrip(trip.id)}
                  />
                ) : (
                  <CompactTripCard
                    key={trip.id}
                    trip={trip}
                    isPast={false}
                    onPress={() => vm.handleOpenTrip(trip.id)}
                    onDelete={() => vm.requestDeleteTrip(trip.id)}
                  />
                )
              )}
            </>
          ) : null}

          {vm.pastTrips.length > 0 ? (
            <>
              <SectionHeader label="Past" dotColor={colors.textTertiary} />
              {vm.pastTrips.map((trip) => (
                <CompactTripCard
                  key={trip.id}
                  trip={trip}
                  isPast
                  onPress={() => vm.handleOpenTrip(trip.id)}
                  onDelete={() => vm.requestDeleteTrip(trip.id)}
                />
              ))}
            </>
          ) : null}
        </ScrollView>
      )}

      <Modal
        visible={Boolean(vm.pendingDeleteTrip)}
        transparent
        animationType="slide"
        onRequestClose={vm.cancelDeleteTrip}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={vm.cancelDeleteTrip} />
          <GlassContainer style={styles.modalSheet}>
            <Typography variant="headline" weight="bold" align="center" color={colors.textPrimary}>
              Delete this trip?
            </Typography>
            <Typography variant="body" color={colors.textSecondary} align="center" style={styles.modalText}>
              {vm.pendingDeleteTrip?.destination.name}
            </Typography>

            <View style={styles.modalActions}>
              <Button title="Cancel" variant="ghost" onPress={vm.cancelDeleteTrip} style={styles.modalButton} />
              <Button
                title="Delete"
                variant="destructive"
                loading={vm.isDeletingTrip}
                onPress={vm.confirmDeleteTrip}
                style={styles.modalButton}
              />
            </View>
          </GlassContainer>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listContent: {
    paddingHorizontal: spacing.screen,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: radii.full,
  },
  sectionLabel: {
    letterSpacing: 0.8,
  },
  sectionLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },

  // Cards
  cardShadow: {
    borderRadius: radii.lg,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  card: {
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  pastCard: {
    opacity: 0.82,
  },
  featuredImage: {
    height: 210,
    justifyContent: 'flex-end',
  },
  compactImage: {
    height: 150,
    justifyContent: 'flex-end',
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '65%',
  },
  captionWrap: {
    padding: spacing.md,
    gap: 2,
  },
  titleShadow: {
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },

  // Featured footer
  featuredFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  metaStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: spacing.xxs,
    flexShrink: 1,
  },
  tag: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
    borderRadius: radii.xs,
  },

  // Badges / buttons
  countdownBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: radii.xs,
  },
  countdownDot: {
    width: 5,
    height: 5,
    borderRadius: radii.full,
    backgroundColor: '#FFFFFF',
  },
  deleteButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 30,
    height: 30,
    borderRadius: radii.full,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // States
  skeleton: {
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  emptySubtitle: {
    marginBottom: spacing.md,
  },

  // Delete modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalSheet: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
  },
  modalText: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalButton: {
    flex: 1,
  },
});
