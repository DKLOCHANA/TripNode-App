import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/presentation/components/ui/Typography';
import { useActivityPhoto } from '@/hooks';
import { formatDurationShort } from '@/lib/date';
import { getCategoryIcon, getCategoryLabel } from '@/lib/categoryIcons';
import { useTheme } from '@/theme/ThemeContext';
import { getInterestColors } from '@/theme/interestColors';
import { spacing } from '@/theme/spacing';
import { radii } from '@/theme/radii';
import type { Attraction } from '@/domain/entities/Attraction';

interface AttractionCardProps {
  attraction: Attraction;
  selected: boolean;
  destinationCity?: string;
  onToggle: () => void;
}

const RATING_COLOR = '#E8A23D'; // amber star, readable on both themes

function MetaDot() {
  const { colors } = useTheme();
  return (
    <Typography variant="caption2" color={colors.glassBorder}>
      ·
    </Typography>
  );
}

export function AttractionCard({ attraction, selected, destinationCity, onToggle }: AttractionCardProps) {
  const { colors, isDark } = useTheme();
  const category = getInterestColors(attraction.category, isDark);
  const label = getCategoryLabel(attraction.category);
  const duration = formatDurationShort(attraction.estimatedDurationMinutes);
  const price = attraction.estimatedCostUsd != null ? `$${attraction.estimatedCostUsd}` : null;
  const { data: photoUri } = useActivityPhoto(attraction.name, destinationCity);

  return (
    <Pressable
      onPress={onToggle}
      style={[
        styles.card,
        {
          backgroundColor: colors.backgroundSecondary,
          borderColor: selected ? colors.electricBlue : colors.glassBorder,
        },
        !selected && styles.cardOff,
      ]}
    >
      <View style={styles.inner}>
        {/* Photo (falls back to the category icon while loading / if missing) */}
        <View style={[styles.iconChip, { backgroundColor: category.bg }]}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} contentFit="cover" cachePolicy="disk" />
          ) : (
            <Ionicons name={getCategoryIcon(attraction.category)} size={22} color={category.text} />
          )}
        </View>

        {/* Body */}
        <View style={styles.body}>
          <Typography variant="callout" weight="semiBold" color={colors.textPrimary} numberOfLines={1}>
            {attraction.name}
          </Typography>
          <Typography variant="caption1" color={colors.textSecondary} numberOfLines={2} style={styles.desc}>
            {attraction.description}
          </Typography>

          <View style={styles.meta}>
            {attraction.rating != null ? (
              <>
                <Ionicons name="star" size={12} color={RATING_COLOR} />
                <Typography variant="caption2" weight="semiBold" color={RATING_COLOR}>
                  {attraction.rating.toFixed(1)}
                </Typography>
                <MetaDot />
              </>
            ) : null}
            <Typography variant="caption2" color={colors.textTertiary}>
              {duration}
            </Typography>
            {price ? (
              <>
                <MetaDot />
                <Typography variant="caption2" color={colors.textTertiary}>
                  {price}
                </Typography>
              </>
            ) : null}
            <MetaDot />
            <View style={[styles.categoryTag, { backgroundColor: category.bg }]}>
              <Typography variant="caption2" weight="medium" color={category.text}>
                {label}
              </Typography>
            </View>
          </View>
        </View>

        {/* Checkbox */}
        <View
          style={[
            styles.checkbox,
            { backgroundColor: selected ? colors.electricBlue : colors.backgroundTertiary },
          ]}
        >
          {selected ? <Ionicons name="checkmark" size={14} color={colors.white} /> : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.card,
    borderWidth: 1.5,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  cardOff: {
    opacity: 0.7,
  },
  inner: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  iconChip: {
    width: 56,
    height: 56,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  desc: {
    marginTop: spacing.xxs,
    marginBottom: spacing.xs,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xxs,
  },
  categoryTag: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: radii.xs,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginTop: 2,
  },
});
