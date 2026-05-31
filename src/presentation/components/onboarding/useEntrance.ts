import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

/**
 * Standard fade + rise entrance for onboarding content blocks.
 * Returns an animated style object to spread onto an Animated.View.
 */
export function useEntrance(delay = 0, distance = 18) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(distance)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 520,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 520,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return { opacity, transform: [{ translateY }] };
}
