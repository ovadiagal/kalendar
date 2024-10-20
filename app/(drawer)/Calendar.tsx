import type {
  CalendarKitHandle,
  DateOrDateTime,
  EventItem,
  SelectedEventType,
} from '@howljs/calendar-kit';
import { CalendarBody, CalendarContainer, CalendarHeader } from '@howljs/calendar-kit';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Text, View, useColorScheme } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../../components/CalendarTopBar';
import * as scheduler from '../../scheduler/index';
import { SupabaseContext } from '../context/SupabaseContext';

export interface ScheduledItem extends EventItem {
  scheduled: boolean;
}

const MIN_DATE = new Date(
  new Date().getFullYear() - 1,
  new Date().getMonth(),
  new Date().getDate()
).toISOString();

const MAX_DATE = new Date(
  new Date().getFullYear() + 1,
  new Date().getMonth(),
  new Date().getDate()
).toISOString();

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

const minDate = new Date(new Date().getFullYear(), new Date().getMonth() - 4, new Date().getDate());

const generateEvents = () => {
  return new Array(500).fill(0).map((_, index) => {
    const randomDateByIndex = new Date(
      minDate.getFullYear(),
      minDate.getMonth(),
      minDate.getDate() + Math.floor(index / 2),
      Math.floor(Math.random() * 24),
      Math.round((Math.random() * 60) / 15) * 15
    );
    const duration = (Math.floor(Math.random() * 15) + 1) * 15 * 60 * 1000;
    const endDate = new Date(randomDateByIndex.getTime() + duration);

    return {
      id: `event_${index + 1}`,
      start: {
        dateTime: randomDateByIndex.toISOString(),
      },
      end: {
        dateTime: endDate.toISOString(),
      },
      title: `Event ${index + 1}`,
      color: randomColor(),
    } as EventItem;
  });
};

const Calendar = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const { userId } = useContext(SupabaseContext);
  useEffect(() => {
    if (userId) {
      scheduler.runScheduler(userId).then((events) => {
        const coloredEvents = events.map((event) => ({
          ...event,
          color: randomColor(),
        }));
        setEvents(coloredEvents);
      });
    } else {
      scheduler.runScheduler('TEST').then((events) => {
        const coloredEvents = events.map((event) => ({
          ...event,
          color: randomColor(),
        }));
        setEvents(coloredEvents);
      });
    }
  }, [userId]);

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
      { start: 0, end: 6 * 60, enableBackgroundInteraction: true },
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

  return (
    <View className="flex-1">
      <Header currentDate={currentDate} onPressToday={_onPressToday} />
      <CalendarContainer
        ref={calendarRef}
        calendarWidth={calendarWidth}
        numberOfDays={7}
        scrollByDay={false}
        firstDay={1}
        hideWeekDays={[]} // Can specify here to hide specific days to hide, i.e. hide weekend w/ [6, 7]
        minRegularEventMinutes={5}
        allowPinchToZoom={true}
        onChange={_onChange}
        onDateChanged={console.log}
        minDate={MIN_DATE}
        maxDate={MAX_DATE}
        initialDate={INITIAL_DATE}
        onPressDayNumber={undefined}
        onPressBackground={_onPressBackground}
        unavailableHours={unavailableHours}
        events={events}
        onPressEvent={(event) => {
          console.log(event);
        }}
        useHaptic={true}
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
        onDragEventEnd={async (event) => {
          const { originalRecurringEvent, ...rest } = event;
          if (event.id) {
            const filteredEvents = events.filter(
              (item) => item.id !== event.id && item.id !== originalRecurringEvent?.id
            );
            if (originalRecurringEvent) {
              filteredEvents.push(originalRecurringEvent);
            }
            const newEvent = { ...rest, id: event.id };
            filteredEvents.push(newEvent);
            setEvents(filteredEvents);
          }

          setSelectedEvent(event);
          await new Promise((resolve) => {
            setTimeout(() => {
              resolve(true);
            }, 100);
          });
        }}
        onDragSelectedEventEnd={async (event) => {
          const { originalRecurringEvent, ...rest } = event;
          if (event.id) {
            const filteredEvents = events.filter(
              (item) => item.id !== event.id && item.id !== originalRecurringEvent?.id
            );
            if (originalRecurringEvent) {
              filteredEvents.push(originalRecurringEvent);
            }
            filteredEvents.push(rest as EventItem);
            setEvents(filteredEvents);
          }

          setSelectedEvent(event);
          await new Promise((resolve) => {
            setTimeout(() => {
              resolve(true);
            }, 100);
          });
        }}
        onDragCreateEventEnd={(event) => {
          const newEvent = {
            ...event,
            id: `event_${events.length + 1}`,
            title: `Event ${events.length + 1}`,
            color: '#23cfde',
          };
          const newEvents = [...events, newEvent];
          setEvents(newEvents);
          setSelectedEvent(newEvent);
        }}>
        <CalendarHeader dayBarHeight={60} renderHeaderItem={undefined} />
        <CalendarBody />
      </CalendarContainer>
    </View>
  );
};

export default Calendar;
