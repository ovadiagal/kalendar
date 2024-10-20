import { EventItem } from '@howljs/calendar-kit';

interface Preferences {
  userId: string;
  startTime: string; // ISO time string
  endTime: string; // ISO time string
  selectedDays: string[]; // e.g., ['M', 'T', 'W', 'Th', 'F']
  selectedTimes: string[]; // e.g., ['6AM - 9AM']
  breakTimeMinutes: number;
  offlineTimes: string[]; // ISO time strings
  selectedActivities: string[]; // e.g., ['Short walks']
}

async function fetchEvents(userId: string): Promise<EventItem[]> {
  // Fetch events from context? Or from supabase? Not sure what the right place is.
  // TODO(isabelleilyia): fetch data from supabase here
  return [];
}

async function fetchPreferences(userId: string): Promise<Preferences> {
  // Fetch  preferences from supabase
  // TODO(isabelleilyia): fetch data from supabase here
  return {
    userId,
    startTime: '09:00',
    endTime: '17:00',
    selectedDays: ['M', 'T', 'W', 'Th', 'F'],
    selectedTimes: ['9AM - 12PM', '1PM - 5PM'],
    breakTimeMinutes: 15,
    offlineTimes: ['12:00', '13:00'], // For lunch break, for example
    selectedActivities: ['Short walks', 'Meditation'],
  };
}
