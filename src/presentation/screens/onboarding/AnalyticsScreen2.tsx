import { AnalyticsScreen } from './AnalyticsScreen';
import { ONBOARDING_ANALYTICS } from '@/config';

const config = ONBOARDING_ANALYTICS.analytics2;

export function AnalyticsScreen2() {
  return (
    <AnalyticsScreen
      title={config.title}
      subtitles={config.subtitles}
      defaultSubtitle={config.defaultSubtitle}
      supportingText={config.supportingText}
      chartType={config.chartType}
      chartProps={config.chartProps}
      nextRoute={config.nextRoute}
      storeKey={config.storeKey}
    />
  );
}
