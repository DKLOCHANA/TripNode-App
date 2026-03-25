import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Typography } from '@/presentation/components/ui/Typography';
import { useTheme } from '@/theme/ThemeContext';
import { shadows } from '@/theme/shadows';
import { spacing } from '@/theme/spacing';
import { radii } from '@/theme/radii';
import type { Attraction } from '@/domain/entities/Attraction';

interface AttractionCardProps {
  attraction: Attraction;
  selected: boolean;
  onToggle: () => void;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  culture: '🏛️',
  foodie: '🍜',
  adventure: '⛰️',
  relax: '🏖️',
  shopping: '🏪',
  nightlife: '🌃',
  history: '🏰',
  wellness: '🧘',
  beach: '🏝️',
  photography: '📸',
  nature: '🌲',
  landmark: '📍',
};

export function AttractionCard({ attraction, selected, onToggle }: AttractionCardProps) {
  const { colors } = useTheme();
  const emoji = CATEGORY_EMOJIS[attraction.category] || '📍';

  return (
    <Pressable
      style={[
        styles.container,
        { backgroundColor: colors.glassInputBg, borderColor: colors.glassBorder },
        selected && { borderColor: colors.electricBlue, backgroundColor: 'rgba(0, 122, 255, 0.1)' },
      ]}
      onPress={onToggle}
      hitSlop={4}
    >
      {/* Checkbox */}
      <View style={[
        styles.checkbox,
        { borderColor: colors.glassBorder },
        selected && { backgroundColor: colors.electricBlue, borderColor: colors.electricBlue },
      ]}>
        {selected && <Typography variant="caption1" color={colors.white}>✓</Typography>}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Typography variant="body" weight="semiBold" numberOfLines={1} style={styles.name}>
            {emoji} {attraction.name}
          </Typography>
          {attraction.rating && (
            <View style={styles.rating}>
              <Typography variant="caption1" color={colors.textSecondary}>
                ⭐ {attraction.rating.toFixed(1)}
              </Typography>
            </View>
          )}
        </View>

        <Typography
          variant="footnote"
          color={colors.textSecondary}
          numberOfLines={2}
          style={styles.description}
        >
          {attraction.description}
        </Typography>

        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Typography variant="caption2" color={colors.textTertiary}>
              ⏱ {formatDuration(attraction.estimatedDurationMinutes)}
            </Typography>
          </View>
          {attraction.estimatedCostUsd !== null && (
            <View style={styles.metaItem}>
              <Typography variant="caption2" color={colors.textTertiary}>
                💵 ${attraction.estimatedCostUsd}
              </Typography>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radii.full,
    borderWidth: 2,
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xxs,
  },
  name: {
    flex: 1,
  },
  rating: {
    marginLeft: spacing.xs,
  },
  description: {
    marginBottom: spacing.xs,
  },
  meta: {
    flexDirection: 'row',
  },
  metaItem: {
    marginRight: spacing.md,
  },
});
