import { ScheduledItem } from '~/app/(drawer)/Calendar';
import { generatePersonalEvents } from './generators/eventGenerator';
import { fetchEvents } from './services/eventService';
import { EventItem } from '@howljs/calendar-kit';
import { mockEvents } from './data/events';

export async function runScheduler(userId: string): Promise<EventItem[]> {
  if (userId === 'TEST') {
    console.info('Running scheduler in test mode');
    return mockEvents;
  }
  const externalEvents = await fetchEvents(userId); // external, hard coded events
  const personalEvents = await generatePersonalEvents(userId, externalEvents); // personal events we recommend
  // Process recommended events, e.g., save to database or return to client
  return [...externalEvents, ...personalEvents];
}
