import { Preferences } from '../models/Preferences';
import { supabase } from '~/utils/supabase';

export async function fetchPreferences(userId: string): Promise<Preferences> {
  if (userId === 'TEST') {
    console.log('Using test preferences');
    return {
      userId: 'TEST',
      startTime: '09:00',
      endTime: '17:00',
      selectedDays: ['M', 'T', 'W', 'Th', 'F'],
      selectedTimes: ['6AM - 9AM'],
      breakTimeMinutes: 15,
      offlineTimes: ['12:00', '13:00'],
      selectedActivities: ['Short walk', 'Meditation', 'Work out'],
    };
  }

  const { data: workPreferencesData, error: workPreferencesError } = await supabase
    .from('work_preferences_updated')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1);

  const { data: breakPreferencesData, error: breakPreferencesError } = await supabase
    .from('break_preferences_updated')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1);

  if (workPreferencesError || breakPreferencesError) {
    throw new Error('Error fetching preferences');
  }

  const workPreferences = workPreferencesData?.[0];
  const breakPreferences = breakPreferencesData?.[0];

  if (!workPreferences || !breakPreferences) {
    throw new Error('No preferences found for user');
  }

  // Extract time information from the first day's preferences
  const firstDayPrefs = (workPreferences.days as any[])[0];
  const startTime = new Date(firstDayPrefs.workday_start_time);
  const endTime = new Date(firstDayPrefs.workday_end_time);

  // Collect productive time chunks from all days
  const selectedTimes = new Set<string>();
  (workPreferences.days as any[]).forEach(day => {
    day.productive_time_chunks?.forEach((chunk: string) => {
      selectedTimes.add(chunk);
    });
  });

  // Convert break time selection to minutes
  const breakTimeMap: { [key: string]: number } = {
    'Short (< 15 min)': 15,
    'Mid (15-30 min)': 30,
    'Long (30-60 min)': 45,
    'Dedicated (> 1 hr)': 60,
  };

  return {
    userId,
    startTime: `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`,
    endTime: `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`,
    selectedDays: workPreferences.days!.map((day: any) => day.day),
    selectedTimes: Array.from(selectedTimes),
    breakTimeMinutes: breakTimeMap[breakPreferences.break_time ?? 'Short (< 15 min)'] ?? 15,
    offlineTimes: [], // field is not present in new schema. leaving it empty for now
    selectedActivities: breakPreferences.selected_activities?.split(',') ?? ['Short walks', 'Meditation'],
  };
}