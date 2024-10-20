import React from 'react';
import { View, ScrollView, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';

const Done = () => {
  const router = useRouter();
  const check = require('../../assets/check.png');

  const titleText = "You're all set.";

  return (
    <ScrollView className="pb-30 flex-1 px-10 py-10">
      <Text className="mb-5 text-3xl font-bold">{titleText}</Text>
      <View className="mb-5 flex items-center">
        <Image source={check} className="mb-10 mt-40 h-24 w-24" resizeMode="contain" />
      </View>
      <View className="mt-20 h-20" />
      <TouchableOpacity
        className="rounded bg-accentPurple p-3"
        onPress={() => {
          router.push('/Calendar');
        }}>
        <Text className="text-center text-lg text-white">Show me my schedule!</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Done;
