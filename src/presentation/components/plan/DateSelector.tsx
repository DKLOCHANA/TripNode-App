import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Typography } from '@/presentation/components/ui/Typography';
import { useTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme/spacing';
import { radii } from '@/theme/radii';

interface DateSelectorProps {
  label: string;
  sublabel: string;
  value: Date | null;
  active: boolean;
  compact?: boolean;
  onPress: () => void;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function DateSelector({
  label,
  sublabel,
  value,
  active,
  compact = false,
  onPress,
}: DateSelectorProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        compact && styles.containerCompact,
        { backgroundColor: colors.glassInputBg, borderColor: colors.glassBorder },
        active && { borderColor: colors.electricBlue },
      ]}
    >
      <Typography variant="caption2" color={colors.textTertiary} weight="medium">
        {sublabel}
      </Typography>
      <View style={styles.dateBtn}>
        <Typography
          variant="callout"
          color={value ? colors.textPrimary : colors.textTertiary}
          weight={value ? 'medium' : 'regular'}
        >
          {value ? formatDate(value) : label}
        </Typography>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: radii.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    minHeight: 48,
    justifyContent: 'center',
  },
  containerCompact: {
    paddingHorizontal: spacing.xxs,
    paddingVertical: spacing.xxs,
    minHeight: 44,
  },
  dateBtn: {
    paddingVertical: spacing.xxs,
  },
});
