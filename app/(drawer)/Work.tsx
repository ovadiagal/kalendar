import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import { Database } from '../../database.types';
import { useSupabase } from '../context/useSupabase';

const Work = () => {
  const router = useRouter();
  const { supabase, userId } = useSupabase();

  const titleText = "Let's start with your job.";
  const worktimeQuestion = 'What is your preferred start time and end time for this workday?';
  const productiveTimesQuestion = 'When do you think you are most productive on this workday?';
  const remoteWorkQuestion = 'Will you be working remotely this day?';

  const [selectedDay, setSelectedDay] = useState<string>('M');
  const [times, setTimes] = useState<{ [key: string]: { start: Date; end: Date } }>({
    M: { start: new Date(), end: new Date() },
    T: { start: new Date(), end: new Date() },
    W: { start: new Date(), end: new Date() },
    Th: { start: new Date(), end: new Date() },
    F: { start: new Date(), end: new Date() },
  });

  const [productiveTimes, setProductiveTimes] = useState<{ [key: string]: string[] }>({
    M: [],
    T: [],
    W: [],
    Th: [],
    F: [],
  });

  const [remoteWork, setRemoteWork] = useState<{ [key: string]: boolean | null }>({
    M: null,
    T: null,
    W: null,
    Th: null,
    F: null,
  });

  const handleTimeChange = (
    day: string,
    type: 'start' | 'end',
    event: any,
    selectedTime?: Date
  ) => {
    if (selectedTime) {
      setTimes((prev) => ({
        ...prev,
        [day]: {
          ...prev[day],
          [type]: selectedTime,
        },
      }));
    }
  };

  const toggleProductiveTime = (time: string) => {
    setProductiveTimes((prev) => {
      const currentTimes = prev[selectedDay];
      return {
        ...prev,
        [selectedDay]: currentTimes.includes(time)
          ? currentTimes.filter((t) => t !== time)
          : [...currentTimes, time],
      };
    });
  };

  const handleRemoteWorkSelection = (isRemote: boolean) => {
    setRemoteWork((prev) => ({
      ...prev,
      [selectedDay]: isRemote,
    }));
  };

  const handleSave = async () => {
    try {
      const daysData = Object.entries(times).map(([day, time]) => ({
        day,
        workday_start_time: time.start.toISOString(),
        workday_end_time: time.end.toISOString(),
        productive_time_chunks: productiveTimes[day],
        is_remote_workday: remoteWork[day],
      }));

      const newWorkPreference: Database['public']['Tables']['work_preferences_updated']['Insert'] = {
          user_id: userId,
          days: daysData,
          updated_at: new Date().toISOString(),
        };

      const { error } = await supabase.from('work_preferences_updated').insert(newWorkPreference);

      if (error) throw error;
      console.log('Saved work preference data: ', newWorkPreference);
      router.push('/Break');
    } catch (error) {
      console.error('Error saving work preference data:', error);
      Alert.alert('Error', 'Failed to save work preference data. Please try again.');
    }
  };

  const days = ['M', 'T', 'W', 'Th', 'F'];
  const dayNames: Record<string, string> = {
    M: 'Monday',
    T: 'Tuesday',
    W: 'Wednesday',
    Th: 'Thursday',
    F: 'Friday',
  };
  const timeSlots = [
    '6AM - 7AM',
    '7AM - 8AM',
    '8AM - 9AM',
    '9AM - 10AM',
    '10AM - 11AM',
    '11AM - 12PM',
    '12PM - 1PM',
    '1PM - 2PM',
    '2PM - 3PM',
    '3PM - 4PM',
    '4PM - 5PM',
    '5PM - 6PM',
    '6PM - 7PM',
    '7PM - 8PM',
    '8PM - 9PM',
    '9PM - 10PM',
    '10PM - 11PM',
    '11PM - 12AM',
  ];

  const morningSlots = timeSlots.slice(0, 6);
  const afternoonSlots = timeSlots.slice(6, 12);
  const eveningSlots = timeSlots.slice(12, 18);

  return (
    <View className="flex-1">
      <ScrollView className="flex-1 p-6">
        <Text className="mb-5 text-3xl font-bold">{titleText}</Text>
        <Text className="mb-3 text-lg font-bold text-accentPurple">{dayNames[selectedDay]}</Text>
        <View className="mb-5 flex-row justify-between">
          {days.map((day) => (
            <TouchableOpacity
              key={day}
              onPress={() => setSelectedDay(day)}
              className={`flex-1 items-center rounded p-3 ${selectedDay === day ? 'bg-accentPurple' : 'bg-gray-200'}`}>
              <Text
                className={`font-bold ${selectedDay === day ? 'text-white' : 'text-accentPurple'}`}>
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="mb-5 mt-5 rounded-lg bg-white p-5 shadow-lg">
          <Text className="text-lg font-semibold">{remoteWorkQuestion}</Text>
          <View className="mt-4 flex-row justify-between">
            <TouchableOpacity
              onPress={() => handleRemoteWorkSelection(true)}
              className={`mr-2 flex-1 rounded-lg p-3 ${remoteWork[selectedDay] === true ? 'bg-accentPurple' : 'bg-gray-200'}`}>
              <Text
                className={`text-center font-bold ${remoteWork[selectedDay] === true ? 'text-white' : 'text-accentPurple'}`}>
                Yes, I am working remotely
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleRemoteWorkSelection(false)}
              className={`ml-2 flex-1 rounded-lg p-3 ${remoteWork[selectedDay] === false ? 'bg-accentPurple' : 'bg-gray-200'}`}>
              <Text
                className={`text-center font-bold ${remoteWork[selectedDay] === false ? 'text-white' : 'text-accentPurple'}`}>
                No, I am not working remotely
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mb-5 mt-5 rounded-lg bg-white p-5 shadow-lg">
          <Text className="text-lg font-semibold">{worktimeQuestion}</Text>

          <View className="mt-5 flex-row items-center justify-center">
            <Text className="text-md mr-3 font-semibold">Start Time</Text>
            <DateTimePicker
              testID="startTimePicker"
              value={times[selectedDay].start}
              mode="time"
              is24Hour={false}
              onChange={(event, selectedTime) =>
                handleTimeChange(selectedDay, 'start', event, selectedTime)
              }
              style={{ width: 100 }}
            />
          </View>

          <View className="mt-5 flex-row items-center justify-center">
            <Text className="text-md mr-3 font-semibold">End Time</Text>
            <DateTimePicker
              testID="endTimePicker"
              value={times[selectedDay].end}
              mode="time"
              is24Hour={false}
              onChange={(event, selectedTime) =>
                handleTimeChange(selectedDay, 'end', event, selectedTime)
              }
              style={{ width: 100 }}
            />
          </View>
        </View>

        <View className="mb-5 mt-5 rounded-lg bg-white p-5 shadow-lg">
          <Text className="text-lg font-semibold">{productiveTimesQuestion}</Text>

          <Text className="mt-4 text-lg">Morning</Text>
          <View className="mb-3 flex-row flex-wrap">
            {morningSlots.map((time) => (
              <TouchableOpacity
                key={time}
                onPress={() => toggleProductiveTime(time)}
                className={`mx-1 mb-2 h-12 flex-1 items-center justify-center rounded-lg p-1
                  ${productiveTimes[selectedDay].includes(time) ? 'bg-accentPurple' : 'bg-gray-100'}`}
                style={{ flexBasis: '30%', marginHorizontal: '1%' }}>
                <Text
                  className={`text-sm font-bold ${productiveTimes[selectedDay].includes(time) ? 'text-white' : 'text-accentPurple'}`}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="mt-4 text-lg">Afternoon</Text>
          <View className="mb-3 flex-row flex-wrap">
            {afternoonSlots.map((time) => (
              <TouchableOpacity
                key={time}
                onPress={() => toggleProductiveTime(time)}
                className={`mx-1 mb-2 h-12 flex-1 items-center justify-center rounded-lg p-1
                  ${productiveTimes[selectedDay].includes(time) ? 'bg-accentPurple' : 'bg-gray-100'}`}
                style={{ flexBasis: '30%', marginHorizontal: '1%' }}>
                <Text
                  className={`text-sm font-bold ${productiveTimes[selectedDay].includes(time) ? 'text-white' : 'text-accentPurple'}`}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="mt-4 text-lg">Evening</Text>
          <View className="mb-3 flex-row flex-wrap">
            {eveningSlots.map((time) => (
              <TouchableOpacity
                key={time}
                onPress={() => toggleProductiveTime(time)}
                className={`mx-1 mb-2 h-12 flex-1 items-center justify-center rounded-lg p-1
                  ${productiveTimes[selectedDay].includes(time) ? 'bg-accentPurple' : 'bg-gray-100'}`}
                style={{ flexBasis: '30%', marginHorizontal: '1%' }}>
                <Text
                  className={`text-sm font-bold ${productiveTimes[selectedDay].includes(time) ? 'text-white' : 'text-accentPurple'}`}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>

      <View className="p-6 pb-10 shadow-lg">
        <TouchableOpacity className="rounded bg-accentPurple p-3" onPress={handleSave}>
          <Text className="text-center text-lg text-white">Save and Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Work;
