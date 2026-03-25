import React from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeScrollView } from '@/presentation/components/shared/SafeScrollView';
import { ErrorBanner } from '@/presentation/components/shared/ErrorBanner';
import { Typography } from '@/presentation/components/ui/Typography';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { useForgotPasswordViewModel } from '@/presentation/view-models/useForgotPasswordViewModel';
import { colors, gradients } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radii } from '@/theme/radii';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const {
    email,
    fieldErrors,
    loading,
    error,
    emailSent,
    handleEmailChange,
    handleSubmit,
    clearError,
    navigateBack,
    navigateToLogin,
  } = useForgotPasswordViewModel();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[...gradients.authLogin]}
        style={styles.bgGradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <LinearGradient
        colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.85)']}
        style={StyleSheet.absoluteFill}
      />

      <SafeScrollView
        contentContainerStyle={{ paddingTop: insets.top + spacing.xl }}
      >
        {/* Back button */}
        <Pressable
          onPress={navigateBack}
          hitSlop={12}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </Pressable>

        {/* App Icon */}
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Ionicons name="key-outline" size={24} color={colors.white} />
          </View>
        </View>

        {emailSent ? (
          <>
            {/* Success state */}
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={64} color={colors.success} />
            </View>

            <Typography variant="title1" weight="bold" align="center">
              Check your email
            </Typography>
            <Typography
              variant="subheadline"
              color={colors.textSecondary}
              align="center"
              style={styles.subtitle}
            >
              We've sent a password reset link to {email}. Check your inbox and follow the instructions.
            </Typography>

            <Button
              title="Back to Login"
              variant="primary"
              size="large"
              onPress={navigateToLogin}
              style={styles.cta}
            />
          </>
        ) : (
          <>
            {/* Header */}
            <Typography variant="title1" weight="bold" align="center">
              Reset password
            </Typography>
            <Typography
              variant="subheadline"
              color={colors.textSecondary}
              align="center"
              style={styles.subtitle}
            >
              Enter your email address and we'll send you a link to reset your password.
            </Typography>

            {/* Error banner */}
            {error && (
              <ErrorBanner
                error={error}
                onDismiss={clearError}
                onRetry={handleSubmit}
              />
            )}

            {/* Form */}
            <View style={styles.form}>
              <Input
                placeholder="Email"
                value={email}
                onChangeText={handleEmailChange}
                error={fieldErrors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
            </View>

            {/* CTA */}
            <Button
              title="Send Reset Link"
              variant="primary"
              size="large"
              loading={loading}
              onPress={handleSubmit}
              style={styles.cta}
            />

            {/* Footer */}
            <View style={styles.footerRow}>
              <Typography variant="footnote" color={colors.textTertiary}>
                Remember your password?{' '}
              </Typography>
              <Pressable onPress={navigateToLogin}>
                <Typography
                  variant="footnote"
                  color={colors.textLink}
                  weight="semiBold"
                >
                  Sign in
                </Typography>
              </Pressable>
            </View>
          </>
        )}
      </SafeScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  bgGradient: {
    ...StyleSheet.absoluteFillObject,
    height: SCREEN_HEIGHT,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  logoRow: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.sm,
    backgroundColor: colors.electricBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  subtitle: {
    marginTop: spacing.xxs,
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.md,
  },
  form: {
    gap: 0,
  },
  cta: {
    marginTop: spacing.md,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
});
