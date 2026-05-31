/**
 * Onboarding-specific visual tokens.
 *
 * The flow keeps the app's existing dark gradient background. Text is white;
 * the serif-style emphasis from the mockups is rendered with a soft sky accent
 * so headlines feel premium on the dark gradient. Buttons keep the app's
 * Electric Blue (via the shared Button component).
 */
import { fontScale, moderateScale } from '@/lib/responsive';

export const onboardingTokens = {
  accent: '#4FC3F7', // sky — headline emphasis on the dark gradient
  accentSoft: 'rgba(79,195,247,0.16)',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.62)',
  textTertiary: 'rgba(255,255,255,0.40)',
  cardBg: 'rgba(255,255,255,0.06)',
  cardBorder: 'rgba(255,255,255,0.12)',
  cardBgSelected: 'rgba(79,195,247,0.16)',
  warning: '#FF9F0A',
  // Gradient overlay applied above the shared background gradient for depth.
  overlay: ['rgba(0,0,0,0.35)', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0.55)'] as const,
} as const;

export const f = fontScale;
export const ms = moderateScale;
