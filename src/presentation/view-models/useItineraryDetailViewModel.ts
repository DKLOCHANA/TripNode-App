import { useState, useMemo, useCallback } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTrip } from '@/hooks/useTrip';
import { useTripGenerationStore } from '@/store/tripGenerationStore';
import { useAuthStore } from '@/store/authStore';
import { getDayTimeline, type ItineraryDay } from '@/domain/entities/Itinerary';
import type { TimelineItem } from '@/domain/entities/Activity';

export function useItineraryDetailViewModel() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const userId = useAuthStore((s) => s.user?.uid);
  const generatedItinerary = useTripGenerationStore((s) => s.generatedItinerary);
  const { data: storedItinerary } = useTrip(userId, params.id);

  const itinerary = useMemo(() => {
    if (params.id && generatedItinerary?.id === params.id) {
      return generatedItinerary;
    }

    return storedItinerary ?? generatedItinerary;
  }, [generatedItinerary, storedItinerary, params.id]);

  const [selectedDayNumber, setSelectedDayNumber] = useState(1);

  // Day tabs data
  const dayTabs = useMemo(() => {
    if (!itinerary) return [];
    return itinerary.days.map((day) => ({
      dayNumber: day.dayNumber,
      date: day.date,
    }));
  }, [itinerary]);

  // Selected day's timeline items (activities + free time)
  const timelineItems = useMemo((): TimelineItem[] => {
    if (!itinerary) return [];
    const selectedDay = itinerary.days.find((d) => d.dayNumber === selectedDayNumber);
    if (!selectedDay) return [];
    return getDayTimeline(selectedDay);
  }, [itinerary, selectedDayNumber]);

  // Selected day data
  const selectedDay = useMemo((): ItineraryDay | null => {
    if (!itinerary) return null;
    return itinerary.days.find((d) => d.dayNumber === selectedDayNumber) || null;
  }, [itinerary, selectedDayNumber]);

  // Header info
  const headerInfo = useMemo(() => {
    if (!itinerary) {
      return {
        title: 'Trip Details',
        destination: '',
        dateRange: '',
      };
    }

    const startDate = new Date(itinerary.startDateUtc);
    const endDate = new Date(itinerary.endDateUtc);
    const formatOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };

    return {
      title: `Trip to ${itinerary.destination.name}`,
      destination: itinerary.destination.name,
      dateRange: `${startDate.toLocaleDateString('en-US', formatOptions)} - ${endDate.toLocaleDateString('en-US', formatOptions)}`,
    };
  }, [itinerary]);

  const handleSelectDay = useCallback((dayNumber: number) => {
    setSelectedDayNumber(dayNumber);
  }, []);

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  return {
    // Data
    itinerary,
    dayTabs,
    selectedDayNumber,
    selectedDay,
    timelineItems,
    headerInfo,
    ianaTimezone: itinerary?.destination.ianaTimezone,

    // Actions
    handleSelectDay,
    handleGoBack,
  };
}
