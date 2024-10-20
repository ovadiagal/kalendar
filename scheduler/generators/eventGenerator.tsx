import { fetchEvents } from '../services/eventService';
import { fetchPreferences } from '../services/preferenceService';
import { DateTime, Interval } from 'luxon';
import { isIntervalFree } from '../utils/schedulingUtils';
import { EventItem } from '@howljs/calendar-kit';
import { Preferences } from '../models/Preferences';

export async function generatePersonalEvents(userId: string): Promise<EventItem[]> {
  const events = await fetchEvents(userId);
  const prefs: Preferences = await fetchPreferences(userId);
  const tomorrowMorning = DateTime.now().plus({ days: 1 }).startOf('day').plus({ hours: 8 });
  const tomorrowMorningEnd = tomorrowMorning.plus({ hours: 4 });

  const preferredActivity = prefs.selectedActivities[0];

  const scheduled: EventItem[] = [];
  const interval = Interval.fromDateTimes(tomorrowMorning, tomorrowMorningEnd);
  if (isIntervalFree(interval, events)) {
    scheduled.push({
      id: `event-${Date.now()}`,
      title: preferredActivity,
      allDay: false,
      start: { dateTime: tomorrowMorning.toISO() },
      end: { dateTime: tomorrowMorningEnd.toISO() },
    });
  }

  return scheduled;
}
