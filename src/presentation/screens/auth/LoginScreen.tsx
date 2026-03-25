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
import { AppleSignInButton } from '@/presentation/components/auth/AppleSignInButton';
import { AuthFormDivider } from '@/presentation/components/auth/AuthFormDivider';
import { useLoginViewModel } from '@/presentation/view-models/useLoginViewModel';
import { colors, gradients } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radii } from '@/theme/radii';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function LoginScreen() {
  const insets = useSafeAreaInsets();
  const {
    email,
    password,
    fieldErrors,
    loading,
    authError,
    handleEmailChange,
    handlePasswordChange,
    handleSignIn,
    handleAppleSignIn,
    clearError,
    navigateToRegister,
    navigateToForgotPassword,
  } = useLoginViewModel();

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
        contentContainerStyle={{ 
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: spacing.xxl,
        }}
      >
        {/* App Icon */}
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Ionicons name="navigate" size={24} color={colors.white} />
          </View>
        </View>

        {/* Header */}
        <Typography variant="title1" weight="bold" align="center">
          Welcome back
        </Typography>
        <Typography
          variant="subheadline"
          color={colors.textSecondary}
          align="center"
          style={styles.subtitle}
        >
          Sign in to continue your journey.
        </Typography>

        {/* Auth error banner */}
        {authError && (
          <ErrorBanner
            error={authError}
            onDismiss={clearError}
            onRetry={handleSignIn}
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
            returnKeyType="next"
          />

          <Input
            placeholder="Password"
            value={password}
            onChangeText={handlePasswordChange}
            error={fieldErrors.password}
            secureTextEntry
            autoComplete="current-password"
            returnKeyType="done"
            onSubmitEditing={handleSignIn}
          />
        </View>

        {/* Forgot password */}
        <Pressable style={styles.forgotRow} onPress={navigateToForgotPassword}>
          <Typography
            variant="footnote"
            color={colors.textLink}
            weight="medium"
          >
            Forgot password?
          </Typography>
        </Pressable>

        {/* CTA */}
        <Button
          title="Sign In"
          variant="primary"
          size="large"
          loading={loading}
          onPress={handleSignIn}
          style={styles.cta}
        />

        {/* Divider */}
        <AuthFormDivider />

        {/* Social auth */}
        <AppleSignInButton onPress={handleAppleSignIn} />

        {/* Footer */}
        <View style={styles.footerRow}>
          <Typography variant="footnote" color={colors.textTertiary}>
            Don't have an account?{' '}
          </Typography>
          <Pressable onPress={navigateToRegister}>
            <Typography
              variant="footnote"
              color={colors.textLink}
              weight="semiBold"
            >
              Create one
            </Typography>
          </Pressable>
        </View>
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
  subtitle: {
    marginTop: spacing.xxs,
    marginBottom: spacing.xxl,
  },
  form: {
    gap: spacing.md,
    width: '100%',
  },
  forgotRow: {
    alignSelf: 'flex-end',
    marginTop: spacing.xxs,
    marginBottom: spacing.xs,
  },
  cta: {
    marginTop: spacing.md,
    width: '100%',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
    width: '100%',
  },
});
