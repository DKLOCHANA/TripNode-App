import { create } from 'zustand';
import { AsyncStorageService } from '@/data/sources/local/asyncStorage';
import type { PreviewDay } from '@/data/sources/remote/api/onboardingPreviewApi';

/**
 * Onboarding state.
 *
 * Holds every answer captured across the 31-screen conversion flow. Answers live
 * in memory for the duration of the flow and drive the personalised reflection /
 * insight / snapshot screens (see `src/config/onboarding/personalization.ts`).
 *
 * Only two things are persisted to device storage:
 *   1. `completed`  — so the heavy flow is shown ONCE, then skipped on relaunch.
 *   2. `userName`   — so it can prefill the Register form for a seamless handoff.
 *
 * `userName` is cleared once an account is created (see useRegisterViewModel).
 */

const STORAGE_KEYS = {
  completed: 'tripnode_onboarding_completed',
  name: 'tripnode_onboarding_name',
} as const;

export type YesNo = 'yes' | 'no';

interface OnboardingAnswers {
  /** Screen 5 — name capture */
  userName: string;
  /** Screen 7 — "how do you usually plan a trip?" */
  planHabit: string | null;
  /** Screen 10 — "what matters most" (multi-select, max 3) */
  priorities: string[];
  /** Screen 11 — "what usually goes wrong" */
  tripProblem: string | null;
  /** Screen 13 — budget style */
  budgetStyle: string | null;
  /** Screen 14 — "come home feeling you missed the best parts?" */
  missedBest: YesNo | null;
  /** Screen 19 — destination typed for the preview */
  destination: string;
  /** Screen 27 — commitment level */
  commitment: string | null;
}

interface OnboardingState extends OnboardingAnswers {
  /** True once the persisted flag has been read from storage. */
  isHydrated: boolean;
  /** True if the user has already finished onboarding on a previous session. */
  completed: boolean;
  /** Screen 21 — AI-generated Day 1 for the typed destination (set on screen 20). */
  previewDay: PreviewDay | null;
  setPreviewDay: (day: PreviewDay | null) => void;

  setUserName: (name: string) => void;
  setPlanHabit: (value: string) => void;
  setPriorities: (values: string[]) => void;
  setTripProblem: (value: string) => void;
  setBudgetStyle: (value: string) => void;
  setMissedBest: (value: YesNo) => void;
  setDestination: (value: string) => void;
  setCommitment: (value: string) => void;

  /** Load persisted completion flag + saved name from storage. */
  hydrate: () => Promise<void>;
  /** Persist the completion flag + name (called when the flow finishes). */
  complete: () => Promise<void>;
  /** Clear the saved name after it has been consumed by registration. */
  clearSavedName: () => Promise<void>;
  /**
   * Wipe the persisted completion flag + saved name and reset in-memory state.
   * After this the gate routes back through the full onboarding flow — used
   * when an account is deleted so the next sign-up starts fresh.
   */
  resetCompletion: () => Promise<void>;
  /** Reset in-memory answers (does not touch the persisted completion flag). */
  reset: () => void;
}

const initialAnswers: OnboardingAnswers = {
  userName: '',
  planHabit: null,
  priorities: [],
  tripProblem: null,
  budgetStyle: null,
  missedBest: null,
  destination: '',
  commitment: null,
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  ...initialAnswers,
  isHydrated: false,
  completed: false,
  previewDay: null,

  setPreviewDay: (previewDay) => set({ previewDay }),

  setUserName: (userName) => set({ userName }),
  setPlanHabit: (planHabit) => set({ planHabit }),
  setPriorities: (priorities) => set({ priorities }),
  setTripProblem: (tripProblem) => set({ tripProblem }),
  setBudgetStyle: (budgetStyle) => set({ budgetStyle }),
  setMissedBest: (missedBest) => set({ missedBest }),
  setDestination: (destination) => set({ destination }),
  setCommitment: (commitment) => set({ commitment }),

  hydrate: async () => {
    try {
      const [completedFlag, savedName] = await Promise.all([
        AsyncStorageService.getItem(STORAGE_KEYS.completed),
        AsyncStorageService.getItem(STORAGE_KEYS.name),
      ]);
      set({
        completed: completedFlag === 'true',
        userName: savedName ?? '',
        isHydrated: true,
      });
    } catch {
      // Storage failure should never block the app — fall back to "not completed".
      set({ isHydrated: true });
    }
  },

  complete: async () => {
    set({ completed: true });
    const { userName } = get();
    try {
      await AsyncStorageService.setItem(STORAGE_KEYS.completed, 'true');
      if (userName.trim()) {
        await AsyncStorageService.setItem(STORAGE_KEYS.name, userName.trim());
      }
    } catch {
      // Non-fatal — worst case the flow shows again next launch.
    }
  },

  clearSavedName: async () => {
    try {
      await AsyncStorageService.removeItem(STORAGE_KEYS.name);
    } catch {
      // Non-fatal.
    }
  },

  resetCompletion: async () => {
    set({ ...initialAnswers, previewDay: null, completed: false, isHydrated: true });
    try {
      await Promise.all([
        AsyncStorageService.removeItem(STORAGE_KEYS.completed),
        AsyncStorageService.removeItem(STORAGE_KEYS.name),
      ]);
    } catch {
      // Non-fatal — in-memory state already reflects "not completed".
    }
  },

  reset: () => set({ ...initialAnswers, previewDay: null }),
}));

/** Read the saved onboarding name directly from storage (used to prefill Register). */
export async function getSavedOnboardingName(): Promise<string> {
  try {
    return (await AsyncStorageService.getItem(STORAGE_KEYS.name)) ?? '';
  } catch {
    return '';
  }
}

export async function clearSavedOnboardingName(): Promise<void> {
  try {
    await AsyncStorageService.removeItem(STORAGE_KEYS.name);
  } catch {
    // Non-fatal.
  }
}
