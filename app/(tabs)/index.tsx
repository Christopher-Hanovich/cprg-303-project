import * as location from 'expo-location';
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { GooglePlaceData, GooglePlaceDetail, GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

// Default region (SAIT, Calgary, Canada) in case user does not allow location access

const defaultRegion = {
  latitude: 51.0641,
  longitude: -114.0885,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const App = () => {
  //sets a reference to the map view
  const mapRef = React.useRef<MapView>(null);
  //state to hold region and marker coordinate
  const [region, setRegion] = useState(defaultRegion);
  const [markerCoordinate, setMarkerCoordinate] = useState<{ latitude: number; longitude: number } | null>(null);
  
  //function to handle place selection from autocomplete
  const handlePlaceSelect = (data: GooglePlaceData, detail: GooglePlaceDetail | null) => {
        if (detail && detail.geometry && detail.geometry.location) {
          const { lat, lng } = detail.geometry.location;
          const newRegion = {
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          };
          setRegion(newRegion);
          setMarkerCoordinate({ latitude: lat, longitude: lng });
          mapRef.current?.animateToRegion(newRegion, 1000); // Animate map to selected location
        }
  };
  useEffect(() => {
    const requestLocationPermission = async () => {
      let { status } = await location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }
      let lastKnownLocation = await location.getLastKnownPositionAsync({});
      if (lastKnownLocation) {
        console.log('User location:', lastKnownLocation);
        setRegion({
          latitude: lastKnownLocation.coords.latitude,
          longitude: lastKnownLocation.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    };

    requestLocationPermission();
  }, []);
  return (
    <View
      style={styles.container}
    >
      <MapView
        style={styles.maps}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation={true}
        onRegionChangeComplete={setRegion}
      >
        {markerCoordinate && (
          <Marker coordinate={markerCoordinate} />
        )}
      </MapView>
      <View style={styles.searchContainer}>
            <GooglePlacesAutocomplete
              placeholder="Search for a place"
              onPress={handlePlaceSelect}
              query={{
                key: 'YOUR_GOOGLE_MAPS_API_KEY', // Replace with your API key
                language: 'en',
              }}
              fetchDetails={true} // To get full place details including coordinates
              styles={{
                textInputContainer: styles.textInputContainer,
                textInput: styles.textInput,
              }}
            />
          </View>
    </View>
  );
}

export default App;

const styles = StyleSheet.create({
  container: {
     flex: 1,
      justifyContent: "center",
      alignItems: "center",
  },
  maps: {
    width: "100%",
    height: "100%",
  },
  searchContainer: {
    position: 'absolute',
    top: 10,
    width: '90%',
    alignSelf: 'center',
  },
  textInputContainer: {
    backgroundColor: 'white',
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  textInput: {
    height: 44,
    color: '#5d5d5d',
    fontSize: 16,
  },
});

