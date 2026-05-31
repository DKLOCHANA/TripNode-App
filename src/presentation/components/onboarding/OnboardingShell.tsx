import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { gradients } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { OnboardingProgress } from './OnboardingProgress';
import { onboardingTokens, ms } from './tokens';

interface OnboardingShellProps {
  children: React.ReactNode;
  /** Footer area — usually the CTA button or tap hint. */
  footer?: React.ReactNode;
  /** Whole-screen tap handler (for "tap to continue" screens). */
  onTap?: () => void;
  /** Scroll the content instead of vertically centering it. */
  scroll?: boolean;
  /** Vertically center content (ignored when `scroll`). Default true. */
  centered?: boolean;
  /** Progress bar config. */
  progress?: { index: number; total: number; visible: boolean };
  /** Avoid the keyboard (text-input screens). */
  keyboardAware?: boolean;
  contentStyle?: ViewStyle;
}

export function OnboardingShell({
  children,
  footer,
  onTap,
  scroll = false,
  centered = true,
  progress,
  keyboardAware = false,
  contentStyle,
}: OnboardingShellProps) {
  const insets = useSafeAreaInsets();

  const body = (
    <>
      <View
        style={[
          styles.topBar,
          { paddingTop: insets.top + ms(8) },
        ]}
      >
        {progress?.visible ? (
          <OnboardingProgress index={progress.index} total={progress.total} />
        ) : null}
      </View>

      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: spacing.lg },
            contentStyle,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View
          style={[
            styles.flex,
            styles.fixedContent,
            centered && styles.centered,
            contentStyle,
          ]}
        >
          {children}
        </View>
      )}

      {footer ? (
        <View
          style={[
            styles.footer,
            { paddingBottom: insets.bottom + ms(16) },
          ]}
        >
          {footer}
        </View>
      ) : (
        <View style={{ height: insets.bottom + ms(16) }} />
      )}
    </>
  );

  const content = onTap ? (
    <Pressable style={styles.flex} onPress={onTap}>
      {body}
    </Pressable>
  ) : (
    body
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[...gradients.onboarding]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
      />
      <LinearGradient
        colors={[...onboardingTokens.overlay]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      {keyboardAware ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1628',
  },
  flex: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: spacing.screen,
    minHeight: ms(8),
  },
  fixedContent: {
    paddingHorizontal: spacing.screen,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.screen,
    paddingTop: ms(8),
  },
  centered: {
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: spacing.screen,
    paddingTop: ms(10),
  },
});
