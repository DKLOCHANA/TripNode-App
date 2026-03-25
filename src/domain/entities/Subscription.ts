export interface Subscription {
  isActive: boolean;
  tier: 'free' | 'pro';
  expiresAt: string | null;
  renewsAutomatically: boolean;
  productIdentifier?: string | null;
  isExpired?: boolean;
}
