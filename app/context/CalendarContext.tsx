import React, { createContext, useState, ReactNode } from 'react';
import { EventItem } from '@howljs/calendar-kit';

interface CalendarContextType {
  events: EventItem[];
  addEvents: (newEvents: EventItem[]) => void;
}

export const CalendarContext = createContext<CalendarContextType>({
  events: [],
  addEvents: () => {},
});

interface CalendarProviderProps {
  children: ReactNode;
}

export const CalendarProvider: React.FC<CalendarProviderProps> = ({ children }) => {
  const [events, setEvents] = useState<EventItem[]>([]);

  const addEvents = (newEvents: EventItem[]) => {
    setEvents(newEvents);
  };

  return (
    <CalendarContext.Provider value={{ events, addEvents }}>{children}</CalendarContext.Provider>
  );
};
