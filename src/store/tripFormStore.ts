import { create } from 'zustand';
import type { Location } from '@/domain/value-objects/Location';
import type { InterestId } from '@/lib/constants';

interface TripFormState {
  destination: Location | null;
  startDate: Date | null;
  endDate: Date | null;
  interests: Set<InterestId>;
  budget: string;

  // Actions
  setDestination: (location: Location | null) => void;
  setStartDate: (date: Date | null) => void;
  setEndDate: (date: Date | null) => void;
  toggleInterest: (interest: InterestId) => void;
  setBudget: (amount: string) => void;
  reset: () => void;
}

const initialState = {
  destination: null,
  startDate: null,
  endDate: null,
  interests: new Set<InterestId>(),
  budget: '',
};

export const useTripFormStore = create<TripFormState>((set) => ({
  ...initialState,

  setDestination: (location) => set({ destination: location }),

  setStartDate: (date) =>
    set((state) => {
      // If end date is before new start date, clear it
      if (state.endDate && date && state.endDate < date) {
        return { startDate: date, endDate: null };
      }
      return { startDate: date };
    }),

  setEndDate: (date) => set({ endDate: date }),

  toggleInterest: (interest) =>
    set((state) => {
      const newInterests = new Set(state.interests);
      if (newInterests.has(interest)) {
        newInterests.delete(interest);
      } else {
        newInterests.add(interest);
      }
      return { interests: newInterests };
    }),

  setBudget: (amount) => set({ budget: amount }),

  reset: () => set(initialState),
}));
