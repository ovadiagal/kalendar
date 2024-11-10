import type {
  CalendarKitHandle,
  DateOrDateTime,
  EventItem,
  SelectedEventType,
} from '@howljs/calendar-kit';
import { CalendarBody, CalendarContainer, CalendarHeader } from '@howljs/calendar-kit';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CalendarTopBar from '../../components/CalendarTopBar';
import { EventNotification } from '../../components/EventNotification';
import * as scheduler from '../../scheduler/index';
import { CalendarContext } from '../context/CalendarContext';
import { useSupabase } from '../context/useSupabase';

const INITIAL_DATE = new Date(
  new Date().getFullYear(),
  new Date().getMonth(),
  new Date().getDate()
).toISOString();

const randomColor = () => {
  const colorPalette = ['#EEA5A6', '#E493B3', '#B784B7'];
  const randomIndex = Math.floor(Math.random() * colorPalette.length);
  return colorPalette[randomIndex];
};

const Calendar = () => {
  const [externalEvents, setExternalEvents] = useState<EventItem[]>([]);
  const { events } = useContext(CalendarContext);

  useEffect(() => {
    setExternalEvents(events.map((event) => ({ ...event, color: 'tomato', draggable: false })));
  }, [events]);

  const [personalEvents, setPersonalEvents] = useState<EventItem[]>([]);

  const { userId } = useSupabase();

  const [loading, setLoading] = useState(false);
  const runScheduler = () => {
    if (loading) return;
    setLoading(true);
    scheduler.runScheduler(userId ?? 'TEST', events).then((result) => {
      setPersonalEvents(result.map((event) => ({ ...event, color: 'powderblue', draggable: true })));
      setLoading(false);
    });
  };

  const calendarRef = useRef<CalendarKitHandle>(null);
  const currentDate = useSharedValue(INITIAL_DATE);
  const [selectedEvent, setSelectedEvent] = useState<SelectedEventType>();
  const [calendarWidth, setCalendarWidth] = useState(Dimensions.get('window').width);
  const { bottom: safeBottom } = useSafeAreaInsets();
  
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setCalendarWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  const _onChange = (date: string) => {
    currentDate.value = date;
  };

  const _onPressToday = useCallback(() => {
    calendarRef.current?.goToDate({
      date: new Date().toISOString(),
      animatedDate: true,
      hourScroll: true,
    });
  }, []);

  const unavailableHours = useMemo(
    () => [
      { start: 0, end: 9 * 60, enableBackgroundInteraction: true },
      { start: 20 * 60, end: 24 * 60, enableBackgroundInteraction: true },
    ],
    []
  );

  const _onPressBackground = (props: DateOrDateTime) => {
    if (props.date) {
      console.log(new Date(props.date).toISOString());
    }
    if (props.dateTime) {
      console.log(new Date(props.dateTime).toISOString());
    }
    setSelectedEvent(undefined);
  };

  const handleDragEventEnd = async (event: EventItem) => {
    if (!event.draggable) return;

    const { originalRecurringEvent, ...rest } = event;
    if (event.id) {
      const updatedPersonalEvents = personalEvents.filter(
        (item) => item.id !== event.id && item.id !== originalRecurringEvent?.id
      );
      
      if (originalRecurringEvent) {
        updatedPersonalEvents.push(originalRecurringEvent);
      }
      
      const newEvent = { ...rest, id: event.id, color: 'powderblue', draggable: true };
      updatedPersonalEvents.push(newEvent);
      setPersonalEvents(updatedPersonalEvents);
    }

    setSelectedEvent(event);
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 100);
    });
  };

  const handleDragSelectedEventEnd = async (event: EventItem) => {
    if (!event.draggable) return;

    const { originalRecurringEvent, ...rest } = event;
    if (event.id) {
      const updatedPersonalEvents = personalEvents.filter(
        (item) => item.id !== event.id && item.id !== originalRecurringEvent?.id
      );
      
      if (originalRecurringEvent) {
        updatedPersonalEvents.push(originalRecurringEvent);
      }
      
      updatedPersonalEvents.push({ ...rest, color: 'powderblue', draggable: true } as EventItem);
      setPersonalEvents(updatedPersonalEvents);
    }

    setSelectedEvent(event);
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 100);
    });
  };

  const handleDragCreateEventEnd = (event: EventItem) => {
    const newEvent = {
      ...event,
      id: `personal_event_${personalEvents.length + 1}`,
      title: `Personal Event ${personalEvents.length + 1}`,
      color: 'powderblue',
      draggable: true,
    };
    setPersonalEvents([...personalEvents, newEvent]);
    setSelectedEvent(newEvent);
  };

  const handleEventNotificationUpdate = (updatedEvent: EventItem, action: 'delay' | 'cancel' | 'keep') => {
    if (action === 'cancel') {
      // Remove the event if it was cancelled
      setPersonalEvents(prev => prev.filter(event => event.id !== updatedEvent.id));
      return;
    }
  
    if (action === 'delay') {
      // Update the event with new times
      setPersonalEvents(prev => 
        prev.map(event => 
          event.id === updatedEvent.id ? updatedEvent : event
        )
      );
    }
  };

  return (
    <View className="flex-1">
      <EventNotification 
        events={[...externalEvents, ...personalEvents]}
        onEventUpdate={handleEventNotificationUpdate}
      />
      <CalendarTopBar
        currentDate={currentDate}
        onPressToday={_onPressToday}
        runScheduler={runScheduler}
        loading={loading}
      />
      <CalendarContainer
        ref={calendarRef}
        calendarWidth={calendarWidth}
        numberOfDays={5}
        scrollByDay={true}
        firstDay={1}
        hideWeekDays={[]}
        minRegularEventMinutes={5}
        allowPinchToZoom
        onChange={_onChange}
        onDateChanged={console.log}
        onPressDayNumber={undefined}
        onPressBackground={_onPressBackground}
        unavailableHours={unavailableHours}
        events={[...externalEvents, ...personalEvents]}
        onPressEvent={(event) => {
          console.log(event);
        }}
        useHaptic
        allowDragToEdit
        allowDragToCreate
        useAllDayEvent={false}
        rightEdgeSpacing={1}
        overlapEventsSpacing={2}
        onLongPressEvent={(event) => {
          if (event.id !== selectedEvent?.id) {
            setSelectedEvent(undefined);
          }
        }}
        selectedEvent={selectedEvent}
        spaceFromBottom={safeBottom}
        onDragEventEnd={handleDragEventEnd}
        onDragSelectedEventEnd={handleDragSelectedEventEnd}
        onDragCreateEventEnd={handleDragCreateEventEnd}
      >
        <CalendarHeader dayBarHeight={60} renderHeaderItem={undefined} />
        <CalendarBody />
      </CalendarContainer>
    </View>
  );
};

export default Calendar;