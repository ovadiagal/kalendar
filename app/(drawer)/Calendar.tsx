import type {
  CalendarKitHandle,
  DateOrDateTime,
  EventItem,
  SelectedEventType,
} from '@howljs/calendar-kit';
import { CalendarBody, CalendarContainer, CalendarHeader } from '@howljs/calendar-kit';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../../components/Header';

interface ScheduledItem extends EventItem {
  scheduled: true;
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
  const [events, setEvents] = useState<EventItem[]>(() => generateEvents());
  const { bottom: safeBottom } = useSafeAreaInsets();
  const calendarRef = useRef<CalendarKitHandle>(null);
  const currentDate = useSharedValue(INITIAL_DATE);
  const [selectedEvent, setSelectedEvent] = useState<SelectedEventType>();
  const [calendarWidth, setCalendarWidth] = useState(Dimensions.get('window').width);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setCalendarWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  const _onChange = (date: string) => {
    currentDate.value = date;
  };

  const _onPressDayNumber = (date: string) => {};

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
    <View style={styles.container}>
      <Header currentDate={currentDate} onPressToday={_onPressToday} />
      <CalendarContainer
        ref={calendarRef}
        calendarWidth={calendarWidth}
        numberOfDays={7}
        scrollByDay={false}
        firstDay={1}
        hideWeekDays={[]} // Can specify here to hide specific days, i.e. weekend
        minRegularEventMinutes={5}
        allowPinchToZoom={true}
        onChange={_onChange}
        onDateChanged={console.log}
        minDate={MIN_DATE}
        maxDate={MAX_DATE}
        initialDate={INITIAL_DATE}
        onPressDayNumber={undefined} // In the future we can make this change 'numberOfDays' to 1 and show a daily view
        onPressBackground={_onPressBackground}
        unavailableHours={unavailableHours}
        events={events}
        onPressEvent={(event) => {
          console.log(event);
        }}
        useHaptic={true}
        allowDragToEdit // We can disable these if we want more fine tuned interaction with how users reschedule events (i.e. tap -> popup -> edit)
        allowDragToCreate
        useAllDayEvent={false} // Allows us to schedule 'full day' events. I'm not sure if in this context of our day-to-day granular scheduling it's necessary.
        rightEdgeSpacing={1}
        overlapEventsSpacing={2}
        onLongPressEvent={(event) => {
          if (event.id !== selectedEvent?.id) {
            setSelectedEvent(undefined);
          }
        }}
        selectedEvent={selectedEvent}
        // end <-- set start/end times to calendar with this prop.
        // start
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
        <CalendarHeader
          dayBarHeight={60}
          renderHeaderItem={undefined} // Can place a custom header renderer here if we want.
        />
        <CalendarBody />
      </CalendarContainer>
    </View>
  );
};

export default Calendar;

const styles = StyleSheet.create({
  container: { flex: 1 },
  actions: { flexDirection: 'row', gap: 10, padding: 10 },
  btn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#23cfde',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
  },
  date: { fontSize: 16, fontWeight: 'bold' },
  resourceContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  dateContainer: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 8,
  },
});
