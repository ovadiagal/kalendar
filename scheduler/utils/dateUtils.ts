import { DateTime } from 'luxon';

export function timeStringToDateTime(timeString: string, date: DateTime): DateTime {
  const [hour, minute] = timeString.split(':').map(Number);
  return date.set({ hour, minute, second: 0, millisecond: 0 });
}
