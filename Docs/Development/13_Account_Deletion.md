# 13 — Account Deletion & Data Cascade

← [12_Privacy_Manifest](./12_Privacy_Manifest.md) | Next → [14_Subscription](./14_Subscription.md)

---

## Why This Is Mandatory

Apple requires that any app with account creation **must** provide in-app account deletion. Apps without it will be rejected from the App Store. This is not optional.

---

## What Must Be Deleted

| Layer | Action | File |
|---|---|---|
| Firestore — all trips | Delete all trip documents for the user | `TripRepository.deleteAllForUser()` |
| Firestore — user profile | Delete `users/{uid}` document | `UserRepository.deleteProfile()` |
| Firebase Auth | `deleteUser(currentUser)` — removes login credentials | `AuthRepository.deleteAccount()` |
| SecureStore | Clear JWT + refresh token | `SecureStoreService.clearToken()` |
| Zustand | Clear `authStore` user state | `authStore.clearUser()` |
| RevenueCat | `Purchases.logOut()` — disassociate entitlements | `revenueCatService.logOut()` |
| TanStack Query | `queryClient.clear()` — wipe all cached data | root layout / view-model |

**Order is critical.** Firestore writes must happen while the user is still authenticated. Firebase Auth deletion must be last.

---

## `DeleteAccountUseCase` (`src/domain/use-cases/account/DeleteAccountUseCase.ts`)

```typescript
export class DeleteAccountUseCase {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly tripRepository: ITripRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string): Promise<void> {
    // 1. Delete all trips first (requires authentication)
    await this.tripRepository.deleteAllForUser(userId);

    // 2. Delete user profile document
    await this.userRepository.deleteProfile(userId);

    // 3. Delete Firebase Auth account — MUST be last
    //    After this, the user loses write access to Firestore
    await this.authRepository.deleteAccount();

    // Steps 4–7 are handled in useProfileViewModel after this resolves:
    // authStore.clearUser()
    // SecureStoreService.clearToken()
    // SecureStoreService.clearRefreshToken()
    // Purchases.logOut()
    // queryClient.clear()
    // router.replace('/(auth)/welcome')
  }
}
```

---

## Firestore Batch Delete (`src/data/repositories/TripRepository.ts`)

Deleting a parent document in Firestore does **not** delete subcollections. Must iterate and delete explicitly.

```typescript
async deleteAllForUser(userId: string): Promise<void> {
  const tripsRef = collection(db, 'trips', userId, 'items');
  const snapshot = await getDocs(tripsRef);

  // Batch delete all trip documents (max 500 per batch — safe for MVP)
  const batch = writeBatch(db);
  snapshot.docs.forEach(docSnap => batch.delete(docSnap.ref));
  await batch.commit();

  // Delete the parent trips/{userId} container document
  await deleteDoc(doc(db, 'trips', userId));
}
```

---

## Re-Authentication Requirement

Firebase requires a **recent sign-in** before `deleteUser()` succeeds. If the token is stale (user hasn't signed in for a while), Firebase throws `auth/requires-recent-login`.

Handle this explicitly in `useProfileViewModel`:

```typescript
async function handleDeleteAccount() {
  try {
    await deleteAccountUseCase.execute(user.id);

    // Post-deletion cleanup
    authStore.clearUser();
    await SecureStoreService.clearToken();
    await SecureStoreService.clearRefreshToken();
    await Purchases.logOut();
    queryClient.clear();
    router.replace('/(auth)/welcome');

  } catch (error: any) {
    if (error.code === 'auth/requires-recent-login') {
      // Show re-authentication sheet
      setShowReAuthSheet(true);
      return;
    }
    setError(normalizeToDomainError(error));
  }
}
```

### Re-Auth Sheet Behaviour

When `showReAuthSheet` is true, show a bottom sheet that prompts the user to re-enter their password (or re-authenticate with Apple/Google). On successful re-auth, automatically retry `handleDeleteAccount()`.

---

## UI Flow in ProfileScreen

```
SettingsRow "Delete Account"
  ↓ tap
DeleteConfirmSheet (step 1: "Are you sure?")
  ↓ confirm
DeleteConfirmSheet (step 2: Input "Type DELETE to confirm")
  ↓ user types "DELETE" exactly
  [If Firebase token stale:]
    Re-auth sheet → user re-enters credentials
  ↓ authenticated
LoadingOverlay ("Deleting your account...")
  ↓ success
router.replace('/(auth)/welcome')
  ↓ error
ErrorBanner with support contact link
```

---

## App Store Review Note

Include in App Store Connect review notes:
> "To delete your account: open the app → Profile tab → scroll to bottom → tap 'Delete Account' → confirm deletion."

This helps the App Store reviewer locate the feature quickly.
