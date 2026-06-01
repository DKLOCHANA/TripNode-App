import React from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import { Typography } from '@/presentation/components/ui/Typography';
import { useTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme/spacing';
import { radii } from '@/theme/radii';

interface DayTab {
  dayNumber: number;
  date: string; // YYYY-MM-DD
}

interface DayTabBarProps {
  days: DayTab[];
  selectedDay: number;
  onSelectDay: (dayNumber: number) => void;
}

const ACTIVE_WEEKDAY = 'rgba(255,255,255,0.7)';
const ACTIVE_DOT = 'rgba(255,255,255,0.85)';

export function DayTabBar({ days, selectedDay, onSelectDay }: DayTabBarProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.content}>
      {days.map((day) => {
        const isSelected = day.dayNumber === selectedDay;
        const dateObj = new Date(day.date + 'T00:00:00');
        const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        const dayOfMonth = dateObj.getDate();

        return (
          <Pressable
            key={day.dayNumber}
            onPress={() => onSelectDay(day.dayNumber)}
            style={[
              styles.tab,
              { backgroundColor: isSelected ? colors.electricBlue : colors.backgroundSecondary },
            ]}
          >
            <Typography
              variant="caption2"
              weight="medium"
              color={isSelected ? ACTIVE_WEEKDAY : colors.textTertiary}
              style={styles.weekday}
            >
              {weekday.toUpperCase()}
            </Typography>
            <Typography
              variant="headline"
              weight="semiBold"
              color={isSelected ? colors.white : colors.textPrimary}
            >
              {dayOfMonth}
            </Typography>
            <View style={[styles.dot, { backgroundColor: isSelected ? ACTIVE_DOT : 'transparent' }]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  tab: {
    minWidth: 52,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    borderRadius: radii.md,
    gap: 1,
  },
  weekday: {
    letterSpacing: 0.5,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: radii.full,
    marginTop: 2,
  },
});
