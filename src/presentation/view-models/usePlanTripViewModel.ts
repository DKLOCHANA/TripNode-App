import { useState, useCallback } from 'react';
import { Keyboard, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTripFormStore } from '@/store/tripFormStore';
import { useTripGenerationStore } from '@/store/tripGenerationStore';
import { useUIStore } from '@/store/uiStore';
import { useHaptic } from '@/hooks/useHaptic';
import { useSaveTrip } from '@/hooks/useSaveTrip';
import { useAuthStore } from '@/store/authStore';
import { createLocation } from '@/domain/value-objects/Location';
import { sanitizeDestination, sanitizeBudget } from '@/lib/sanitize';
import { addDays, formatLocalDate } from '@/lib/date';
import { INTERESTS, MAX_TRIP_DAYS, type InterestId } from '@/lib/constants';
import { checkNetworkAndAlert } from '@/lib/network';
import {
  generateAttractionSuggestions,
  generateItinerary,
  type TripGenerationRequest,
} from '@/data/sources/remote/api/openaiApi';
import { mapAttractionToDomain, mapItineraryToDomain } from '@/data/mappers/TripMapper';

type ActivePicker = 'start' | 'end' | null;

export interface PlaceResult {
  name: string;
  placeId: string;
  latitude: number;
  longitude: number;
  ianaTimezone?: string;
}

