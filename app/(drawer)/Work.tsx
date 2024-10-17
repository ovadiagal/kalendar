import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
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
  const worktimeQuestion = 'What is your preferred start and end time for your workday?';
  const workdayQuestion = 'What days do you work remotely?';
  const productiveTimes = 'Do you have specific times that you are most productive?';

  const [startTime, setStartTime] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState<Date>(new Date());
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);

  const onStartTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    const currentTime = selectedTime || startTime;
    setStartTime(currentTime);
  };

  const onEndTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    const currentTime = selectedTime || endTime;
    setEndTime(currentTime);
  };

  const toggleDaySelection = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggleTimeSelection = (time: string) => {
    setSelectedTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    );
  };

  const handleSaveAndContinue = async () => {
    try {
      const newWorkPreference: Database['public']['Tables']['work_preferences']['Insert'] = {
        user_id: userId,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        selected_days: selectedDays.join(','),
        selected_times: selectedTimes.join(','),
        updated_at: new Date().toISOString(),
      };
      supabase
        .from('work_preferences')
        .insert(newWorkPreference)
        .then(() => console.log('saved work preferences: ', newWorkPreference));

      // if successful
      router.push('/Break');
    } catch (error) {
      console.error('Error saving work preference data:', error);
      Alert.alert('Error', 'Failed to save work preference data. Please try again.');
    }
  };

  const days = ['M', 'T', 'W', 'Th', 'F'];

  const timeSlots = [
    ['6AM - 9AM', '9AM - 12PM', '12PM - 3PM'],
    ['3PM - 6PM', '6PM - 9PM', '9PM - 12AM'],
  ];

  return (
    <ScrollView className="pb-30 flex-1 px-10 py-10">
      <Text className="mb-5 text-3xl font-bold">{titleText}</Text>

      <View className="mb-5 mt-5 rounded-lg bg-white p-5 shadow-lg">
        <Text className="text-lg font-semibold">{worktimeQuestion}</Text>
        <View className="mt-5 flex-row items-center justify-between">
          <Text className="text-md ml-5 font-semibold">Start Time</Text>
          <DateTimePicker
            testID="startTimePicker"
            value={startTime}
            mode="time"
            is24Hour={false}
            onChange={onStartTimeChange}
            style={{ width: 100, marginRight: 25 }}
          />
        </View>

        <View className="mt-5 flex-row items-center justify-between">
          <Text className="text-md ml-5 font-semibold">End Time</Text>
          <DateTimePicker
            testID="endTimePicker"
            value={endTime}
            mode="time"
            is24Hour={false}
            onChange={onEndTimeChange}
            style={{ width: 100, marginRight: 25 }}
          />
        </View>
      </View>

      <View className="mb-5 mt-5 rounded-lg bg-white p-5 shadow-lg">
        <Text className="text-lg font-semibold">{workdayQuestion}</Text>
        <View className="mt-3 flex-row justify-around">
          {days.map((day) => (
            <TouchableOpacity
              key={day}
              onPress={() => toggleDaySelection(day)}
              className={`h-12 w-12 items-center justify-center rounded-full 
                ${selectedDays.includes(day) ? 'bg-accentPurple' : 'bg-gray-100'}`}>
              <Text
                className={`text-lg font-bold ${selectedDays.includes(day) ? 'text-white' : 'text-accentPurple'}`}>
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="mb-5 mt-5 rounded-lg bg-white p-5 shadow-lg">
        <Text className="text-lg font-semibold">{productiveTimes}</Text>
        {timeSlots.map((row, rowIndex) => (
          <View key={rowIndex} className="mt-3 flex-row justify-around">
            {row.map((time) => (
              <TouchableOpacity
                key={time}
                onPress={() => toggleTimeSelection(time)}
                className={`h-12 w-24 items-center justify-center rounded-lg p-1
                  ${selectedTimes.includes(time) ? 'bg-accentPurple' : 'bg-gray-100'}`}>
                <Text
                  className={`text-sm font-bold ${selectedTimes.includes(time) ? 'text-white' : 'text-accentPurple'}`}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      <TouchableOpacity
        className="mt-5 rounded bg-accentPurple p-3"
        onPress={() => handleSaveAndContinue()}>
        <Text className="text-center text-lg text-white">Save and Continue</Text>
      </TouchableOpacity>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

export default Work;
