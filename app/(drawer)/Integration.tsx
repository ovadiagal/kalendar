import { useRouter } from 'expo-router';
import React from 'react';
import { View, ScrollView, Text, TouchableOpacity, Image } from 'react-native';

const Integration = () => {
  const router = useRouter();
  const gcal = require('../../assets/gcal.png');

  const titleText = "Let's integrate your schedule.";
  const syncInformation =
    'Sync Google Calendar below to make sure that we put your meetings, events, and other information into your schedule.';

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
        onPress={() => router.push('/Done')}>
        <Text className="text-center text-lg text-white">Sync and Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Integration;
