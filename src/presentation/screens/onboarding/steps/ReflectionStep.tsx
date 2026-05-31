import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
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
import {
  buildGoalsReflection,
  buildEmotionalReflection,
  buildInsightCards,
} from '@/config/onboarding/personalization';
import type { ReflectionStepDef, StepRendererProps } from '@/config/onboarding/types';

type Props = StepRendererProps<ReflectionStepDef>;

export function ReflectionStep({ step, onNext, index, total }: Props) {
  const answers = useOnboardingStore();
  const titleAnim = useEntrance(100);

  return (
    <OnboardingShell
      scroll
      footer={<OnboardingButton title={step.cta} onPress={onNext} />}
      progress={{ index, total, visible: step.showProgress !== false }}
      contentStyle={styles.content}
    >
      {step.variant === 'goals' && (
        <GoalsBody data={buildGoalsReflection(answers)} titleAnim={titleAnim} />
      )}
      {step.variant === 'emotional' && (
        <EmotionalBody
          data={buildEmotionalReflection(answers)}
          titleAnim={titleAnim}
        />
      )}
      {step.variant === 'insightCards' && (
        <InsightCardsBody
          data={buildInsightCards(answers)}
          titleAnim={titleAnim}
        />
      )}
    </OnboardingShell>
  );
}

type Anim = ReturnType<typeof useEntrance>;

function Title({ children, anim }: { children: string; anim: Anim }) {
  return (
    <Animated.View style={anim}>
      <Typography
        variant="title2"
        weight="bold"
        color={onboardingTokens.textPrimary}
        style={{ fontSize: f(22), lineHeight: f(29) }}
      >
        {children}
      </Typography>
    </Animated.View>
  );
}

function Card({
  children,
  delay,
  highlight,
}: {
  children: React.ReactNode;
  delay: number;
  highlight?: boolean;
}) {
  const anim = useEntrance(delay);
  return (
    <Animated.View
      style={[
        anim,
        styles.card,
        highlight && {
          backgroundColor: onboardingTokens.cardBgSelected,
          borderColor: 'rgba(79,195,247,0.4)',
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

function GoalsBody({
  data,
  titleAnim,
}: {
  data: ReturnType<typeof buildGoalsReflection>;
  titleAnim: Anim;
}) {
  return (
    <View>
      <Title anim={titleAnim}>{data.title}</Title>
      <View style={styles.stack}>
        {data.goals.map((g, i) => (
          <Card key={g.label} delay={220 + i * 130}>
            <Typography
              variant="footnote"
              weight="heavy"
              color={onboardingTokens.accent}
              style={{ fontSize: f(13) }}
            >
              {g.label}
            </Typography>
            <Typography
              variant="caption1"
              color={onboardingTokens.textSecondary}
              style={{ fontSize: f(12), marginTop: ms(2) }}
            >
              {g.note}
            </Typography>
          </Card>
        ))}
      </View>
      <Typography
        variant="body"
        color={onboardingTokens.textSecondary}
        style={{ fontSize: f(14), marginTop: ms(16), lineHeight: f(21) }}
      >
        {data.closing[0]}
      </Typography>
      <Typography
        variant="body"
        weight="semiBold"
        color={onboardingTokens.textPrimary}
        style={{ fontSize: f(14), marginTop: ms(4) }}
      >
        {data.currentState}.
      </Typography>
      <Typography
        variant="body"
        color={onboardingTokens.textSecondary}
        style={{ fontSize: f(14), marginTop: ms(12), lineHeight: f(21) }}
      >
        {data.closing[1]}
      </Typography>
    </View>
  );
}

function EmotionalBody({
  data,
  titleAnim,
}: {
  data: ReturnType<typeof buildEmotionalReflection>;
  titleAnim: Anim;
}) {
  const bodyAnim = useEntrance(280);
  return (
    <View>
      <Title anim={titleAnim}>{data.title}</Title>
      <Animated.View style={[bodyAnim, { marginTop: ms(16) }]}>
        <Typography
          variant="body"
          color={onboardingTokens.textSecondary}
          style={{ fontSize: f(15), lineHeight: f(23) }}
        >
          <Typography
            variant="body"
            weight="semiBold"
            color={onboardingTokens.textPrimary}
            style={{ fontSize: f(15) }}
          >
            {data.blocker}
          </Typography>{' '}
          — that’s exactly what TripNode is built to solve.
        </Typography>
        <Typography
          variant="body"
          color={onboardingTokens.textSecondary}
          style={{ fontSize: f(15), lineHeight: f(23), marginTop: ms(14) }}
        >
          {data.midline}
        </Typography>
        <Typography
          variant="title3"
          weight="bold"
          color={onboardingTokens.textPrimary}
          style={{ fontSize: f(18), marginTop: ms(16) }}
        >
          {data.closing}
        </Typography>
      </Animated.View>
    </View>
  );
}

function InsightCardsBody({
  data,
  titleAnim,
}: {
  data: ReturnType<typeof buildInsightCards>;
  titleAnim: Anim;
}) {
  return (
    <View>
      <Title anim={titleAnim}>{data.title}</Title>
      <View style={styles.stack}>
        {data.cards.map((c, i) => (
          <Card key={c.label} delay={220 + i * 140} highlight>
            <Typography
              variant="caption2"
              weight="heavy"
              color={onboardingTokens.accent}
              style={{ fontSize: f(9), letterSpacing: 1, textTransform: 'uppercase' }}
            >
              {c.label}
            </Typography>
            <Typography
              variant="footnote"
              weight="bold"
              color={onboardingTokens.textPrimary}
              style={{ fontSize: f(13), marginTop: ms(3) }}
            >
              {c.value}
            </Typography>
          </Card>
        ))}
      </View>
      <Typography
        variant="body"
        weight="semiBold"
        color={onboardingTokens.textPrimary}
        align="center"
        style={{ fontSize: f(14), marginTop: ms(18), lineHeight: f(21) }}
      >
        {data.closing}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
  },
  stack: {
    marginTop: ms(16),
    gap: ms(9),
  },
  card: {
    backgroundColor: onboardingTokens.cardBg,
    borderColor: onboardingTokens.cardBorder,
    borderWidth: 1,
    borderRadius: ms(14),
    padding: ms(13),
  },
});
