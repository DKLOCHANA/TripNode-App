import React, { useState } from 'react';
import { Animated, StyleSheet, TextInput, View } from 'react-native';
import { Typography } from '@/presentation/components/ui/Typography';
import {
  OnboardingShell,
  OnboardingButton,
  AccentText,
  useEntrance,
  onboardingTokens,
  f,
  ms,
} from '@/presentation/components/onboarding';
import { useOnboardingStore } from '@/store/onboardingStore';
import { interpolate } from '@/config/onboarding/personalization';
import { sanitizeTextInput } from '@/lib/sanitize';
import type { TextInputStepDef, StepRendererProps } from '@/config/onboarding/types';

type Props = StepRendererProps<TextInputStepDef>;

export function TextInputStep({ step, onNext, index, total }: Props) {
  const store = useOnboardingStore();
  const initial = step.field === 'userName' ? store.userName : store.destination;
  const [value, setValue] = useState(initial);
  const [focused, setFocused] = useState(false);

  const headlineAnim = useEntrance(120);
  const fieldAnim = useEntrance(300);

  const trimmed = value.trim();
  const canContinue = trimmed.length >= step.minChars;

  const commit = () => {
    if (!canContinue) return;
    const clean = sanitizeTextInput(trimmed, 60);
    if (step.field === 'userName') store.setUserName(clean);
    else store.setDestination(clean);
    onNext();
  };

  return (
    <OnboardingShell
      keyboardAware
      footer={
        <OnboardingButton
          title={step.cta}
          onPress={commit}
          disabled={!canContinue}
        />
      }
      progress={{ index, total, visible: step.showProgress !== false }}
      centered
    >
      <View style={styles.center}>
        <Animated.View style={headlineAnim}>
          <AccentText style={styles.headline}>
            {interpolate(step.headline, store)}
          </AccentText>
        </Animated.View>

        {step.subheading ? (
          <Animated.View style={[headlineAnim, { marginTop: ms(8) }]}>
            <Typography
              variant="title3"
              color={onboardingTokens.textSecondary}
              align="center"
              style={{ fontSize: f(16), lineHeight: f(22) }}
            >
              {interpolate(step.subheading, store)}
            </Typography>
          </Animated.View>
        ) : null}

        <Animated.View style={[fieldAnim, styles.fieldWrap]}>
          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder={step.placeholder}
            placeholderTextColor={onboardingTokens.textTertiary}
            autoCapitalize={step.autoCapitalize ?? 'sentences'}
            autoCorrect={false}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={commit}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            selectionColor={onboardingTokens.accent}
            maxLength={60}
            style={[
              styles.input,
              {
                borderColor: focused
                  ? onboardingTokens.accent
                  : onboardingTokens.cardBorder,
              },
            ]}
          />
        </Animated.View>
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
  },
  headline: {
    fontSize: f(28),
    lineHeight: f(35),
    fontWeight: '800',
    color: onboardingTokens.textPrimary,
    textAlign: 'center',
  },
  fieldWrap: {
    width: '100%',
    marginTop: ms(26),
  },
  input: {
    width: '100%',
    backgroundColor: onboardingTokens.cardBg,
    borderWidth: 1.5,
    borderRadius: ms(14),
    paddingVertical: ms(15),
    paddingHorizontal: ms(16),
    fontSize: f(18),
    color: onboardingTokens.textPrimary,
    textAlign: 'center',
  },
});
