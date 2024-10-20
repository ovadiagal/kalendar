import { generatePersonalEvents } from './generators/personalEventGenerator';

async function runScheduler(userId: string) {
  const recommendedEvents = await generatePersonalEvents(userId);
  // Process recommended events, e.g., save to database or return to client
}

runScheduler('user-123').catch(console.error);
