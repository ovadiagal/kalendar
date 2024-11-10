import { Preferences } from '../models/Preferences';
import { supabase } from '~/utils/supabase';

export async function fetchPreferences(userId: string): Promise<Preferences> {
  if (userId === 'TEST') {
    console.log('Using test preferences');
    return {
      userId: 'TEST',
      days: [
        {
          day: 'Mon',
          start_time: '9AM',
          end_time: '5PM',
          productive_times: ['9AM - 12PM', '2PM - 4PM'],
        },
        {
          day: 'Tue',
          start_time: '9AM',
          end_time: '5PM',
          productive_times: ['9AM - 12PM', '1PM - 4PM'],
        },
      ],
      breakTimeMinutes: 15,
      numberOfBreaks: 4,
      selectedActivities: ['Short walk', 'Meditation', 'Work out'],
      preferenceModifications: {},
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

  const { data: freeformPreferencesData, error: freeformPreferencesError } = await supabase
    .from('freeform_preferences')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1);

  if (workPreferencesError || breakPreferencesError || freeformPreferencesError) {
    throw new Error('Error fetching preferences');
  }

  const workPreferences = workPreferencesData[0];
  const breakPreferences = breakPreferencesData[0];
  const freeformPreferences = freeformPreferencesData[0];

  let parsedPreferenceModifications = {};
  if (freeformPreferences?.preference_modifications) {
    try {
      parsedPreferenceModifications = JSON.parse(freeformPreferences.preference_modifications);
    } catch (e) {
      console.error('Error parsing preference modifications:', e);
    }
  }

  let daysData: {
    day: string;
    start_time: string;
    end_time: string;
    productive_times: string[];
  }[] = [];

  if (Array.isArray(workPreferences?.days)) {
    daysData = workPreferences.days.map((day: any) => {
      return {
        day: day.day || 'Mon',
        start_time: day.workday_start_time,
        end_time: day.workday_end_time,
        productive_times: day.productive_time_chunks || [],
      };
    });
  } else {
    daysData = [
      {
        day: 'Mon',
        start_time: '9AM',
        end_time: '5PM',
        productive_times: ['9AM - 12PM', '2PM - 4PM'],
      },
      {
        day: 'Tue',
        start_time: '9AM',
        end_time: '5PM',
        productive_times: ['9AM - 12PM', '1PM - 4PM'],
      },
    ];
  }

  const breakTimeMap: { [key: string]: number } = {
    'Short (< 15 min)': 15,
    'Mid (15-30 min)': 30,
    'Long (30-60 min)': 45,
    'Dedicated (> 1 hr)': 60,
  };

  return {
    userId,
    days: daysData,
    breakTimeMinutes: breakTimeMap[breakPreferences?.break_time ?? 'Short (< 15 min)'] ?? 15,
    numberOfBreaks: breakPreferences?.number_of_breaks
      ? parseInt(breakPreferences.number_of_breaks, 10)
      : 4,
    selectedActivities: breakPreferences?.selected_activities?.split(',') ?? [
      'Short walk',
      'Meditation',
    ],
    preferenceModifications: parsedPreferenceModifications ?? {},
  };
}
