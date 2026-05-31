import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Typography } from '@/presentation/components/ui/Typography';
import { radii } from '@/theme/radii';
import { useTheme } from '@/theme/ThemeContext';
import { f, ms } from './tokens';

interface OnboardingButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

/** Full-width primary CTA tuned for the onboarding flow (Electric Blue). */
export function OnboardingButton({
  title,
  onPress,
  disabled = false,
  style,
}: OnboardingButtonProps) {
  const { colors } = useTheme();

  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: colors.electricBlue },
        pressed && !disabled && { backgroundColor: colors.electricBluePressed, transform: [{ scale: 0.985 }] },
        disabled && styles.disabled,
        style,
      ]}
    >
      <Typography
        variant="callout"
        weight="bold"
        color="#FFFFFF"
        style={{ fontSize: f(16) }}
      >
        {title}
      </Typography>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    borderRadius: radii.lg,
    paddingVertical: ms(15),
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
});
