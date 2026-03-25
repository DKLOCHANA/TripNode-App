# 14 — Subscription & RevenueCat

← [13_Account_Deletion](./13_Account_Deletion.md) | Next → [15_SDLC_Phases](./15_SDLC_Phases.md)

---

## Plans

| Plan | Price | Identifier |
|---|---|---|
| Annual | $49.99 / year (~$4.17/mo) | `$rc_annual` |
| Monthly | $5.99 / month | `$rc_monthly` |
| Free tier | — | — |

The Annual plan displays a **"BEST VALUE"** badge in the paywall.

---

## Constants (`src/lib/constants.ts`)

Never use raw strings for entitlement or package IDs across files.

```typescript
export const REVENUECAT = {
  ENTITLEMENT_PRO:  'pro',
  PACKAGE_ANNUAL:   '$rc_annual',
  PACKAGE_MONTHLY:  '$rc_monthly',
} as const;
```

---

## Domain Interface (`src/domain/repositories/ISubscriptionRepository.ts`)

The domain layer defines the contract. The data layer implements it via RevenueCat.

```typescript
export interface ISubscriptionRepository {
  /**
   * Check if the current user has an active Pro entitlement.
   */
  getSubscriptionStatus(userId: string): Promise<SubscriptionStatus>;

  /**
   * Trigger the App Store purchase flow for the given package.
   * Resolves with updated status on success.
   * Rejects with DomainError on cancellation or failure.
   */
  purchasePackage(packageIdentifier: string): Promise<SubscriptionStatus>;

  /**
   * Restore previous purchases — required by App Store guidelines.
   */
  restorePurchases(): Promise<SubscriptionStatus>;
}

export interface SubscriptionStatus {
  isActive: boolean;
  tier: 'free' | 'pro';
  expiresAt: string | null;       // UTC ISO string, null for free tier
  renewsAutomatically: boolean;
}
```

---

## Data Implementation (`src/data/repositories/SubscriptionRepository.ts`)

```typescript
import Purchases from 'react-native-purchases';
import { REVENUECAT } from '@/lib/constants';
import {
  ISubscriptionRepository,
  SubscriptionStatus,
} from '@/domain/repositories/ISubscriptionRepository';

export class SubscriptionRepository implements ISubscriptionRepository {

  async getSubscriptionStatus(_userId: string): Promise<SubscriptionStatus> {
    const info = await Purchases.getCustomerInfo();
    const entitlement = info.entitlements.active[REVENUECAT.ENTITLEMENT_PRO];

    return {
      isActive:            !!entitlement,
      tier:                entitlement ? 'pro' : 'free',
      expiresAt:           entitlement?.expirationDate ?? null,
      renewsAutomatically: entitlement?.willRenew ?? false,
    };
  }

  async purchasePackage(packageIdentifier: string): Promise<SubscriptionStatus> {
    const offerings = await Purchases.getOfferings();
    const pkg = offerings.current?.availablePackages.find(
      p => p.identifier === packageIdentifier
    );

    if (!pkg) {
      throw { type: 'NotFoundError', message: 'Package not found', resourceId: packageIdentifier };
    }

    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const entitlement = customerInfo.entitlements.active[REVENUECAT.ENTITLEMENT_PRO];

    return {
      isActive:            !!entitlement,
      tier:                entitlement ? 'pro' : 'free',
      expiresAt:           entitlement?.expirationDate ?? null,
      renewsAutomatically: entitlement?.willRenew ?? false,
    };
  }

  async restorePurchases(): Promise<SubscriptionStatus> {
    const info = await Purchases.restorePurchases();
    const entitlement = info.entitlements.active[REVENUECAT.ENTITLEMENT_PRO];

    return {
      isActive:            !!entitlement,
      tier:                entitlement ? 'pro' : 'free',
      expiresAt:           entitlement?.expirationDate ?? null,
      renewsAutomatically: entitlement?.willRenew ?? false,
    };
  }
}
```

---

## RevenueCat Initialization (`app/_layout.tsx`)

Initialize once at the app root — before any screen renders.

```typescript
import Purchases from 'react-native-purchases';

useEffect(() => {
  Purchases.configure({
    apiKey: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY!,
  });
}, []);
```

Identify the user to RevenueCat after login so their purchases are linked to their account:

```typescript
// In AuthRepository, after successful sign-in:
await Purchases.logIn(user.id);
```

---

## TanStack Query Integration

```typescript
// src/hooks/useSubscriptionStatus.ts
export function useSubscriptionStatus() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.subscription.status(user!.id),
    queryFn: () => subscriptionRepository.getSubscriptionStatus(user!.id),
    staleTime: 60 * 1000,   // 1 minute
    enabled: !!user,
  });
}
```

### After Successful Purchase — Invalidate Cache

```typescript
// In usePaywallViewModel, inside useMutation onSuccess:
onSuccess: () => {
  queryClient.invalidateQueries({
    queryKey: queryKeys.subscription.status(user!.id),
  });
  router.back();  // dismiss paywall modal
  haptic.success();
},
```

---

## Sandbox Testing Checklist

Before Phase 6 launch, test all RevenueCat flows in sandbox:

- [ ] Annual purchase flow completes, `isActive` becomes `true`
- [ ] Monthly purchase flow completes, `isActive` becomes `true`
- [ ] Pro badge appears on Profile screen after purchase
- [ ] "Restore Purchases" re-activates a previously purchased subscription
- [ ] Subscription expiry → `isActive` returns to `false`
- [ ] `Purchases.logOut()` is called on account deletion
- [ ] User is re-identified (`Purchases.logIn(userId)`) after sign-in on a new device

---

## RevenueCat Dashboard Setup

Before Phase 4 begins:
1. Create app in RevenueCat dashboard
2. Create entitlement: `pro`
3. Create two products in App Store Connect: annual + monthly
4. Link products to RevenueCat offerings
5. Set `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` in `.env`
