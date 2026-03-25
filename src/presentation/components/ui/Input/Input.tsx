import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  Pressable,
} from 'react-native';
import { Typography } from '../Typography';
import { useTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme/spacing';
import { radii } from '@/theme/radii';
import { typography } from '@/theme/typography';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  secureTextEntry,
  ...rest
}: InputProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isSecure = secureTextEntry && !passwordVisible;

  return (
    <View style={styles.container}>
      {label && (
        <Typography
          variant="caption1"
          color={colors.textSecondary}
          weight="medium"
          style={styles.label}
        >
          {label}
        </Typography>
      )}

      <View
        style={[
          styles.inputRow,
          { backgroundColor: colors.glassInputBg, borderColor: colors.glassBorder },
          focused && { borderColor: colors.electricBlue },
          error ? { borderColor: colors.error } : null,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          {...rest}
          secureTextEntry={isSecure}
          placeholderTextColor={colors.textTertiary}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          style={[
            styles.input,
            { color: colors.textPrimary },
            leftIcon ? { paddingLeft: 0 } : null,
          ]}
        />

        {secureTextEntry && (
          <Pressable
            onPress={() => setPasswordVisible((v) => !v)}
            hitSlop={8}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textTertiary}
            />
          </Pressable>
        )}
      </View>

      {error && (
        <Typography variant="caption2" color={colors.error} style={styles.hint}>
          {error}
        </Typography>
      )}
      {hint && !error && (
        <Typography variant="caption2" color={colors.textTertiary} style={styles.hint}>
          {hint}
        </Typography>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  label: {
    marginBottom: spacing.xxs,
    marginLeft: spacing.xxs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    minHeight: 44,
  },
  leftIcon: {
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.body,
    paddingVertical: spacing.xs,
  },
  eyeIcon: {
    paddingLeft: spacing.xs,
  },
  hint: {
    marginTop: spacing.xxs,
    marginLeft: spacing.xxs,
  },
});
