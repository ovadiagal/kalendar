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
    .from('work_preferences')
    .select('*')
    .eq('user_id', userId);
  const { data: breakPreferencesData, error: breakPreferencesError } = await supabase
    .from('break_preferences')
    .select('*')
    .eq('user_id', userId);

  if (workPreferencesError || breakPreferencesError) {
    throw new Error('Error fetching preferences');
  }

  const workPreferences = workPreferencesData[0];
  const breakPreferences = breakPreferencesData[0];

  return {
    userId,
    startTime: workPreferences.start_time ?? '09:00',
    endTime: workPreferences.end_time ?? '17:00',
    selectedDays: workPreferences.selected_days?.split(',') ?? ['M', 'T', 'W', 'Th', 'F'],
    selectedTimes: workPreferences.selected_times?.split(',') ?? [],
    breakTimeMinutes: breakPreferences.break_time_minutes
      ? parseInt(breakPreferences?.break_time_minutes, 10)
      : 15,
    offlineTimes: breakPreferences.offline_time_1?.split(',') ?? ['12:00', '13:00'],
    selectedActivities: breakPreferences.selected_activities?.split(',') ?? [
      'Short walks',
      'Meditation',
    ],
  };
}
