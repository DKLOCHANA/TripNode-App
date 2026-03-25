import React, { useRef, useEffect } from 'react';
import { Pressable, StyleSheet, ViewStyle, Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { Typography } from '@/presentation/components/ui/Typography';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radii } from '@/theme/radii';

interface SelectableOptionProps {
  text: string;
  isSelected: boolean;
  onSelect: () => void;
  style?: ViewStyle;
}

export function SelectableOption({
  text,
  isSelected,
  onSelect,
  style,
}: SelectableOptionProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(glowOpacity, {
      toValue: isSelected ? 0.15 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [isSelected]);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect();
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.container,
          {
            borderColor: isSelected ? colors.electricBlue : colors.glassBorder,
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
      >
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        <Animated.View style={[StyleSheet.absoluteFill, styles.overlay]} />
        <Animated.View style={[StyleSheet.absoluteFill, styles.glow, { opacity: glowOpacity }]} />
        <Typography
          variant="callout"
          weight={isSelected ? 'semiBold' : 'regular'}
          color={isSelected ? colors.textPrimary : colors.textSecondary}
          align="center"
          style={styles.text}
        >
          {text}
        </Typography>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.card,
    overflow: 'hidden',
    minHeight: 56,
  },
  overlay: {
    backgroundColor: colors.glassSurface,
  },
  glow: {
    backgroundColor: colors.electricBlue,
  },
  text: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
});
