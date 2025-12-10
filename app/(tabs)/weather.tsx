import React from "react";
import { ScrollView, StyleSheet, Text, View, Image } from "react-native";
import { useRoute } from "../contexts/RouteContext";

export default function Weather() {
  const { routeCities, weatherData } = useRoute();

  if (routeCities.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Weather Along Route</Text>
        <Text style={styles.emptyText}>No route selected. Go to Map tab and get directions.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weather Along Route</Text>
      <ScrollView style={styles.cityList}>
        {routeCities.map((city, index) => {
          const weather = weatherData[city.name];
          
          return (
            <View key={index} style={styles.cityItem}>
              <View style={styles.cityHeader}>
                <Text style={styles.cityText}>{city.name}</Text>
                {weather?.icon && (
                  <Image 
                    source={{ uri: weather.icon }} 
                    style={styles.weatherIcon}
                  />
                )}
              </View>
              
              {weather ? (
                <>
                  <Text style={styles.temperature}>
                    {weather.temperature}°C
                    {weather.feelsLike && (
                      <Text style={styles.feelsLike}> (Feels like {weather.feelsLike}°C)</Text>
                    )}
                  </Text>
                  <Text style={styles.weatherDescription}>{weather.description}</Text>
                  <View style={styles.weatherDetails}>
                    <Text style={styles.detailText}>💧 {weather.humidity}% Humidity</Text>
                    <Text style={styles.detailText}>💨 {weather.windSpeed} km/h Wind</Text>
                  </View>
                  <Text style={styles.coordsText}>
                    {city.latitude.toFixed(4)}°, {city.longitude.toFixed(4)}°
                  </Text>
                </>
              ) : (
                <Text style={styles.noDataText}>Loading weather data...</Text>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 40,
    color: '#333',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  cityList: {
    flex: 1,
  },
  cityItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  weatherIcon: {
    width: 50,
    height: 50,
  },
  temperature: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  feelsLike: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'normal',
  },
  weatherDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    textTransform: 'capitalize',
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#555',
  },
  coordsText: {
    fontSize: 12,
    color: '#888',
  },
  noDataText: {
    fontSize: 14,
    color: '#ff9800',
    fontStyle: 'italic',
  },
});