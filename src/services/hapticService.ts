import * as Haptics from 'expo-haptics';

/**
 * Haptic feedback service wrapper
 * Provides consistent haptic feedback across the app
 */
export const hapticService = {
  /**
   * Medium impact - for primary button presses, CTAs
   */
  impact: (): void => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },

  /**
   * Light impact - for subtle interactions
   */
  lightImpact: (): void => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },

  /**
   * Heavy impact - for significant actions
   */
  heavyImpact: (): void => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },

  /**
   * Success notification - for successful operations (trip generated, purchase complete)
   */
  success: (): void => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },

  /**
   * Error notification - for errors, destructive actions (delete confirmation)
   */
  error: (): void => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },

  /**
   * Warning notification - for warnings, alerts
   */
  warning: (): void => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  },

  /**
   * Selection - for selection changes (chip toggles, picker changes)
   */
  selection: (): void => {
    Haptics.selectionAsync();
  },
};

export default hapticService;
