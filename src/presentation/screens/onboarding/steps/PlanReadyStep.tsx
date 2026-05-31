import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/presentation/components/ui/Typography';
import {
  OnboardingShell,
  OnboardingButton,
  useEntrance,
  onboardingTokens,
  f,
  ms,
} from '@/presentation/components/onboarding';
import { useOnboardingStore } from '@/store/onboardingStore';
import { displayName } from '@/config/onboarding/personalization';
import type { PlanReadyStepDef, StepRendererProps } from '@/config/onboarding/types';

type Props = StepRendererProps<PlanReadyStepDef>;

export function PlanReadyStep({ step, onNext, index, total }: Props) {
  const { userName } = useOnboardingStore();
  const checkScale = useRef(new Animated.Value(0)).current;
  const textAnim = useEntrance(560);

  useEffect(() => {
    Animated.spring(checkScale, {
      toValue: 1,
      friction: 5,
      tension: 80,
      delay: 150,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <OnboardingShell
      footer={<OnboardingButton title={step.cta} onPress={onNext} />}
      progress={{ index, total, visible: step.showProgress !== false }}
      centered
    >
      <View style={styles.center}>
        <Animated.View
          style={[styles.checkWrap, { transform: [{ scale: checkScale }] }]}
        >
          <Ionicons
            name="checkmark-circle"
            size={ms(96)}
            color={onboardingTokens.accent}
          />
        </Animated.View>

        <Animated.View style={[textAnim, { marginTop: ms(20) }]}>
          <Typography
            variant="title2"
            weight="bold"
            color={onboardingTokens.textPrimary}
            align="center"
            style={{ fontSize: f(20), lineHeight: f(27) }}
          >
            {displayName(userName)}, your travel plan is ready.
          </Typography>
        </Animated.View>
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
  },
  checkWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
