import { EventItem } from '@howljs/calendar-kit';

import { Database } from '~/database.types';
import { supabase } from '~/utils/supabase';

export const fetchStoredSchedule = async (
  userId: string
): Promise<
  Database['public']['Tables']['generated_schedules']['Row']['generated_schedule'] | undefined
> => {
  const { data, error } = await supabase
    .from('generated_schedules')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching stored schedule:', error);
  }

  if (data) {
    return data[0].generated_schedule;
  }
};

export const storeGeneratedSchedule = async (userId: string, generatedSchedule: EventItem[]) => {
  const { error } = await supabase.from('generated_schedules').insert({
    user_id: userId,
    generated_schedule: generatedSchedule,
  });

  if (error) {
    console.error('Error storing generated schedule:', error);
  }
};
