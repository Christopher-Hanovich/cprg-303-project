// Simple Weather API Service
const OPENWEATHER_API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || "";

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  cityName: string;
}

export async function fetchWeatherForCoordinates(
  latitude: number,
  longitude: number,
  cityName: string
): Promise<WeatherData> {
  try {
    if (!OPENWEATHER_API_KEY) {
      // Return mock data for testing
      return {
        temperature: Math.floor(Math.random() * 30) + 10,
        feelsLike: Math.floor(Math.random() * 30) + 10,
        description: ['Sunny', 'Cloudy', 'Rainy', 'Snowy'][Math.floor(Math.random() * 4)],
        humidity: Math.floor(Math.random() * 50) + 30,
        windSpeed: Math.floor(Math.random() * 20) + 5,
        icon: 'https://openweathermap.org/img/wn/01d@2x.png',
        cityName: cityName
      };
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
      cityName: cityName
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    // Return fallback data
    return {
      temperature: 20,
      feelsLike: 21,
      description: 'Partly cloudy',
      humidity: 65,
      windSpeed: 12,
      icon: 'https://openweathermap.org/img/wn/02d@2x.png',
      cityName: cityName
    };
  }
}

export async function fetchWeatherForCities(
  cities: {latitude: number; longitude: number; name: string}[]
): Promise<Record<string, WeatherData>> {
  const weatherMap: Record<string, WeatherData> = {};
  
  for (const city of cities) {
    const weather = await fetchWeatherForCoordinates(city.latitude, city.longitude, city.name);
    weatherMap[city.name] = weather;
  }
  
  return weatherMap;
}