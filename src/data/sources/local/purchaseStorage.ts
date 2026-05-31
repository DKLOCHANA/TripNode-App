import { AsyncStorageService } from './asyncStorage';

/**
 * Tracks the first time the user obtained the Pro entitlement on this device
 * (purchase OR successful restore). The renewal-reminder scheduler uses the
 * authoritative expiration date from RevenueCat, so this timestamp is for
 * analytics and surfacing in UI ("Premium since ..."), not for scheduling.
 */

const FIRST_PURCHASE_KEY = 'tripnode_first_purchase_at';

export async function recordFirstPurchase(when: Date = new Date()): Promise<void> {
  try {
    const existing = await AsyncStorageService.getItem(FIRST_PURCHASE_KEY);
    if (existing) return; // first-purchase semantics — never overwrite
    await AsyncStorageService.setItem(FIRST_PURCHASE_KEY, when.toISOString());
  } catch {
    // Non-fatal — the renewal reminder still schedules off RC's expiration date.
  }
}

export async function getFirstPurchaseDate(): Promise<Date | null> {
  try {
    const raw = await AsyncStorageService.getItem(FIRST_PURCHASE_KEY);
    if (!raw) return null;
    const date = new Date(raw);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

export async function clearFirstPurchase(): Promise<void> {
  try {
    await AsyncStorageService.removeItem(FIRST_PURCHASE_KEY);
  } catch {
    // Non-fatal.
  }
}
