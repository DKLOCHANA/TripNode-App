import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Typography } from '@/presentation/components/ui/Typography';
import { useTheme } from '@/theme/ThemeContext';
import { shadows } from '@/theme/shadows';
import { spacing } from '@/theme/spacing';
import { radii } from '@/theme/radii';

interface DayTabBarProps {
  days: DayTab[];
  selectedDay: number;
  onSelectDay: (dayNumber: number) => void;
}

interface DayTab {
  dayNumber: number;
  date: string; // YYYY-MM-DD
}

export function DayTabBar({ days, selectedDay, onSelectDay }: DayTabBarProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrapper}>
      <View style={[
        styles.container,
        { backgroundColor: colors.backgroundSecondary, borderColor: colors.glassBorder },
      ]}>
        {days.map((day) => {
          const isSelected = day.dayNumber === selectedDay;
          const dateObj = new Date(day.date + 'T00:00:00');
          const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
          const dayOfMonth = dateObj.getDate();

          return (
            <Pressable
              key={day.dayNumber}
              style={[
                styles.tab,
                isSelected && { backgroundColor: colors.electricBlueDim },
              ]}
              onPress={() => onSelectDay(day.dayNumber)}
            >
              <Typography
                variant="caption2"
                color={isSelected ? colors.electricBlue : colors.textTertiary}
                weight="medium"
              >
                {dayOfWeek}
              </Typography>
              <Typography
                variant="headline"
                color={isSelected ? colors.electricBlue : colors.textPrimary}
                weight={isSelected ? 'bold' : 'regular'}
              >
                {dayOfMonth}
              </Typography>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  container: {
    flexDirection: 'row',
    borderRadius: radii.xl,
    borderWidth: 1,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
    ...shadows.sm,
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.lg,
    backgroundColor: 'transparent',
  },
});
