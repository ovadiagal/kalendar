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

// Helper function to split time slots based on busy times
export function splitTimeSlots(
  slots: { start: Date; end: Date }[],
  busyStart: Date,
  busyEnd: Date
): { start: Date; end: Date }[] {
  const newSlots: { start: Date; end: Date }[] = [];
  for (const slot of slots) {
    // If the busy time is completely outside the slot, keep the slot as is
    if (busyEnd <= slot.start || busyStart >= slot.end) {
      newSlots.push(slot);
    } else {
      // If the busy time overlaps with the slot, split the slot
      if (busyStart > slot.start) {
        newSlots.push({ start: slot.start, end: busyStart });
      }
      if (busyEnd < slot.end) {
        newSlots.push({ start: busyEnd, end: slot.end });
      }
    }
  }
  return newSlots;
}

// Random number generator class based on seed
export class RandomNumberGenerator {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  random(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }
}
