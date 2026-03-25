import { create } from 'zustand';

interface UIState {
  isGlobalLoadingVisible: boolean;
  globalLoadingMessage: string;

  // Actions
  showLoading: (message?: string) => void;
  hideLoading: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isGlobalLoadingVisible: false,
  globalLoadingMessage: '',

  showLoading: (message = 'Loading...') =>
    set({
      isGlobalLoadingVisible: true,
      globalLoadingMessage: message,
    }),

  hideLoading: () =>
    set({
      isGlobalLoadingVisible: false,
      globalLoadingMessage: '',
    }),
}));
