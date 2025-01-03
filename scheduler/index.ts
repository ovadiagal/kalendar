import { generatePersonalEvents } from './generators/eventGenerator';
import { EventItem } from '@howljs/calendar-kit';
import { mockEvents } from './data/events';
import OpenAI from 'openai';
import { fetchPreferences } from './services/preferenceService';
import { getLocation } from '~/components/Weather';
import { supabase } from '~/utils/supabase';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const threads: { [userId: string]: any } = {};

const weatherCache: { [userId: string]: string } = {};

export async function runScheduler(
  userId: string,
  externalEvents: EventItem[],
  schedulerType: 'normal' | 'compact'
): Promise<EventItem[]> {
  const preferences = await fetchPreferences(userId);

  const openai = new OpenAI({
    apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY!,
  });

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
    The is most productive during these times: ${preferences.days[0].productive_times ?? 'unknown'}.
    The preferred break time in minutes is ${preferences.breakTimeMinutes}.
    The preferred number of breaks per day is ${preferences.numberOfBreaks}.
    Some of the preferred activities are ${preferences.selectedActivities}.
    ${weatherCache[userId] && `The weather today is ${weatherCache[userId]}. Take this into account when scheduling events, you can also add some weather-based ones.`}.
    Additional notes from the user: ${JSON.stringify(preferences.preferenceModifications)}
    Schedule events for the next 3 days for this user. Try to be mindful of their preferences. Do not schedule anything before 1PM and after 3AM in UTC. Make sure that scheduled events DO NOT overlap with any external events. The user is in the New York time zone, but all times are in ISO strings. Try to schedule varied events. Don't schedule the same type of activity more than twice in a single day. Don't mention anything about lunch/breakfast/dinner or the time of day 'i.e. evening walk' in the names of the events.`;

  console.log('Prompt for OpenAI:', content);
  await openai.beta.threads.messages.create(thread.id, {
    role: 'user',
    content,
  });

  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id:
      schedulerType === 'normal'
        ? process.env.EXPO_PUBLIC_OPENAI_ASSISTANT_ID!
        : process.env.EXPO_PUBLIC_OPENAI_COMPACT_ASSISTANT_ID!,
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
    const updatedEvents: EventItem[] = generatedEvents
      .map((event: Omit<EventItem, 'start' | 'end'>): EventItem => {
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
      })
      .filter(
        (event: {
          end: { dateTime: string | number | Date };
          start: { dateTime: string | number | Date };
        }) => {
          const endDateTime = new Date(event.end.dateTime);
          const startDateTime = new Date(event.start.dateTime);
          const now = new Date();

          // Remove any events that end before the current time
          if (endDateTime <= now) {
            return false;
          }

          // Remove any events that start before 1PM UTC
          if (startDateTime.getUTCHours() < 13) {
            return false;
          }

          return true;
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
  return runScheduler(userId, externalEvents, 'compact');
}

export async function runSchedulerNormal(
  userId: string,
  externalEvents: EventItem[]
): Promise<EventItem[]> {
  return runScheduler(userId, externalEvents, 'normal');
}
