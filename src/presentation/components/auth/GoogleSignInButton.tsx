import React from 'react';
import { Pressable, StyleSheet, View, Image } from 'react-native';
import { Typography } from '../ui/Typography';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radii } from '@/theme/radii';

interface GoogleSignInButtonProps {
  onPress: () => void;
}

export function GoogleSignInButton({ onPress }: GoogleSignInButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
      ]}
    >
      <GoogleIcon />
      <Typography
        variant="callout"
        weight="semiBold"
        color={colors.googleBtnText}
        style={styles.text}
      >
        Continue with Google
      </Typography>
    </Pressable>
  );
}

function GoogleIcon() {
  return (
    <View style={styles.iconContainer}>
      <Typography variant="callout" weight="bold" color={colors.googleBtnBlue}>
        G
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.googleBtnBg,
    borderRadius: radii.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  text: {
    marginLeft: spacing.xs,
  },
  iconContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
