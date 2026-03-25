import React, { memo } from 'react';
import { View, StyleSheet, Pressable, Linking, Platform } from 'react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { Typography } from '@/presentation/components/ui/Typography';
import { useActivityPhoto } from '@/hooks';
import { useTheme } from '@/theme/ThemeContext';
import { shadows } from '@/theme/shadows';
import { spacing } from '@/theme/spacing';
import { radii } from '@/theme/radii';
import type { Activity } from '@/domain/entities/Activity';

interface ActivityCardProps {
  activity: Activity;
  destinationCity?: string;
  ianaTimezone?: string;
}

export const ActivityCard = memo(function ActivityCard({ activity, destinationCity, ianaTimezone }: ActivityCardProps) {
  const { colors } = useTheme();
  const startTime = formatTime(activity.startTimeUtc);
  const duration = formatDuration(activity.durationMinutes);
  const { data: photoUri } = useActivityPhoto(activity.name, destinationCity);

  const handleOpenMaps = () => {
    const { latitude, longitude } = activity.coordinates;
    const label = encodeURIComponent(activity.name);

    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
      default: `https://maps.google.com/?q=${latitude},${longitude}`,
    });

    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      {/* Time indicator */}
      <View style={styles.timeColumn}>
        <Typography variant="caption1" color={colors.electricBlue} weight="semiBold">
          {startTime}
        </Typography>
        <View style={styles.timeline}>
          <View style={[styles.timelineDot, { backgroundColor: colors.electricBlue }]} />
          <View style={[styles.timelineLine, { backgroundColor: colors.glassBorder }]} />
        </View>
      </View>

      {/* Activity Card with Photo — shadow wrapper outside overflow:hidden */}
      <View style={styles.cardShadow}>
        <View style={[styles.card, { backgroundColor: colors.backgroundTertiary }]}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.cardImage} contentFit="cover" cachePolicy="disk" />
        ) : (
          <View style={[styles.cardImage, { backgroundColor: colors.backgroundTertiary }]} />
        )}

        <View style={styles.cardOverlay} />

        {/* Duration badge - top left */}
        <View style={[styles.durationBadge, { borderColor: colors.glassBorder }]}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.durationBadgeContent}>
            <Typography variant="caption2" color="#FFFFFF" weight="semiBold">
              {duration}
            </Typography>
          </View>
        </View>

        {/* Open in Maps button - top right */}
        <Pressable onPress={handleOpenMaps} style={[styles.mapButton, { backgroundColor: colors.electricBlue }]} hitSlop={8}>
          <Typography variant="caption1" color="#FFFFFF" weight="semiBold">
            Open Map
          </Typography>
        </Pressable>

        {/* Content - bottom (always dark because it's over a photo) */}
        <View style={styles.cardContent}>
          <BlurView intensity={15} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.cardContentInner}>
            <Typography variant="body" weight="semiBold" color="#FFFFFF" numberOfLines={1}>
              {activity.name}
            </Typography>
            <Typography variant="caption1" color="rgba(255,255,255,0.7)" numberOfLines={1} style={styles.address}>
              {activity.address}
            </Typography>
          </View>
        </View>
        </View>
      </View>
    </View>
  );
});

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
  return `${hours}h ${mins}m`;
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
    marginTop: spacing.xs,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  cardShadow: {
    flex: 1,
    height: 140,
    borderRadius: radii.card,
    marginLeft: spacing.xs,
    ...shadows.card,
  },
  card: {
    flex: 1,
    borderRadius: radii.card,
    overflow: 'hidden',
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  durationBadge: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    borderRadius: radii.sm,
    overflow: 'hidden',
    borderWidth: 1,
  },
  durationBadgeContent: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
  },
  mapButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    borderRadius: radii.sm,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  cardContentInner: {
    padding: spacing.sm,
  },
  address: {
    marginTop: spacing.xxs,
  },
});
