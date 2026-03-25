/**
 * Analytics service wrapper for tracking user events
 * Replace with your analytics provider (Firebase Analytics, Mixpanel, etc.)
 */

type EventParams = Record<string, string | number | boolean | undefined>;

/**
 * Analytics event names
 */
export const AnalyticsEvents = {
  // Auth events
  AUTH_LOGIN: 'auth_login',
  AUTH_REGISTER: 'auth_register',
  AUTH_LOGOUT: 'auth_logout',
  AUTH_METHOD_USED: 'auth_method_used',
  ACCOUNT_DELETED: 'account_deleted',

  // Trip events
  TRIP_GENERATED: 'trip_generated',
  TRIP_VIEWED: 'trip_viewed',
  TRIP_DELETED: 'trip_deleted',

  // Subscription events
  PAYWALL_VIEWED: 'paywall_viewed',
  SUBSCRIPTION_PURCHASED: 'subscription_purchased',
  SUBSCRIPTION_RESTORED: 'subscription_restored',

  // Navigation events
  SCREEN_VIEW: 'screen_view',
} as const;

export type AnalyticsEvent = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];

/**
 * Analytics service for tracking user events
 */
export const analyticsService = {
  /**
   * Initialize analytics SDK
   */
  initialize: async (): Promise<void> => {
    // TODO: Initialize your analytics provider
    // Example: await Analytics.initialize(API_KEY);
    if (__DEV__) {
      console.log('[Analytics] Initialized');
    }
  },

  /**
   * Identify user for analytics tracking
   */
  identify: async (userId: string, traits?: EventParams): Promise<void> => {
    // TODO: Identify user with your analytics provider
    // Example: await Analytics.identify(userId, traits);
    if (__DEV__) {
      console.log('[Analytics] Identify:', userId, traits);
    }
  },

  /**
   * Reset user identity (on logout)
   */
  reset: async (): Promise<void> => {
    // TODO: Reset analytics identity
    // Example: await Analytics.reset();
    if (__DEV__) {
      console.log('[Analytics] Reset');
    }
  },

  /**
   * Track an analytics event
   */
  track: async (event: AnalyticsEvent | string, params?: EventParams): Promise<void> => {
    // TODO: Track event with your analytics provider
    // Example: await Analytics.track(event, params);
    if (__DEV__) {
      console.log('[Analytics] Track:', event, params);
    }
  },

  /**
   * Track screen view
   */
  trackScreen: async (screenName: string, params?: EventParams): Promise<void> => {
    await analyticsService.track(AnalyticsEvents.SCREEN_VIEW, {
      screen_name: screenName,
      ...params,
    });
  },

  /**
   * Set user property
   */
  setUserProperty: async (name: string, value: string): Promise<void> => {
    // TODO: Set user property with your analytics provider
    // Example: await Analytics.setUserProperty(name, value);
    if (__DEV__) {
      console.log('[Analytics] Set Property:', name, value);
    }
  },
};

export default analyticsService;
