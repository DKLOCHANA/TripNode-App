import React, { useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Typography } from '@/presentation/components/ui/Typography';
import {
  OnboardingShell,
  OnboardingButton,
  AccentText,
  ChoiceOption,
  useEntrance,
  onboardingTokens,
  f,
  ms,
} from '@/presentation/components/onboarding';
import { useOnboardingStore } from '@/store/onboardingStore';
import { interpolate } from '@/config/onboarding/personalization';
import type {
  ChoiceStepDef,
  StepRendererProps,
  YesNo,
} from '@/config/onboarding/types';

type Props = StepRendererProps<ChoiceStepDef>;

export function ChoiceStep({ step, onNext, index, total }: Props) {
  const store = useOnboardingStore();

  const initialSingle = (() => {
    if (step.field) return (store[step.field] as string | null) ?? null;
    if (step.yesNoField) return store.missedBest;
    return null;
  })();

  const [single, setSingle] = useState<string | null>(initialSingle);
  const [multi, setMulti] = useState<string[]>(
    step.multiField ? store.priorities : []
  );

  const headlineAnim = useEntrance(100);

  const isMulti = step.mode === 'multi';
  const max = step.maxSelect ?? 3;

  const canContinue = isMulti ? multi.length > 0 : single != null;

  const toggleMulti = (value: string) => {
    setMulti((prev) => {
      if (prev.includes(value)) return prev.filter((v) => v !== value);
      if (prev.length >= max) return prev;
      return [...prev, value];
    });
  };

  const commit = () => {
    if (!canContinue) return;
    if (isMulti && step.multiField) {
      store.setPriorities(multi);
    } else if (step.yesNoField && single) {
      store.setMissedBest(single as YesNo);
    } else if (step.field && single) {
      switch (step.field) {
        case 'planHabit':
          store.setPlanHabit(single);
          break;
        case 'tripProblem':
          store.setTripProblem(single);
          break;
        case 'budgetStyle':
          store.setBudgetStyle(single);
          break;
        case 'commitment':
          store.setCommitment(single);
          break;
      }
    }
    onNext();
  };

  return (
    <OnboardingShell
      scroll
      footer={
        <OnboardingButton
          title={step.cta}
          onPress={commit}
          disabled={!canContinue}
        />
      }
      progress={{ index, total, visible: step.showProgress !== false }}
      contentStyle={styles.content}
    >
      <Animated.View style={headlineAnim}>
        <AccentText style={styles.headline}>
          {interpolate(step.headline, store)}
        </AccentText>
        {step.subheading ? (
          <Typography
            variant="subheadline"
            color={onboardingTokens.textSecondary}
            style={{ fontSize: f(14), marginTop: ms(6) }}
          >
            {step.subheading}
          </Typography>
        ) : null}
      </Animated.View>

      <View style={step.layout === 'chips' ? styles.chips : styles.list}>
        {step.options.map((opt, i) => {
          const selected = isMulti
            ? multi.includes(opt.value)
            : single === opt.value;
          return (
            <AnimatedOption
              key={opt.value}
              order={i}
              layout={step.layout}
              label={opt.label}
              emoji={opt.emoji}
              selected={selected}
              onPress={() =>
                isMulti ? toggleMulti(opt.value) : setSingle(opt.value)
              }
            />
          );
        })}
      </View>
    </OnboardingShell>
  );
}

interface AnimatedOptionProps {
  order: number;
  layout: 'list' | 'chips';
  label: string;
  emoji?: string;
  selected: boolean;
  onPress: () => void;
}

function AnimatedOption({
  order,
  layout,
  label,
  emoji,
  selected,
  onPress,
}: AnimatedOptionProps) {
  const anim = useEntrance(180 + order * 70);
  return (
    <Animated.View style={[anim, layout === 'list' ? styles.listItem : undefined]}>
      <ChoiceOption
        label={label}
        emoji={emoji}
        selected={selected}
        layout={layout}
        onPress={onPress}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'flex-start',
  },
  headline: {
    fontSize: f(22),
    lineHeight: f(29),
    fontWeight: '700',
    color: onboardingTokens.textPrimary,
  },
  list: {
    marginTop: ms(20),
  },
  listItem: {
    marginBottom: ms(10),
  },
  chips: {
    marginTop: ms(20),
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ms(9),
  },
});
