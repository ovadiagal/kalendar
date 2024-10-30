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
      <View style={{ flex: 1, justifyContent: 'space-between', paddingHorizontal: 40, paddingVertical: 20 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="items-center">
            <Image
              source={require('../../assets/logo.png')}
              className="h-40 w-full max-h-60 mb-10"
              resizeMode="contain"
            />
            <Text className="mb-4 text-3xl font-bold text-center">{titleText}</Text>
            <Text className="mb-10 text-lg text-center">{introText}</Text>
            <Text className="mb-2 text-2xl font-bold text-center">{instructionHeader}</Text>
            <Text className="mb-6 text-lg text-center">{instructionText}</Text>
          </View>
        </ScrollView>
        <TouchableOpacity
          className="rounded bg-accentPurple px-4 py-2 mb-4"
          onPress={() => router.push('/Login')}
        >
          <Text className="text-center font-bold text-lg text-white">Get Started</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/Login')}>
          <Text className="text-sm text-gray-500 text-center">Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
