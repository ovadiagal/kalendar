import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import { Database } from '../../database.types';
import { useSupabase } from '../context/useSupabase';

const Break = () => {
  const router = useRouter();
  const { supabase, userId } = useSupabase();

  const titleText = 'You deserve a break today.';
  const breakQuestion = 'How much break time do you prefer between focused work sessions?';
  const numberOfBreaksQuestion =
    'How many breaks on average would you like to take in a given day?';
  const activityQuestion = 'What kinds of activities help you recharge?';

  const [numberOfBreaks, setNumberOfBreaks] = useState<string | null>(null);
  const [selectedBreakTime, setSelectedBreakTime] = useState<string | null>(null);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

  const breakOptions = [
    { label: 'Short (<15 min)', value: 'short' },
    { label: 'Mid (15-30 min)', value: 'medium' },
    { label: 'Long (30-60 min)', value: 'long' },
    { label: 'Dedicated (> 1 hr)', value: 'dedicated' },
  ];

  const toggleActivitySelection = (activity: string) => {
    setSelectedActivities((prev) =>
      prev.includes(activity) ? prev.filter((a) => a !== activity) : [...prev, activity]
    );
  };

  const toggleBreakTimeSelection = (value: string) => {
    setSelectedBreakTime(value === selectedBreakTime ? null : value);
  };

  const handleSaveAndContinue = async () => {
    try {
      const newBreakPreference: Database['public']['Tables']['break_preferences_updated']['Insert'] = {
          user_id: userId,
          break_time: selectedBreakTime,
          number_of_breaks: numberOfBreaks,
          selected_activities: selectedActivities.join(','),
          updated_at: new Date().toISOString(),
        };

      const { error } = await supabase.from('break_preferences_updated').insert(newBreakPreference);
      if (error) throw error;

      console.log('saved break preferences: ', newBreakPreference);
      router.push('/Integration');
    } catch (error) {
      console.error('Error saving break preference data:', error);
      Alert.alert('Error', 'Failed to save break preference data. Please try again.');
    }
  };

  return (
    <ScrollView className="pb-30 flex-1 px-10 py-10">
      <Text className="mb-5 text-3xl font-bold">{titleText}</Text>

      <View className="mb-5 mt-5 rounded-lg bg-white p-5 shadow-lg">
        <Text className="text-lg font-semibold">{breakQuestion}</Text>
        <View className="mt-5">
          <View className="flex-row justify-between">
            {breakOptions.slice(0, 2).map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => toggleBreakTimeSelection(option.value)}
                className={`h-14 w-40 items-center justify-center rounded-lg 
                  ${selectedBreakTime === option.value ? 'bg-accentPurple' : 'bg-gray-100'}`}>
                <Text
                  className={`text-md font-bold ${selectedBreakTime === option.value ? 'text-white' : 'text-accentPurple'}`}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View className="mt-3 flex-row justify-between">
            {breakOptions.slice(2).map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => toggleBreakTimeSelection(option.value)}
                className={`h-14 w-40 items-center justify-center rounded-lg 
                  ${selectedBreakTime === option.value ? 'bg-accentPurple' : 'bg-gray-100'}`}>
                <Text
                  className={`text-md font-bold ${selectedBreakTime === option.value ? 'text-white' : 'text-accentPurple'}`}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View className="mb-5 mt-5 rounded-lg bg-white p-5 shadow-lg">
        <Text className="mb-3 text-lg font-semibold">{numberOfBreaksQuestion}</Text>
        <TextInput
          keyboardType="numeric"
          placeholder="Number of breaks"
          value={numberOfBreaks !== null ? numberOfBreaks.toString() : ''}
          onChangeText={(text) => setNumberOfBreaks(text)}
          className="mt-2 rounded-lg border border-gray-400 p-2" // Using NativeWind classes
        />
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
            {['Social breaks', 'Eating snacks'].map((activity) => (
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
        onPress={handleSaveAndContinue}>
        <Text className="text-center text-lg text-white">Save and Continue</Text>
      </TouchableOpacity>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

export default Break;
