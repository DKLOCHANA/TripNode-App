import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, Animated as RNAnimated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/presentation/components/ui/Typography';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radii } from '@/theme/radii';
import type { DomainError } from '@/errors/DomainError';

interface ErrorBannerProps {
  error: DomainError | string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

function getErrorMessage(error: DomainError | string): string {
  if (typeof error === 'string') return error;
  return error.message;
}

function isRetryable(error: DomainError | string): boolean {
  if (typeof error === 'string') return false;
  if (error.type === 'NetworkError') return error.retryable;
  if (error.type === 'AuthError') return error.code === 'TOO_MANY_REQUESTS';
  return false;
}

export function ErrorBanner({ error, onRetry, onDismiss }: ErrorBannerProps) {
  const fadeAnim = useRef(new RNAnimated.Value(0)).current;
  const translateY = useRef(new RNAnimated.Value(-8)).current;

  useEffect(() => {
    RNAnimated.parallel([
      RNAnimated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      RNAnimated.timing(translateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateY]);

  const message = getErrorMessage(error);
  const showRetry = isRetryable(error) && onRetry;

  return (
    <RNAnimated.View
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ translateY }] },
      ]}
    >
      <View style={styles.content}>
        <Ionicons
          name="alert-circle"
          size={18}
          color={colors.error}
          style={styles.icon}
        />
        <Typography
          variant="footnote"
          color={colors.error}
          style={styles.message}
        >
          {message}
        </Typography>
        {onDismiss && (
          <Pressable onPress={onDismiss} hitSlop={8} style={styles.dismissBtn}>
            <Ionicons name="close" size={16} color={colors.error} />
          </Pressable>
        )}
      </View>
      {showRetry && (
        <Pressable onPress={onRetry} style={styles.retryBtn}>
          <Ionicons name="refresh" size={14} color={colors.electricBlue} />
          <Typography
            variant="caption1"
            color={colors.electricBlue}
            weight="medium"
            style={styles.retryText}
          >
            Try Again
          </Typography>
        </Pressable>
      )}
    </RNAnimated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.errorDim,
    borderRadius: radii.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.25)',
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: spacing.xs,
  },
  message: {
    flex: 1,
  },
  dismissBtn: {
    marginLeft: spacing.xs,
    padding: spacing.xxs,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
    paddingVertical: spacing.xxs,
  },
  retryText: {
    marginLeft: spacing.xxs,
  },
});
