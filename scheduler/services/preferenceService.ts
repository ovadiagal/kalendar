import { Preferences } from '../models/Preferences';

export async function fetchPreferences(userId: string): Promise<Preferences> {
  // TODO(isabelleilyia): Supabase fetching here
  // Fetch work preferences from the database or API
  return {
    userId,
    startTime: '09:00',
    endTime: '17:00',
    selectedDays: ['M', 'T', 'W', 'Th', 'F'],
    selectedTimes: ['9AM - 12PM', '1PM - 5PM'],
    breakTimeMinutes: 15,
    offlineTimes: ['12:00', '13:00'],
    selectedActivities: ['Short walks', 'Meditation'],
  };
}
