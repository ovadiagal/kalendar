import { EventItem } from '@howljs/calendar-kit';
import OpenAI from 'openai';
import { fetchPreferences } from './services/preferenceService';
import { fetchStoredSchedule, storeGeneratedSchedule } from './services/storedScheduleService';

let threads: { [userId: string]: any } = {};

export async function runScheduler(
  userId: string,
  externalEvents: EventItem[]
): Promise<EventItem[]> {
  console.log('gonna fetch preferences');
  const preferences = await fetchPreferences(userId);
  const existingSchedule = await fetchStoredSchedule(userId);

  if (existingSchedule) {
    return existingSchedule as EventItem[];
  }

  const openai = new OpenAI({
    apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY!,
  });

  if (!threads[userId]) {
    threads[userId] = await openai.beta.threads.create();
  }

  const thread = threads[userId];

  await openai.beta.threads.messages.create(thread.id, {
    role: 'user',
    content: `Here are external, nonmovable events: ${JSON.stringify(externalEvents)} Here are the users preferences: ${JSON.stringify(preferences)}`,
  });

  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: process.env.EXPO_PUBLIC_OPENAI_ASSISTANT_ID!,
  });

  let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
  while (runStatus.status !== 'completed') {
    console.log(runStatus.status);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
  }

  if (runStatus.status !== 'completed') {
    throw new Error('OpenAI run did not complete successfully');
  }

  const response = await openai.beta.threads.messages.list(thread.id);
  const firstMessage = response.data[0];

  if (!firstMessage?.content?.[0] || firstMessage.content[0].type !== 'text') {
    throw new Error('Invalid response format from OpenAI');
  }

  try {
    const parsedResponse = JSON.parse(firstMessage.content[0].text.value);
    console.log(parsedResponse);
    const schedule = parsedResponse['schedule'];
    if (!schedule) {
      throw new Error('No schedule found in response');
    }

    return schedule;
  } catch (error) {
    console.error('Failed to parse OpenAI response:', error);
    throw new Error('Failed to parse schedule from OpenAI response');
  }
}
