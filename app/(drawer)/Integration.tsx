import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Image, Alert } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const Integration = () => {
  const router = useRouter();
  const gcal = require('../../assets/gcal.png');
  const [accessToken, setAccessToken] = useState(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID!,
    scopes: [process.env.EXPO_PUBLIC_SCOPES!]
  });

  const titleText = "Let's integrate your schedule.";
  const syncInformation =
    'Sync Google Calendar below to make sure that we put your meetings, events, and other information into your schedule.';

  useEffect(() => {
    if (response?.type === 'success') {
      setAccessToken(response.authentication.accessToken);
    }
  }, [response]);

  const getWeekDates = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); 
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return { monday, sunday };
  };

  const fetchCalendarEvents = async () => {
    try {
      const { monday, sunday } = getWeekDates();
      const timeMin = monday.toISOString();
      const timeMax = sunday.toISOString();

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const data = await response.json();
      
      // Log event names
      if (data.items && Array.isArray(data.items)) {
        console.log('Event Names for this week:');
        data.items.forEach((event, index) => {
          const startDate = new Date(event.start.dateTime || event.start.date);
          console.log(`${index + 1}. ${event.summary || 'Unnamed event'} - ${startDate.toLocaleDateString()}`);
        });
      } else {
        console.log('No events found for this week or unexpected data structure');
      }

      return data;
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      Alert.alert('Error', 'Failed to fetch calendar events. Please try again.');
    }
  };

  const handleSyncAndContinue = async () => {
    if (accessToken) {
      const events = await fetchCalendarEvents();
      if (events) {
        router.push('/Done');
      }
    } else {
      promptAsync();
    }
  };

  return (
    <ScrollView className="pb-30 flex-1 px-10 py-10">
      <Text className="mb-5 text-3xl font-bold">{titleText}</Text>
      <Text className="mb-5 text-xl">{syncInformation}</Text>
      <View className="mb-5 flex items-center">
        <Image source={gcal} className="w-50 h-50 mb-20" resizeMode="contain" />
      </View>

      <View className="mt-20 h-20" />

      <TouchableOpacity
        className="rounded bg-accentPurple p-3"
        onPress={handleSyncAndContinue}>
        <Text className="text-center text-lg text-white">
          {accessToken ? 'Sync and Continue' : 'Connect Google Calendar'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Integration;