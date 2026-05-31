import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Typography } from '@/presentation/components/ui/Typography';
import { onboardingTokens, f, ms } from './tokens';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface LoadingRingProps {
  steps: string[];
  durationMs: number;
  tint: 'blue' | 'dark';
  onDone: () => void;
}

/**
 * Animated circular progress ring with sequentially-checked step labels.
 * Calls `onDone` once the ring completes (minimum `durationMs`).
 */
export function LoadingRing({ steps, durationMs, tint, onDone }: LoadingRingProps) {
  const size = ms(86);
  const stroke = ms(4);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = useRef(new Animated.Value(0)).current;
  const [activeStep, setActiveStep] = useState(0);
  const ringColor = tint === 'blue' ? '#FFFFFF' : onboardingTokens.accent;
  const trackColor =
    tint === 'blue' ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.12)';

  useEffect(() => {
    const id = progress.addListener(({ value }) => {
      const step = Math.min(steps.length - 1, Math.floor(value * steps.length));
      setActiveStep(step);
    });

    Animated.timing(progress, {
      toValue: 1,
      duration: durationMs,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) onDone();
    });

    return () => progress.removeListener(id);
  }, []);

  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={styles.wrap}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={trackColor}
            strokeWidth={stroke}
            fill="none"
          />
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={ringColor}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${circumference}, ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
      </View>

      <View style={styles.steps}>
        {steps.map((label, i) => {
          const done = i < activeStep;
          const current = i === activeStep;
          return (
            <Typography
              key={label}
              variant="footnote"
              weight={current ? 'semiBold' : 'regular'}
              color={
                done || current
                  ? tint === 'blue'
                    ? 'rgba(255,255,255,0.92)'
                    : onboardingTokens.textPrimary
                  : onboardingTokens.textTertiary
              }
              align="center"
              style={{ fontSize: f(13), marginTop: ms(6) }}
            >
              {done ? '✓ ' : ''}
              {label}
            </Typography>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  steps: {
    marginTop: ms(22),
    alignItems: 'center',
  },
});
