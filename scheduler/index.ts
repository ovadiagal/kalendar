import { EventItem } from '@howljs/calendar-kit';
import OpenAI from 'openai';

export async function runScheduler(
  userId: string,
  externalEvents: EventItem[]
): Promise<EventItem[]> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
  });

  // Create a thread with the external events as context
  const thread = await openai.beta.threads.create({
    messages: [
      {
        role: 'user',
        content: `Generate personalized event recommendations based on these existing events: ${JSON.stringify(externalEvents)}`,
      },
    ],
  });

  // Run the assistant
  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: process.env.OPENAI_ASSISTANT_ID!,
  });

  // Wait for the completion
  let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);

  while (runStatus.status !== 'completed') {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
  }

  // Get the assistant's response
  const messages = await openai.beta.threads.messages.list(thread.id);
  const response = messages.data[0].content[0];

  console.log('Response:', response);

  // Parse the response into EventItem array
  // Assuming the assistant returns properly formatted JSON
  if (response.type === 'text') {
    const generatedEvents = JSON.parse(response.text.value) as EventItem[];
    console.log('Generated events:', generatedEvents);
    return generatedEvents;
  } else {
    throw new Error('Unexpected response type');
  }
}
