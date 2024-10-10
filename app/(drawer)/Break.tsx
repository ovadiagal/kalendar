import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

const Break = () => {
  const router = useRouter();

  const titleText = 'You deserve a break today.';
  const breakQuestion = 'How much break time do you prefer between focused work sessions?';
  const offlineQuestion =
    'Are there specific times when you want to be offline and unavailable for work?';
  const activityQuestion = 'What kinds of activities help you recharge?';

  const [firstOfflineTime, setFirstOfflineTime] = useState<Date>(new Date());
  const [secondOfflineTime, setSecondOfflineTime] = useState<Date>(new Date());
  const [minutes, setMinutes] = useState<string>('');
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

  const onFirstOfflineTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    const currentTime = selectedTime || firstOfflineTime;
    setFirstOfflineTime(currentTime);
  };

  const onSecondOfflineTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    const currentTime = selectedTime || secondOfflineTime;
    setSecondOfflineTime(currentTime);
  };

  const handleMinutesChange = (text: string) => {
    if (text === '' || /^\d*$/.test(text)) {
      const value = parseInt(text, 10);
      if (value >= 0 && value <= 60) {
        setMinutes(text);
      } else if (text !== '') {
        Alert.alert('Invalid Input', 'Please enter a value between 0 and 60.');
      } else {
        setMinutes(text);
      }
    }
  };

  const toggleActivitySelection = (activity: string) => {
    setSelectedActivities((prev) =>
      prev.includes(activity) ? prev.filter(a => a !== activity) : [...prev, activity]
    );
  };

  return (
    <ScrollView className="pb-30 flex-1 px-10 py-10">
      <Text className="mb-5 text-3xl font-bold">{titleText}</Text>

      <View className="mb-5 mt-5 rounded-lg bg-white p-5 shadow-lg">
        <Text className="text-lg font-semibold">{breakQuestion}</Text>
        <View className="mt-5 flex-row items-center justify-between">
          <Text className="text-md ml-5 font-semibold">Break Time</Text>
          <View className="mr-5 flex-row items-center">
            <TextInput
              value={minutes}
              onChangeText={handleMinutesChange}
              keyboardType="numeric" // Numeric keyboard for easier input
              placeholder="0 - 60"
              className="mb-3 mt-3 rounded border border-gray-300 p-2"
              style={{ width: 60, height: 40 }} // Adjust the width and height as needed
            />
            <Text className="text-md ml-2">minutes</Text>
          </View>
        </View>
      </View>

      <View className="mb-5 mt-5 rounded-lg bg-white p-5 shadow-lg">
        <Text className="text-lg font-semibold">{offlineQuestion}</Text>
        <View className="mt-5 flex-row items-center justify-between">
          <Text className="text-md ml-5 font-semibold">Offline Time #1</Text>
          <DateTimePicker
            testID="startTimePicker"
            value={firstOfflineTime}
            mode="time"
            is24Hour={false}
            onChange={onFirstOfflineTimeChange}
            style={{ width: 100, marginRight: 25 }}
          />
        </View>

        <View className="mt-5 flex-row items-center justify-between">
          <Text className="text-md ml-5 font-semibold">Offline Time #2</Text>
          <DateTimePicker
            testID="endTimePicker"
            value={secondOfflineTime}
            mode="time"
            is24Hour={false}
            onChange={onSecondOfflineTimeChange}
            style={{ width: 100, marginRight: 25 }}
          />
        </View>
      </View>

      <View className="mb-5 mt-5 rounded-lg bg-white pb-5 pl-3 pr-5 pt-5 shadow-lg">
        <Text className="ml-3 text-lg font-semibold">{activityQuestion}</Text>
        <View className="mt-3">
          <View className="mb-2 flex-row justify-start">
            {['Short walks', 'Meditation'].map((activity) => (
              <TouchableOpacity
                key={activity}
                onPress={() => toggleActivitySelection(activity)}
                className={`mr-2 h-14 w-40 items-center justify-center rounded-lg
                  ${selectedActivities.includes(activity) ? 'bg-accentPurple' : 'bg-gray-100'}`}>
                <Text
                  className={`text-md font-bold ${selectedActivities.includes(activity) ? 'text-white' : 'text-accentPurple'}`}>
                  {activity}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View className="flex-row justify-start">
            {['Social breaks', 'Other'].map((activity) => (
              <TouchableOpacity
                key={activity}
                onPress={() => toggleActivitySelection(activity)}
                className={`mr-2 h-14 w-40 items-center justify-center rounded-lg
                  ${selectedActivities.includes(activity) ? 'bg-accentPurple' : 'bg-gray-100'}`}>
                <Text
                  className={`text-md font-bold ${selectedActivities.includes(activity) ? 'text-white' : 'text-accentPurple'}`}>
                  {activity}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <TouchableOpacity
        className="mt-5 rounded bg-accentPurple p-3"
        onPress={() => router.push('/Integration')}>
        <Text className="text-center text-lg text-white">Save and Continue</Text>
      </TouchableOpacity>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

export default Break;
