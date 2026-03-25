import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Typography } from '@/presentation/components/ui/Typography';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GAUGE_SIZE = Math.min(SCREEN_WIDTH - spacing.screen * 4, 220);
const STROKE_WIDTH = 12;
const RADIUS = (GAUGE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface PercentageGaugeProps {
  withoutValue: number;
  withValue: number;
  withoutLabel: string;
  withLabel: string;
}

export function PercentageGauge({
  withoutValue,
  withValue,
  withoutLabel,
  withLabel,
}: PercentageGaugeProps) {
  const [strokeDashoffset, setStrokeDashoffset] = useState(CIRCUMFERENCE);
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const listener = animValue.addListener(({ value }) => {
      setStrokeDashoffset(CIRCUMFERENCE * (1 - value));
    });

    Animated.sequence([
      Animated.delay(300),
      Animated.timing(animValue, {
        toValue: withValue / 100,
        duration: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();

    return () => animValue.removeListener(listener);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.gaugeContainer}>
        <Svg width={GAUGE_SIZE} height={GAUGE_SIZE}>
          <Defs>
            <LinearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={colors.electricBlue} />
              <Stop offset="100%" stopColor="#30D158" />
            </LinearGradient>
          </Defs>
          
          {/* Background circle */}
          <Circle
            cx={GAUGE_SIZE / 2}
            cy={GAUGE_SIZE / 2}
            r={RADIUS}
            stroke={colors.glassSurface}
            strokeWidth={STROKE_WIDTH}
            fill="transparent"
          />
          
          {/* Progress circle */}
          <Circle
            cx={GAUGE_SIZE / 2}
            cy={GAUGE_SIZE / 2}
            r={RADIUS}
            stroke="url(#gaugeGradient)"
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(-90 ${GAUGE_SIZE / 2} ${GAUGE_SIZE / 2})`}
          />
        </Svg>
        
        {/* Center content */}
        <View style={styles.centerContent}>
          <Typography
            variant="largeTitle"
            weight="heavy"
            color={colors.electricBlue}
          >
            {withValue}%
          </Typography>
          <Typography
            variant="caption1"
            color={colors.textSecondary}
            align="center"
          >
            {withLabel}
          </Typography>
        </View>
      </View>

      {/* Comparison text */}
      <View style={styles.comparison}>
        <Typography
          variant="footnote"
          color={colors.textTertiary}
          align="center"
        >
          {withoutLabel}: {withoutValue}%
        </Typography>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  gaugeContainer: {
    width: GAUGE_SIZE,
    height: GAUGE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  comparison: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.glassSurface,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
});
