import React, { memo } from 'react';
import { View, StyleSheet, Pressable, Linking, Platform } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/presentation/components/ui/Typography';
import { useActivityPhoto, useActivityRating } from '@/hooks';
import { formatClockTime, formatDurationShort } from '@/lib/date';
import { useTheme } from '@/theme/ThemeContext';
import { gradients } from '@/theme/colors';
import { getInterestColors } from '@/theme/interestColors';
import { shadows } from '@/theme/shadows';
import { spacing } from '@/theme/spacing';
import { radii } from '@/theme/radii';
import type { Activity } from '@/domain/entities/Activity';

interface ActivityCardProps {
  activity: Activity;
  destinationCity?: string;
  ianaTimezone?: string;
}

const OVERLAY_GRADIENT = ['transparent', 'rgba(0,0,0,0.6)'] as const;
const BADGE_BG = 'rgba(0,0,0,0.45)';
const TITLE_SHADOW = {
  textShadowColor: 'rgba(0,0,0,0.4)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 5,
} as const;
const RATING_COLOR = '#E8A23D'; // amber — gold-ish star, readable on both themes

export const ActivityCard = memo(function ActivityCard({
  activity,
  destinationCity,
  ianaTimezone,
}: ActivityCardProps) {
  const { colors, isDark } = useTheme();
  const tz = ianaTimezone ?? 'UTC';
  const { data: photoUri } = useActivityPhoto(activity.name, destinationCity);
  const { data: rating } = useActivityRating(activity.name, destinationCity);

  const timeRange = `${formatClockTime(activity.startTimeUtc, tz)} → ${formatClockTime(activity.endTimeUtc, tz)}`;
  const duration = formatDurationShort(activity.durationMinutes);
  const category = getInterestColors(activity.category?.toLowerCase() ?? '', isDark);
  const price = activity.estimatedCostUsd != null ? `$${Math.round(activity.estimatedCostUsd)}` : null;

  const handleOpenMaps = () => {
    const { latitude, longitude } = activity.coordinates;
    const label = encodeURIComponent(activity.name);
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
      default: `https://maps.google.com/?q=${latitude},${longitude}`,
    });
    Linking.openURL(url!);
  };

  return (
    <View style={[styles.cardShadow, styles.card, { backgroundColor: colors.backgroundSecondary, borderColor: colors.glassBorder }]}>
      {/* Image */}
      <View style={styles.imageWrap}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} contentFit="cover" cachePolicy="disk" />
        ) : (
          <LinearGradient colors={gradients.brand} style={StyleSheet.absoluteFill} />
        )}
        <LinearGradient colors={OVERLAY_GRADIENT} style={styles.overlay} />

        <View style={[styles.badge, styles.badgeLeft]}>
          <Ionicons name="time-outline" size={12} color={colors.white} />
          <Typography variant="caption2" weight="medium" color={colors.white}>
            {timeRange}
          </Typography>
        </View>
        <View style={[styles.badge, styles.badgeRight]}>
          <Typography variant="caption2" weight="semiBold" color={colors.white}>
            {duration}
          </Typography>
        </View>

        <View style={styles.caption}>
          <Typography variant="callout" weight="semiBold" color={colors.white} numberOfLines={1} style={TITLE_SHADOW}>
            {activity.name}
          </Typography>
          <Typography variant="caption1" color="rgba(255,255,255,0.8)" numberOfLines={1} style={TITLE_SHADOW}>
            {activity.address}
          </Typography>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          {activity.category ? (
            <View style={[styles.categoryTag, { backgroundColor: category.bg }]}>
              <Typography variant="caption2" weight="medium" color={category.text}>
                {activity.category}
              </Typography>
            </View>
          ) : null}
          {rating != null ? (
            <View style={styles.rating}>
              <Ionicons name="star" size={12} color={RATING_COLOR} />
              <Typography variant="caption1" weight="semiBold" color={RATING_COLOR}>
                {rating.toFixed(1)}
              </Typography>
            </View>
          ) : null}
          {price ? (
            <Typography variant="caption1" color={colors.textTertiary}>
              · {price}
            </Typography>
          ) : null}
        </View>

        <Pressable style={styles.mapLink} onPress={handleOpenMaps} hitSlop={8}>
          <Ionicons name="location-outline" size={13} color={colors.electricBlue} />
          <Typography variant="caption1" weight="medium" color={colors.electricBlue}>
            Map
          </Typography>
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  cardShadow: {
    borderRadius: radii.card,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  card: {
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  imageWrap: {
    height: 130,
    justifyContent: 'flex-end',
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
  },
  badge: {
    position: 'absolute',
    top: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: radii.xs,
    backgroundColor: BADGE_BG,
  },
  badgeLeft: {
    left: spacing.sm,
  },
  badgeRight: {
    right: spacing.sm,
  },
  caption: {
    padding: spacing.sm,
    gap: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexShrink: 1,
  },
  categoryTag: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
    borderRadius: radii.xs,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  mapLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingVertical: spacing.xxs,
  },
});
