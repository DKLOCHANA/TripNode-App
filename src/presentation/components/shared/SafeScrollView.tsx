import React from 'react';
import { ScrollView, StyleSheet, ViewStyle, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme/spacing';

interface SafeScrollViewProps {
  children: React.ReactNode;
  contentContainerStyle?: ViewStyle;
  padHorizontal?: boolean;
}

export function SafeScrollView({
  children,
  contentContainerStyle,
  padHorizontal = true,
}: SafeScrollViewProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.backgroundPrimary }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={[styles.flex, { backgroundColor: colors.backgroundPrimary }]}
        contentContainerStyle={[
          {
            paddingTop: insets.top + spacing.md,
            paddingBottom: insets.bottom + spacing.xxxl,
            paddingHorizontal: padHorizontal ? spacing.screen : 0,
          },
          contentContainerStyle,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
