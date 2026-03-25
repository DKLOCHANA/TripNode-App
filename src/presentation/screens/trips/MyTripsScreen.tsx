import React, { memo } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Itinerary } from '@/domain/entities/Itinerary';
import { formatDateRangeSummary } from '@/lib/date';
import { useTripCardPhoto } from '@/hooks';
import { useMyTripsViewModel } from '@/presentation/view-models/useMyTripsViewModel';
import { GlassContainer } from '@/presentation/components/ui/GlassContainer';
import { Typography } from '@/presentation/components/ui/Typography';
import { Button } from '@/presentation/components/ui/Button';
import { useTheme } from '@/theme/ThemeContext';
import { shadows } from '@/theme/shadows';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

// Fixed height for TripCard for FlatList optimization
const TRIP_CARD_HEIGHT = 200;

interface TripCardProps {
  trip: Itinerary;
  onPress: () => void;
  onDelete: () => void;
}

const TripCard = memo(function TripCard({ trip, onPress, onDelete }: TripCardProps) {
  const { data: photoUri } = useTripCardPhoto(trip);
  const { colors } = useTheme();

  const tripDateRange = formatDateRangeSummary(
    trip.startDateUtc,
    trip.endDateUtc,
    trip.destination.ianaTimezone
  );

  return (
    <Pressable onPress={onPress} style={styles.cardPressable}>
      <View style={[styles.cardImageContainer, { backgroundColor: colors.backgroundTertiary }]}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.cardImage} contentFit="cover" cachePolicy="disk" />
        ) : (
          <View style={[styles.cardImage, styles.cardImageFallback]}>
            <Typography variant="caption1" color={colors.textSecondary}>
              No photo available
            </Typography>
          </View>
        )}

        <View style={styles.cardImageOverlay} />

        <GlassContainer style={styles.dateContainer} intensity={15} padding={spacing.xs}>
          <Typography variant="caption1" color={colors.textPrimary} weight="semiBold">
            {tripDateRange}
          </Typography>
        </GlassContainer>

        <Pressable style={[styles.deleteButton, { borderColor: colors.glassBorder }]} onPress={onDelete} hitSlop={12}>
          <Ionicons name="trash-outline" size={18} color={colors.error} />
        </Pressable>

        <GlassContainer style={styles.cardContent} intensity={15} padding={spacing.sm}>
          <Typography variant="headline" weight="bold" numberOfLines={1} color={colors.textPrimary}>
            {trip.destination.name}
          </Typography>
        </GlassContainer>
      </View>
    </Pressable>
  );
});

function LoadingState() {
  const { colors } = useTheme();
  return (
    <View style={styles.listContent}>
      {[0, 1, 2].map((item) => (
        <View key={item} style={[styles.loadingCard, { backgroundColor: colors.backgroundTertiary, borderColor: colors.glassBorder }]} />
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
      <Typography
        variant="body"
        color={colors.textSecondary}
        align="center"
        style={styles.emptySubtitle}
      >
        Plan your first AI-powered trip
      </Typography>
      <Button
        title="Plan a Trip"
        variant="primary"
        onPress={onPlanTrip}
        icon={<Typography variant="headline" color={colors.white}>+</Typography>}
      />
    </View>
  );
}

export function MyTripsScreen() {
  const insets = useSafeAreaInsets();
  const vm = useMyTripsViewModel();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}> 
        <Typography variant="title2" weight="bold" color={colors.textPrimary}>
          My Trips
        </Typography>
        <Button
          title="Plan"
          variant="ghost"
          size="small"
          onPress={vm.handlePlanTrip}
          icon={<Typography variant="headline" color={colors.electricBlue}>+</Typography>}
        />
      </View>

      {vm.isLoadingTrips ? (
        <LoadingState />
      ) : vm.trips.length === 0 ? (
        <EmptyState onPlanTrip={vm.handlePlanTrip} />
      ) : (
        <FlatList
          data={vm.trips}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TripCard
              trip={item}
              onPress={() => vm.handleOpenTrip(item.id)}
              onDelete={() => vm.requestDeleteTrip(item.id)}
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + spacing.xxxl },
          ]}
          showsVerticalScrollIndicator={false}
          initialNumToRender={5}
          maxToRenderPerBatch={3}
          windowSize={5}
          removeClippedSubviews={true}
          getItemLayout={(_, index) => ({
            length: TRIP_CARD_HEIGHT,
            offset: TRIP_CARD_HEIGHT * index + spacing.md * index,
            index,
          })}
        />
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
            <Typography
              variant="body"
              color={colors.textSecondary}
              align="center"
              style={styles.modalText}
            >
              {vm.pendingDeleteTrip?.destination.name}
            </Typography>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={vm.cancelDeleteTrip}
                style={styles.modalButton}
              />
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
    gap: spacing.md,
  },
  cardPressable: {
    borderRadius: radii.card,
    ...shadows.card,
  },
  cardImageContainer: {
    height: 200,
    borderRadius: radii.card,
    overflow: 'hidden',
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
  },
  cardImageFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  dateContainer: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    zIndex: 5,
  },
  deleteButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    zIndex: 5,
    width: 34,
    height: 34,
    borderRadius: radii.full,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  cardContent: {
    position: 'absolute',
    left: spacing.sm,
    right: spacing.sm,
    bottom: spacing.sm,
  },
  loadingCard: {
    height: 200,
    borderRadius: radii.card,
    borderWidth: 1,
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
