import { useRouter } from 'expo-router';
import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
  const router = useRouter();

  const titleText = 'Welcome to your circadian rhythm.';
  const introText =
    'Sync your day with your natural rhythm. Optimize your schedule effortlessly for peak productivity and well-being.';
  const instructionHeader = 'Getting started.';
  const instructionText =
    'To give you the best possible experience, we need to ask you a few questions about your perfect day.';

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{
          flex: 1,
          justifyContent: 'space-between',
          paddingHorizontal: 40,
          paddingVertical: 20,
        }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="items-center">
            <Image
              source={require('../../assets/logo.png')}
              className="mb-10 h-40 max-h-60 w-full"
              resizeMode="contain"
            />
            <Text className="mb-4 text-center text-3xl font-bold">{titleText}</Text>
            <Text className="mb-10 text-center text-lg">{introText}</Text>
            <Text className="mb-2 text-center text-2xl font-bold">{instructionHeader}</Text>
            <Text className="mb-6 text-center text-lg">{instructionText}</Text>
          </View>
        </ScrollView>
        <TouchableOpacity
          className="mb-4 rounded bg-accentPurple px-4 py-2"
          onPress={() => router.push('/Login')}>
          <Text className="text-center text-lg font-bold text-white">Get Started</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/Login')}>
          <Text className="text-center text-sm text-gray-500">Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
