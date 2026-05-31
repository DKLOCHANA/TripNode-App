import React, { useEffect } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Typography } from '@/presentation/components/ui/Typography';
import {
  OnboardingShell,
  OnboardingButton,
  AccentText,
  TapHint,
  useEntrance,
  onboardingTokens,
  f,
  ms,
} from '@/presentation/components/onboarding';
import { useOnboardingStore } from '@/store/onboardingStore';
import {
  interpolate,
  buildCommitmentResponse,
} from '@/config/onboarding/personalization';
import type {
  StatementStepDef,
  DynamicStatementStepDef,
  StepRendererProps,
} from '@/config/onboarding/types';

type Props = StepRendererProps<StatementStepDef | DynamicStatementStepDef>;

export function StatementStep({ step, onNext, index, total }: Props) {
  const answers = useOnboardingStore();

  // Resolve copy (static, token-interpolated, or dynamic from commitment).
  let headline: string;
  let subheading: string | undefined;
  let body: string[] = [];
  let emoji: string | undefined;
  let advance: 'tap' | 'button' | 'auto' = 'button';
  let autoMs = 1800;
  let cta = step.cta ?? 'continue';

  if (step.type === 'dynamicStatement') {
    const r = buildCommitmentResponse(answers);
    headline = r.headline;
    body = [r.body];
    emoji = r.emoji;
    advance = 'button';
  } else {
    headline = interpolate(step.headline, answers);
    subheading = step.subheading
      ? interpolate(step.subheading, answers)
      : undefined;
    body = (step.body ?? []).map((l) => interpolate(l, answers));
    emoji = step.emoji;
    advance = step.advance;
    autoMs = step.autoMs ?? 1800;
    cta = step.cta ?? 'continue';
  }

  const headlineAnim = useEntrance(120);
  const subAnim = useEntrance(320);

  useEffect(() => {
    if (advance !== 'auto') return;
    const t = setTimeout(onNext, autoMs);
    return () => clearTimeout(t);
  }, [advance, autoMs]);

  const footer =
    advance === 'button' ? (
      <OnboardingButton title={cta} onPress={onNext} />
    ) : (
      <TapHint />
    );

  return (
    <OnboardingShell
      footer={footer}
      onTap={advance === 'button' ? undefined : onNext}
      progress={{ index, total, visible: step.showProgress !== false }}
      centered
    >
      <View style={styles.center}>
        {emoji ? (
          <Animated.Text style={[styles.emoji, headlineAnim]}>
            {emoji}
          </Animated.Text>
        ) : null}

        <Animated.View style={headlineAnim}>
          <AccentText style={styles.headline}>{headline}</AccentText>
        </Animated.View>

        {subheading ? (
          <Animated.View style={[subAnim, { marginTop: ms(10) }]}>
            <Typography
              variant="title3"
              color={onboardingTokens.textSecondary}
              align="center"
              style={{ fontSize: f(17), lineHeight: f(24) }}
            >
              {subheading}
            </Typography>
          </Animated.View>
        ) : null}

        {body.length > 0 ? (
          <Animated.View style={[subAnim, styles.body]}>
            {body.map((line, i) => {
              const isLast = i === body.length - 1;
              return (
                <Typography
                  key={i}
                  variant="body"
                  weight={isLast && body.length > 1 ? 'semiBold' : 'regular'}
                  color={
                    isLast && body.length > 1
                      ? onboardingTokens.textPrimary
                      : onboardingTokens.textSecondary
                  }
                  align="center"
                  style={{
                    fontSize: f(15),
                    lineHeight: f(23),
                    marginTop: i === 0 ? 0 : ms(14),
                  }}
                >
                  {line}
                </Typography>
              );
            })}
          </Animated.View>
        ) : null}
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: f(44),
    marginBottom: ms(14),
  },
  headline: {
    fontSize: f(30),
    lineHeight: f(38),
    fontWeight: '800',
    color: onboardingTokens.textPrimary,
    textAlign: 'center',
  },
  body: {
    marginTop: ms(20),
    paddingHorizontal: ms(4),
  },
});
