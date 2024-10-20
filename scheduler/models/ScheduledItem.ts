import { EventItem } from '@howljs/calendar-kit';

export interface ScheduledItem extends EventItem {
  scheduled: boolean;
}
