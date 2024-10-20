import { generatePersonalEvents } from './generators/eventGenerator';
import { EventItem } from '@howljs/calendar-kit';
import { mockEvents } from './data/events';

export async function runScheduler(
  userId: string,
  externalEvents: EventItem[]
): Promise<EventItem[]> {
  if (userId === 'TEST') {
    console.info('Running scheduler in test mode');
    return mockEvents;
  }
  const personalEvents = await generatePersonalEvents(userId, externalEvents); // personal events we recommend
  // Process recommended events, e.g., save to database or return to client
  return personalEvents;
}
