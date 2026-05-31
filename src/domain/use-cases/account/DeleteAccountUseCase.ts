/**
 * DeleteAccountUseCase
 *
 * Permanently deletes a user's account and ALL associated data.
 *
 * Order is critical (see Docs/Development/13_Account_Deletion.md):
 *   1. Firestore trips      — must happen while still authenticated
 *   2. Firestore user doc   — same
 *   3. Firebase Auth user   — MUST be last (afterwards Firestore writes are denied)
 *
 * Pure domain: depends only on narrow ports, never on Firebase/data directly.
 */
export interface AccountDeletionPorts {
  /** Delete every trip (Firestore + local cache) for the user. */
  deleteAllTripsForUser(userId: string): Promise<void>;
  /** Delete the users/{uid} profile document. */
  deleteUserProfile(userId: string): Promise<void>;
  /** Delete the Firebase Auth credential (throws on stale session). */
  deleteAuthAccount(): Promise<void>;
}

export class DeleteAccountUseCase {
  constructor(private readonly ports: AccountDeletionPorts) {}

  async execute(userId: string): Promise<void> {
    // 1. Trips first — needs an authenticated session.
    await this.ports.deleteAllTripsForUser(userId);

    // 2. Profile document — best-effort: a missing/already-gone profile
    //    must not block credential deletion.
    try {
      await this.ports.deleteUserProfile(userId);
    } catch {
      // Swallow — profile may not exist; the auth account is what matters.
    }

    // 3. Auth credential LAST. If this throws (e.g. requires-recent-login)
    //    it propagates so the caller can prompt re-authentication.
    await this.ports.deleteAuthAccount();
  }
}
