import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography } from '@/presentation/components/ui/Typography';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radii } from '@/theme/radii';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - spacing.screen * 4;
const BAR_WIDTH = (CHART_WIDTH - spacing.xl) / 2;
const MAX_BAR_HEIGHT = 200;

interface EfficiencyBarChartProps {
  withoutValue: number;
  withValue: number;
  withoutLabel: string;
  withLabel: string;
}

export function EfficiencyBarChart({
  withoutValue,
  withValue,
  withoutLabel,
  withLabel,
}: EfficiencyBarChartProps) {
  const withoutHeight = useRef(new Animated.Value(0)).current;
  const withHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(200),
      Animated.timing(withoutHeight, {
        toValue: (withoutValue / 100) * MAX_BAR_HEIGHT,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();

    Animated.sequence([
      Animated.delay(400),
      Animated.timing(withHeight, {
        toValue: (withValue / 100) * MAX_BAR_HEIGHT,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.chartArea}>
        {/* Without TripNode Bar */}
        <View style={styles.barColumn}>
          <View style={styles.barContainer}>
            <Animated.View style={[styles.barWrapper, { height: withoutHeight }]}>
              <LinearGradient
                colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                style={styles.bar}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              />
            </Animated.View>
          </View>
          <Typography
            variant="headline"
            weight="bold"
            color={colors.textSecondary}
            align="center"
            style={styles.value}
          >
            {withoutValue}%
          </Typography>
          <Typography
            variant="caption1"
            color={colors.textTertiary}
            align="center"
            numberOfLines={2}
          >
            {withoutLabel}
          </Typography>
        </View>

        {/* With TripNode Bar */}
        <View style={styles.barColumn}>
          <View style={styles.barContainer}>
            <Animated.View style={[styles.barWrapper, { height: withHeight }]}>
              <LinearGradient
                colors={[colors.electricBlue, 'rgba(10,132,255,0.6)']}
                style={styles.bar}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              />
            </Animated.View>
          </View>
          <Typography
            variant="headline"
            weight="bold"
            color={colors.electricBlue}
            align="center"
            style={styles.value}
          >
            {withValue}%
          </Typography>
          <Typography
            variant="caption1"
            color={colors.textSecondary}
            align="center"
            numberOfLines={2}
          >
            {withLabel}
          </Typography>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  chartArea: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    height: MAX_BAR_HEIGHT + 80,
  },
  barColumn: {
    alignItems: 'center',
    width: BAR_WIDTH,
  },
  barContainer: {
    height: MAX_BAR_HEIGHT,
    justifyContent: 'flex-end',
  },
  barWrapper: {
    width: BAR_WIDTH * 0.6,
    borderRadius: radii.sm,
    overflow: 'hidden',
  },
  bar: {
    flex: 1,
    borderRadius: radii.sm,
  },
  value: {
    marginTop: spacing.sm,
  },
});
