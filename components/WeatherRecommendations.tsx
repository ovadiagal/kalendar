import { useEffect, useState } from 'react';

import { supabase } from '../lib/supabaseClient';

interface WeatherData {
  success: boolean;
  recommendation: string;
  weather: {
    temperature: number;
    weatherCode: number;
  };
}

export default function WeatherRecommendations() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWeatherData() {
      try {
        setLoading(true);

        // You might want to get these from the user's settings or device
        const location = '42.3478,-71.0466'; // Default to Boston
        const userId = '123'; // Get this from your auth context

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
  }, []);

  if (loading) return <div>Loading weather data...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!weatherData) return <div>No weather data available</div>;

  return (
    <div className="rounded-lg bg-white p-4 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Today's Weather</h2>
        <div className="text-lg">{weatherData.weather.temperature.toFixed(1)}°C</div>
      </div>

      <div className="rounded-md bg-blue-50 p-3">
        <p className="text-blue-800">{weatherData.recommendation}</p>
      </div>

      <button
        onClick={() => setLoading(true)}
        className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
        Refresh
      </button>
    </div>
  );
}
