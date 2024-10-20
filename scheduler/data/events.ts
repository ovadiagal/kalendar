import { EventItem } from '@howljs/calendar-kit';

export const mockEvents: EventItem[] = [
  {
    id: `event-${Date.now()}`,
    title: 'Meeting with Isabelle',
    allDay: false,
    start: { dateTime: new Date('2024-10-14T09:00:00').toISOString() },
    end: { dateTime: new Date('2024-10-14T10:00:00').toISOString() },
  },
  {
    id: `event-${Date.now() + 1}`,
    title: 'Workout',
    allDay: false,
    start: { dateTime: new Date('2024-10-15T11:00:00').toISOString() },
    end: { dateTime: new Date('2024-10-15T12:00:00').toISOString() },
    scheduled: true,
  },
  {
    id: `event-${Date.now() + 2}`,
    title: 'Independent Work Time',
    allDay: false,
    start: { dateTime: new Date('2024-10-16T13:00:00').toISOString() },
    end: { dateTime: new Date('2024-10-16T14:00:00').toISOString() },
    scheduled: true,
  },
  {
    id: `event-${Date.now() + 3}`,
    title: 'Meeting with Sammy',
    allDay: false,
    start: { dateTime: new Date('2024-10-17T15:00:00').toISOString() },
    end: { dateTime: new Date('2024-10-17T16:00:00').toISOString() },
  },
];
