import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Typography } from '@/presentation/components/ui/Typography';
import { onboardingTokens, f, ms } from './tokens';

interface TravelDnaBarProps {
  /** Fill percentage 0–100. */
  pct: number;
  leftLabel: string;
  rightLabel: string;
  /** Accent (default sky) or warning (amber) fill. */
  tone?: 'accent' | 'warning';
  /** Caption shown under the bar (e.g. "room to grow"). */
  caption?: string;
}

/** Labelled progress bar used on the travel-snapshot screen. */
export function TravelDnaBar({
  pct,
  leftLabel,
  rightLabel,
  tone = 'accent',
  caption,
}: TravelDnaBarProps) {
  const width = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(width, {
      toValue: Math.min(100, Math.max(0, pct)),
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  return (
    <View>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor:
                tone === 'warning' ? onboardingTokens.warning : onboardingTokens.accent,
              width: width.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      <View style={styles.labels}>
        <Typography
          variant="caption2"
          color={onboardingTokens.textTertiary}
          style={{ fontSize: f(10) }}
        >
          {leftLabel}
        </Typography>
        <Typography
          variant="caption2"
          color={onboardingTokens.textTertiary}
          style={{ fontSize: f(10) }}
        >
          {rightLabel}
        </Typography>
      </View>
      {caption ? (
        <Typography
          variant="caption2"
          color={onboardingTokens.textTertiary}
          style={{ fontSize: f(10), marginTop: ms(2) }}
        >
          {caption}
        </Typography>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: ms(6),
    borderRadius: ms(6),
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: ms(6),
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: ms(4),
  },
});
