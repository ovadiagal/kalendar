import { fetchEvents } from '../services/eventService';
import { fetchPreferences } from '../services/preferenceService';
import { DateTime } from 'luxon';
import { isIntervalFree, RandomNumberGenerator, splitTimeSlots } from '../utils/schedulingUtils';
import { EventItem } from '@howljs/calendar-kit';
import { Preferences } from '../models/Preferences';

export async function generatePersonalEvents(
  userId: string,
  externalEvents: EventItem[]
): Promise<EventItem[]> {
  const prefs: Preferences = await fetchPreferences(userId);
  console.log('Fetched preferences:', prefs);
  const recommendedEvents: EventItem[] = [];

  // Initialize event ID counter
  let eventIdCounter = 0;

  function generateEventId(): string {
    return 'event-' + eventIdCounter++;
  }

  // Initialize random number generator
  const rng = new RandomNumberGenerator(Math.floor(Math.random() * 100));

  // Set the date range for scheduling today until next week
  const today = new Date();
  const endDate = new Date();
  endDate.setDate(today.getDate() + 7);

  // Get all dates in the date range
  const dates: Date[] = [];
  let currentDate = new Date(today);
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Organize external events by date
  const externalEventsByDate: { [date: string]: EventItem[] } = {};
  for (const event of externalEvents) {
    if (!event.start.dateTime) {
      continue;
    }
    const eventDate = new Date(event.start.dateTime).toDateString();
    if (!externalEventsByDate[eventDate]) {
      externalEventsByDate[eventDate] = [];
    }
    externalEventsByDate[eventDate].push(event);
  }

  // For each day in the date range
  for (const date of dates) {
    const dayString = date.toDateString();

    // Map day numbers to day names
    const dayOfWeek = date.getDay(); // 0 (Sunday) to 6 (Saturday)
    const daysOfWeekMap: { [key: number]: string } = {
      0: 'Sun',
      1: 'M',
      2: 'T',
      3: 'W',
      4: 'Th',
      5: 'F',
      6: 'Sat',
    };
    const dayName = daysOfWeekMap[dayOfWeek];

    // Find the preferences for this day
    const dayPrefs = prefs.days.find(day => {
      return day.day === dayName;
    });

    if (dayPrefs) {
      const dayStart = new Date(date);
      const [startHour, startMinute] = parseTime(dayPrefs.start_time);
      dayStart.setHours(startHour, startMinute, 0, 0);

      const dayEnd = new Date(date);
      const [endHour, endMinute] = parseTime(dayPrefs.end_time);
      dayEnd.setHours(endHour, endMinute, 0, 0);

      // Initialize available slots with the full working day
      let availableSlots: { start: Date; end: Date }[] = [{ start: dayStart, end: dayEnd }];

      // Exclude existing external events
      if (externalEventsByDate[dayString]) {
        for (const event of externalEventsByDate[dayString]) {
          if (!event.start.dateTime || !event.end.dateTime) {
            continue;
          }
          const eventStart = new Date(event.start.dateTime);
          const eventEnd = new Date(event.end.dateTime);

          availableSlots = splitTimeSlots(availableSlots, eventStart, eventEnd);
        }
      }

      // Schedule work and activities in the available slots
      for (const slot of availableSlots) {
        const scheduledEvents = scheduleWorkAndActivities(slot, prefs, rng, generateEventId);
        recommendedEvents.push(...scheduledEvents);
      }
    }
  }

  return recommendedEvents;
}

function parseTime(timeString: string): [number, number] {
  const date = new Date(timeString);
  return [date.getHours(), date.getMinutes()];
}

function scheduleWorkAndActivities(
  slot: { start: Date; end: Date },
  prefs: Preferences,
  rng: RandomNumberGenerator,
  generateEventId: () => string
): EventItem[] {
  const scheduledEvents: EventItem[] = [];

  let currentTime = new Date(slot.start);

  while (currentTime < slot.end) {
    // Check if current time is within productive times
    const dayPrefs = prefs.days.find(day => day.day === getDayName(currentTime.getDay()));

    if (dayPrefs) {
      const isProductiveTime = dayPrefs.productive_times.some((timeRange) => {
        const [rangeStartStr, rangeEndStr] = timeRange.split('-');
        const [rangeStartHour, rangeStartMinute] = parseTime(rangeStartStr.trim());
        const [rangeEndHour, rangeEndMinute] = parseTime(rangeEndStr.trim());

        const rangeStart = new Date(currentTime);
        rangeStart.setHours(rangeStartHour, rangeStartMinute, 0, 0);
        const rangeEnd = new Date(currentTime);
        rangeEnd.setHours(rangeEndHour, rangeEndMinute, 0, 0);

        return currentTime >= rangeStart && currentTime < rangeEnd;
      });

      // Set event durations
      const workSessionDuration = 90; // minutes
      const activityDuration = 30; // minutes
      let eventDuration = isProductiveTime ? workSessionDuration : activityDuration;

      // Adjust event duration if it exceeds slot end
      let eventEnd = new Date(currentTime);
      eventEnd.setMinutes(eventEnd.getMinutes() + eventDuration);
      if (eventEnd > slot.end) {
        eventEnd = new Date(slot.end);
        eventDuration = (eventEnd.getTime() - currentTime.getTime()) / (1000 * 60);
      }

      if (eventDuration <= 0) {
        break; // No time left in slot
      }

      if (isProductiveTime) {
        // Schedule focus work
        const event: EventItem = {
          id: generateEventId(),
          title: 'Focus Work',
          start: { dateTime: currentTime.toISOString() },
          end: { dateTime: eventEnd.toISOString() },
          color: 'blue',
        };
        scheduledEvents.push(event);

        // Add break time
        currentTime = new Date(eventEnd);
        currentTime.setMinutes(currentTime.getMinutes() + prefs.breakTimeMinutes);
      } else {
        // Schedule an activity from selectedActivities
        if (prefs.selectedActivities.length > 0) {
          const activityIndex = Math.floor(rng.random() * prefs.selectedActivities.length);
          const activity = prefs.selectedActivities[activityIndex];

          const event: EventItem = {
            id: generateEventId(),
            title: activity,
            start: { dateTime: currentTime.toISOString() },
            end: { dateTime: eventEnd.toISOString() },
            color: 'green',
          };
          scheduledEvents.push(event);
        }

        // Move currentTime to eventEnd
        currentTime = new Date(eventEnd);
      }
    } else {
      // If no preferences for the day, move to the end of the slot
      break;
    }
  }

  return scheduledEvents;
}

function getDayName(dayIndex: number): string {
  const daysOfWeekMap: { [key: number]: string } = {
    0: 'Sun',
    1: 'M',
    2: 'T',
    3: 'W',
    4: 'Th',
    5: 'F',
    6: 'Sat',
  };
  return daysOfWeekMap[dayIndex];
}
