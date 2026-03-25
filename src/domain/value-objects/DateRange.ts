import { differenceInCalendarDays } from 'date-fns';
import { MAX_TRIP_DAYS } from '@/lib/constants';

export interface DateRange {
  readonly startDateUtc: string; // ISO 8601 UTC string
  readonly endDateUtc: string;
  readonly durationDays: number;
}

export class DateRangeError extends Error {
  constructor(
    message: string,
    public field: 'startDate' | 'endDate'
  ) {
    super(message);
    this.name = 'DateRangeError';
  }
}

export function createDateRange(start: Date, end: Date): DateRange {
  const days = differenceInCalendarDays(end, start);

  if (days < 0) {
    throw new DateRangeError('End date must be after start date', 'endDate');
  }

  if (days > MAX_TRIP_DAYS - 1) {
    throw new DateRangeError(
      `Maximum trip duration is ${MAX_TRIP_DAYS} days`,
      'endDate'
    );
  }

  return {
    startDateUtc: start.toISOString(),
    endDateUtc: end.toISOString(),
    durationDays: days + 1,
  };
}
