import React, { createContext, useState, ReactNode } from 'react';

interface CalendarEvent {
  title: string;
  startTime: string;
  endTime: string;
}

interface CalendarContextType {
  events: CalendarEvent[];
  addEvents: (newEvents: CalendarEvent[]) => void;
}

export const CalendarContext = createContext<CalendarContextType>({
  events: [],
  addEvents: () => {},
});

interface CalendarProviderProps {
  children: ReactNode;
}

export const CalendarProvider: React.FC<CalendarProviderProps> = ({ children }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const addEvents = (newEvents: CalendarEvent[]) => {
    setEvents(newEvents);
  };

  return (
    <CalendarContext.Provider value={{ events, addEvents }}>
      {children}
    </CalendarContext.Provider>
  );
};
