import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Dimensions, Alert } from 'react-native';

import { Database } from '../../database.types';
import { useSupabase } from '../context/useSupabase';

const { width } = Dimensions.get('window');

const Freeform = () => {
  const router = useRouter();
  const { supabase, userId } = useSupabase();

  const [preferences, setPreferences] = useState({
    workPreferences: '',
    breakPreferences: '',
    additionalPreferences: '',
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleInputChange = (key: string, value: string) => {
    setPreferences({ ...preferences, [key]: value });
  };

  const handleSaveAndContinue = async () => {
    try {
      const newFreeFormPreference: Database['public']['Tables']['freeform_preferences']['Insert'] = {
          user_id: userId,
          preference_modifications: JSON.stringify(preferences),
          updated_at: new Date().toISOString(),
        };

      const { error } = await supabase.from('freeform_preferences').insert(newFreeFormPreference);
      if (error) throw error;

      console.log('saved freeform preferences: ', newFreeFormPreference);
      router.push('/Integration');
    } catch (error) {
      console.error('Error saving freeform preference data:', error);
      Alert.alert('Error', 'Failed to save freeform preference data. Please try again.');
    }
  };

  const data = [
    {
      key: 'How would you like your workday to look like?',
      description:
        'What are your preferred work hours? Are you a morning or night person? Do you like structure or more flexibility? When do you work remotely? What helps you stay focused?',
      placeholder: 'e.g., 9 AM - 5 PM',
      value: preferences.workPreferences,
      inputKey: 'workPreferences',
    },
    {
      key: 'How would you like to maintain your wellness?',
      description:
        'What techniques do you like to use to manage stress (hobbies, activities, etc.)? How often would you like to take breaks? What does self-care look like for you?',
      placeholder: 'e.g., taking regular breaks',
      value: preferences.breakPreferences,
      inputKey: 'breakPreferences',
    },
    {
      key: 'Is there anything else you would like to add?',
      description:
        'What information are we missing that might help create an ideal working schedule for you? Do you have any aspiring goals in creating a healthy work life balance?',
      placeholder: 'e.g., i like the pomodoro method',
      value: preferences.additionalPreferences,
      inputKey: 'additionalPreferences',
    },
  ];

  return (
    <View className="flex-1 bg-gray-100">
      <Text className="mb-5 pl-5 pr-5 pt-10 text-3xl font-bold">
        Let's learn about your ideal kind of workday.
      </Text>
      <FlatList
        data={data}
        renderItem={({ item }) => (
          <View className="flex-1 rounded-lg bg-white p-5" style={{ width }}>
            <Text className="mb-2 text-lg font-semibold">{item.key}</Text>
            <Text className="mb-5 text-m italic">{item.description}</Text>
            <TextInput
              value={item.value}
              onChangeText={(value) => handleInputChange(item.inputKey, value)}
              placeholder={item.placeholder}
              multiline
              style={{
                borderColor: '#D1D5DB',
                borderWidth: 1,
                borderRadius: 5,
                padding: 10,
                flex: 1,
                textAlignVertical: 'top',
              }}
            />
          </View>
        )}
        keyExtractor={(item) => item.inputKey}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={width}
        decelerationRate="fast"
        onMomentumScrollEnd={(event) => {
          const index = Math.floor(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      <View className="pb-3 pt-3">
        <Text className="text-center text-lg">
          Page {currentIndex + 1} of {data.length}
        </Text>
        <Text className="mt-1 pl-5 pr-5 text-center text-m text-accentPurple font-bold">
          Swipe Right for More Customization
        </Text>
      </View>

      <View className="p-6 pb-10 shadow-lg">
        <TouchableOpacity className="rounded bg-accentPurple p-3" onPress={handleSaveAndContinue}>
          <Text className="text-center text-lg text-white">Save and Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Freeform;
