import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Typography } from '@/presentation/components/ui/Typography';
import { onboardingTokens, f } from './tokens';

/** Subtly pulsing "tap to continue →" affordance for narrative screens. */
export function TapHint() {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.9,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View style={[styles.wrap, { opacity }]}>
      <Typography
        variant="footnote"
        weight="medium"
        color={onboardingTokens.textSecondary}
        style={{ fontSize: f(13) }}
      >
        tap to continue →
      </Typography>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-end',
  },
});
