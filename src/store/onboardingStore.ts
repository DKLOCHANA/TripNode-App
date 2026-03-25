import { create } from 'zustand';

export type Answer1 =
  | 'Planning takes too long'
  | 'I miss important places'
  | 'Hard to manage daily schedule'
  | 'Too many decisions to make';

export type Answer2 =
  | 'Poor route planning'
  | 'Waiting in wrong locations'
  | 'Visiting crowded places'
  | 'Switching between travel apps';

export type Answer3 =
  | 'Estimating total trip cost'
  | 'Overspending unexpectedly'
  | 'Choosing affordable activities'
  | 'Balancing comfort vs price';

interface OnboardingState {
  selectedAnswer1: Answer1 | null;
  selectedAnswer2: Answer2 | null;
  selectedAnswer3: Answer3 | null;
  setAnswer1: (answer: Answer1) => void;
  setAnswer2: (answer: Answer2) => void;
  setAnswer3: (answer: Answer3) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  selectedAnswer1: null,
  selectedAnswer2: null,
  selectedAnswer3: null,
  setAnswer1: (answer) => set({ selectedAnswer1: answer }),
  setAnswer2: (answer) => set({ selectedAnswer2: answer }),
  setAnswer3: (answer) => set({ selectedAnswer3: answer }),
  reset: () => set({ selectedAnswer1: null, selectedAnswer2: null, selectedAnswer3: null }),
}));
