import { StyleSheet, View } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import * as location from 'expo-location';
import React from "react";

const requestLocationPermission = async () => {
  let { status } = await location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    console.log('Permission to access location was denied');
    return;
  }
  let userLocation = await location.getLastKnownPositionAsync({});
  console.log('User location:', userLocation);
}

const defaultRegion = {
  latitude: 51.0641,
  longitude: 114.0885,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};


export default function Index() {
  requestLocationPermission();
  return (
    <View
      style={styles.container}
    >
      <MapView
        style={styles.maps}
        provider={PROVIDER_GOOGLE}
        initialRegion={
          {
            latitude: userLocation.coords.latitude,
            userLocation.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        }}

      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
     flex: 1,
      justifyContent: "center",
      alignItems: "center",
  },
  maps: {
    width: "100%",
    height: "100%",
  }
});

