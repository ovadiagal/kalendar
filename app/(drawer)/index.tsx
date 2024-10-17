import { useRouter } from 'expo-router';
import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

export default function Home() {
  const router = useRouter();

  const titleText = 'Welcome to your circadian rhythm.';
  const introText =
    'Sync your day with your natural rhythm. Optimize your schedule effortlessly for peak productivity and well-being.';
  const instructionHeader = 'Getting started.';
  const instructionText =
    'To give you the best possible experience, we need to ask you a few questions about your perfect day.';

  return (
    <ScrollView className="flex-1 px-10 py-10">
      <View className="mb-10 items-center">
        <Image
          source={require('../../assets/logo.png')}
          className="h-30 w-30"
          resizeMode="contain"
        />
      </View>
      <Text className="mb-5 text-3xl font-bold">{titleText}</Text>
      <Text className="mb-10 text-xl">{introText}</Text>
      <Text className="mb-5 text-2xl font-bold">{instructionHeader}</Text>
      <Text className="mb-10 text-xl">{instructionText}</Text>
      <TouchableOpacity
        className="rounded bg-accentPurple p-3"
        onPress={() => router.push('/Login')}>
        <Text className="text-center text-lg text-white">Get Started</Text>
      </TouchableOpacity>
      <View className="mt-6 items-center">
        <TouchableOpacity onPress={() => router.push('/Login')}>
          <Text className="text-sm text-gray-500">Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
