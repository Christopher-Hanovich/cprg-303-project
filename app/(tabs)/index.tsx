import Polyline from '@mapbox/polyline';
import * as location from 'expo-location';
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { GooglePlaceData, GooglePlaceDetail } from 'react-native-google-places-autocomplete';
import MapView, { Polyline as MapPolyline, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomSheet from "../components/BottomSheet";
import SearchBar from "../components/SearchBar";

// Use a public runtime env var. Define EXPO_PUBLIC_GOOGLE_MAPS_API_KEY in your env.
const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
const hasApiKey = Boolean(googleMapsApiKey);

// Default region (SAIT, Calgary, Canada) in case user does not allow location access

const defaultRegion = {
  latitude: 51.0641,
  longitude: -114.0885,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};



const App = () => {
  const insets = useSafeAreaInsets();
  //sets a reference to the map view
  const mapRef = React.useRef<MapView>(null);
  const autocompleteRef = React.useRef<any>(null);
  //state to hold region and marker coordinate
  const [region, setRegion] = useState(defaultRegion);
  const [markerCoordinate, setMarkerCoordinate] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);
  
  //function to handle place selection from autocomplete
  const handlePlaceSelect = async (data: GooglePlaceData, detail: GooglePlaceDetail | null) => {
        console.log('Place selected:', data, detail);
        // Always clear the input when a suggestion is tapped
        autocompleteRef.current?.setAddressText('');

        if (detail?.geometry?.location) {
          setSelectedPlace({
            latitude: detail.geometry.location.lat,
            longitude: detail.geometry.location.lng,
            title: data.structured_formatting.main_text,
            address: data.structured_formatting.secondary_text,
            placeId: data.place_id,
          });
          const { lat, lng } = detail.geometry.location;
          console.log('Updating map to:', lat, lng);
          const newRegion = {
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          };
          console.log('Animating to region:', newRegion);
          mapRef.current?.animateToRegion(newRegion, 1000); // Animate map to selected location
          setMarkerCoordinate({ latitude: lat, longitude: lng });

          // Fetch and draw route from current region to selected place
          const start = { latitude: region.latitude, longitude: region.longitude };
          try {
            const points = await fetchRoute(start, { latitude: lat, longitude: lng });
            setRouteCoords(points);
          } catch (err) {
            console.warn('Failed to fetch route', err);
            setRouteCoords([]);
          }
        } else {
          console.warn('No geometry/location found in place details');
        }
  };
  //request location permission and get user location on mount
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

  //function to fetch route between two points
  const fetchRoute = async (start: { latitude: number; longitude: number }, end: { latitude: number; longitude: number }) => {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${start.latitude},${start.longitude}&destination=${end.latitude},${end.longitude}&key=${googleMapsApiKey}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const points: { latitude: number; longitude: number }[] = Polyline.decode(data.routes[0].overview_polyline.points).map((point: [number, number]) => ({ latitude: point[0], longitude: point[1] }));
        return points;
      } else {
        console.warn('No routes found');
        return [];
      }
    } catch (error) {
      console.error('Error fetching directions:', error);
      return [];
    }
  };

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
});
  return (
    <View
      style={styles.container}
    >
      <MapView
        ref={mapRef}
        style={styles.maps}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation={true}
        onRegionChangeComplete={setRegion}
      >
        {markerCoordinate && (
          <Marker
            coordinate={markerCoordinate}
            onPress={() => setShowBottomSheet(true)}
          />
        )}
        {routeCoords.length > 0 && (
          <MapPolyline
            coordinates={routeCoords}
            strokeWidth={4}
            strokeColor="#007AFF"
          />
        )}
      </MapView>
      <SearchBar
        apiKey={googleMapsApiKey}
        hasApiKey={hasApiKey}
        topInset={insets.top}
        autocompleteRef={autocompleteRef}
        onPlaceSelect={handlePlaceSelect}
      />
      <BottomSheet
        visible={showBottomSheet}
        title={selectedPlace?.title}
        address={selectedPlace?.address}
        bottomInset={insets.bottom}
        onClose={() => setShowBottomSheet(false)}
        onGetDirections={() => {
          if (markerCoordinate) {
            fetchRoute(region, markerCoordinate).then(setRouteCoords);
          }
        }}
      />
    </View>
  );
}

export default App;



