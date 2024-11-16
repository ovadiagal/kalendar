import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

function generateRecommendations(weatherData: any) {
  const timeline = weatherData.timelines.daily[0];
  const temp = timeline.values.temperatureAvg;
  const weatherCode = timeline.values.weatherCodeMax;

  // Tomorrow.io Weather Codes: https://docs.tomorrow.io/reference/data-layers-core#weather-codes
  let recommendation = '';

  if (temp > 25) {
    recommendation += "It's quite warm! Stay hydrated. ";
  } else if (temp < 10) {
    recommendation += "It's chilly! Bundle up. ";
  }

  // Weather code based recommendations
  switch (true) {
    case weatherCode <= 1000: // Clear, Mostly Clear
      recommendation += 'Perfect weather for outdoor activities like hiking or sports!';
      break;
    case weatherCode <= 1100: // Partly Cloudy
      recommendation += 'Good conditions for most outdoor activities.';
      break;
    case weatherCode <= 2000: // Cloudy
      recommendation += 'Decent weather for outdoor tasks, but keep an eye on the sky.';
      break;
    case weatherCode <= 4000: // Rain
      recommendation += 'Bring an umbrella! Good day for indoor activities.';
      break;
    case weatherCode <= 5000: // Snow
      recommendation += 'Snow expected! Consider working from home if possible.';
      break;
    case weatherCode <= 7000: // Freezing Rain/Ice
      recommendation += 'Icy conditions! Stay indoors if possible.';
      break;
    default:
      recommendation += 'Check local weather alerts for safety recommendations.';
  }

  return recommendation;
}

serve(async (req) => {
  try {
    const { userId, location } = await req.json();

    if (!userId || !location) {
      return new Response(JSON.stringify({ error: 'Missing userId or location' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch weather data from Tomorrow.io
    const TOMORROW_API_KEY = Deno.env.get('TOMORROW_API_KEY');
    if (!TOMORROW_API_KEY) {
      throw new Error('TOMORROW_API_KEY is not set');
    }

    const weatherResponse = await fetch(
      `https://api.tomorrow.io/v4/weather/forecast?location=${location}&apikey=${TOMORROW_API_KEY}`
    );

    if (!weatherResponse.ok) {
      throw new Error(`Weather API responded with status ${weatherResponse.status}`);
    }

    const weatherData = await weatherResponse.json();
    const recommendation = generateRecommendations(weatherData);

    return new Response(
      JSON.stringify({
        success: true,
        recommendation,
        weather: {
          temperature: weatherData.timelines.daily[0].values.temperatureAvg,
          weatherCode: weatherData.timelines.daily[0].values.weatherCodeMax,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