export function usePlanTripViewModel() {
  const router = useRouter();
  const store = useTripFormStore();
  const genStore = useTripGenerationStore();
  const uiStore = useUIStore();
  const haptic = useHaptic();
  const user = useAuthStore((s) => s.user);
  const saveTripMutation = useSaveTrip(user?.uid);

  const [activePicker, setActivePicker] = useState<ActivePicker>(null);
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [dateError, setDateError] = useState<string | null>(null);
  const [showAttractionSheet, setShowAttractionSheet] = useState(false);

  // Show start date picker
  const showStartDatePicker = useCallback(() => {
    Keyboard.dismiss();
    setTempDate(store.startDate || new Date());
    setActivePicker('start');
  }, [store.startDate]);

  // Show end date picker
  const showEndDatePicker = useCallback(() => {
    Keyboard.dismiss();
    if (!store.startDate) {
      Alert.alert('Select start date first', 'Please select a start date before selecting an end date.');
      return;
    }
    setTempDate(store.endDate || store.startDate);
    setActivePicker('end');
  }, [store.startDate, store.endDate]);

  // Handle spinner change (updates temp date only)
  const handleTempDateChange = useCallback(
    (_event: DateTimePickerEvent, selectedDate?: Date) => {
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    },
    []
  );

  // Dismiss without saving
  const dismissPicker = useCallback(() => {
    setActivePicker(null);
  }, []);

  // Confirm and save the selected date
  const confirmDate = useCallback(() => {
    if (activePicker === 'start') {
      store.setStartDate(tempDate);
      // Clear end date if now invalid (before start or more than 5 days total)
      if (store.endDate) {
        const maxEnd = addDays(tempDate, MAX_TRIP_DAYS - 1);
        if (store.endDate < tempDate || store.endDate > maxEnd) {
          store.setEndDate(null);
          setDateError('End date was reset. Max trip is 5 days.');
        }
      }
    } else if (activePicker === 'end') {
      store.setEndDate(tempDate);
      setDateError(null);
    }
    haptic.selection();
    setActivePicker(null);
  }, [activePicker, tempDate, store, haptic]);

  // Computed min/max dates for picker
  // End date can be at most 4 days after start (= 5 day trip total)
  const today = new Date();
  const pickerMinDate = activePicker === 'end' ? (store.startDate || today) : today;
  const pickerMaxDate = activePicker === 'end' && store.startDate 
    ? addDays(store.startDate, MAX_TRIP_DAYS - 1) 
    : undefined;

  const handlePlaceSelect = useCallback(
    (place: PlaceResult) => {
      const location = createLocation({
        placeId: place.placeId,
        name: sanitizeDestination(place.name),
        formattedAddress: place.name,
        latitude: place.latitude,
        longitude: place.longitude,
        ianaTimezone: place.ianaTimezone,
      });
      store.setDestination(location);
      setActivePicker(null);
      haptic.selection();
    },
    [store, haptic]
  );

  const handlePlaceClear = useCallback(() => {
    store.setDestination(null);
  }, [store]);

  const toggleInterest = useCallback(
    (interest: InterestId) => {
      store.toggleInterest(interest);
      haptic.selection();
    },
    [store, haptic]
  );

  const handleBudgetChange = useCallback(
    (text: string) => {
      // Only allow numbers and decimal point
      const cleaned = text.replace(/[^0-9.]/g, '');
      store.setBudget(cleaned);
    },
    [store]
  );

  const handleReset = useCallback(() => {
    store.reset();
    setActivePicker(null);
    setDateError(null);
    haptic.lightImpact();
  }, [store, haptic]);

  const validateForm = useCallback((): boolean => {
    if (!store.destination) {
      Alert.alert('Destination required', 'Please search and select a destination.');
      return false;
    }
    if (!store.startDate || !store.endDate) {
      Alert.alert('Dates required', 'Please select your start and end dates.');
      return false;
    }
    if (store.interests.size === 0) {
      Alert.alert('Interests required', 'Please select at least one interest.');
      return false;
    }
    return true;
  }, [store]);

  const handleGenerate = useCallback(async () => {
    setActivePicker(null);
    Keyboard.dismiss();

    // Check network connectivity first
    if (!(await checkNetworkAndAlert())) {
      haptic.error();
      return;
    }

    if (!validateForm()) {
      haptic.error();
      return;
    }

    haptic.impact();
    genStore.startGeneration();
    setShowAttractionSheet(true);

    try {
      const request: TripGenerationRequest = {
        destination: {
          name: store.destination!.name,
          placeId: store.destination!.placeId,
          latitude: store.destination!.coordinates.latitude,
          longitude: store.destination!.coordinates.longitude,
        },
        startDate: formatLocalDate(store.startDate!, 'yyyy-MM-dd'),
        endDate: formatLocalDate(store.endDate!, 'yyyy-MM-dd'),
        interests: Array.from(store.interests) as InterestId[],
        budgetUsd: sanitizeBudget(store.budget),
      };

      // Step 1: Get attraction suggestions from AI
      const suggestionsResponse = await generateAttractionSuggestions(request);
      
      const attractions = suggestionsResponse.attractions.map((dto, index) =>
        mapAttractionToDomain(dto, index)
      );

      genStore.setAttractionSuggestions(
        suggestionsResponse.destinationOverview,
        attractions
      );
      haptic.success();
    } catch (error) {
      console.error('AI generation error:', error);
      genStore.setError('Failed to generate attractions. Please try again.');
      haptic.error();
      Alert.alert('Error', 'Failed to generate trip suggestions. Please check your internet connection and try again.');
    }
  }, [store, validateForm, haptic, genStore]);

  // Handle attraction toggle
  const handleToggleAttraction = useCallback((id: string) => {
    genStore.toggleAttractionSelection(id);
    haptic.selection();
  }, [genStore, haptic]);

  // Handle select all attractions
  const handleSelectAllAttractions = useCallback(() => {
    genStore.selectAllAttractions();
    haptic.selection();
  }, [genStore, haptic]);

  // Handle clear all attractions
  const handleClearAllAttractions = useCallback(() => {
    genStore.clearAttractionSelection();
    haptic.lightImpact();
  }, [genStore, haptic]);

  // Handle confirm selection and build itinerary
  const handleConfirmAttractions = useCallback(async () => {
    // Check network connectivity first
    if (!(await checkNetworkAndAlert())) {
      haptic.error();
      return;
    }

    // Get selected attractions from store
    const selectedAttractions = genStore.suggestedAttractions.filter(
      (a) => genStore.selectedAttractionIds.has(a.id)
    );
    
    if (selectedAttractions.length === 0) {
      Alert.alert('Select attractions', 'Please select at least one attraction for your trip.');
      return;
    }

    haptic.impact();
    genStore.startBuildingItinerary();

    try {
      const request: TripGenerationRequest = {
        destination: {
          name: store.destination!.name,
          placeId: store.destination!.placeId,
          latitude: store.destination!.coordinates.latitude,
          longitude: store.destination!.coordinates.longitude,
        },
        startDate: formatLocalDate(store.startDate!, 'yyyy-MM-dd'),
        endDate: formatLocalDate(store.endDate!, 'yyyy-MM-dd'),
        interests: Array.from(store.interests) as InterestId[],
        budgetUsd: sanitizeBudget(store.budget),
      };

      // Convert selected attractions back to DTO format for API
      const attractionDtos = selectedAttractions.map((a) => ({
        name: a.name,
        description: a.description,
        category: a.category,
        address: a.address,
        latitude: a.coordinates.latitude,
        longitude: a.coordinates.longitude,
        estimatedDurationMinutes: a.estimatedDurationMinutes,
        estimatedCostUsd: a.estimatedCostUsd,
        bestTimeToVisit: 'morning' as const,
        rating: a.rating || 4.0,
      }));

      // Step 2: Generate itinerary from selected attractions
      const itineraryResponse = await generateItinerary(request, attractionDtos);

      const itinerary = mapItineraryToDomain(
        itineraryResponse,
        user?.uid || 'anonymous',
        store.destination!,
        store.startDate!.toISOString(),
        store.endDate!.toISOString(),
        Array.from(store.interests),
        sanitizeBudget(store.budget)
      );

      genStore.setGeneratedItinerary(itinerary);
      await saveTripMutation.mutateAsync(itinerary);
      haptic.success();

      // Close sheet and navigate to trip details
      setShowAttractionSheet(false);
      router.push(`/(app)/trips/${itinerary.id}`);
    } catch (error) {
      console.error('Itinerary generation error:', error);
      genStore.setError('Failed to create itinerary. Please try again.');
      haptic.error();
      Alert.alert('Error', 'Failed to create your itinerary. Please try again.');
    }
  }, [store, genStore, user, haptic, router]);

  // Close attraction sheet
  const handleCloseAttractionSheet = useCallback(() => {
    setShowAttractionSheet(false);
    genStore.reset();
  }, [genStore]);

  return {
    // State
    destination: store.destination,
    startDate: store.startDate,
    endDate: store.endDate,
    interests: store.interests,
    budget: store.budget,
    activePicker,
    tempDate,
    dateError,
    isLoading: uiStore.isGlobalLoadingVisible,

    // Attraction selection state
    showAttractionSheet,
    isGenerating: genStore.isGenerating,
    generationStep: genStore.generationStep,
    destinationOverview: genStore.destinationOverview,
    suggestedAttractions: genStore.suggestedAttractions,
    selectedAttractionIds: genStore.selectedAttractionIds,
    generationError: genStore.error,

    // Constants
    INTERESTS,
    MAX_TRIP_DAYS,

    // Computed
    pickerMinDate,
    pickerMaxDate,

    // Actions
    showStartDatePicker,
    showEndDatePicker,
    handleTempDateChange,
    dismissPicker,
    confirmDate,
    handlePlaceSelect,
    handlePlaceClear,
    toggleInterest,
    handleBudgetChange,
    handleReset,
    handleGenerate,

    // Attraction selection actions
    handleToggleAttraction,
    handleSelectAllAttractions,
    handleClearAllAttractions,
    handleConfirmAttractions,
    handleCloseAttractionSheet,
  };
}
