import { EventItem } from '@howljs/calendar-kit';
import { DateTime, Interval } from 'luxon';

export function isIntervalFree(interval: Interval, events: EventItem[]): boolean {
  return !events.some((event) => {
    const eventStart = DateTime.fromISO(event.start.dateTime || event.start.date || '');
    const eventEnd = DateTime.fromISO(event.end.dateTime ?? event.end.date ?? '');
    const eventInterval = Interval.fromDateTimes(eventStart, eventEnd);
    return interval.overlaps(eventInterval);
  });
}
