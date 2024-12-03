import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';

import { useSupabase } from '../app/context/useSupabase';

import { supabase } from '~/utils/supabase';

import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRouter } from 'expo-router';

interface WeatherData {
  success: boolean;
  recommendation: string;
  weather: {
    temperature: number;
    weatherCode: number;
  };
}

export const getLocation = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permission to access location was denied');
  }
  return await Location.getCurrentPositionAsync({});
};

export default function Weather() {
  const router = useRouter();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useSupabase();

  useEffect(() => {
    async function fetchWeatherData() {
      try {
        setLoading(true);
        setError(null);

        const loc = await getLocation();
        const latitude = loc.coords.latitude;
        const longitude = loc.coords.longitude;
        const location = `${latitude},${longitude}`;

        const { data, error } = await supabase.functions.invoke('weather-recommendations', {
          body: { userId, location },
        });

        if (error) throw error;

        setWeatherData(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    fetchWeatherData();
  }, [userId]);

  if (loading) return <ActivityIndicator color="#0000ff" />;
  if (error) return <Text>Error: {error}</Text>;
  if (!weatherData) return <Text>No weather data available</Text>;

  return (
    <View className="rounded-lg bg-white p-4">
      <View className="mb-4 flex-row items-center justify-between">
        <TouchableOpacity
          className="mr-2"
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          activeOpacity={0.6}
          onPress={() => router.push('/Profile')}>
          <Ionicons name="person-circle" size={30} color="#000" />
        </TouchableOpacity>
        <Text className="flex-grow text-xl font-semibold">Today's Weather</Text>
        <Text className="text-lg">{weatherData.weather.temperature.toFixed(1)}°C</Text>
      </View>

      <View className="rounded-lg bg-blue-100 p-3">
        <Text className="text-blue-700">{weatherData.recommendation}</Text>
      </View>
    </View>
  );
}
