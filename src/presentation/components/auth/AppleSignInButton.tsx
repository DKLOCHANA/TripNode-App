import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../ui/Typography';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radii } from '@/theme/radii';

interface AppleSignInButtonProps {
  onPress: () => void;
}

export function AppleSignInButton({ onPress }: AppleSignInButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons name="logo-apple" size={20} color={colors.white} />
      <Typography
        variant="callout"
        weight="semiBold"
        color={colors.white}
        style={styles.text}
      >
        Continue with Apple
      </Typography>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.appleBtnBg,
    borderRadius: radii.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    borderWidth: 1,
    borderColor: colors.appleBtnBorder,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  text: {
    marginLeft: spacing.xs,
  },
});
