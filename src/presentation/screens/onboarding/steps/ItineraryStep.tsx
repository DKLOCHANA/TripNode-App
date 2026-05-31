import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
import { displayName, displayDestination } from '@/config/onboarding/personalization';
import {
  buildFallbackDay,
  formatPreviewMeta,
} from '@/data/sources/remote/api/onboardingPreviewApi';
import type { ItineraryStepDef, StepRendererProps } from '@/config/onboarding/types';

const DISCLAIMER =
  'Itineraries are AI-generated suggestions. Always verify details like hours, prices, and availability before your trip.';

type Props = StepRendererProps<ItineraryStepDef>;

export function ItineraryStep({ step, onNext, index, total }: Props) {
  const { userName, destination, previewDay } = useOnboardingStore();
  const titleAnim = useEntrance(100);

  // The AI-generated Day 1 from screen 20. Defensive fallback only if the
  // user somehow reached here without a generated preview.
  const day = previewDay ?? buildFallbackDay(destination);
  const sections = [
    { label: '🌅 Morning', activities: day.morning },
    { label: '☀️ Afternoon', activities: day.afternoon },
  ].filter((s) => s.activities.length > 0);

  return (
    <OnboardingShell
      scroll
      footer={<OnboardingButton title={step.cta} onPress={onNext} />}
      progress={{ index, total, visible: step.showProgress !== false }}
      contentStyle={styles.content}
    >
      <Animated.View style={titleAnim}>
        <AccentText style={styles.headline}>
          {`here’s Day 1 in *${displayDestination(destination)}*, ${displayName(
            userName
          )}.`}
        </AccentText>
      </Animated.View>

      {sections.map((section, si) => (
        <View key={section.label} style={{ marginTop: ms(18) }}>
          <Typography
            variant="caption2"
            weight="heavy"
            color={onboardingTokens.accent}
            style={{ fontSize: f(10), letterSpacing: 1, textTransform: 'uppercase' }}
          >
            {section.label}
          </Typography>
          {section.activities.map((a, ai) => (
            <ActivityRow
              key={`${a.title}-${ai}`}
              delay={220 + (si * 2 + ai) * 130}
              emoji={a.emoji}
              title={a.title}
              note={a.note}
              meta={formatPreviewMeta(a)}
            />
          ))}
        </View>
      ))}

      <Typography
        variant="footnote"
        weight="semiBold"
        color={onboardingTokens.textPrimary}
        align="center"
        style={{ fontSize: f(12), marginTop: ms(18) }}
      >
        this is just Day 1. the full trip covers every day.
      </Typography>

      <View style={styles.disclaimer}>
        <Ionicons
          name="alert-circle-outline"
          size={ms(13)}
          color={onboardingTokens.warning}
        />
        <Typography
          variant="caption2"
          color={onboardingTokens.textTertiary}
          style={{ fontSize: f(10), flex: 1, lineHeight: f(15) }}
        >
          {DISCLAIMER}
        </Typography>
      </View>
    </OnboardingShell>
  );
}

function ActivityRow({
  delay,
  emoji,
  title,
  note,
  meta,
}: {
  delay: number;
  emoji: string;
  title: string;
  note: string;
  meta: string;
}) {
  const anim = useEntrance(delay);
  return (
    <Animated.View style={[anim, styles.card]}>
      <View style={styles.cardHead}>
        <Typography variant="footnote" style={{ fontSize: f(15) }}>
          {emoji}
        </Typography>
        <Typography
          variant="footnote"
          weight="bold"
          color={onboardingTokens.textPrimary}
          style={{ fontSize: f(14), flex: 1 }}
        >
          {title}
        </Typography>
      </View>
      <Typography
        variant="caption1"
        color={onboardingTokens.textSecondary}
        style={{ fontSize: f(11.5), marginTop: ms(3), lineHeight: f(16) }}
      >
        {note}
      </Typography>
      <Typography
        variant="caption2"
        weight="heavy"
        color={onboardingTokens.textTertiary}
        style={{ fontSize: f(10), marginTop: ms(5) }}
      >
        {meta}
      </Typography>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'flex-start',
  },
  headline: {
    fontSize: f(20),
    lineHeight: f(27),
    fontWeight: '800',
    color: onboardingTokens.textPrimary,
  },
  card: {
    backgroundColor: onboardingTokens.cardBg,
    borderColor: onboardingTokens.cardBorder,
    borderWidth: 1,
    borderRadius: ms(13),
    padding: ms(12),
    marginTop: ms(8),
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(7),
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: ms(6),
    marginTop: ms(12),
    paddingHorizontal: ms(4),
  },
});
