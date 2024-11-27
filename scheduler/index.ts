import { generatePersonalEvents } from './generators/eventGenerator';
import { EventItem } from '@howljs/calendar-kit';
import { mockEvents } from './data/events';
import OpenAI from 'openai';
import { fetchPreferences } from './services/preferenceService';
import { getLocation } from '~/components/Weather';
import { supabase } from '~/utils/supabase';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const normalThreads: { [userId: string]: any } = {};
const compactThreads: { [userId: string]: any } = {};

const weatherCache: { [userId: string]: string } = {};

export async function runScheduler(
  userId: string,
  externalEvents: EventItem[],
  assistantId: string,
  assistantType: 'normal' | 'compact'
): Promise<EventItem[]> {
  const preferences = await fetchPreferences(userId);

  const openai = new OpenAI({
    apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY!,
  });

  const threads = assistantType === 'normal' ? normalThreads : compactThreads;

  if (!threads[userId]) {
    threads[userId] = await openai.beta.threads.create();
  }

  const thread = threads[userId];

  if (!weatherCache[userId]) {
    const loc = await getLocation();
    const location = `${loc.coords.latitude},${loc.coords.longitude}`;
    const { data: weatherData, error: weatherError } = await supabase.functions.invoke(
      'weather-recommendations',
      {
        body: { userId, location },
      }
    );
    weatherCache[userId] = weatherData.recommendation;
  }

  const content = `The current time is ${new Date().toISOString()}.
    Here are external, nonmovable events: ${JSON.stringify(externalEvents)}.
    Here are the users preferences. The user works remotely on the following days: ${JSON.stringify(preferences.days)}. 
    The user prefers to start their day at ${preferences.days[0].start_time ?? 'unknown'} and end their day at ${preferences.days[0].end_time ?? 'unknown'}.
    The is most productive during these times: ${preferences.days[0].productive_times ?? 'unknown'}.
    The preferred break time in minutes is ${preferences.breakTimeMinutes}.
    The preferred number of breaks per day is ${preferences.numberOfBreaks}.
    Some of the preferred activities are ${preferences.selectedActivities}.
    ${weatherCache[userId] && `The weather today is ${weatherCache[userId]}`}.
    Additional notes from the user: ${JSON.stringify(preferences.preferenceModifications)}`;

  console.log('Prompt for OpenAI:', content);
  await openai.beta.threads.messages.create(thread.id, {
    role: 'user',
    content,
  });

  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: assistantId,
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

  if (firstMessage.content[0].type === 'text') {
    const generatedEvents = JSON.parse(firstMessage.content[0].text.value)['items'];
    const updatedEvents: EventItem[] = generatedEvents.map(
      (event: Omit<EventItem, 'start' | 'end'>): EventItem => {
        return {
          ...event,
          id: uuidv4(),
          start: {
            dateTime: event.start,
          },
          end: {
            dateTime: event.end,
          },
        };
      }
    );
    console.log('Scheduler created these events:', updatedEvents);
    return updatedEvents;
  }
  return [];
}

export async function runSchedulerCompact(
  userId: string,
  externalEvents: EventItem[]
): Promise<EventItem[]> {
  const compactAgentId = process.env.EXPO_PUBLIC_OPENAI_COMPACT_ASSISTANT_ID!;
  return runScheduler(userId, externalEvents, compactAgentId, 'compact');
}

export async function runSchedulerNormal(
  userId: string,
  externalEvents: EventItem[]
): Promise<EventItem[]> {
  const normalAgentId = process.env.EXPO_PUBLIC_OPENAI_NORMAL_ASSISTANT_ID!;
  return runScheduler(userId, externalEvents, normalAgentId, 'normal');
}
