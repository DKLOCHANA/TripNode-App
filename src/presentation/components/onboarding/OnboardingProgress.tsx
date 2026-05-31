import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { onboardingTokens, ms } from './tokens';

interface OnboardingProgressProps {
  index: number;
  total: number;
}

/** Slim top progress bar that fills smoothly as the user moves through the flow. */
export function OnboardingProgress({ index, total }: OnboardingProgressProps) {
  const target = Math.min(1, Math.max(0, (index + 1) / total));
  const width = useRef(new Animated.Value(target)).current;

  useEffect(() => {
    Animated.timing(width, {
      toValue: target,
      duration: 420,
      useNativeDriver: false,
    }).start();
  }, [target]);

  return (
    <View style={styles.track}>
      <Animated.View
        style={[
          styles.fill,
          {
            width: width.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: ms(3),
    borderRadius: ms(3),
    backgroundColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: ms(3),
    backgroundColor: onboardingTokens.accent,
  },
});
