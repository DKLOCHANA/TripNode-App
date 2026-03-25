import React from 'react';
import {
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { Typography } from '../Typography';
import { useTheme, ColorScheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme/spacing';
import { radii } from '@/theme/radii';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'default' | 'large' | 'small';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

function getVariantStyle(variant: ButtonVariant, colors: ColorScheme): ViewStyle {
  switch (variant) {
    case 'primary':
      return { backgroundColor: colors.electricBlue };
    case 'secondary':
      return { backgroundColor: colors.glassSurface, borderWidth: 1, borderColor: colors.glassBorder };
    case 'ghost':
      return { backgroundColor: 'transparent' };
    case 'destructive':
      return { backgroundColor: colors.errorDim };
  }
}

function getVariantPressedStyle(variant: ButtonVariant, colors: ColorScheme): ViewStyle {
  switch (variant) {
    case 'primary':
      return { backgroundColor: colors.electricBluePressed, transform: [{ scale: 0.98 }] };
    case 'secondary':
      return { backgroundColor: colors.glassBorder, transform: [{ scale: 0.98 }] };
    case 'ghost':
      return { opacity: 0.7 };
    case 'destructive':
      return { opacity: 0.8, transform: [{ scale: 0.98 }] };
  }
}

function getVariantTextColor(variant: ButtonVariant, colors: ColorScheme): string {
  switch (variant) {
    case 'primary':
      return colors.white;
    case 'secondary':
      return colors.textPrimary;
    case 'ghost':
      return colors.electricBlue;
    case 'destructive':
      return colors.error;
  }
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'default',
  loading = false,
  disabled = false,
  icon,
  style,
}: ButtonProps) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        sizeStyles[size],
        getVariantStyle(variant, colors),
        pressed && !isDisabled && getVariantPressedStyle(variant, colors),
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#fff' : colors.electricBlue}
          size="small"
        />
      ) : (
        <>
          {icon}
          <Typography
            variant={size === 'small' ? 'footnote' : 'callout'}
            weight="semiBold"
            color={getVariantTextColor(variant, colors)}
            style={icon ? { marginLeft: spacing.xs } : undefined}
          >
            {title}
          </Typography>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
  },
  disabled: {
    opacity: 0.5,
  },
});

const sizeStyles: Record<ButtonSize, ViewStyle> = {
  small: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
  default: { paddingVertical: 14, paddingHorizontal: spacing.xl },
  large: { paddingVertical: spacing.md, paddingHorizontal: spacing.xxl, borderRadius: radii.lg },
};
