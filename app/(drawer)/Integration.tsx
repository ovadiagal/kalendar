import React, { useContext } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Image, Alert } from 'react-native';
import * as Calendar from 'expo-calendar';
import { useRouter } from 'expo-router';
import { CalendarContext } from '../context/CalendarContext';
import { EventItem } from '@howljs/calendar-kit';

const Integration = () => {
  const router = useRouter();
  const ical = require('../../assets/ical.png');
  const titleText = "Let's integrate your schedule.";
  const syncInformation =
    'Sync your calendar below to make sure that we put your meetings, events, and other information into your schedule.';

  const { addEvents } = useContext(CalendarContext);

  const getPermissionsAndFetchEvents = async () => {
    try {
      // Ask for calendar permission
      const { status: calendarStatus } = await Calendar.requestCalendarPermissionsAsync();

      if (calendarStatus === 'granted') {
        // Get default calendar source
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);

        const calendarId = calendars[0].id;

        // Get current week start and end dates
        const currentDate = new Date();
        const startOfWeek = new Date(
          currentDate.setDate(currentDate.getDate() - currentDate.getDay())
        );
        const endOfWeek = new Date(currentDate.setDate(currentDate.getDate() + 6));

        // Fetch events for the current week
        const events = await Calendar.getEventsAsync([calendarId], startOfWeek, endOfWeek);
        const formattedEvents: EventItem[] = events.map((event) => ({
          id: event.id,
          title: event.title,
          start: { dateTime: new Date(event.startDate).toISOString() },
          end: { dateTime: new Date(event.endDate).toISOString() },
        }));
        addEvents(formattedEvents);
        router.push('/Done');
      } else {
        Alert.alert(
          'Permission denied',
          'Please enable calendar permissions in device settings to continue.'
        );
      }
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    }
  };

  return (
    <ScrollView className="pb-30 flex-1 px-10 py-10">
      <Text className="mb-5 text-3xl font-bold">{titleText}</Text>
      <Text className="mb-5 text-xl">{syncInformation}</Text>
      <View className="mb-5 flex items-center">
        <Image source={ical} className="w-50 h-50 mb-20" resizeMode="contain" />
      </View>

      <View className="mt-20 h-20" />

      <TouchableOpacity
        className="rounded bg-accentPurple p-3"
        onPress={getPermissionsAndFetchEvents}>
        <Text className="text-center text-lg text-white">Sync and Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Integration;
