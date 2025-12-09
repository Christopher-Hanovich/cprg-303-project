import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRoute } from "../contexts/RouteContext";

export default function Weather() {
  const { routeCities } = useRoute();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weather Along Route</Text>
      {routeCities.length === 0 ? (
        <Text style={styles.emptyText}>No route selected. Go to Map tab and get directions.</Text>
      ) : (
        <ScrollView style={styles.cityList}>
          {routeCities.map((city, index) => (
            <View key={index} style={styles.cityItem}>
              <Text style={styles.cityText}>{city}</Text>
            </View>
          ))}
        </ScrollView>
      )}
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
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cityText: {
    fontSize: 18,
    color: '#333',
  },
});