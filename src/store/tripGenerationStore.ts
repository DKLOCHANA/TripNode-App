import { create } from 'zustand';
import type { Attraction } from '@/domain/entities/Attraction';
import type { Itinerary } from '@/domain/entities/Itinerary';

interface TripGenerationState {
  // Generation state
  isGenerating: boolean;
  generationStep: 'idle' | 'fetching_attractions' | 'selecting' | 'building_itinerary' | 'complete';
  error: string | null;

  // Attraction suggestions
  destinationOverview: string | null;
  suggestedAttractions: Attraction[];
  selectedAttractionIds: Set<string>;

  // Generated itinerary
  generatedItinerary: Itinerary | null;

  // Actions
  startGeneration: () => void;
  setAttractionSuggestions: (overview: string, attractions: Attraction[]) => void;
  toggleAttractionSelection: (id: string) => void;
  selectAllAttractions: () => void;
  clearAttractionSelection: () => void;
  startBuildingItinerary: () => void;
  setGeneratedItinerary: (itinerary: Itinerary) => void;
  setError: (error: string) => void;
  reset: () => void;
}

export const useTripGenerationStore = create<TripGenerationState>((set, get) => ({
  // Initial state
  isGenerating: false,
  generationStep: 'idle',
  error: null,
  destinationOverview: null,
  suggestedAttractions: [],
  selectedAttractionIds: new Set(),
  generatedItinerary: null,

  // Actions
  startGeneration: () =>
    set({
      isGenerating: true,
      generationStep: 'fetching_attractions',
      error: null,
      suggestedAttractions: [],
      selectedAttractionIds: new Set(),
      generatedItinerary: null,
    }),

  setAttractionSuggestions: (overview, attractions) =>
    set({
      isGenerating: false,
      generationStep: 'selecting',
      destinationOverview: overview,
      suggestedAttractions: attractions,
      // Pre-select all attractions by default
      selectedAttractionIds: new Set(attractions.map((a) => a.id)),
    }),

  toggleAttractionSelection: (id) =>
    set((state) => {
      const newSelected = new Set(state.selectedAttractionIds);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return { selectedAttractionIds: newSelected };
    }),

  selectAllAttractions: () =>
    set((state) => ({
      selectedAttractionIds: new Set(state.suggestedAttractions.map((a) => a.id)),
    })),

  clearAttractionSelection: () =>
    set({ selectedAttractionIds: new Set() }),

  startBuildingItinerary: () =>
    set({
      isGenerating: true,
      generationStep: 'building_itinerary',
    }),

  setGeneratedItinerary: (itinerary) =>
    set({
      isGenerating: false,
      generationStep: 'complete',
      generatedItinerary: itinerary,
    }),

  setError: (error) =>
    set({
      isGenerating: false,
      error,
    }),

  reset: () =>
    set({
      isGenerating: false,
      generationStep: 'idle',
      error: null,
      destinationOverview: null,
      suggestedAttractions: [],
      selectedAttractionIds: new Set(),
      generatedItinerary: null,
    }),
}));

// Selectors
export const selectSelectedAttractions = (state: TripGenerationState) =>
  state.suggestedAttractions.filter((a) => state.selectedAttractionIds.has(a.id));

export const selectSelectionCount = (state: TripGenerationState) =>
  state.selectedAttractionIds.size;
